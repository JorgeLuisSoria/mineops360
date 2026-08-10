# 🗺️ MineOps360 — Roadmap de Aprendizaje y Portafolio Salesforce

**Equipo:** Jorge Soria (Salesforce Developer, ~3-4 años, foco en integraciones/Apex, camino a Arquitecto de Integración) + Carlos Soria (ex-técnico de mantenimiento de maquinaria minera / ventas de andamios Doka-Layher, TECSUP Arequipa, estudiando Java + React, objetivo: Salesforce Developer Junior antes de enero)

**Periodo:** 10 de agosto 2026 → 27 de diciembre 2026 (20 semanas), dejando enero libre para postulaciones y entrevistas.

---

## 1. El proyecto: MineOps360

Una plataforma de **gestión de alquiler y mantenimiento de equipos y maquinaria para proyectos mineros** — no solo andamios: incluye maquinaria pesada, equipos de izaje, vehículos y generadores, reflejando tanto la venta de andamios (Doka/Layher) como el mantenimiento de maquinaria minera que Carlos ya conoce de primera mano. Es el proyecto ideal para ambos porque:

- Carlos puede hablar de él en entrevistas con autoridad real (conoce el negocio de memoria, en ambas facetas).
- Cubre de forma natural Sales Cloud (venta/alquiler), Service Cloud (mantenimiento, incidencias, inspecciones) y Experience Cloud (portal para el cliente minero).
- El caso de uso de "subir/descargar certificados de inspección" encaja perfecto con el servicio Java que quieren construir.
- La variedad de tipos de equipo y de roles (vendedor, técnico, supervisor, cliente externo) da pie natural para trabajar en profundidad **todas las capas del modelo de seguridad de Salesforce**, no solo modelado de datos.

Ver [`architecture/data-model.md`](architecture/data-model.md) para el modelo de datos completo y [`architecture/security-model.md`](architecture/security-model.md) para los roles de negocio usados para modelar seguridad.

---

## 2. Metodología: sprints simulados en Git

- **Repositorio:** cuenta gratuita de GitHub, uno de los dos como owner, el otro como colaborador.
- **Formato del proyecto:** estructura SFDX estándar (`force-app/main/default/...`), con la documentación de arquitectura en `architecture/` actualizada por fase.
- **Sprints:** de 1 semana, usando **GitHub Projects** (Kanban gratuito: Backlog → In Progress → Review → Done).
- **Historias de usuario = Issues:** cada feature de la semana se abre como Issue con formato "Como [rol], quiero [funcionalidad], para [beneficio]".
- **Ramas:** `feature/xxx` → PR a `develop` → PR a `qa` (deploy automático a la org QA) → Release a `main` (deploy automático a la org PROD). Detalle completo en [`architecture/ci-cd.md`](architecture/ci-cd.md).
- **Orgs de trabajo:** 3 Developer Edition orgs gratuitas (CI, QA, PROD) — configuradas desde la Fase 0, para que todo el proyecto se construya ya sobre el pipeline real desde el día uno.

---

## 3. Cómo se dividen el trabajo cada semana

- **Carlos construye primero**, con foco 100% junior: entender el "por qué" de cada herramienta declarativa antes de automatizar con código. Su meta es tener respuestas sólidas para entrevista técnica junior (diferencia entre Flow y Apex Trigger, cuándo usar validation rule vs Apex, etc.).
- **Jorge revisa y extiende**: repasa lo que le falta de modelado de datos y herramientas out-of-the-box, y lleva cada feature un paso más allá con Apex/integraciones — el foco rumbo a Arquitecto de Integración.
- Cierre de sprint semanal (aunque sea 30-45 min): mini demo entre ambos + actualizar la documentación.

---

## 4. Roadmap semana a semana

### 🟩 Fase 0 — Setup (antes del lunes 10 de agosto)
- Crear las 3 orgs Developer Edition gratuitas: CI, QA y PROD (ver [`architecture/ci-cd.md`](architecture/ci-cd.md)).
- Instalar Salesforce CLI + VS Code + extensión Salesforce.
- Crear el repo en GitHub + tablero de proyecto (Kanban) + ramas `develop`/`qa`/`main` + reglas de protección de rama.
- Configurar el workflow `validate.yml` y confirmar que corre en verde contra la org CI.
- Escribir juntos las historias de usuario del MVP (10-15 issues iniciales).

### 🟦 Fase 1 — Modelado de datos + Seguridad (Semanas 1-4 · 10 ago – 6 sep)

**Semana 1 (10-16 ago):** Objetos custom, tipos de campo, relaciones lookup vs master-detail. Crear `Equipment__c` (con sus categorías: andamio, maquinaria pesada, izaje, vehículo, generador) y `Rental_Contract__c`.
**Semana 2 (17-23 ago):** Junction object (`Contract_Line__c`), Schema Builder, roll-up summary fields (ej. cantidad de equipos por contrato), Record Types + Page Layouts dinámicos por categoría de equipo.
**Semana 3 (24-30 ago) — Seguridad, nivel objeto/campo:** crear los 4 usuarios/perfiles de la tabla de roles. Profiles vs Permission Sets vs Permission Set Groups (cuándo usar cada uno — pregunta clásica de entrevista junior), Field-Level Security (ej. el Técnico no ve el campo de monto del contrato), Object-Level permissions (CRUD por perfil).
**Semana 4 (31 ago-6 sep) — Seguridad, nivel registro:** Organization-Wide Defaults (Private para `Equipment__c` y `Rental_Contract__c`), Role Hierarchy (Supervisor ve lo de su Técnico), Sharing Rules basadas en dueño vs basadas en criterio (ej. compartir por zona/región), Manual Sharing puntual, e introducción a Restriction Rules como concepto (feature de Enterprise+, aunque no esté disponible en la DE org, vale la pena conocerla).

*Entregable de fase:* modelo de datos completo y poblado con datos de prueba (Data Loader o Data Import Wizard), con 4 usuarios reales viendo exactamente lo que deberían ver — grabar un GIF corto mostrando la diferencia de vista entre el Vendedor y el Técnico, buen elemento de portafolio.

### 🟦 Fase 2 — Sales Cloud declarativo (Semanas 5-7 · 7 sep – 27 sep)

**Semana 5 (7-13 sep):** Validation Rules (ej. no permitir contrato sin fecha de fin), Formula Fields (ej. días restantes de contrato).
**Semana 6 (14-20 sep):** Flows — Record-Triggered Flow para crear automáticamente un `Inspection__c` cuando un `Equipment__c` cambia de estado a "En alquiler".
**Semana 7 (21-27 sep):** Screen Flow para que un vendedor registre un nuevo contrato paso a paso; Approval Process para descuentos especiales en el contrato; Reports & Dashboards de pipeline de alquiler.

*Entregable de fase:* proceso de venta/alquiler 100% automatizado sin código.

### 🟦 Fase 3 — Service Cloud (Semanas 8-10 · 28 sep – 18 oct)

*Nota de nomenclatura: Salesforce renombró "Service Cloud" a "Agentforce Service" en las releases Spring/Summer '26 — es solo un cambio de marca en la UI. El asistente guiado "Agentforce Service Setup" requiere Enterprise Edition y no estará disponible en las orgs gratuitas, pero la funcionalidad clásica (Cases, Queues, Omni-Channel, Knowledge, Entitlements) no depende de ese wizard y sigue disponible configurándola directamente desde Setup clásico, como se detalla semana a semana abajo.*

**Semana 8 (28 sep-4 oct):** Case Record Types y Page Layouts ("Falla de equipo", "Solicitud de mantenimiento"), Assignment Rules, Queues por especialidad técnica (membresía de queue como capa extra de seguridad/visibilidad), Omni-Channel routing a la queue de técnicos.
**Semana 9 (5-11 oct):** Email-to-Case para que el cliente reporte fallas por correo, Knowledge Base (artículos de manuales de mantenimiento — reutilizando el expertise real de Carlos), Case Milestones + Entitlements para SLA de respuesta a fallas críticas.
**Semana 10 (12-18 oct):** Service Cloud Console a fondo — Utility Bar, Macros, Quick Text, apps de consola Lightning; Case Swarming o Feed-based layout como opción avanzada.

*Entregable de fase:* ciclo completo de atención a incidencias de equipos, con SLA y una consola de agente pulida y eficiente.

### 🟦 Fase 4 — Experience Cloud (Semanas 11-13 · 19 oct – 8 nov)

**Semana 11 (19-25 oct):** Crear el sitio (Customer Account Portal template), tipos de licencia externa (Customer Community vs Customer Community Plus), Sharing Sets para que cada empresa minera vea solo sus propios equipos/contratos.
**Semana 12 (26 oct-1 nov):** Componentes en Experience Builder: listado de equipos alquilados, formulario para crear un Case de mantenimiento desde el portal; Share Groups si hace falta que varios perfiles externos compartan acceso.
**Semana 13 (2-8 nov):** Login/registro de usuarios externos, acceso de Guest User vs cliente autenticado, branding básico, un componente LWC simple embebido.

*Entregable de fase:* portal funcional donde el cliente minero autogestiona sus contratos e incidencias.

### 🟦 Fase 5 — Apex + Integraciones (Semanas 14-16 · 9 nov – 29 nov)

**Semana 14 (9-15 nov):** Apex classes/triggers con buenas prácticas (bulkification, trigger handler pattern), SOQL/SOSL, cubrir con Apex lo que las herramientas declarativas no alcanzan.
**Semana 15 (16-22 nov):** Apex REST Service expuesto desde Salesforce (para que el portal externo o servicios de terceros consulten equipos) + Named Credentials.
**Semana 16 (23-29 nov):** HTTP Callout desde Apex hacia el servicio Java (ver Fase 6) para subir/descargar los certificados de inspección; Async Apex (Queueable) para no bloquear al usuario mientras se sube el archivo.

*En paralelo, Fase 6 — Servicio Java "bucket" de documentos (mismo periodo, semanas 14-16):*
Carlos, apoyándose en su curso de Java, construye una API REST simple (Spring Boot) con dos endpoints: `POST /documents` (subir certificado) y `GET /documents/{id}` (descargar). Se despliega gratis en Render o Railway (free tier), guardando los archivos en almacenamiento local del servicio o un bucket gratuito (Cloudinary/S3 free tier). Lo construyen juntos, cada uno desde su ángulo (Carlos como backend Java, Jorge como consumidor Apex).

*Entregable de fase:* certificado subido desde Salesforce llega al servicio Java, y se puede descargar desde el portal Experience Cloud.

### 🟦 Fase 7 — Twilio + Reporting ejecutivo (Semanas 17-18 · 30 nov – 13 dic)

**Semana 17 (30 nov-6 dic):** Integración Twilio vía Apex Callout — enviar SMS automático al cliente cuando su Case de falla crítica cambia de estado.
**Semana 18 (7-13 dic):** Dashboard ejecutivo que une Sales Cloud y Service Cloud (pipeline de alquiler + SLA de mantenimiento en una sola vista); de paso, Territory Management o Forecasting como profundización opcional de Sales Cloud si sobra tiempo.

### 🟩 Fase 8 — Portafolio y preparación de entrevistas (Semanas 19-20 · 14 – 27 dic)

**Semana 19:** Pulir README y `architecture/` (decisiones técnicas, diagrama del modelo de datos), grabar un video demo corto de 3-5 min.
**Semana 20:** Simulacro de entrevista técnica cruzada (Jorge pregunta a Carlos temas junior: diferencias Flow/Trigger, gobernadores de Apex a nivel conceptual, seguridad; Carlos pregunta a Jorge sobre integraciones). Publicar el proyecto en LinkedIn.

### 🟨 Enero — Postulación y entrevistas
Con el proyecto ya cerrado en diciembre, enero queda libre para que Carlos postule activamente a posiciones junior y se enfoque en la llegada del bebé sin la presión de seguir construyendo.

---

## 5. Recursos recomendados por fase
- Trailhead: trails "Data Modeling", "Business Administration Specialist", "Service Cloud for Lightning Experience", "Build Sites and Portals with Experience Cloud", "Apex Basics & Database", "Platform Developer I".
- Salesforce Architect Decision Guides (integraciones y Named Credentials).
- Documentación oficial de Service Cloud Console y de la API REST de Twilio.

---

*Este documento se actualiza al cierre de cada sprint con lo realmente completado vs. lo planeado.*
