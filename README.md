# MineOps360

Plataforma de gestión de alquiler y mantenimiento de equipos y maquinaria para proyectos mineros, construida sobre Salesforce (Sales Cloud + Service Cloud + Experience Cloud) con integraciones a un servicio propio en Java.

Proyecto de portafolio compartido, construido en sprints semanales simulados con GitHub, por Jorge Soria y Carlos Soria (experto de mantenimiento de maquinaria minera / agente de ventas de andamios Doka & Layher, en transición a Salesforce Developer).

## 📋 De qué trata

Una empresa minera alquila equipos y maquinaria (andamios, maquinaria pesada, equipos de izaje, vehículos, generadores) a distintas compañías mineras clientes. MineOps360 cubre todo el ciclo:

- **Venta y alquiler** del equipo (Sales Cloud): oportunidades, contratos de alquiler, aprobaciones de descuento.
- **Mantenimiento y soporte** (Service Cloud): reporte de fallas, asignación a técnicos por especialidad, SLA de respuesta, base de conocimiento, consola de atención con dial.
- **Autogestión del cliente** (Experience Cloud): un portal donde cada empresa minera ve solo sus propios equipos y contratos, reporta incidencias y descarga certificados de inspección.
- **Integraciones**: los certificados de inspección se suben/descargan desde un servicio propio en Java conectado a Azure Blob Storage, y las notificaciones críticas de servicio se envían por SMS vía Twilio.

El proyecto está pensado para reflejar el día a día real de un equipo de implementación Salesforce — modelado de datos, seguridad, automatización declarativa, Apex, integraciones — construido en sprints semanales con Pull Requests, revisiones cruzadas, y un pipeline de CI/CD real sobre 3 orgs (CI, QA, PROD).

## 🏗️ Arquitectura

La documentación técnica profunda vive en [`architecture/`](architecture/) para no inflar este README:

- [Modelo de datos](architecture/data-model.md) — objetos, relaciones y diagrama ER
- [Modelo de seguridad](architecture/security-model.md) — roles, OWD, sharing
- [Alcance por nube](architecture/cloud-scope.md) — Sales / Service / Experience Cloud y stack tecnológico
- [Integraciones](architecture/integrations.md) — servicio Java, Azure Blob, Twilio
- [Pipeline CI/CD](architecture/ci-cd.md) — workflows, orgs, branch protection

El plan de trabajo semana a semana está en [`ROADMAP.md`](ROADMAP.md).

## 👥 Roles del equipo

- **Tech Lead / Integraciones:** revisa y aprueba PRs hacia `qa`/`main`, crea los Releases, construye la capa de Apex/integraciones.
- **Desarrollador Junior:** construye cada feature declarativa primero (modelo de datos, automatización, seguridad), abre PRs contra `develop`.
