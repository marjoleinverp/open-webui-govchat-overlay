# GovChat-NL Overlay voor Open WebUI

Een configureerbare overlay die **help-button**, **app launcher** en **admin panel** toevoegt aan een standaard [Open WebUI](https://github.com/open-webui/open-webui) deployment — zonder fork, zonder codewijzigingen.

Ontwikkeld als onderdeel van [GovChat-NL](https://govchat.nl), het open-source AI-chatplatform voor de Nederlandse overheid.

## Wat zit erin?

| Component | Omschrijving |
|---|---|
| **Help-button** | Floating "?" button rechtsonder met een complete handleiding-modal |
| **App Launcher** | Grid met apps rechtsboven in de navbar (Versimpelaar, externe tools, etc.) |
| **Admin Panel** | Webinterface om handleiding en apps te beheren — zonder herbouw van het Docker image |
| **Versimpelaar** | Ingebouwde tekstvereenvoudiger (B1/B2 taalniveau) via n8n webhook |

## Architectuur

```
┌─────────────────┐    /static/*.js,css,json   ┌──────────────────┐
│   Open WebUI     │  ←── shared volume ──────  │  govchat-admin   │
│   (main app)     │                            │  (Node.js/Express)│
└─────────────────┘                            │                  │
                                               │  :3001/dashboard │
                    ┌────────────┐  login +     │  Admin UI (NL)   │
                    │  Beheerder │────edit────→ │                  │
                    └────────────┘              └──────────────────┘
                                                       │
                                                ┌──────┴──────┐
                                                │  Volume:     │
                                                │  JSON config │
                                                └─────────────┘
```

## Snel starten

```bash
# Clone de repository
git clone https://github.com/MarjoleinVerP/open-webui-govchat-overlay.git
cd open-webui-govchat-overlay

# Start met docker compose (voorbeeld: Meierijstad configuratie)
GOVCHAT_ADMIN_PASSWORD=mijnwachtwoord docker compose -f docker-compose.meierijstad.yaml up -d --build
```

Open daarna:
- **Open WebUI**: http://localhost:3000
- **Admin Panel**: http://localhost:3001

## Bestanden

```
open-webui-help-overlay/
├── loader.js                     # Injecteert help-button, app launcher, versimpelaar
├── custom.css                    # Alle styling (dark mode, responsive)
├── help-content.json             # Standaard handleiding (fallback)
├── apps.json                     # Standaard apps config (fallback)
├── Dockerfile                    # Open WebUI + overlay bestanden
├── docker-compose.yaml           # Basis compose config
├── docker-compose.meierijstad.yaml  # Productie config voor Meierijstad
└── admin/
    ├── Dockerfile                # Admin panel image (node:20-alpine)
    ├── package.json
    ├── server.js                 # Express server met API + admin UI
    ├── views/
    │   ├── login.html            # Login pagina
    │   ├── dashboard.html        # Overzicht met snelkoppelingen
    │   ├── help-editor.html      # WYSIWYG handleiding-editor
    │   └── apps-editor.html      # Apps configuratie
    └── defaults/
        ├── help-content.json     # Standaard handleiding
        └── apps.json             # Standaard apps config
```

## Admin Panel

Het admin panel draait als aparte container en biedt:

- **Handleiding bewerken** — WYSIWYG editor met rich text toolbar, emoji picker, secties en subsecties toevoegen/verwijderen
- **Apps configureren** — Apps toevoegen, verwijderen, herschikken met emoji picker en target type (navigate/iframe/blank/versimpelaar)
- **App Launcher aan/uit** — Toggle om de app launcher knop te verbergen
- **Direct publishing** — Wijzigingen worden direct naar Open WebUI gepubliceerd via een shared Docker volume

Beveiligd met een wachtwoord via de `GOVCHAT_ADMIN_PASSWORD` environment variable.

## Features

- Floating "?" help-button rechtsonder
- Modal met sidebar-navigatie en collapsible secties
- App launcher knop rechtsboven in de navbar
- Versimpelaar voor tekstvereenvoudiging (B1/B2)
- Dark mode support (volgt Open WebUI theme)
- Print-functie en fullscreen toggle
- "Niet meer automatisch tonen" checkbox
- `{{APP_NAME}}` placeholder-support
- Configureerbaar via admin panel (geen herbouw nodig)

## Configuratie via environment variables

| Variable | Omschrijving | Voorbeeld |
|---|---|---|
| `GOVCHAT_ADMIN_PASSWORD` | Wachtwoord voor het admin panel | `geheim123` |
| `STATIC_DIR` | Open WebUI static directory (belangrijk!) | `/app/backend/static` |
| `CORS_ORIGIN` | Toegestane origin voor API calls | `https://jip.meierijstad.nl` |
| `WEBUI_NAME` | Naam van de applicatie | `GAIMS` |

**Let op**: `STATIC_DIR=/app/backend/static` is vereist in de Open WebUI container zodat de overlay-bestanden correct worden geserveerd.

## Updaten naar nieuwe Open WebUI versie

Pas de tag aan in de `Dockerfile`:

```dockerfile
FROM ghcr.io/open-webui/open-webui:v0.6.x
```

Herbouw:

```bash
docker compose up -d --build
```

De overlay-bestanden blijven intact — ze raken de Open WebUI broncode niet.

---

## GovChat-NL

Dit project is onderdeel van **[GovChat-NL](https://govchat.nl)** — een initiatief dat AI-chattools toegankelijk en veilig maakt voor de Nederlandse overheid.

### Wat is GovChat-NL?

GovChat-NL is een open-source AI-chatplatform specifiek ontwikkeld voor Nederlandse overheidsorganisaties. Het biedt een veilige, privacy-vriendelijke omgeving waarin ambtenaren kunnen werken met grote taalmodellen (LLMs), zonder dat gevoelige gegevens naar externe partijen gaan.

### Deelnemende organisaties

GovChat-NL wordt gebruikt en mede-ontwikkeld door meerdere Nederlandse gemeenten en provincies, waaronder:
- Gemeente Meierijstad
- Provincie Limburg
- En andere overheidsorganisaties

### Meedoen of interesse?

GovChat-NL is open source en staat open voor deelname van alle Nederlandse overheidsorganisaties.

- **Website**: [govchat.nl](https://govchat.nl)
- **Contact**: Neem contact op via de website voor meer informatie over deelname
- **GitHub**: Bekijk de broncode, dien issues in of draag bij via pull requests
- **Licentie**: Open source — vrij te gebruiken en aan te passen

Of je nu een gemeente, provincie, waterschap of andere overheidsorganisatie bent: je bent welkom om GovChat-NL te gebruiken, te testen en mee te ontwikkelen.
