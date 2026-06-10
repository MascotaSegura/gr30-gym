# 💻 ¿EN CUÁNTO RENTAR LA PLATAFORMA WEB GR30?
## Análisis de Precio SaaS — Sistema de Gestión para Gimnasios
> **Documento Estratégico Interno** | Junio 2026

---

## 1. ¿QUÉ OFRECE LA PLATAFORMA GR30?

Antes de fijar el precio, hay que entender exactamente **qué se está vendiendo**:

| Módulo                       | Descripción                                                          |
|------------------------------|----------------------------------------------------------------------|
| 🏠 **Landing Page pública**  | Sitio web con marca, planes, staff, reseñas, FAQ y contacto         |
| 🔐 **Login + Autenticación** | Sistema de acceso para admin y clientes, flujo de activación por PIN |
| 🖥️ **Panel de Administración** | Dashboard, miembros, pagos, staff, planes, accesos, POS (tienda)  |
| 👤 **Portal del Cliente**    | Estado de membresía, historial de pagos, vencimiento                |
| 🎯 **Kiosco Biométrico**     | Control de acceso facial en tiempo real (WebRTC + IA)               |
| 📊 **Base de Datos Supabase**| Backend en la nube, tiempo real, escalable                          |
| 📱 **PWA (App instalable)**  | Funciona como app móvil sin tienda de apps                          |

**Este no es un sistema genérico.** Es un producto especializado con biometría facial, control de acceso en tiempo real y gestión financiera integrada. Eso lo separa radicalmente de cualquier software de gym básico.

---

## 2. ANÁLISIS DE COMPETIDORES (SaaS para Gimnasios)

### Mercado global / nacional

| Software                    | Precio/mes (USD) | Precio/mes (MXN ~) | Lo que ofrece                             |
|-----------------------------|------------------|--------------------|-------------------------------------------|
| **Mindbody**                | $129 – $349 USD  | $2,200 – $6,000    | Reservas, pagos, clases. Sin biometría.   |
| **Gympass / Wellhub**       | $80 – $200 USD   | $1,400 – $3,400    | Plataforma de beneficios corporativos     |
| **Vagaro**                  | $30 – $90 USD    | $520 – $1,550      | Citas, pagos, básico                      |
| **GymMaster**               | $89 – $199 USD   | $1,530 – $3,400    | Control de acceso por tarjeta, sin facial |
| **Zen Planner**             | $99 – $348 USD   | $1,700 – $5,980    | CrossFit/Yoga enfocado, sin biometría     |
| **Software local MX (genérico)** | $500 – $1,500 MXN | —             | Excel mejorado, sin biometría, sin kiosco |
| **GR30 (tu plataforma)**    | **A definir**    | **Ver abajo ↓**    | **Todo lo anterior + biometría facial**   |

### Conclusión clave
**Ningún competidor en México ofrece biometría facial + portal cliente + kiosco desatendido + POS en un solo sistema a precio accesible.** GR30 es técnicamente superior al promedio del mercado local.

---

## 3. FACTORES QUE DETERMINAN EL PRECIO

### 🔼 Factores que SUBEN el precio
- ✅ Control de acceso facial (tecnología de alto valor percibido)
- ✅ Kiosco desatendido (reemplaza a un empleado en recepción)
- ✅ Tiempo real vía Supabase Realtime (no polling, no delays)
- ✅ PWA instalable (parece app nativa sin costo de App Store)
- ✅ Multi-módulo: admin + cliente + kiosco + POS = 4 productos en 1
- ✅ Diseño profesional brutalista (producto terminado, no un MVP feo)

### 🔽 Factores que BAJAN el precio (honestidad)
- ⚠️ Biometría actualmente en desarrollo/demo (no producción total)
- ⚠️ Sin app nativa iOS/Android (PWA puede ser limitante para algunos)
- ⚠️ Sin integración con terminales de pago físicas (TPV)
- ⚠️ Sin soporte multi-sucursal aún
- ⚠️ Sistema relativamente nuevo, sin casos de éxito probados aún

---

## 4. MODELOS DE PRECIO RECOMENDADOS

### Opción A — SaaS Mensual (Recomendado para escalar)

| Tier           | Precio/mes | Para quién                                      | Incluye                                              |
|----------------|------------|------------------------------------------------|------------------------------------------------------|
| **Básico**     | $1,200 MXN | Gym pequeño (< 100 miembros)                   | Admin + clientes + landing. Sin kiosco biométrico.   |
| **Pro**        | $2,500 MXN | Gym mediano (100–500 miembros)                 | Todo lo anterior + Kiosco + POS + soporte técnico    |
| **Premium**    | $4,500 MXN | Gym grande o cadena (500+ miembros)            | Todo Pro + onboarding personalizado + SLA garantizado |

**Precio estrella recomendado para el mercado de Juárez: $2,500 MXN/mes (Plan Pro)**

---

### Opción B — Licencia Anual (Mejor flujo de caja inicial)

| Tier       | Precio/año  | Equivalente/mes | Ahorro vs. mensual |
|------------|-------------|------------------|--------------------|
| Básico     | $12,000 MXN | $1,000 MXN       | 17%                |
| Pro        | $24,000 MXN | $2,000 MXN       | 20%                |
| Premium    | $42,000 MXN | $3,500 MXN       | 22%                |

---

### Opción C — Setup único + mensualidad baja (Para mercado conservador)

Algunos dueños de gym en Juárez desconfían del "SaaS" y prefieren pagar "y ya". Puedes ofrecer:

| Concepto                   | Precio          |
|----------------------------|-----------------|
| Instalación y configuración| $8,000 – $15,000 MXN (único) |
| Mantenimiento mensual      | $800 – $1,200 MXN/mes       |
| Actualizaciones mayores    | $3,000 – $5,000 MXN c/u     |

---

## 5. ANÁLISIS DE RETORNO DE INVERSIÓN PARA EL CLIENTE

¿Por qué un gimnasio en Juárez debería pagar $2,500/mes por GR30?

### El kiosco biométrico solo ya lo justifica:

| Concepto                                   | Costo sin GR30        | Con GR30              |
|--------------------------------------------|-----------------------|-----------------------|
| Recepcionista para control de acceso       | $8,000 – $12,000/mes  | $0 (kiosco automatizado) |
| Software de gestión básico                 | $500 – $1,500/mes     | Incluido              |
| Sitio web del gimnasio                     | $3,000 – $8,000/mes   | Incluido              |
| Sistema de cobros/pagos manual             | Tiempo staff + errores| Automatizado          |
| **Total sin GR30**                         | **$11,500 – $21,500/mes** | —                 |
| **GR30 Plan Pro**                          | —                     | **$2,500/mes**        |
| **Ahorro estimado**                        | —                     | **$9,000 – $19,000/mes** |

**Un solo gimnasio ahorra 4x–8x el costo de la plataforma solo en nómina de recepción.**
Ese es el argumento de venta más poderoso.

---

## 6. ESTRATEGIA DE LANZAMIENTO EN JUÁREZ

### Fase 1 — Validación (Meses 1-3)
- Precio: **GRATIS** para 2–3 gimnasios piloto en Juárez
- Objetivo: casos de éxito, testimonios, ajustes de producto
- Entrega: soporte personalizado, onboarding completo

### Fase 2 — Early Adopters (Meses 4-8)
- Precio: **$1,500 MXN/mes** (precio especial fundadores)
- Objetivo: 5–10 gimnasios pagando
- Condición: precio bloqueado de por vida si pagan desde el inicio

### Fase 3 — Precio público (Mes 9+)
- **Plan Pro a $2,500 MXN/mes** para nuevos clientes
- Marketing: ROI calculado, caso de éxito de gimnasios piloto

---

## 7. RESUMEN EJECUTIVO

| Escenario              | Precio sugerido           | Justificación                                              |
|------------------------|---------------------------|------------------------------------------------------------|
| Renta mensual (Pro)    | **$2,500 MXN/mes**        | Por debajo de competidores globales, muy superior en funciones |
| Renta anual (Pro)      | **$24,000 MXN/año**       | 20% descuento, garantiza 12 meses de ingreso               |
| Setup + mantenimiento  | **$12,000 + $1,000/mes**  | Para clientes conservadores que no quieren "renta"         |
| Precio mínimo viable   | **$1,200 MXN/mes**        | No bajar de aquí o no cubres costos de infraestructura     |

### Veredicto final
**Renta a $2,500 MXN/mes el Plan Pro.** Es un precio honesto, muy por debajo del mercado internacional, y fácilmente justificable cuando le muestras al dueño del gym cuánto ahorra en nómina de recepción. El kiosco biométrico es tu argumento de cierre más poderoso.

---

*Análisis elaborado para estrategia comercial de GR30 Platform. GR30 Gym © 2026.*
