# Admin-Setup (Decap CMS)

Diese Seite dokumentiert, wie das Admin-Backend für die Galerie eingerichtet wird.

## 1) GitHub OAuth App anlegen

1. Öffne **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Trage ein:
   - **Application name:** Friseurmeisterin Dalinger CMS
   - **Homepage URL:** `https://varane.github.io/FriseurmeisterinDalinger/`
   - **Authorization callback URL:** `https://<DEIN-OAUTH-PROXY>/auth`
3. Speichere die App und notiere dir **Client ID** und **Client Secret**.

## 2) OAuth-Proxy deployen (Empfehlung: Cloudflare Worker)

Du brauchst einen externen OAuth-Proxy, weil GitHub Pages keine Callback-URL hostet.

1. Deploye einen OAuth-Proxy (z. B. den Decap OAuth Provider oder eine Cloudflare-Worker-Variante).
2. Hinterlege dort **Client ID** und **Client Secret** deiner GitHub OAuth App.
3. Prüfe, dass der Proxy eine URL im Format `https://<DEIN-OAUTH-PROXY>` bereitstellt.

## 3) Base URL in der CMS-Konfiguration eintragen

Öffne `admin/config.yml` und ersetze den Platzhalter:

```yml
base_url: "PLACEHOLDER_OAUTH_BASE_URL"
```

mit der tatsächlichen Proxy-URL, z. B.:

```yml
base_url: "https://dein-oauth-proxy.example.com"
```

> Keine Secrets committen: Client Secret bleibt nur im Proxy.

## 4) Admin starten

Rufe im Browser auf:

```
https://varane.github.io/FriseurmeisterinDalinger/admin/
```

Nach erfolgreichem Login kannst du Bilder unter **Gallery Items** hochladen und die Reihenfolge pflegen.
