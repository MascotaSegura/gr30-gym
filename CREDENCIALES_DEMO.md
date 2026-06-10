# 🔐 CREDENCIALES DE DEMOSTRACIÓN — GR30 GYM
> **DOCUMENTO CONFIDENCIAL — SOLO USO INTERNO / DEMOS**
> Generado: Junio 2026 | Sistema: GR30 Gym v1.0

---

## ⚠️ ADVERTENCIA
Este archivo contiene credenciales ficticias para uso exclusivo en sesiones de demostración del sistema.
**NO usar en producción. NO compartir públicamente.**

---

## 1. ACCESO ADMINISTRADOR

| Campo       | Valor            |
|-------------|------------------|
| **URL**     | `login.html`     |
| **Teléfono**| `5500000000`     |
| **Password**| `admin`          |
| **Rol**     | Administrador    |
| **Destino** | `admin.html`     |

> Este usuario tiene acceso total al Panel de Administración: Dashboard, Staff, Miembros, Accesos, Pagos, Planes y Tienda (POS).

---

## 2. USUARIOS CLIENTES (MIEMBROS DE DEMOSTRACIÓN)

> **Login de clientes:** `login.html` → se redirige a `cliente.html`
> Los clientes se autentican con su **número de teléfono** y **contraseña**.

### ✅ Miembros AL DÍA (pago reciente — hace ~10 días)

| # | Nombre                   | Teléfono     | Contraseña        | Plan    | Estado     |
|---|--------------------------|--------------|-------------------|---------|------------|
| 1 | Héctor Miguel Velázquez  | `5511223344` | `HVelazquez2024!` | Anual   | ✅ Al Día  |
| 2 | Valeria Gómez Ruiz       | `5522334455` | `ValeriaG_88`     | Mensual | ✅ Al Día  |

### ⚠️ Miembros ATRASADOS (pago hace ~40 días — mensualidad vencida)

| # | Nombre           | Teléfono     | Contraseña     | Plan    | Estado       |
|---|------------------|--------------|----------------|---------|--------------|
| 3 | Ricardo Tamez    | `5533445566` | `RTamez$990`   | Mensual | ❌ Atrasado  |
| 4 | Ana Karen Silva  | `5544556677` | `AnaK.Silva!`  | Mensual | ❌ Atrasado  |

### 🟡 Miembros SIN PAGO REGISTRADO / ESTADO ESPECIAL

| # | Nombre               | Teléfono     | Contraseña       | Plan          | Estado       |
|---|----------------------|--------------|------------------|---------------|--------------|
| 5 | Luis Fernando Castro | `5555667788` | `LuisF.Castro*`  | Visita Diaria | — Pendiente  |
| 6 | Mónica de la Garza   | `5566778899` | `MoniGarza#1`    | Anual         | ✅ Al Día    |

### 🚫 Miembros SUSPENDIDOS (activo = false en BD)

| # | Nombre          | Teléfono     | Contraseña    | Plan    | Estado         |
|---|-----------------|--------------|---------------|---------|----------------|
| 7 | Jorge Alberto Soto | `5577889900` | `JSoto_2025`  | Mensual | 🚫 Suspendido  |

### 🔵 Miembros ACTIVOS sin estado de pago

| # | Nombre        | Teléfono     | Contraseña       | Plan    | Estado     |
|---|---------------|--------------|------------------|---------|------------|
| 8 | Diego Herrera | `5588990011` | `DiegoH_Pass!`   | Mensual | ✅ Activo  |

---

## 3. ACCESO AL KIOSCO BIOMÉTRICO

| Campo     | Valor                                                |
|-----------|------------------------------------------------------|
| **URL**   | `kiosco.html` (también accesible desde admin → botón "Kiosco") |
| **Modo**  | Desatendido — sin credenciales manuales              |
| **Nota**  | El kiosco no requiere login. Es una pantalla de control de acceso en tiempo real. |

---

## 4. CONEXIÓN A BASE DE DATOS (Supabase)

| Campo            | Valor                                                                 |
|------------------|-----------------------------------------------------------------------|
| **Proyecto**     | Supabase — GR30 Demo                                                 |
| **URL**          | `https://ibslnogitgwtyeyxfscw.supabase.co`                           |
| **Anon Key**     | `sb_publishable_G43BK4zraE7IZ-HrQoL0oA_NVo2QLoL`                    |
| **Tablas activas**| `miembros`, `pagos`, `planes`, `staff`, `accesos`, `productos`      |

---

## 5. ESCENARIOS DE DEMOSTRACIÓN RECOMENDADOS

### 🎬 Escenario A — Acceso exitoso en Kiosco
1. Entrar a `kiosco.html`
2. El kiosco escanea rostros en tiempo real
3. Mostrar que Héctor o Valeria (al día) reciben "ACCESO CONCEDIDO"
4. Mostrar que Ricardo o Ana (atrasados) reciben "ACCESO DENEGADO"

### 🎬 Escenario B — Panel de Administración
1. Login con `5500000000` / `admin`
2. Ver Dashboard: estadísticas en tiempo real
3. Ir a Miembros → mostrar estados (Al Día / Atrasado / Suspendido)
4. Ir a Pagos → registrar un nuevo pago para Ricardo Tamez
5. Ir a Planes → mostrar y editar planes

### 🎬 Escenario C — Portal del Cliente
1. Login con `5511223344` / `HVelazquez2024!` (Héctor — Al Día)
2. Ver estado de membresía, fecha de vencimiento, historial
3. Logout y login con `5533445566` / `RTamez$990` (Ricardo — Atrasado)
4. Mostrar aviso de pago pendiente

### 🎬 Escenario D — Registro de nuevo miembro
1. Login admin → Miembros → Añadir Miembro
2. Sistema genera PIN de 4 dígitos automáticamente
3. Cliente usa ese PIN para activar cuenta y crear contraseña

---

## 6. NOTAS TÉCNICAS

- Las contraseñas de demo en la BD son **texto plano** (sistema en etapa de desarrollo).
- Si un cliente inicia sesión con un PIN de 4 dígitos, el sistema lo fuerza a crear una contraseña permanente (flujo de activación).
- El token de admin se almacena en `localStorage` como `gr30_admin_token = 'SECURE_ADMIN_GRANTED'`.
- La sesión de cliente se almacena en `localStorage` como `gr30_client_session` (JSON con `phone` y `pass`).
- Los accesos del kiosco se transmiten vía **Supabase Realtime** (canal `public:accesos`).

---

*Documento generado para uso interno. GR30 Gym © 2026.*
