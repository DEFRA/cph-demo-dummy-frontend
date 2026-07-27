# cph-demo-dummy-frontend

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cph-demo-dummy-frontend&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_cph-demo-dummy-frontend)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cph-demo-dummy-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_cph-demo-dummy-frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cph-demo-dummy-frontend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_cph-demo-dummy-frontend)

Core delivery platform Node.js Frontend Template.

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Server-side Caching](#server-side-caching)
- [Redis](#redis)
- [Local Development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Update dependencies](#update-dependencies)
  - [Formatting](#formatting)
    - [Windows prettier issue](#windows-prettier-issue)
- [Sample Form](#sample-form)
  - [1. Install plugin](#1-install-plugin)
  - [2. Add local auth bypass](#2-add-local-auth-bypass)
  - [3. Create the form definition](#3-create-the-form-definition)
  - [4. Create forms service](#4-create-forms-service)
  - [5. Register the forms plugin](#5-register-the-forms-plugin)
  - [6. Run the app](#6-run-the-app)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
  - [Dependabot](#dependabot)
  - [SonarCloud](#sonarcloud)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd cph-demo-dummy-frontend
nvm use
```

## Server-side Caching

We use Catbox for server-side caching. By default the service will use CatboxRedis when deployed and CatboxMemory for
local development.
You can override the default behaviour by setting the `SESSION_CACHE_ENGINE` environment variable to either `redis` or
`memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be shared between each
instance of the service and it will not persist between restarts.

## Redis

Redis is an in-memory key-value store. Every instance of a service has access to the same Redis key-value store similar
to how services might have a database (or MongoDB). All frontend services are given access to a namespaced prefixed that
matches the service name. e.g. `my-service` will have access to everything in Redis that is prefixed with `my-service`.

If your service does not require a session cache to be shared between instances or if you don't require Redis, you can
disable setting `SESSION_CACHE_ENGINE=false` or changing the default value in `src/config/index.js`.

## Proxy

We are using forward-proxy which is set up by default. To make use of this: `import { fetch } from 'undici'` then
because of the `setGlobalDispatcher(new ProxyAgent(proxyUrl))` calls will use the ProxyAgent Dispatcher

If you are not using Wreck, Axios or Undici or a similar http that uses `Request`. Then you may have to provide the
proxy dispatcher:

To add the dispatcher to your own client:

```javascript
import { ProxyAgent } from 'undici'

return await fetch(url, {
  dispatcher: new ProxyAgent({
    uri: proxyUrl,
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
})
```

## OGC API Features Integration

Use a backend proxy route so your API key is never exposed in browser JavaScript.

Add these variables to your `.env`:

```bash
OGC_API_BASE_URL=https://<your-ogc-host>/<ogc-features-root>/
OGC_API_KEY=<your-api-key>
OGC_API_SECRET=<your-api-secret>

# Optional: if your provider expects a specific header
OGC_API_KEY_HEADER=x-api-key
OGC_API_SECRET_HEADER=x-api-secret

# Optional: set this instead of OGC_API_KEY_HEADER when the provider expects the key in query string
# OGC_API_KEY_QUERY_PARAM=key
# OGC_API_SECRET_QUERY_PARAM=secret

# Optional timeout in milliseconds (default 10000)
# OGC_API_TIMEOUT_MS=10000
```

Also accepted (aliases):

- `OGC_API_ENDPOINT_URL`, `OGC_API_URL`, `OGC_ENDPOINT_URL` for base URL
- `OGC_KEY` for API key
- `OGC_SECRET` for API secret

Available backend endpoints:

- `GET /api/ogc/collections`
- `GET /api/ogc/collections/{collectionId}/items`

All query parameters are forwarded to the upstream OGC API. Example:

```bash
curl "http://localhost:3001/api/ogc/collections/buildings/items?bbox=-2.3,53.4,-2.1,53.5&limit=50"
```

Example browser usage:

```javascript
const response = await fetch('/api/ogc/collections/my-collection/items?limit=25')
const featureCollection = await response.json()
console.log(featureCollection.features)
```

## Local Development

### Setup

Install application dependencies:

```bash
npm install
```

### Git hooks

Install git hooks (optional)

```bash
npm run git:hooks
```

### Development

To run the application in `development` mode run:

```bash
npm run dev
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

### Update dependencies

To update dependencies use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

> The following script is a good start. Check out all the options on
> the [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

```bash
ncu --interactive --format group
```

### Formatting

#### Windows prettier issue

If you are having issues with formatting of line breaks on Windows update your global git config by running:

```bash
git config --global core.autocrlf false
```

## Sample Form

This section shows a minimal setup to render a sample form page using `@defra/forms-engine-plugin`.

### 1. Install plugin

```bash
npm install @defra/forms-engine-plugin@4.19.1
```

### 2. Add local auth bypass

In development, allow local bypass so form routes do not redirect to Entra sign-in.

In your `.env`:

```bash
AUTH_BYPASS=true
SESSION_COOKIE_PASSWORD=the-password-must-be-at-least-32-characters-long
```

### 3. Create the form definition

Create `src/server/forms/pet-registration.json`:

```json
{
  "name": "Pet Registration Form",
  "version": 2,
  "pages": [
    {
      "id": "449c053b-9201-4312-9a75-187ac1b720eb",
      "title": "What is your full name?",
      "path": "/pet-form/intro",
      "section": "449c053b-9201-4312-9a75-187ac1b720ec",
      "components": [
        {
          "id": "2e088e75-c6f6-4a0f-8f1f-3cee14c71e4c",
          "type": "TextField",
          "title": "Full name",
          "name": "fullName",
          "shortDescription": "Enter your full name",
          "options": {
            "required": true
          },
          "schema": {
            "minLength": 1,
            "maxLength": 100
          }
        }
      ]
    }
  ],
  "sections": [
    {
      "id": "449c053b-9201-4312-9a75-187ac1b720ec",
      "title": "About You",
      "name": "about-you"
    }
  ],
  "lists": []
}
```

### 4. Create forms service

Create `src/server/services/forms-service.js`:

```javascript
import path from 'path'
import { fileURLToPath } from 'node:url'
import { FileFormService } from '@defra/forms-engine-plugin/file-form-service.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const formsDir = path.join(dirname, '../forms')

const now = new Date()
const user = { id: 'local', displayName: 'Local Dev' }
const author = {
  createdAt: now,
  createdBy: user,
  updatedAt: now,
  updatedBy: user
}

const loader = new FileFormService()

await loader.addForm(path.join(formsDir, 'pet-registration.json'), {
  id: 'a1b2c3d4-0000-0000-0000-000000000001',
  title: 'Pet Registration Form',
  slug: 'pet-form',
  organisation: 'Defra',
  teamName: 'Demo Team',
  teamEmail: 'demo@defra.gov.uk',
  submissionGuidance: "Thanks for registering your pet, we'll be in touch",
  notificationEmail: 'demo@defra.gov.uk',
  ...author,
  live: author
})

export const formsService = loader.toFormsService()
```

### 5. Register the forms plugin

In `src/server/server.js`:

1. Register `@hapi/inert` before static directories are used.
2. Import and register `@defra/forms-engine-plugin`.
3. Provide `formsService`, plus basic `formSubmissionService` and `outputService` stubs.

Minimal service stubs:

```javascript
const formSubmissionService = {
  async submit() {
    return { ok: true }
  }
}

const outputService = {
  async save() {
    return { ok: true }
  }
}
```

### 6. Run the app

Use a login shell in WSL so Node/NVM is loaded correctly:

```bash
wsl -d Ubuntu bash -li -c "cd /home/<your-user>/cph-demo-dummy-frontend && npm run dev"
```

Open:

- `http://localhost:3001/pet-form/intro`

If redirected to sign-in, confirm `.env` contains `AUTH_BYPASS=true` and restart.

## Docker

### Development image

> [!TIP]
> For Apple Silicon users, you may need to add `--platform linux/amd64` to the `docker run` command to ensure
> compatibility fEx: `docker build --platform=linux/arm64 --no-cache --tag cph-demo-dummy-frontend`

Build:

```bash
docker build --target development --no-cache --tag cph-demo-dummy-frontend:development .
```

Run:

```bash
docker run -p 3000:3000 cph-demo-dummy-frontend:development
```

### Production image

Build:

```bash
docker build --no-cache --tag cph-demo-dummy-frontend .
```

Run:

```bash
docker run -p 3000:3000 cph-demo-dummy-frontend
```

### Docker Compose

A local environment with:

- Floci (replacing Localstack) for AWS services (S3, SQS)
- Redis
- MongoDB
- This service.
- A commented out backend example.

To enable the Easting/Northing map, set the following values in compose/aws.env:

- ORDNANCE_SURVEY_API_KEY
- ORDNANCE_SURVEY_API_SECRET

These credentials come from OS Maps API (API Catalogue):

- https://www.api.gov.uk/os/os-maps-api/#os-maps-api

For local development, you can place the same variables in `.env` as an alternative to `compose/aws.env`.

To verify map API routes are wired correctly:

```bash
node tmp-check-map-routes.mjs
node tmp-check-geocode.mjs
```

```bash
docker compose up --build -d
```

### Dependabot

We have added an example dependabot configuration file to the repository. You can enable it by renaming
the [.github/example.dependabot.yml](.github/example.dependabot.yml) to `.github/dependabot.yml`

### SonarCloud

Instructions for setting up SonarCloud can be found in [sonar-project.properties](./sonar-project.properties).

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
