# Open WebUI met Help Overlay
#
# Bouwt bovenop de officiële Open WebUI image en voegt alleen
# de help-button + handleiding toe via loader.js en custom.css.
#
# Gebruik:
#   docker build -t open-webui-met-help .
#   docker run -d -p 3000:8080 --name open-webui-help open-webui-met-help
#
# Of in docker-compose.yaml:
#   build: ./open-webui-help-overlay

FROM ghcr.io/open-webui/open-webui:main

# Kopieer de overlay-bestanden naar de FRONTEND build directory.
# Open WebUI kopieert bij startup alles van /app/build/static/ → werkende static dir.
# Hierdoor overleven onze bestanden elke herstart.
COPY loader.js       /app/build/static/loader.js
COPY custom.css      /app/build/static/custom.css
COPY help-content.json /app/build/static/help-content.json
