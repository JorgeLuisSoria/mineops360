# MineOps360

Plataforma Salesforce (Sales Cloud + Service Cloud + Experience Cloud) para gestión de alquiler/mantenimiento de equipos mineros, con integraciones a un servicio Java propio (Azure Blob, Twilio). Proyecto de portafolio de un solo dev, construido en sprints simulados con Git.

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
- Calidad estática (PMD/ESLint/Flow vía Salesforce Code Analyzer): `npm run scan`
  (requiere el plugin: `sf plugins install code-analyzer`, y Java 11+ para el motor PMD)

## Flujo de ramas

`feature/xxx` → PR a `develop` → PR a `qa` (push a `qa` dispara deploy automático a la org QA) → Release publicado desde `main` (dispara deploy a PROD; el merge a `main` por sí solo **no** despliega).

Detalle completo (ruleset `protect-main-qa`, por qué `deploy-qa.yml` filtra por `paths` y `validate.yml` no, cómo cada job se salta el trabajo pesado en PRs de solo docs): `architecture/ci-cd.md`.

## Orgs y secrets

3 orgs Trailhead Playground: CI, QA, PROD — alias locales iguales a los nombres. Secrets del repo: `SFDX_AUTH_URL_CI`, `SFDX_AUTH_URL_QA`, `SFDX_AUTH_URL_PROD`. Nunca imprimir o loggear su valor.

## Convenciones

- Metadata custom con sufijo `__c` en inglés (`Equipment__c`, `Rental_Contract__c`), pero labels y textos de UI en español.
- Un PR por feature (disciplina propia, sin aprobación de terceros: ver `architecture/ci-cd.md`). Push directo a `develop`/`qa`/`main` solo para fixes triviales.
- Antes de mergear un PR, el check `validate` debe estar en verde.
- No mergear a `main` sin que el deploy a QA (`deploy-qa.yml`) haya corrido en verde primero.
