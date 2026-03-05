# Open WebUI Help Overlay

Voegt een **floating help-button** (rechtsonder) en een **handleiding-modal** toe aan een standaard Open WebUI deployment — **zonder fork, zonder codewijzigingen**.

## Hoe werkt het?

Open WebUI laadt bij elke pagina twee lege placeholder-bestanden:
- `/static/loader.js` — voor custom JavaScript
- `/static/custom.css` — voor custom styling

Dit project vult die bestanden met een help-button en modal. Daarnaast wordt een `help-content.json` meegeleverd met de inhoud van de handleiding.

## Snel starten

```bash
docker compose up -d --build
```

Open daarna http://localhost:3000

## Bestanden

| Bestand | Wat het doet |
|---|---|
| `loader.js` | Maakt de floating "?" button en de modal met navigatie, print, fullscreen |
| `custom.css` | Alle styling: button, modal, sidebar, dark mode support |
| `help-content.json` | De inhoud van de handleiding (bewerkbaar!) |
| `Dockerfile` | Bouwt bovenop `ghcr.io/open-webui/open-webui:main` |
| `docker-compose.yaml` | Eenvoudige compose config |

## Handleiding aanpassen

Bewerk `help-content.json`. De structuur:

```json
{
  "title": "Handleiding {{APP_NAME}}",
  "subtitle": "Ondertitel...",
  "sections": [
    {
      "id": "sec1",
      "emoji": "📖",
      "title": "Sectietitel",
      "content": "<h2>Sectietitel</h2>",
      "items": [
        {
          "id": "sec1a",
          "emoji": "💡",
          "title": "Subsectie",
          "content": "<div>Inhoud in HTML...</div>"
        }
      ]
    }
  ]
}
```

`{{APP_NAME}}` wordt automatisch vervangen door de pagina-titel (of de `WEBUI_NAME` env var).

## Features

- Floating "?" button rechtsonder (verborgen op mobiel)
- Modal met sidebar-navigatie
- Collapsible secties met subsecties
- Dark mode support (volgt Open WebUI's theme)
- Print-functie (opent volledige handleiding in nieuw venster)
- Fullscreen toggle
- "Niet meer automatisch tonen" checkbox (localStorage)
- Toont automatisch bij eerste bezoek
- Escape-toets sluit de modal
- `{{APP_NAME}}` placeholder-support

## Updaten naar nieuwe Open WebUI versie

Pas de tag aan in de `Dockerfile`:

```dockerfile
FROM ghcr.io/open-webui/open-webui:v0.6.x
```

Herbouw:

```bash
docker compose up -d --build
```

Je overlay-bestanden blijven intact — ze raken de Open WebUI broncode niet.
