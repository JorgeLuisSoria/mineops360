# Modelo de datos

```mermaid
erDiagram
    ACCOUNT {
        string Name
        string Industry
    }
    CONTACT {
        string Name
        string Email
    }
    OPPORTUNITY {
        string Name
        currency Amount
        string StageName
    }
    EQUIPMENT {
        string Name
        picklist Category__c "Andamio / Maquinaria Pesada / Izaje / Vehículo / Generador"
        text Brand__c
        picklist Status__c "Disponible / En Alquiler / En Mantenimiento / Fuera de Servicio"
        text Serial_Number__c
        text Location__c
    }
    RENTAL_CONTRACT {
        string Name "CONT-{0000}"
        date Start_Date__c
        date End_Date__c
        picklist Status__c "Borrador / Activo / Finalizado / Cancelado"
    }
    CONTRACT_LINE {
        number Quantity__c
    }
    INSPECTION {
        date Inspection_Date__c
        text Certificate_URL__c "link al doc en Azure Blob"
        picklist Result__c
    }
    CASE {
        picklist RecordType "Falla de Equipo / Solicitud de Mantenimiento / Consulta"
        picklist Status
        picklist Priority
    }

    ACCOUNT ||--o{ CONTACT : has
    ACCOUNT ||--o{ EQUIPMENT : owns
    ACCOUNT ||--o{ RENTAL_CONTRACT : signs
    ACCOUNT ||--o{ OPPORTUNITY : has
    OPPORTUNITY ||--o| RENTAL_CONTRACT : originates
    RENTAL_CONTRACT ||--o{ CONTRACT_LINE : contains
    EQUIPMENT ||--o{ CONTRACT_LINE : "incluido en"
    EQUIPMENT ||--o{ INSPECTION : "historial de"
    EQUIPMENT ||--o{ CASE : genera
    CONTACT ||--o{ CASE : reporta
```

## Notas del modelo

- `Equipment__c` y `Rental_Contract__c` se relacionan con `Account` por Lookup (no Master-Detail) — un equipo o contrato no debería borrarse en cascada si se elimina la cuenta.
- `Contract_Line__c` es un objeto junction (Master-Detail hacia `Rental_Contract__c` y hacia `Equipment__c`), y resuelve la relación many-to-many: un contrato puede incluir varios equipos, y un equipo puede aparecer en varios contratos a lo largo del tiempo.
- `Inspection__c` es Master-Detail de `Equipment__c` — el historial de inspecciones no tiene sentido sin su equipo.
- `Case` usa Record Types para separar "Falla de Equipo", "Solicitud de Mantenimiento" y "Consulta de Contrato", cada uno con su propio Page Layout y proceso de asignación.
