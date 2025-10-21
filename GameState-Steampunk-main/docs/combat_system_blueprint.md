# Kampf- und Server-Blueprint

## Leitprinzipien
- **Server-autoritative Verarbeitung**: Alle Flottenbewegungen, Kampfsimulationen und Ressourcenbuchungen laufen ausschließlich auf dem Server, der als einzige Quelle der Wahrheit fungiert.
- **Deterministische Ergebnisse**: Jeder Kampf kann mithilfe eines Seeds reproduziert werden, um Replays, Support-Fälle und Anti-Cheat-Maßnahmen zu unterstützen.
- **Horizontale Skalierbarkeit**: API-Knoten bleiben zustandslos, Worker erledigen zeitgesteuerte Jobs, ein Redis-Event-Bus überträgt Statusänderungen an Clients.
- **Steampunk-spezifische Spielwerte**: Drei Schadenstypen (Kinetik, Explosiv, Energie), Kesseldruck als Energiemodifikator und Vitriol als Treibstoff.

## Systemarchitektur
### Komponentenübersicht
- **API-Service (NestJS/Express, Prisma, PostgreSQL)**
  - REST-Endpunkte für Flotten, Missionen, Reports und Wirtschaft.
  - WebSocket-Gateway für `state:update`, `battle:round`, `queue:done` und weitere Live-Events.
- **Worker (BullMQ, Redis)**
  - Jobs für Missionsankünfte, Rückflüge, Bau- und Forschungsabschlüsse.
  - Ausführung idempotent, Wiederholungen überstehen Prozessabstürze.
- **Event-Bus (Redis Pub/Sub)**
  - Broadcast von Statusänderungen an API-Knoten und Frontend.
- **Frontend (Vite/React)**
  - Konsumiert REST-APIs und WebSocket-Events, rendert UI, führt keine Kernlogik aus.
- **Admin/Observer**
  - Replay-Darstellung, Moderation, Metriken (Prometheus, Grafana), Audit-Logs.

## Datenmodell
```text
player { id, name, alliance_id, created_at, ... }
planet { id, owner_id, coord_g, coord_s, coord_p, biome, storage_or, storage_kr, storage_vi, kesseldruck, ... }
fleet { id, owner_id, location_planet_id | null, status, cargo_or, cargo_kr, cargo_vi }
fleet_ship { fleet_id, ship_class_id, count }
ship_class { id, name, speed, cargo, fuel_per_distance, hp, armor, shield, regen, weapon_dmg, weapon_type, targeting_tags[], size_class, build_costs_json, build_time }
defense { planet_id, turret_class_id, count }
turret_class { id, name, hp, armor, shield, regen, weapon_dmg, weapon_type, targeting_tags[], size_class, build_costs_json }
mission { id, fleet_id, type, source_planet_id, target_planet_id, distance, eta_arrival, eta_return, seed, status }
battle { id, mission_id, attacker_snapshot_json, defender_snapshot_json, rounds_json, debris_or, debris_kr, debris_vi, winner, created_at }
battle_round { battle_id, round_no, events_json }
report { id, player_id, type, ref_id, payload_json, read_at }
debris_field { planet_id, orichalkum, fokuskristalle, vitriol, expires_at }
queue_build { planet_id, building_id, level_to, ready_at, status }
queue_research { player_id, research_id, level_to, ready_at, status }
audit_log { id, actor_id, action, entity_type, entity_id, before_json, after_json, created_at }
```
- Alle JSON-Felder enthalten nur Details für Reports/Replays, Kernwerte sind normalisiert.

## Missionen
### Distanz und Treibstoff
- Hex-Koordinaten (axial `q`, `r`) → Distanz: `d = (|dq| + |dr| + |dq + dr|) / 2`.
- Flugzeit: `t = base_travel + d / (speed * (1 + engine_bonus))`.
- Treibstoffverbrauch: `vitriol = Σ(ship.fuel_per_distance * d * count) * (1 + payload_modifier)` für Hin- und Rückflug.
- Unterdeckung beim Kesseldruck auf dem Startplaneten kann optional Effizienz senken.

### Missionsablauf
1. **Dispatch**
   - API validiert Ressourcen, zieht Kosten ab, erstellt Mission und FleetSnapshot, plant `mission_arrival`-Job.
2. **Ankunft**
   - Worker lädt Mission, erkennt Zielstatus (leer, Verteidigung, Flotte), erstellt ggf. Kampf, plant Rückflug.
3. **Rückflug**
   - Worker verarbeitet Loot, Trümmer, Treibstoffrest, markiert Mission als abgeschlossen und sendet Events.

### Missionsarten
- Angriff (Kampf mit Trümmerfeld und Mondchance).
- Transport (Ressourcen hin- und her bewegen, kein Kampf).
- Stationieren (Flotte bleibt beim Zielplaneten und stärkt die Verteidigung).
- Expedition (Seed-basierte Ereignistabelle mit Chance auf Loot oder Verlust).
- Spionage (Scans mit gestaffelten Informationsstufen).

## Kampfsystem
### Aggregationsmodell
- Flotten werden als Vektoren je Schiffsklasse simuliert: `count`, `hp_pool`, `shield_pool`, `dps`.
- Schadenstypen (Kinetik, Explosiv, Energie) greifen auf eine Resistenzmatrix je `size_class` und `targeting_tag` zu.
- Schadensberechnung erfolgt schichtweise: erst Schild, dann Panzerung, dann Struktur.
- Schild regeneriert pro Runde um einen Anteil der Maximalwerte (10–30%, konfigurierbar).

### Rundenlogik
1. **Startphase**: Anwenden von Schildregeneration, Aura-Buffs, Minenfeldern, Debuffs.
2. **Zielauswahl**: Pro Angreiferklasse gewichtete Zielpriorität basierend auf `targeting_tags` und `size_class`. Varianz über deterministische RNG-Werte.
3. **Feuerphase**: Gleichzeitige Volleys; Schaden pro Zielklasse = Σ(DPS * Wirksamkeit * RNG). Überkill wird auf vollständige Schiffe begrenzt.
4. **Verlustermittlung**: Reduziere `count`, aktualisiere Rest-HP- und Schildpools.
5. **Endphase**: Morale- oder Retreat-Prüfung; Status für folgende Runden gespeichert.
6. **Logging**: Runden-Snapshot in `rounds_json` (kompakt), inkl. Verlusten, Trefferverteilungen, Effekten.

### RNG-Strategie
- Seed: `hash(attacker_id || defender_id || mission_id || departure_time_rounded)`.
- Generator: Xoroshiro128+ oder PCG mit Zusatzsalz `round_no` und `phase` für reproduzierbare Zufallszahlen.
- Gleicher Input + Seed ⇒ identische Ergebnisse, ideal für Replays und Loadtests.

### Trümmer & Mondchance
- Trümmerfeld erzeugt `x%` der zerstörten Materialkosten je Ressource.
- Mondchance basiert auf Trümmermasse, z. B. `min(20%, k * sqrt(total_debris))`.

## Spionage & Nebel des Krieges
- Scanstufen definieren Informationsumfang:
  1. Ressourcenstände
  2. Schiffsklassen und Counts
  3. Verteidigungen
  4. Forschung/Bonuseffekte
- Scans verfallen nach `ttl_scan_visible`, danach werden Daten als "ungenau" markiert und schließlich verborgen.

## Galaxie-Features
- Liste und Hex-Map synchronisieren via gemeinsamen `selectedPlanetId`.
- Map-Controls: Zoom `+/-/Reset`, Anzeige des Zoomlevels, Button „Zentrieren auf Auswahl“.
- Koordinatensprung: Eingabe `G:S:P` führt zu Fokuswechsel.
- Tabelle: Sticky-Header, Suche nach Koordinaten, Planetenname, Spielername, Biomfilter.

## Betriebsanforderungen
- API-Knoten stateless, Scale-out per Load Balancer.
- Redis als zentrale Job-Queue und Event-Bus, Worker horizontal skalierbar.
- PostgreSQL nutzt Row-Level-Locks für Mission-Dispatch und Ressourcenbuchungen.
- Idempotente Worker mithilfe von `mission_id` und `job_id`.
- Rate-Limiting pro Spieler/IP für Flottenaktionen und Scans.
- Observability: Prometheus-Metriken (Jobs/Sek, Kampfdauer, DB-Latenz), strukturierte Logs.

## Tests & Qualitätssicherung
- Unit-Tests für Distanz, ETA, Treibstoffverbrauch, Schadenslayer und Resistenzmatrix.
- Property-Based-Tests: höherer DPS reduziert erwartete Rest-HP; Replay identisch bei gleichem Seed.
- Lasttests: ≥10.000 Kampfsimulationen/Minute pro Worker.
- Snapshot-Tests für Battle-Reports im Frontend.

## Schrittweiser Umsetzungsplan
1. **Phase A – Server-Skelett & Jobs**
   - NestJS + Prisma + Redis einrichten, Tabellen anlegen.
   - Mission-Dispatch, ETA-Worker, WebSocket-Events implementieren.
2. **Phase B – Reisen & Spionage**
   - Hex-Distanz, ETA, Treibstofflogik hinzufügen.
   - Scan-Level mit TTL, Fog-of-War im Frontend.
3. **Phase C – Kampfengine**
   - Aggregationsmodell, Schadensschichten, Resistenzmatrix, RNG-Seed.
   - Ergebnis- und Rundenprotokollierung; Performance-Ziele definieren.
4. **Phase D – UI-Integration**
   - Flotten-Dialog, Kampf-Report-Ansicht, Map-Badges für aktive Kämpfe.
5. **Phase E – Balancing & Live-Ops**
   - Schiffs-/Turm-Definitionen als JSON/CSV, Validierungs-Tooling.
   - Telemetrie, Admin-Replay, Audit-Log, Hotfix-Pipeline.

## Copy-Paste-Aufgaben für Codex
1. **Server-Missionen & ETA-Worker**
   - Mission-, Fleet-, FleetShip-, Debris-, Report-Tabellen definieren.
   - `POST /fleet/dispatch` mit Distanz-, ETA- und Treibstofflogik, `mission_arrival`-Job planen.
   - WebSocket-Events auf Statuswechsel.
2. **Deterministische Kampfbibliothek**
   - Aggregationsbasiertes Kampfsystem mit drei Schadenstypen und Schichten.
   - Konfigurierbare Resistenzmatrix, Schildregeneration, deterministischer RNG.
   - API: `simulateBattle(attacker, defender, seed)` → Ergebnis & Runden.
3. **Reports & Replays**
   - Serialisierung der Runden, Speicherung von Seed & Snapshots.
   - Endpunkte `GET /battle/:id`, `GET /report/:id`, UI für Schritt-für-Schritt-Replay.
4. **Spionage & Fog of War**
   - Scan-Level mit TTL, Map blendet unbekannte Informationen aus.
5. **Map-Finalisierung**
   - Liste↔Map-Sync, Zoom-Controls, Koordinatensprung, Such- und Filterfunktionen.
6. **Telemetrie & Admin**
   - Prometheus-Metriken, Audit-Logs, Admin-Replay-Endpunkt.

## Sicherheitsmaßnahmen
- Server bleibt autoritativ; Clients melden nur Intentionen.
- Replay-Fähigkeit ermöglicht Support-Prüfungen.
- Rate-Limits, Captcha-Gate bei verdächtigen Aktionen, Audit-Logs für Rollenwechsel und Transfers.

## Leistungsziele
- Missionsjobs werden just-in-time ausgelöst (kein Polling-Tick).
- Kampfsimulationen bleiben bei O(K) mit K = Anzahl beteiligter Klassen.
- Worker verarbeiten 500 gleichzeitige Mission-Events ohne Backlog.
- WebSocket-Events liefern Status innerhalb <250 ms nach Jobabschluss.

