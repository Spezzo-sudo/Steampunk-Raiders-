# Aufgaben-Logbuch

Dieses Logbuch hält alle geplanten Arbeiten fest. Abgeschlossene Punkte bleiben mit kurzer Umsetzungserklärung bestehen, damit die Historie nachvollziehbar bleibt.

## Sprint 1 – UX-Stabilisierung & Informationsarchitektur
- [x] Responsives Grid & Layout-Tokens – Einheitliche Layout-Konstanten in `src/styles/layout.ts` definiert und in `App`, `BuildingsView`, `ResearchView`, `OverviewView` sowie der Galaxie genutzt, um 1/2/3/4-Spalten-Gitter und konsistente Außenränder zu gewährleisten.
- [x] Ressourcen-Topbar (Zweite Zeile + Einheiten) – `TopBar` in `src/components/layout/TopBar.tsx` zu kartenbasierten Anzeigen mit Tooltip-Inhalten, Manometer-Icon und mobiler Zweizeilen-Darstellung umgebaut.
- [x] Karten-Standard: Höhe, Typo, CTA – `GameCard` vereinheitlicht (`src/components/ui/GameCard.tsx`) mit fester Mindesthöhe, clamp-Überschriften, konsistentem CTA und separatem Ressourcen-Hinweis inkl. Tooltip.
- [x] Tooltips-Suite (Ressourcen, Gebäude, Forschung) – Wiederverwendbare Tooltip-Komponente in `src/components/ui/Tooltip.tsx` eingeführt und in Topbar, Karten sowie weiteren Views eingebunden.
- [x] Micro-Feedback: Toasts & Timer – `useUiStore` und `ToastViewport` ergänzt, Timerformat in Karten vereinheitlicht und Fortschrittsanzeigen in `src/components/ui/ProgressBar.tsx` verfeinert.
- [x] Übersicht/Queue-Verbesserung – `OverviewView` erweitert, um Auftragslisten mit Icons, Restzeiten und Engpass-Hinweisen darzustellen.
- [x] Forschung gruppieren – Tabs und Sperrzustände in `ResearchView` ergänzt, um Kategorien und Voraussetzungen klar zu visualisieren.
- [ ] Mergekonflikte bereinigt – Remote-Rebase steht noch aus. Aktueller Blocker: `fatal: 'origin' does not appear to be a git repository`. Nächste Schritte: Remote-URL prüfen/setzen, Branch sichern (`git checkout -b <branch>-backup`), `git fetch origin --prune`, danach `git rebase origin/main` und Konflikte gemäß Projektregeln (`constants.ts`, `gameStore.ts`, `GalaxyHexMap.tsx`) auflösen. Abschließend `npm ci`, `npm run build`, `npx tsc --noEmit` und `git push --force-with-lease`.
- [ ] Liste ↔ Hex-Map Sync – Hover/Klick-Synchronisation zwischen Tabelle und Hex-Map implementieren.
- [ ] Map-Controls – Zoom-Controls, Reset und Koordinaten-Sprung ergänzen.
- [ ] Suche & Filter in der Tabelle – Suchfeld, Biom-Filter und Sticky-Header der Galaxie-Tabelle fertigstellen.
- [ ] i18n & Naming-Konsistenz – Zentrale Übersetzungsdatei anlegen und Bezeichnungen vereinheitlichen.
- [ ] A11y-Pass – Fokuszustände, ARIA-Labels und Tastaturnavigation überprüfen und nachbessern.
- [ ] Performance-Pass (Map & Listen) – Memoization, Throttling und Virtualisierung umsetzen.
- [ ] Fehler-/Offline-Handling (Client-seitig) – Wiederholungen und Nutzerhinweise für Fehlschläge einbauen.
- [ ] Tests (Unit & UI-Snapshots) – Wirtschafts- und UI-Tests erstellen, um Regressionen zu verhindern.

## Sprint 2 – Server, Kampf & Live-Ops
- [ ] Server-Missionen & ETA-Worker – Missionsendpunkte, Flotten-Snapshots und ETA-Jobs in einer NestJS/Prisma-Architektur bereitstellen.
- [ ] Kampf-Bibliothek (deterministisch) – Aggregierte Kampf-Sim mit Seed-basiertem RNG aufsetzen.
- [ ] Reports & Replays – Kampfberichte serialisieren, Replay-Endpunkte und UI implementieren.
- [ ] Spionage/Fog of War – Scan-Level, TTL und Map-Overlays einführen.
- [ ] Map-Finalisierung – Sync, Controls und Suche aus Sprint 1 in einen produktionsreifen Stand überführen.
- [ ] Telemetrie & Admin – Prometheus-Metriken, Audit-Log und Admin-Replay-Ansicht integrieren.

## Merge-Checkliste

- [x] Branch-Backup erstellt (`git checkout -b <branch>-backup`), um bei Bedarf sicher zurückrollen zu können.
- [ ] Rebase gegen `origin/main` durchgeführt und Konflikte nach den Projektregeln gelöst – steht aus, sobald Remote wieder erreichbar ist.
- [x] Dependencies erneuert (`npm ci`) und Builds (`npm run build`, `npx tsc --noEmit`) erfolgreich abgeschlossen.
- [ ] Merge-fähigen Zustand auf GitHub bestätigt – Remotes aktuell nicht erreichbar (`fatal: 'origin' does not appear to be a git repository`). Nach erfolgreichem Rebase GitHub-Status prüfen.

