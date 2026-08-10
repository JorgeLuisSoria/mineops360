# MineOps360

Plataforma Salesforce (Sales Cloud + Service Cloud + Experience Cloud) para gestión de alquiler/mantenimiento de equipos mineros, con integraciones a un servicio Java propio (Azure Blob, Twilio). Proyecto de portafolio compartido entre dos devs, construido en sprints simulados con Git.

Para contexto de negocio y decisiones de diseño, lee bajo demanda (no cargar todo de una):
- `architecture/data-model.md` — objetos y relaciones
- `architecture/security-model.md` — roles, OWD, sharing
- `architecture/cloud-scope.md` — alcance por nube y stack
- `architecture/integrations.md` — servicio Java, Azure Blob, Twilio
- `architecture/ci-cd.md` — pipeline, orgs, gotchas ya resueltos
- `ROADMAP.md` — plan semana a semana, quién construye qué

## Estructura del repo

```
force-app/main/default/   # metadata Salesforce (fuente de verdad)
manifest/package.xml       # manifest para retrieve/deploy por manifest
architecture/               # docs técnicos profundos (ver arriba)
.github/workflows/          # validate.yml, deploy-qa.yml, deploy-prod.yml
config/                     # scratch org defs
scripts/
```

## Comandos

- Deploy/validar contra una org: `sf project deploy validate|start -o <ORG> -d force-app -l RunLocalTests -w 30`
  (`-d force-app` es obligatorio — `sf` ya no infiere el packageDirectory default de `sfdx-project.json`)
- Tests LWC: `npm run test:unit`
- Lint: `npm run lint`
- Formato: `npm run prettier`

## Flujo de ramas

`feature/xxx` → PR a `develop` → PR a `qa` (push a `qa` dispara deploy automático a la org QA) → Release publicado desde `main` (dispara deploy a PROD; el merge a `main` por sí solo **no** despliega).

Detalle completo, incluyendo por qué `validate.yml`/`deploy-qa.yml` usan filtro de `paths` (para que cambios de solo documentación no fallen el pipeline): `architecture/ci-cd.md`.

## Orgs y secrets

3 orgs Trailhead Playground: CI, QA, PROD — alias locales iguales a los nombres. Secrets del repo: `SFDX_AUTH_URL_CI`, `SFDX_AUTH_URL_QA`, `SFDX_AUTH_URL_PROD`. Nunca imprimir o loggear su valor.

## Convenciones

- Metadata custom con sufijo `__c` en inglés (`Equipment__c`, `Rental_Contract__c`), pero labels y textos de UI en español.
- Un PR por feature; no hacer push directo a `develop`/`qa`/`main` salvo fixes triviales ya acordados.
- No mergear a `main` sin que el deploy a QA (`deploy-qa.yml`) haya corrido en verde primero.
