# Playra

**Playra** är en statisk webbapp som samlar starttider för **MotoGP**, **Formel 1** och **NHL** i en gemensam kalender – vecko- och månadsvy, filter per sport, samt NHL-lag med favoriter och ”intressanta” lag som sparas i `localStorage`.

Tider visas i **Europe/Stockholm** och gränssnittet är på **svenska**.

## Köra lokalt

```bash
npm install
npm run fetch-data   # hämtar schema från öppna API:er (körs även automatiskt före build)
npm run dev          # http://localhost:5173
```

### Tester och build

```bash
npm test
npm run build
npm run preview
```

## Publicering (GitHub Pages)

Bygget använder bas-sökväg `/playra/` när `GITHUB_PAGES=true` (se workflow). Aktivera Pages från **GitHub Actions** i repots inställningar.

Lokalt med samma bas:

```bash
GITHUB_PAGES=true npm run build
GITHUB_PAGES=true npm run preview
```

## Datakällor och arkitektur

| Sport | Källa | Vad som hämtas |
|--------|--------|----------------|
| **F1** | [OpenF1](https://openf1.org/) (`api.openf1.org/v1/sessions`) | Alla sessioner (träning, kval, sprint, lopp) för innevarande och nästa år |
| **MotoGP** | MotoGP PulseLive (`api.motogp.pulselive.com/motogp/v1/events`) | GP-weekends (`kind=GP`), klass **MotoGP (MGP)** – träning, practice, Q1/Q2, sprint, warm-up, lopp |
| **NHL** | NHL Official Web API (`api-web.nhle.com/v1/schedule`) | Hela säsongen (försäsong, grundserie, slutspel när publicerat), vecka för vecka |

### Varför build-tidsinhämtning?

API:erna tillåter anrop utan nyckel men är inte avsedda för direktanrop från webbläsaren (CORS, rate limits, många NHL-anrop). Vid **`npm run fetch-data`** normaliseras allt till `public/data/schedule.json`, som statiska filer serveras av Vite/GitHub Pages. Ingen proxy eller hemligheter i källkoden.

### Begränsningar

- **F1 (OpenF1):** historisk/detaljerad data kan vara ofullständig för långt tillbaka; framtida säsonger finns när serien publicerar dem.
- **MotoGP:** press/show-evenemang ingår inte; endast tävlingspass (practice/kval/sprint/warm-up/lopp). Test och presentationer (`kind≠GP`) utelämnas.
- **NHL:** schemat byggs genom upprepade veckoanrop; om ett anrop misslyckas loggas det i metadata; playoff-detaljer kan uppdateras närmare slutspelet.
- **Uppdatering:** kör `npm run fetch-data` (eller bygg om) för färska tider; sidan uppdaterar inte live i realtid.

Metadata per källa finns i appen under filterpanelen och i `schedule.json` → `sources`.

## Teknik

- Vite + React + TypeScript
- `date-fns` / `date-fns-tz` för Europe/Stockholm
- Vitest för normalisering och filterlogik

## Licens

Projektkod: MIT (data tillhör respektive rights holder).
