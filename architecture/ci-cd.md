# Pipeline CI/CD

3 orgs Trailhead Playground: **CI**, **QA**, **PROD**, autenticadas en cada workflow vía `sfdxAuthUrl` guardado como GitHub Secret (`SFDX_AUTH_URL_CI`, `SFDX_AUTH_URL_QA`, `SFDX_AUTH_URL_PROD`).

```
feature/xxx → PR a develop → PR a qa (deploy automático a org QA) → Release publicado desde main (deploy a org PROD)
```

## Workflows (`.github/workflows/`)

- **`validate.yml`** — corre en cada PR hacia `develop`, `qa` o `main`. Ejecuta `sf project deploy validate -o CI -d force-app -l RunLocalTests -w 30` contra la org CI.
- **`deploy-qa.yml`** — corre en cada push a `qa`. Ejecuta `sf project deploy start -o QA -d force-app -l RunLocalTests -w 30`.
- **`deploy-prod.yml`** — corre solo con `release: published` (no con push a `main`). Ejecuta el mismo deploy contra PROD. El deploy a PROD es intencionalmente manual/gated: mergear a `main` no despliega nada por sí solo, hace falta crear el Release.

Los tres pasan `-d force-app` explícito porque `sf project deploy` ya no infiere el `packageDirectory` default de `sfdx-project.json`.

## Filtro de paths

`validate.yml` y `deploy-qa.yml` solo se disparan si el diff toca `force-app/**`, `sfdx-project.json` o `manifest/**`. Cambios de solo documentación (README, `architecture/`, etc.) no ejecutan el pipeline — evita fallos falsos por "no hay nada que desplegar".

## Branch protection

Pendiente de activar: 1 aprobación requerida en `main` (y posiblemente `qa`), enforced incluso para admins, para que ningún deploy a PROD dependa de una sola persona. Requiere al menos un segundo colaborador con acceso al repo.

## Gotchas ya resueltos

- `sf project deploy validate/start` sin `-d`/`-x`/`--metadata` falla con "Exactly one of the following must be provided". Ver commit `f5a50f6`.
- Las 3 orgs (CI, QA, PROD) parten vacías (scaffold SFDX sin metadata real) — hasta que no haya al menos un componente en `force-app`, el paso de deploy falla con `MissingPackageDirectoryError` porque git no versiona carpetas vacías.
