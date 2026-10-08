# My Reading – Standalone Reading App

Enthalten:
- komplette Buchbibliothek aus der bisherigen MeTime-Version
- aktuelles Buch + Fortschritt
- heutige gelesene Seiten frei eintragen
- Ausgangs-Seitenstand ohne neue Leseleistung setzen
- Reading Matcher mit 0–5-Reglern
- Stimmung, Tempo, Schreibstil, Genre
- optional Subgenre + Trope
- Reihenfolge von Buchreihen berücksichtigen
- Bibliothek durchsuchen und filtern
- vollständiges Buch-hinzufügen-Formular mit allen bisherigen Tabellenfeldern
- Lesestatistik
- PWA-Dateien (manifest.json + sw.js)

## Auf dem Computer testen
ZIP entpacken und index.html öffnen.

## Für iPhone / PWA
Die App sollte über HTTPS gehostet werden (z. B. GitHub Pages, Netlify, Vercel oder Cloudflare Pages).
Danach URL in Safari öffnen und über das Teilen-Menü zum Home-Bildschirm hinzufügen.

Hinweis:
Die App speichert Daten aktuell lokal im Browser (localStorage). Wenn du Browserdaten löschst oder einen anderen Browser/ein anderes Gerät verwendest, sind diese Daten nicht automatisch synchron.


## Icon-Fix V1.1
- Apple Touch Icon fest eingebaut
- neue Dateinamen, damit iOS keinen alten Icon-Cache verwendet
- Manifest-Version aktualisiert
- Service-Worker-Cache aktualisiert
