# Experience Cloud: portal del cliente minero

## Decisión

El sitio se **crea a mano en cada org** (QA y PROD) con Experience Builder y **no se versiona todavía**. Lo que sí vive en el repo y viaja por el pipeline es todo lo que el sitio consume:

| En el repo (se despliega con `deploy-qa` / `deploy-prod`)                                                 | Manual en cada org (por ahora)                             |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Objetos `Equipment__c`, `Rental_Contract__c`, `Contract_Line__c`, `Inspection__c`, `Case.Equipment__c`    | Activar Digital Experiences y crear el sitio               |
| OWD en Private para los objetos externos (`externalSharingModel`)                                         | Perfil externo, Sharing Sets y miembros del sitio          |
| Permission set `MineOps_Portal_Customer`                                                                  | Páginas del sitio y ubicación de los componentes           |
| LWC `equipmentList`, `equipmentInspections`, `reportEquipmentIssue` (con targets `lightningCommunity__*`) | Usuario de prueba del portal (cuenta + contacto + usuario) |
| `EquipmentController` (consulta en `USER_MODE`)                                                           | Publicar el sitio                                          |

**Por qué no versionar el sitio desde el día uno:** desplegar un sitio (`Network`, `CustomSite`, `ExperienceBundle` o `DigitalExperienceBundle`) a una org nueva requiere que Digital Experiences ya esté activado en esa org, que el perfil de invitado y los perfiles miembros existan con el mismo nombre y que el prefijo de URL esté libre. En orgs gratuitas eso falla seguido y bloquearía el pipeline. Una vez que el sitio esté estable en QA, se recupera y se versiona (ver "Paso 2" abajo).

## Paso 1: crear el sitio en QA (luego repetir en PROD)

1. **Revisar licencias.** Setup → Company Information → User Licenses: confirmar que la org tiene licencias `Customer Community` o `Customer Community Plus` disponibles. Sin ellas no se puede crear el usuario del portal.
2. **Activar Digital Experiences.** Setup → Digital Experiences → Settings → Enable Digital Experiences. Elegir el dominio. **No se puede desactivar después.**
3. **Desplegar este PR a QA primero.** Así los objetos, el permission set y los LWC ya existen cuando se arma el sitio.
4. **Crear el sitio.** Setup → All Sites → New → plantilla **Customer Account Portal** (como dice `ROADMAP.md`). Nombre `Portal MineOps`, URL `/portal`.
   - Si el portal de referencia (por ejemplo el de un cliente real) usa LWR, elegir **Build Your Own (LWR)** para que el POC sea lo más parecido posible. Los tres LWC sirven en ambos tipos.
5. **Perfil externo.** Clonar `Customer Community User` (o `Customer Community Plus User`) como `MineOps Cliente`. En Administration → Members del sitio, agregar ese perfil.
6. **Sharing Sets** (Setup → Digital Experiences → Settings → Sharing Sets → New), para el perfil `MineOps Cliente`:
   - `Equipment__c`: `Account__c` = `User.Contact.AccountId`, acceso Read Only.
   - `Rental_Contract__c`: `Account__c` = `User.Contact.AccountId`, acceso Read Only.
   - `Case`: `AccountId` = `User.Contact.AccountId`, acceso Read Only (más los casos que el usuario crea, que ya son suyos).
   - `Inspection__c` y `Contract_Line__c` no necesitan Sharing Set: heredan acceso del padre (Master-Detail).
7. **Páginas** (Experience Builder):
   - Home: componente **Lista de equipos** (`equipmentList`).
   - Página de detalle de `Equipment__c` (Object Pages → Equipo): **Inspecciones del equipo** y **Reportar falla de equipo**. El `recordId` llega solo desde la página.
   - Navegación: un ítem "Mis equipos" hacia la lista de `Equipment__c` y otro "Mis casos" hacia `Case`.
8. **Acceso de invitado.** Dejar el sitio sin acceso público a estos objetos: el perfil Guest no recibe el permission set.
9. **Usuario de prueba.** Crear la cuenta `Minera Demo`, un contacto, y desde el contacto "Enable Customer User" con el perfil `MineOps Cliente`. Asignar el permission set `MineOps_Portal_Customer`. Cargar 2 o 3 equipos con `Account__c = Minera Demo` y otros de otra cuenta, para demostrar el aislamiento.
10. **Publicar** y probar: el usuario del portal ve solo los equipos de `Minera Demo` y puede reportar una falla.

## Paso 2: versionar el sitio cuando esté estable

1. Para sitios Aura (Customer Account Portal): Setup → Digital Experiences → Settings → **Enable ExperienceBundle Metadata API**.
2. Recuperar desde QA:
   - Aura: `sf project retrieve start -o QA -m ExperienceBundle -m Network -m CustomSite`
   - LWR: `sf project retrieve start -o QA -m DigitalExperienceBundle -m DigitalExperienceConfig -m Network -m CustomSite`
3. Revisar el diff, abrir PR a `develop` y dejar que `validate` lo pruebe contra CI. Nota: la org CI también necesitará Digital Experiences activado para que la validación pase.

## Relación con el POC de QA (Qase + Playwright)

Este portal sirve como ensayo del POC de pruebas por impacto. Personas y flujos para el mapa de cobertura:

| Flujo                       | Rutas del repo que lo afectan                                                                                                | Personas                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Cliente ve solo sus equipos | `lwc/equipmentList/**`, `classes/EquipmentController*`, `objects/Equipment__c/**`, `permissionsets/MineOps_Portal_Customer*` | cliente del portal, vendedor |
| Cliente reporta una falla   | `lwc/reportEquipmentIssue/**`, `objects/Case/fields/Equipment__c*`                                                           | cliente del portal, técnico  |
| Historial de inspecciones   | `lwc/equipmentInspections/**`, `objects/Inspection__c/**`                                                                    | cliente del portal, técnico  |

Los usuarios de prueba de cada persona y sus credenciales van como secretos de GitHub Environments (`qa`, `prod`), nunca en el repo. El repo es público, así que los logs de Actions y los artefactos también lo son: no subir traces ni screenshots con datos de sesión.
