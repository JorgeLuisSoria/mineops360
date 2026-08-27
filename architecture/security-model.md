# Modelo de seguridad

Se modelan 4 roles de negocio reales, cada uno con visibilidad distinta:

| Rol | Ve | No ve |
|---|---|---|
| Vendedor | Sus propias Opportunities y Accounts asignadas | Contratos/equipos de otros vendedores |
| Técnico de mantenimiento | `Equipment__c` e `Inspection__c` de su zona/queue | Datos comerciales (Opportunities, montos) |
| Supervisor | Todo lo de su equipo, vía jerarquía | Datos de otras regiones |
| Cliente externo (Experience Cloud) | Solo sus propios equipos y contratos | Datos de otras empresas mineras |

## Capas usadas para lograrlo

- **Nivel objeto/campo:** Profiles, Permission Sets y Permission Set Groups; Field-Level Security (ej. el Técnico no ve el monto del contrato).
- **Nivel registro:** Organization-Wide Defaults en Private para `Equipment__c` y `Rental_Contract__c`; Role Hierarchy (Supervisor ve lo de su Técnico); Sharing Rules por dueño y por criterio (ej. compartir por zona); Manual Sharing puntual.
- **Nivel externo (Experience Cloud):** Sharing Sets y Share Groups para que cada empresa minera vea solo lo suyo; distinción entre licencia Customer Community y Customer Community Plus; acceso de Guest User vs usuario autenticado.
