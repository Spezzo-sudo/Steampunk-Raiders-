# Merge-Playbook

Dieses Dokument fasst die noch offenen Schritte zusammen, um den Branch konfliktfrei mit `main` zu vereinen. Es baut auf den Screenshots der GitHub-Meldung und den bereitgestellten Shell-Kommandos auf.

## 1. Remote-Verbindung wiederherstellen
- `git remote -v` prüfen. Falls `origin` fehlt: `git remote add origin <git-url>`.
- Alternativ vorhandene Remote-URL korrigieren: `git remote set-url origin <git-url>`.

## 2. Sicherheitskopie des Arbeitsstands
```bash
git rev-parse --abbrev-ref HEAD
BR=$(git rev-parse --abbrev-ref HEAD)
git checkout -b "${BR}-backup"
```

## 3. Haupt-Branch aktualisieren und rebasen
```bash
git checkout "$BR"
git fetch origin --prune || echo "Remote nicht erreichbar"
if git ls-remote --exit-code origin main >/dev/null 2>&1; then
  git rebase origin/main
else
  echo "main auf origin nicht verfügbar – Rebase abbrechen"
fi
```

## 4. Konflikte nach Projektregeln lösen
| Datei | Maßnahme |
| --- | --- |
| `src/constants.ts` | Eigene Steampunk-Bezeichnungen behalten, upstream-Werte (z. B. Kosten) manuell mergen. |
| `src/store/gameStore.ts` | `dampfkraftwerk`-Logik beibehalten, zusätzliche Bugfixes aus `main` einarbeiten. |
| `src/components/views/GalaxyHexMap.tsx` | Eigenes Pan/Zoom-Handling behalten, UI-Tweaks aus `main` bei Bedarf übernehmen. |
| UI-Views (`TopBar`, `BuildingsView`, `ResearchView`, `OverviewView`) | Tooltip- und Timer-Logik behalten, Copy-Änderungen aus `main` prüfen und ggf. einpflegen. |
| Lockfiles | Eigene Version verwenden, anschließend `npm ci`. |

## 5. Verifizieren und pushen
```bash
npm ci
npm run build
npx tsc --noEmit
```

Erst nach erfolgreichen Checks pushen:
```bash
git push --force-with-lease
```

## 6. GitHub prüfen
- PR-Ansicht aktualisieren.
- Sicherstellen, dass der Hinweis „This branch has no conflicts with the base branch“ angezeigt wird.
- Falls Checks laufen: warten, bis diese grün sind.

## 7. Nachbereitung
- Merge-Status im `docs/task_tracker.md` aktualisieren.
- Im PR-Kommentar kurz festhalten, welche Konflikte auftraten und wie sie gelöst wurden (Referenz für spätere Sprints).
