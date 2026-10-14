# Vicio Tracker — Documento de concepto

## 1. Problema
La gente no es consciente en tiempo real de cuánto le cuesta su vicio (tabaco, alcohol, apuestas, comida, etc.), y cuando sí se da cuenta, no tiene ninguna alternativa concreta en ese momento para frenar el impulso.

## 2. Propuesta de valor
Vicio Tracker ayuda a la persona a ver cuánto gasta en su vicio (o a ocultar la cifra si prefiere no verla, mostrando solo "vas bien" / "vas mal") y, en el momento en que va a gastar, le ofrece una acción concreta para evitar ese gasto o sustituirlo por algo mejor. No es un tracker pasivo: interviene en el momento de la tentación.
> La versión ya construida resuelve esto hoy mediante "simulación de inversión" (qué pasaría si invirtieras el dinero en vez de gastarlo).

## 3. Alcance: multi-vicio
- La app no está limitada a un solo vicio. Cada vicio es su propia categoría.
- **Modo "sin valor" (OBLIGATORIO para la v0)**: para vicios sin cuantía económica clara (ej. comer en exceso), se registra el hecho/frecuencia sin asociarle un gasto. Cuenta racha y límite diario igual que los demás vicios.

## 4. Usuario objetivo
- Perfil amplio: personas que quieren dejar el vicio del todo, reducirlo poco a poco, o solo tener conciencia del gasto. Cualquier tipo de vicio.

## 5. Cuentas / login
- La v0 se mantiene 100% local y anónima (sin login). La creación de cuenta se añade **solo en la versión final**.

## 6. MVP (v0) — qué se construye primero
- Registro de vicios multi-categoría (límite: **3 vicios**).
- Modo "sin valor" (obligatorio), con racha y límite diario igual que el resto.
- Modo "ocultar gasto" — ajuste global: oculta cifras de dinero y muestra solo "vas bien"/"vas mal".
- Objetivos mes a mes + % de cumplimiento del objetivo.
- Equivalencias tangibles del ahorro/consumo (ej. "esto equivale a 2 libros").
- Celebración de racha sin consumir (nueva, además del confetti existente por cantidad consumida).

## 7. Backlog — fuera de la v0
- Detección automática de gasto por tarjeta.
- Contenido de apoyo psicológico integrado.
- Creación de cuenta con email (versión final).

## 8. Decisiones tomadas
- Máximo 3 vicios en la v0.
- Modo "sin valor" obligatorio, con mismo comportamiento de racha/límite diario que los demás.
- Modo "ocultar gasto": ajuste global, no por vicio.
- La v0 es gratis, sin login, se construye sobre el código ya existente (v0.1).
- El confetti por cantidad consumida (`TAP_MILESTONES`) se mantiene tal cual está.
- Celebración de racha sin consumir: hitos en 1, 3, 7, 14, 30, 60 y 90 días seguidos sin consumir. Visualmente distinta del confetti de consumo.
- Conexiones externas (email, banco, pagos) se dejan para la versión final.

## 9. User Journey (v0, sin login)
1. El usuario abre la app (PWA, sin registro). Onboarding para añadir hasta 3 vicios, con categoría, emoji, precio por unidad (o "sin valor"), límite diario opcional y métricas de salud opcionales.
2. Pantalla principal: botones táctiles para registrar consumo al momento, con deshacer, rachas y logros (consumo y, ahora también, rachas sin consumir con su propia celebración).
3. Pantalla de impacto: gasto acumulado, proyección de inversión alternativa, equivalencias tangibles, y cifras ocultas si el modo "ocultar gasto" está activo.
4. Objetivos mensuales: nueva vista comparando este mes vs. el anterior por vicio, con % de cumplimiento.
5. (Fase final, fuera de v0): registro/login con email y sincronización de datos locales a una cuenta.

## 10. Código ya existente (v0.1) — base de la que partimos
Carpeta: `Viciotracker` en el escritorio del usuario (React 18 + Vite + TypeScript + TailwindCSS + Framer Motion + Recharts, PWA, 100% LocalStorage, sin backend).

**Ya construido:** Onboarding (alta de vicios), Home (tracking táctil, rachas, logros, confetti por cantidad consumida, alerta de inversión), Impact (gráfico + proyecciones de inversión), Health (métricas de salud), History (historial), Challenges (retos con penalización), Settings (gestión y export JSON). Modelo de datos en `types/index.ts` (`Vice`, `Tap`, `Settings`, `Challenge`, `AppData`). Rachas ya calculadas en `streaks.ts` (`getStreak`).

## 11. Plan de construcción para la v0
Ver el detalle técnico completo en `docs/prd-v0.md`.
