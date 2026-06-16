# Mein Schulplaner – PWA-Version

Diese Version ist eine vollständige Progressive Web App (PWA). Sie läuft
komplett offline und lässt sich auf dem iPad-Homescreen wie eine native
App installieren – ganz ohne Mac, Xcode oder App Store.

## Ordnerstruktur (NICHT verändern/umbenennen!)

```
/
├── index.html          <- Die App selbst
├── manifest.json        <- PWA-Konfiguration (Name, Icon, Farben)
├── sw.js                 <- Service Worker (sorgt für Offline-Funktion)
├── js/
│   └── vue.global.js     <- Vue 3 (lokal, kein Internet nötig)
├── css/
│   └── tailwind.css      <- Kompiliertes Tailwind-CSS (lokal)
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-192.png
    └── icon-maskable-512.png
```

Wichtig: Diese Struktur muss **genau so** erhalten bleiben, da `index.html`,
`manifest.json` und `sw.js` mit relativen Pfaden (`js/...`, `css/...`,
`icons/...`) darauf verweisen.

## Wie du es auf dem iPad einrichtest

### Schritt 1: Dateien online verfügbar machen

Eine PWA kann **nicht** direkt von `file://` aus auf dem iPad installiert
werden – Safari verlangt eine echte URL (http/https). Du brauchst irgendeinen
Webspace, der die Dateien 1:1 ausliefert. Optionen, die für Lehrer ohne
IT-Hintergrund gut funktionieren:

- **GitHub Pages** (kostenlos): Repository erstellen, diese Dateien hochladen,
  in den Repo-Einstellungen "Pages" aktivieren. Du bekommst eine URL wie
  `https://deinname.github.io/schulplaner/`.
- **Netlify Drop** (kostenlos, kein Account nötig für den Start):
  auf https://app.netlify.com/drop den ganzen Ordner per Drag & Drop hochladen.
  Du bekommst sofort eine URL.
- **Eigener Webspace/Hosting**, falls vorhanden: Ordner per FTP hochladen.

Wichtig: **HTTPS ist Pflicht** für Service Worker (außer bei `localhost`).
Alle drei oben genannten Optionen liefern automatisch HTTPS.

### Schritt 2: Auf dem iPad installieren

1. Öffne die URL in **Safari** (nicht Chrome – "Zum Home-Bildschirm
   hinzufügen" mit Vollbild-Effekt funktioniert auf iOS nur in Safari).
2. Tippe auf das Teilen-Symbol (Quadrat mit Pfeil nach oben).
3. Wähle "Zum Home-Bildschirm".
4. Bestätige mit "Hinzufügen".

Die App erscheint jetzt als eigenes Icon auf deinem Homescreen und startet
beim Öffnen im Vollbild ganz ohne Safari-Adressleiste.

### Schritt 3: Offline-Test

1. Öffne die App einmal **mit** Internetverbindung (das lädt den Service
   Worker und legt alle Dateien im Cache ab).
2. Aktiviere den Flugmodus.
3. Öffne die App erneut über das Homescreen-Icon – sie sollte normal starten
   und funktionieren.

## Wie du Updates einspielst

Wenn du später `index.html` änderst (z.B. neue Features):

1. Lade die neue Version der Datei(en) erneut auf deinen Webspace hoch.
2. **Wichtig:** Öffne `sw.js` und erhöhe die Zeile
   `const CACHE_VERSION = 'v1';` auf `'v2'` (oder höher).
   Ohne diese Änderung lädt die App weiterhin die alte, zwischengespeicherte
   Version, weil der Service Worker den Cache sonst nicht erneuert!
3. Lade auch die aktualisierte `sw.js` hoch.
4. Öffne die App auf dem iPad einmal mit Internetverbindung – der neue
   Service Worker wird erkannt, lädt die neuen Dateien nach und räumt den
   alten Cache auf.

## Datensicherung bleibt wichtig

Die App speichert weiterhin alle Daten in `localStorage` direkt auf dem
Gerät. Die PWA-Installation schützt zwar zuverlässig vor Safaris
automatischer Datenbereinigung (die nur Browser-Tabs betrifft, nicht
installierte Home-Bildschirm-Apps) – ein Hardware-Defekt, ein
versehentliches "App löschen" oder ein iPad-Tausch löscht die Daten trotzdem.
Nutze daher weiterhin regelmäßig die "💾 Datensicherung"-Funktion in der App,
um Backups zu exportieren.
