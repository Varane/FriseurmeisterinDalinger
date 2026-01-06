# Fotos zur Galerie hinzufügen

1) Bild als WebP exportieren (empfohlen: max. 2000 px Breite, hohe Qualität).
2) Dateiname: `portfolio-<kurzthema>-NN.webp` (z. B. `portfolio-balayage-02.webp`).
3) Datei in `images/portfolio/` ablegen.
4) Eintrag in `data/gallery.json` ergänzen (`src`, `alt`, `order`, `fit`).
5) Für Vorher/Nachher-Collagen immer `"fit": "contain"` verwenden.
6) Lokal prüfen (index.html öffnen oder bestehenden lokalen Server nutzen).
