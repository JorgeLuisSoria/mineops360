# Pipeline CI/CD

3 orgs Trailhead Playground: **CI**, **QA**, **PROD**, autenticadas en cada workflow vía `sfdxAuthUrl` guardado como GitHub Secret (`SFDX_AUTH_URL_CI`, `SFDX_AUTH_URL_QA`, `SFDX_AUTH_URL_PROD`).

```
feature/xxx → PR a develop → PR a qa (deploy automático a org QA) → Release publicado desde main (deploy a org PROD)
```

## Workflows (`.github/workflows/`)

- **`validate.yml`** — corre en **cada** PR hacia `develop`, `qa` o `main` (sin filtro de `paths`). Dos jobs paralelos:
  - `validate`: `sf project deploy validate -o CI -d force-app -l RunLocalTests -w 30` contra la org CI.
  - `code-analyzer`: análisis estático de calidad (ver más abajo). No toca ninguna org.
  - Cada job arranca con un paso "¿Cambió metadata de Salesforce?" (`git diff` contra la base del PR sobre `force-app/`, `manifest/`, `sfdx-project.json`). Si no cambió nada, los pasos pesados se saltan (`if: steps.changes.outputs.sf == 'true'`) y el job termina en verde en segundos. Así el check **siempre reporta** aunque el PR sea de solo docs — necesario porque son checks requeridos por el ruleset.
- **`deploy-qa.yml`** — corre en cada push a `qa`. Ejecuta `sf project deploy start -o QA -d force-app -l RunLocalTests -w 30`.
- **`deploy-prod.yml`** — corre solo con `release: published` (no con push a `main`). Ejecuta el mismo deploy contra PROD. El deploy a PROD es intencionalmente manual/gated: mergear a `main` no despliega nada por sí solo, hace falta crear el Release.

Los tres pasan `-d force-app` explícito porque `sf project deploy` ya no infiere el `packageDirectory` default de `sfdx-project.json`.

## Filtro de paths

`deploy-qa.yml` solo se dispara si el push a `qa` toca `force-app/**`, `sfdx-project.json` o `manifest/**` — un merge de solo documentación a `qa` no lanza un deploy "sin nada que desplegar".

`validate.yml` **no** usa filtro de `paths` (sus checks son requeridos por el ruleset y tienen que reportar siempre); el salto de trabajo por-PR lo resuelve a nivel de step. Ver "Workflows" arriba.

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

**Activo**: repository ruleset `protect-main-qa` (Settings → Rules → Rulesets), enforcement `active`, sobre `refs/heads/main` y `refs/heads/qa`:

- **Require a pull request before merging**, con **0 approvals**.
- **Require status checks to pass**: `validate` y `code-analyzer` (jobs de `validate.yml`). Política no estricta (no exige que la rama esté al día antes de mergear).
- **Block force pushes** (`non_fast_forward`) y **block deletion**.
- **Bypass**: rol `Repository admin` en modo `always` — podés auto-mergear y, si hace falta, pushear directo sin quedar bloqueado.

`develop` queda sin proteger a propósito (es la rama de integración). Si se suma otro colaborador: subir approvals a `1` y quitar el bypass de admin.

**Checks requeridos + PRs de solo docs** (resuelto): antes `validate` / `code-analyzer` tenían filtro de `paths`, así que en un PR de solo documentación nunca reportaban y GitHub bloqueaba el merge con "Expected — waiting for status". Ahora los jobs corren siempre y se saltan el trabajo pesado por step, con lo que reportan verde en segundos. El bypass de admin queda solo como escape para casos raros.

## Gotchas ya resueltos

- `sf project deploy validate/start` sin `-d`/`-x`/`--metadata` falla con "Exactly one of the following must be provided". Ver commit `f5a50f6`.
- Las 3 orgs (CI, QA, PROD) parten vacías (scaffold SFDX sin metadata real) — hasta que no haya al menos un componente en `force-app`, el paso de deploy falla con `MissingPackageDirectoryError` porque git no versiona carpetas vacías.
