# Pipeline CI/CD

3 orgs Trailhead Playground: **CI**, **QA**, **PROD**, autenticadas en cada workflow vía `sfdxAuthUrl` guardado como GitHub Secret (`SFDX_AUTH_URL_CI`, `SFDX_AUTH_URL_QA`, `SFDX_AUTH_URL_PROD`).

```
feature/xxx → PR a develop → PR a qa (deploy automático a org QA) → Release publicado desde main (deploy a org PROD)
```

## Workflows (`.github/workflows/`)

- **`validate.yml`** — corre en cada PR hacia `develop`, `qa` o `main`. Dos jobs paralelos:
  - `validate`: `sf project deploy validate -o CI -d force-app -l RunLocalTests -w 30` contra la org CI.
  - `code-analyzer`: análisis estático de calidad (ver más abajo). No toca ninguna org.
- **`deploy-qa.yml`** — corre en cada push a `qa`. Ejecuta `sf project deploy start -o QA -d force-app -l RunLocalTests -w 30`.
- **`deploy-prod.yml`** — corre solo con `release: published` (no con push a `main`). Ejecuta el mismo deploy contra PROD. El deploy a PROD es intencionalmente manual/gated: mergear a `main` no despliega nada por sí solo, hace falta crear el Release.

Los tres pasan `-d force-app` explícito porque `sf project deploy` ya no infiere el `packageDirectory` default de `sfdx-project.json`.

## Filtro de paths

`validate.yml` y `deploy-qa.yml` solo se disparan si el diff toca `force-app/**`, `sfdx-project.json` o `manifest/**`. Cambios de solo documentación (README, `architecture/`, etc.) no ejecutan el pipeline — evita fallos falsos por "no hay nada que desplegar".

## Calidad de código (Salesforce Code Analyzer)

Gate estático gratuito, motor open source. Plugin `code-analyzer` de `sf` (v5). Envuelve varios motores con rulesets mantenidos por Salesforce:

- **PMD** — Apex / Visualforce / XML: best practices, seguridad (SOQL/DML en loop, CRUD/FLS, SOQL injection, hardcoded IDs), naming, complejidad.
- **PMD CPD** — código duplicado.
- **ESLint** — JS de LWC/Aura; usa el `eslint.config.js` del repo.
- **RetireJS** — librerías JS con CVEs.
- **flowtest** — best practices en Flows (necesita Python 3.10+; en CI ya está).
- **regex** — reglas propias.

Uso local: `npm run scan` (reporte detallado en consola). En CI lo corre el job `code-analyzer` de `validate.yml`: instala el plugin, corre `sf code-analyzer run` sobre `force-app` y **falla el PR si hay violaciones de severidad ≥ 3** (Moderate). El umbral se ajusta en el flag `--severity-threshold` del workflow; las reglas puntuales, en `code-analyzer.yml` de la raíz. El reporte HTML queda como artifact del run.

El job necesita Java 17 (`actions/setup-java`) porque el motor PMD corre sobre JVM.

## Branch protection

Proyecto de un solo dev: no se exige aprobación de PR (GitHub no permite aprobar el PR propio, así que "1 aprobación requerida" es inviable en solitario). El flujo de PR se mantiene por disciplina, no por bloqueo.

Config recomendada en GitHub (Settings → Rules / Branch protection) para `main` y `qa`:

- **Require a pull request before merging**: sí.
- **Required approvals**: `0`.
- **Require status checks to pass**: marcar los checks `validate` y `code-analyzer` (jobs de `validate.yml`).
- **Do not allow bypassing the above settings**: desactivado, para poder auto-mergear como admin.

Si en el futuro se suma otro colaborador, subir *Required approvals* a `1` y activar el enforcement para admins.

## Gotchas ya resueltos

- `sf project deploy validate/start` sin `-d`/`-x`/`--metadata` falla con "Exactly one of the following must be provided". Ver commit `f5a50f6`.
- Las 3 orgs (CI, QA, PROD) parten vacías (scaffold SFDX sin metadata real) — hasta que no haya al menos un componente en `force-app`, el paso de deploy falla con `MissingPackageDirectoryError` porque git no versiona carpetas vacías.
