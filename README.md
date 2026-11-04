# Farmatodo · Transformación Financiera
## Portal Interno de la Vicepresidencia (VP) de Finanzas

[![AdonisJS](https://img.shields.io/badge/AdonisJS-v6-purple.svg?style=flat-square&logo=adonisjs)](https://adonisjs.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2-purple.svg?style=flat-square&logo=inertia)](https://inertiajs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Solución técnica desarrollada para la prueba práctica de **Analista / Desarrollador con apoyo de AI** para el equipo de **Planificación Financiera (Transformación Financiera)** de Farmatodo.

**Candidato:** Abraham Santana  
**Repositorio Oficial:** [https://github.com/abrahamsz123/ChallengeTechFarmatodo-AS.git](https://github.com/abrahamsz123/ChallengeTechFarmatodo-AS.git)

---

## 📋 Tabla de Contenido
1. [Descripción General del Proyecto](#-descripción-general-del-proyecto)
2. [Arquitectura & Stack Tecnológico](#-arquitectura--stack-tecnológico)
3. [Alcance Funcional y Procesos de Negocio](#-alcance-funcional-y-procesos-de-negocio)
   - [Estructura Organizacional & Control de Acceso por Rol (RBAC)](#1-estructura-organizacional--control-de-acceso-por-rol-rbac)
   - [Proceso Neurálgico: Gestión y Aprobación de Notas de Crédito](#2-proceso-neurálgico-gestión-y-aprobación-de-notas-de-crédito)
   - [Motor de Evaluación de Riesgo Financiero & Web Scraping BCV](#3-motor-de-evaluación-de-riesgo-financiero--web-scraping-bcv)
   - [Segregación de Funciones (SoD) & Doble Aprobación (Control Dual / 4 Ojos)](#4-segregación-de-funciones-sod--doble-aprobación-control-dual--4-ojos)
4. [Requisitos Previos de Instalación](#-requisitos-previos-de-instalación)
5. [Guía de Instalación y Ejecución Local Paso a Paso](#-guía-de-instalación-y-ejecución-local-paso-a-paso)
6. [Credenciales Oficiales de Prueba (Seeders)](#-credenciales-oficiales-de-prueba-seeders)
7. [Documentación de la API REST (/api/v1)](#-documentación-de-la-api-rest-apiv1)
8. [Estructura del Proyecto](#-estructura-del-proyecto)

---

## 🌟 Descripción General del Proyecto

El sistema es una plataforma web corporativa diseñada para optimizar los controles internos y la gobernanza financiera de la Vicepresidencia de Finanzas de Farmatodo. Combina una arquitectura moderna tipo monolito desacoplado (Full-Stack SSR/SPA con AdonisJS v6 + Inertia.js + React 19) respaldada por una base de datos relacional PostgreSQL en Tercera Forma Normal (3NF).

El portal resuelve la problemática operativa de conciliar reclamaciones comerciales de tiendas (roturas, averías, vencimientos de medicamentos, descuadres de facturación), auditando cada transacción contra la tasa de cambio oficial del Banco Central de Venezuela (BCV) en tiempo real y garantizando el cumplimiento de normas internacionales de control interno (Sarbanes-Oxley / SOX).

---

## 🛠️ Arquitectura & Stack Tecnológico

| Capa | Tecnología | Justificación Técnica |
| :--- | :--- | :--- |
| **Backend & Runtime** | Node.js 22 LTS / AdonisJS v6 (TypeScript) | Framework empresarial robusto con tipado estricto de punta a punta, ORM integrado (Lucid), inyección de dependencias y motor de autenticación criptográfica. |
| **Base de Datos** | PostgreSQL 16 | Base de datos relacional ACID de alto rendimiento, integridad referencial estricta mediante llaves foráneas, índices de búsqueda y soporte de auditoría inmutable. |
| **Capa de Conexión** | Inertia.js v2 | Elimina la sobrecarga de sincronización de APIs cliente/servidor tradicional, proporcionando la experiencia fluida de una Single Page Application (SPA) con el control de sesiones y ruteo seguro desde el servidor. |
| **Frontend** | React 19 + TypeScript | Librería líder para construcción de interfaces declarativas reactivas, componentes modulares y tipado estático. |
| **Estilos & UI** | Tailwind CSS v4 + Lucide React | Framework utilitario para diseño responsivo corporativo de alta fidelidad, con la paleta cromática oficial de Farmatodo (Azul Marino `#002B66`, Azul Cobalto `#0052CC`, Blanco y tonos neutros). |
| **Integraciones** | Axios + Cheerio | Motor de Web Scraping financiero para extracción en vivo de la tasa cambiaria del dólar oficial desde el portal del BCV (`https://www.bcv.org.ve/`). |

---

## 🚀 Alcance Funcional y Procesos de Negocio

### 1. Estructura Organizacional & Control de Acceso por Rol (RBAC)
El portal cuenta con 5 departamentos de la VP de Finanzas poblados en base de datos:
* **Planificación Financiera** (Gerencia y Control Presupuestario)
* **Tesorería** (Gestión de Flujo de Caja y Posición Cambiaria)
* **Contraloría** (Auditoría Interna y Control Normativo)
* **Cuentas por Pagar (CXP)** (Gestión de Proveedores y Devoluciones Comerciales)
* **Cuentas por Cobrar (CXC)** (Facturación Retail y Recaudación)

**Control de Alcance en Backend (Requisito 3.2):**
* **Administrador:** Acceso global a todos los departamentos (40 colaboradores y 15 cargos).
* **Jefe de Departamento:** Su consulta SQL está estrictamente limitada por backend (`where('departamentoId', user.departamentoId)`), visualizando únicamente a su equipo directo de 8 colaboradores y los cargos de su área.
* **Colaborador:** Acceso en modo de solo lectura limitado a los colaboradores de su departamento.

### 2. Proceso Neurálgico: Gestión y Aprobación de Notas de Crédito
Implementación completa de la **Opción 2**:
* **Registro comercial:** Tienda de destino (Venezuela/Argentina), compañía proveedora, monto, moneda (USD o VES), motivo detallado y departamento responsable (CXP o CXC).
* **Paginación ejecutiva:** Límite de 15 notas por página con navegación asistida (Anterior, números de página, Siguiente) y contador dinámico de registros.
* **Búsqueda reactiva en tiempo real:** Filtro instantáneo insensible a mayúsculas, minúsculas o tildes que busca en ID, motivo, proveedor, tienda y solicitante.

### 3. Motor de Evaluación de Riesgo Financiero & Web Scraping BCV
Cada solicitud es procesada automáticamente por un algoritmo de scoring ponderado (0 a 100 puntos):
1. **Umbral Financiero en USD:** Si la nota se emite en Bolívares (VES), se conecta al portal del BCV mediante web scraping en vivo, obtiene la tasa del día, convierte matemáticamente a dólares con redondeo estricto a 2 decimales y evalúa el riesgo sobre el valor real:
   * `< $1.000 USD:` 15 puntos.
   * `$1.000 a $3.000 USD:` 30 puntos.
   * `> $3.000 USD:` 50 puntos (Monto crítico).
2. **Clasificación Semántica del Motivo:**
   * Afectación física de inventario (*merma, avería, vencimiento, producto roto, faltante en despacho*): +35 puntos.
   * Inconsistencia administrativa (*error de facturación, duplicidad, descuadre de precio, orden de compra*): +20 puntos.
   * Ajuste comercial ordinario (*pronto pago, volumen*): +10 puntos.
3. **Histórico del Proveedor:** +15 puntos si el proveedor posee recurrencia crítica de reclamaciones comerciales.

**Niveles de Riesgo:**
* **BAJO:** Menor a 40 pts.
* **MEDIO:** 40 a 69 pts.
* **ALTO:** 70 puntos o más (Activa obligatoriamente el flujo de doble firma).

### 4. Segregación de Funciones (SoD) & Doble Aprobación (Control Dual / 4 Ojos)
* **Anti-Autoaprobación:** Si un usuario (incluso Jefe o Administrador) registra una solicitud, el sistema bloquea por frontend y backend (`HTTP 403 Forbidden`) que pueda autorizarla él mismo.
* **Colaborador Operativo:** No posee facultades delegadas de aprobación.
* **Flujo Estándar (1 Firma):** Notas de riesgo Bajo o Medio creadas por colaboradores son aprobadas con la sola firma de la jefatura. Al aprobarse, el paso 3 (*Desembolso Contable*) se ejecuta automáticamente en verde.
* **Flujo de Doble Aprobación Requerida (2 Firmas):** Las notas de Riesgo Alto o aquellas originadas por jefaturas requieren:
  1. **Primera Firma (1/2):** Pasa a estado `aprobada_parcial`.
  2. **Segunda Firma de Ratificación (2/2):** Debe ser emitida por un superior independiente diferente al primer firmante (Principio de 4 Ojos).
* **Poder de Veto:** Si cualquiera de los aprobadores rechaza con motivo justificado, la nota queda cancelada de forma permanente.
* **Auditoría Inmutable:** Cada cambio de estado queda registrado cronológicamente con usuario, rol, fecha, hora y comentario.

---

## 📦 Requisitos Previos de Instalación

Antes de levantar el proyecto, asegúrate de contar con:
* **Node.js:** Versión 20.x o 22.x LTS instalada (`node -v`).
* **npm:** Versión 10.x o superior (`npm -v`).
* **PostgreSQL:** Versión 15.x o 16.x instalada y en ejecución en el puerto 5432 (`psql -V`).
* **Git:** Para clonar el repositorio.

---

## 💻 Guía de Instalación y Ejecución Local Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/abrahamsz123/ChallengeTechFarmatodo-AS.git
cd "ChallengeTechFarmatodo-AS"
```

### Paso 2: Instalar Dependencias del Proyecto
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Copia el archivo de ejemplo `.env.example` para crear tu `.env`:
```bash
cp .env.example .env
```

Abre el archivo `.env` y configura tus credenciales de PostgreSQL:
```ini
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=generar_clave_segura_aqui
NODE_ENV=development
SESSION_DRIVER=cookie

DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_DATABASE=farmatodo_challenge
```

> **Generar APP_KEY de AdonisJS:**
> Ejecuta este comando para generar automáticamente una clave segura en tu `.env`:
> ```bash
> node ace generate:key
> ```

### Paso 4: Crear la Base de Datos en PostgreSQL
Crea la base de datos relacional antes de ejecutar las migraciones:
```bash
# Desde la terminal psql:
CREATE DATABASE farmatodo_challenge;
```

### Paso 5: Ejecutar Migraciones de Base de Datos
Crea las tablas normalizadas con integridad referencial:
```bash
node ace migration:run
```

### Paso 6: Poblar Datos Semilla Ficticios (Seeders)
Ejecuta el script de carga que insertará los 5 departamentos, los 40 colaboradores, los 15 cargos, las tiendas, proveedores y 26 notas de crédito con histórico de auditoría:
```bash
node ace db:seed
```

### Paso 7: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible de inmediato en:  
👉 **[http://localhost:3333](http://localhost:3333)**

---

## 👥 Credenciales Oficiales de Prueba (Seeders)

El sistema cuenta con autenticación real basada en sesiones y hash criptográfico (**Argon2/Scrypt**). Todas las cuentas de prueba tienen la siguiente clave corporativa:

> 🔑 **Contraseña Oficial:** `Farmatodo2026!`

| Rol en el Sistema | Nombre del Colaborador | Correo Electrónico Registrado | Departamento |
| :--- | :--- | :--- | :--- |
| **Colaborador (Solicitante)** | Andrés Silva | `analista.cxp@farmatodo.local` | Cuentas por Pagar |
| **Jefe de Departamento** | Mariana Gómez | `jefe.cxp@farmatodo.local` | Cuentas por Pagar |
| **Jefe de Auditoría** | Guillermo Arismendi | `jefe.contraloria@farmatodo.local` | Contraloría |
| **Administrador VP** | Abraham Santana | `admin@farmatodo.local` | Planificación Financiera |
| **Colaborador Externo** | Santiago Méndez | `analista.tesoreria@farmatodo.local` | Tesorería |

> **Nota para Evaluadores (Conmutador Asistido):**  
> Una vez iniciada la sesión, en la esquina superior derecha se encuentra disponible un selector de perfiles de demostración. Al seleccionarlo, el sistema realiza una petición `POST /demo-login` que regenera la sesión real en PostgreSQL sin necesidad de tipear credenciales reiteradas veces, permitiendo auditar los flujos de Segregación de Funciones en pocos segundos.

---

## 📡 Documentación de la API REST (/api/v1)

El portal expone una API REST desacoplada que permite consultar y operar el sistema programáticamente:

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Autenticado | Verificación del estado del servidor, entorno y conexión activa a PostgreSQL 16. |
| `GET` | `/api/v1/auth/me` | Autenticado | Obtiene la identidad, rol, cargo y departamento del usuario actual. |
| `GET` | `/api/v1/departamentos` | Autenticado | Listado de departamentos con cargos y colaboradores (filtrado según RBAC). |
| `GET` | `/api/v1/colaboradores` | Autenticado | Directorio de colaboradores con soporte de filtros (`?departamento_id=...&q=...`). |
| `GET` | `/api/v1/cargos` | Autenticado | Catálogo de cargos y funciones asociadas. |
| `GET` | `/api/v1/kpis` | Autenticado | Métricas consolidadas en tiempo real (volumen en USD y VES, aprobadas, pendientes, riesgo alto). |
| `GET` | `/api/v1/notas-credito` | Autenticado | Listado de notas de crédito con filtros dinámicos (`estado`, `moneda`, `risk_level`, `search`). |
| `GET` | `/api/v1/notas-credito/:id` | Autenticado | Expediente completo de una nota con su bitácora inmutable de auditoría. |
| `POST` | `/api/v1/notas-credito` | Autenticado | Creación de nueva solicitud con validación exhaustiva de cada campo. |
| `POST` | `/api/v1/notas-credito/:id/resolver` | Autenticado | Dictamen de aprobación o rechazo validando SoD y control dual. |

---

## 📁 Estructura del Proyecto

```text
├── app/
│   ├── controllers/
│   │   ├── auth_controller.ts          # Autenticación, sesiones y demo switcher
│   │   ├── organizacion_controller.ts  # Directorio y catálogo con alcance RBAC
│   │   └── notas_credito_controller.ts # Lógica de negocio, BCV scraper, Motor de Riesgo y DOA
│   └── models/
│       ├── user.ts                     # Modelo de colaboradores
│       ├── departamento.ts             # Modelo de departamentos de la VP
│       ├── cargo.ts                    # Modelo de cargos y funciones
│       ├── tienda.ts                   # Modelo de tiendas retail
│       ├── compania.ts                 # Modelo de proveedores comerciales
│       ├── nota_credito.ts             # Modelo transaccional de notas de crédito
│       └── nota_credito_auditoria.ts   # Modelo inmutable de trazabilidad de estados
├── database/
│   ├── migrations/                     # Scripts DDL para creación de tablas e integridad referencial
│   └── seeders/
│       └── main_seeder.ts              # Carga masiva de datos organizacionales y transaccionales
├── inertia/
│   ├── components/
│   │   └── Layout.tsx                  # Shell visual corporativo, navbar y sidebar con perfiles
│   └── pages/
│       ├── LoginPage.tsx               # Pantalla de acceso seguro
│       ├── OrganizacionPage.tsx        # Módulo 1: Directorio VP Finanzas
│       ├── CargosPage.tsx              # Módulo 2: Matriz de Cargos y Funciones
│       └── NotasCreditoPage.tsx        # Módulo 3: Flujo de Notas de Crédito, KPIs y Modales
├── start/
│   └── routes.ts                       # Definición de rutas web y endpoints de la API REST v1
├── public/
│   └── images/farmatodo-logo.png       # Identidad gráfica corporativa
└── package.json
```

---

## 📄 Licencia & Confidencialidad
Desarrollado exclusivamente para el proceso de selección técnica de Farmatodo — Transformación Financiera. Todos los datos, colaboradores, tiendas y cifras utilizados son estrictamente ficticios.
