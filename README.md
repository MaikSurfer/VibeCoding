# VibeCoding Buchstabensalat

Ein kleines Terminal-Spiel, bei dem du aus einem Buchstabensalat das richtige Wort finden musst. Der Wortschatz dreht sich um einfache Fakten aus Geschichte und Geografie.

## Spielregeln
- Du hast pro Wort 20 Sekunden Zeit.
- Richtig gelöste Wörter bringen 10 Punkte.
- Sobald das Zeitlimit überschritten wird, endet die Runde und die Punkte werden gezählt.
- Am Ende wirst du nach deinem Namen gefragt und dein Ergebnis wird in einer Highscore-Tabelle gespeichert.

## Starten
Voraussetzung ist Python 3.11+.

```bash
python game.py
```

Die Highscore-Tabelle wird in der Datei `high_scores.json` im Projektordner gespeichert.

## Im Browser spielen

Öffne einfach die Datei `index.html` in deinem Browser. Das Spiel läuft vollständig im Frontend,
inklusive Zeitlimit, Punktevergabe und lokal gespeicherter Highscore-Tabelle (Local Storage).
