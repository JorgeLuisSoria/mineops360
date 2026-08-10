# Arquitectura de integración

```
Salesforce (Apex REST + HTTP Callout, Named Credentials)
        │
        ▼
Servicio Java / Spring Boot  ──────►  Azure Blob Storage (certificados de inspección)
        │
        ▼
Twilio API (SMS al cliente cuando un Case crítico cambia de estado)
```

- **Apex REST Service** expuesto desde Salesforce para que sistemas externos consulten equipos.
- **HTTP Callout** desde Apex (Queueable, para no bloquear al usuario) hacia el servicio Java que sube/descarga certificados de inspección a Azure Blob Storage (nivel gratuito, 5 GB).
- **Named Credentials** para manejar la autenticación hacia el servicio Java sin hardcodear credenciales.
- **Twilio**, vía Apex Callout, para notificar por SMS cuando un Case de falla crítica cambia de estado.
