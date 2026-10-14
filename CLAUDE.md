# Vicio Tracker — CLAUDE.md

Este archivo se lee automáticamente al abrir este proyecto en Claude Code. Contiene el contexto esencial; el detalle completo está en `docs/concepto.md` y `docs/prd-v0.md`.

## Qué es este proyecto
PWA (React + Vite + TypeScript + TailwindCSS + Framer Motion + Recharts) para registrar el consumo y gasto en "vicios" (tabaco, alcohol, apuestas, comida, etc.). El usuario toca un botón cada vez que consume, y la app le muestra el impacto económico y le ayuda a reducir el consumo.

**Estado:** ya existe una versión funcional (v0.1) en este mismo repositorio — no se empieza desde cero. Ahora se está ampliando hacia la v0 definida en `docs/prd-v0.md`.

## Reglas fijas del proyecto (no cambiar sin confirmar con Miguel)
1. **Sin login / sin cuenta en la v0.** La app es 100% local (LocalStorage), sin backend, sin conexión a servicios externos. El registro con email se añade en una fase posterior, fuera de esta v0 — no lo implementes todavía aunque parezca el siguiente paso lógico.
2. **Sin conexiones externas de ningún tipo en la v0**: nada de bancos, pagos, envío de emails, APIs externas. Todo vive dentro de la app.
3. **Máximo 3 vicios por usuario.**
4. Los vicios pueden registrarse en modo **"sin valor"** (sin coste económico, ej. comida): siguen contando racha y límite diario igual que los demás, pero no entran en los cálculos de gasto/inversión.
5. El modo **"ocultar gasto"** es un ajuste **global** (no por vicio).
6. El confetti/celebración por cantidad consumida (ya existente, `TAP_MILESTONES`) **se mantiene tal cual** — no se elimina ni se sustituye.
7. Se añade una celebración **nueva e independiente** para rachas de días sin consumir (hitos: 1, 3, 7, 14, 30, 60, 90 días), visualmente distinta a la de consumo.

## Hoja de ruta de la v0 (ver detalle técnico completo en `docs/prd-v0.md`)
1. Bajar el límite de vicios de 5 a 3.
2. Modo "sin valor" (precio opcional).
3. Modo "ocultar gasto" global ("vas bien" / "vas mal").
4. Objetivos mensuales por vicio + % de cumplimiento (mes actual vs. anterior).
5. Equivalencias tangibles del gasto (ej. "esto equivale a 2 libros").
6. Celebración de racha sin consumir, independiente del confetti de consumo.

## Cómo trabajar en este proyecto
- Miguel (el usuario) está aprendiendo a usar Claude/Claude Code — no asumas conocimiento técnico profundo. Explica brevemente qué vas a hacer y por qué antes de tocar código, en lenguaje sencillo.
- Antes de implementar cambios de producto nuevos que no estén en este documento ni en el PRD, pregunta — no inventes alcance nuevo por tu cuenta.
- Mantén este CLAUDE.md actualizado a medida que el proyecto avance (nuevas fases, nuevas decisiones).

## Documentos de referencia
- `docs/concepto.md`: concepto completo del producto, usuario objetivo, decisiones de producto, journey.
- `docs/prd-v0.md`: especificación técnica punto por punto de la v0 (archivos afectados, modelo de datos, lógica, criterios de aceptación).
