# Vicio Tracker — PRD v0 (MVP)
> Documento de requerimientos técnicos para construir la v0, partiendo del código ya existente en esta carpeta. Entrada principal para Claude Code.

## Alcance de la v0
- Sin login / sin cuenta (100% local, como ya está). El registro con email se añade en una fase posterior, fuera de esta v0.
- Sin conexiones externas de ningún tipo (sin banco, sin pagos, sin email). Todo vive dentro de la app.
- Se construye sobre el código existente, no desde cero.

---

## 1. Límite de vicios → 3

**Objetivo:** el usuario puede dar de alta un máximo de 3 vicios (antes el código permitía 5; el README ya decía 3).

**Archivos afectados:**
- `src/screens/Onboarding.tsx`: el flujo de alta corta en 3 (actualmente corta en 5 — buscar las referencias a `vices.length` y los textos "4 más disponibles", `vices.length < 4`, `vices.length + 1 >= 5`).
- `src/screens/Home.tsx`: el botón "+" para añadir vicio solo debe aparecer si `vices.length < 3` (actualmente `< 5`); el layout de grid (grande/mediano/pequeño según cantidad) se ajusta al máximo de 3+1 placeholder.
- `src/screens/Settings.tsx`: donde se valida `vices.length < 3` para permitir añadir (ya coincide con el README, verificar que sea coherente con el resto).

**Criterio de aceptación:** con 3 vicios dados de alta, no debe ofrecerse la opción de añadir un cuarto en ninguna pantalla (Home, Onboarding, Settings).

---

## 2. Modo "sin valor"

**Objetivo:** permitir dar de alta un vicio sin precio por unidad (ej. comida), que registra frecuencia/racha pero no gasto ni proyección de inversión.

**Modelo de datos (`src/types/index.ts`):**
- `Vice.unitPrice` pasa a ser **opcional**: `unitPrice?: number`.
- Añadir `Vice.hasValue: boolean` (true = vicio con coste económico, false = modo "sin valor"). Alternativa más simple: usar `unitPrice === undefined` como señal de "sin valor", sin campo nuevo — a decidir en implementación, pero debe quedar explícito y no ambiguo (ej. no confundir con precio 0).
- `Tap.priceAtTap` pasa a ser opcional: `priceAtTap?: number` (un tap de un vicio sin valor no lleva precio).

**UI (`src/screens/Onboarding.tsx` y `src/screens/Settings.tsx` donde se edite/cree un vicio):**
- Añadir un toggle/checkbox "Este vicio no tiene un coste económico claro (ej. comida)".
- Si está activado: ocultar/deshabilitar el campo "Precio por unidad" y no exigirlo en `validate()` (ahora mismo `validate()` obliga `unitPrice > 0` siempre — cambiar para que solo sea obligatorio si el vicio tiene valor).

**Lógica (`src/lib/finance.ts`, `src/lib/storage.ts`):**
- `getTotalSpent`, `getMonthlySpend`, `getChartData`, `calculateFV`/`getProjections`: deben excluir los taps sin `priceAtTap` (o sumarlos como 0, que es equivalente en estos cálculos ya que `reduce((s,t) => s + t.priceAtTap, 0)` funciona igual si `priceAtTap` es `undefined` tratado como 0 — hay que asegurar que no lance `NaN`).
- `getDailyTaps`, rachas (`src/lib/streaks.ts` → `getStreak`), logros (`src/lib/achievements.ts`): deben seguir funcionando igual para vicios sin valor (cuentan por frecuencia, no por dinero).

**UI de visualización (`src/screens/Home.tsx`, `src/screens/Impact.tsx`):**
- Para un vicio sin valor: el botón de tap (`ViceButton`) no debe mostrar precio/coste, solo el conteo/racha.
- En `Impact.tsx`: los vicios sin valor no aparecen en el gráfico de gasto/inversión (o aparecen en una sección aparte de "frecuencia", sin cifras económicas).

**Criterio de aceptación:** se puede crear un vicio "comida" sin precio; al tocar el botón se registra el consumo, sube la racha/contador diario, pero no afecta a ninguna cifra de dinero ni a la proyección de inversión.

---

## 3. Modo "ocultar gasto" (ajuste global)

**Objetivo:** el usuario puede activar un ajuste que oculta todas las cifras de dinero de la app, mostrando en su lugar un indicador cualitativo ("vas bien" / "vas mal").

**Modelo de datos (`src/types/index.ts`):**
- Añadir a `Settings`: `hideSpendAmounts?: boolean` (default `false`).

**UI (`src/screens/Settings.tsx`):**
- Nuevo toggle "Ocultar cantidades de dinero" que llama a `updateSettings({ hideSpendAmounts: true/false })`.

**Lógica de "vas bien" / "vas mal":**
- Definir una regla simple para la v0: comparar el gasto/consumo del periodo actual (ej. este mes, o desde el último objetivo) contra el objetivo mensual definido en el punto 4, o contra el periodo anterior si no hay objetivo. Si el consumo actual es menor o igual → "vas bien"; si es mayor → "vas mal".
- Esta lógica puede vivir en el mismo `goals.ts` nuevo del punto 4, para no duplicar comparaciones mes a mes.

**UI de visualización (`src/screens/Home.tsx`, `src/screens/Impact.tsx`):**
- Cuando `settings.hideSpendAmounts === true`: sustituir cualquier cifra de dinero (`{cur}{total.toFixed(2)}`, etc.) por una etiqueta cualitativa ("✅ Vas bien" / "⚠️ Vas mal") con el mismo estilo visual que ya existe.
- Las cifras de cantidad/frecuencia (nº de taps, racha, días) **no** se ocultan — solo el dinero.

**Criterio de aceptación:** al activar el ajuste, desaparecen todas las cifras en € de Home e Impact, sustituidas por el indicador cualitativo; al desactivarlo, vuelven a verse las cifras normales.

---

## 4. Objetivos mes a mes + % de cumplimiento

**Objetivo:** el usuario fija un objetivo de reducción mensual por vicio (cantidad o importe), y la app compara el mes actual contra el anterior mostrando el % de cumplimiento.

**Modelo de datos (`src/types/index.ts`):**
- Añadir a `Vice`: `monthlyGoal?: number` (objetivo de cantidad de consumos para el mes, ej. "máximo 3 cajas este mes"). Para vicios con valor económico, puede expresarse en unidades (no en €, para que aplique igual a vicios "sin valor").

**Nueva lógica — `src/lib/goals.ts` (nuevo archivo):**
- `getMonthCount(taps, viceId, monthOffset)`: cuenta los taps de un vicio en un mes concreto (0 = mes actual, -1 = mes anterior).
- `getGoalProgress(vice, taps)`: compara el conteo del mes actual contra `monthlyGoal` (si existe) y devuelve `{ current: number, previous: number, goal: number, percentCompleted: number, improved: boolean }`. `percentCompleted` = cuánto te acercas a cumplir el objetivo (ej. si el objetivo es reducir de 4 a 3 y vas en 3, es 100%; si vas en 4, es 0%; fórmula a definir con el `improved` entre mes anterior y objetivo).

**UI — nueva sección (puede integrarse en `src/screens/Impact.tsx` o pantalla nueva `src/screens/Goals.tsx`, más enlace en `Layout.tsx`):**
- Por cada vicio con `monthlyGoal` definido: tarjeta mostrando mes anterior vs. mes actual, objetivo, y % de cumplimiento (barra de progreso).
- Edición del objetivo mensual: en `Settings.tsx`, al editar un vicio, añadir campo "Objetivo para este mes (unidades)".

**Criterio de aceptación:** si un usuario consumió 4 cajas de tabaco el mes pasado, fija un objetivo de 3 para este mes, y lleva 3, la app le muestra 100% de cumplimiento del objetivo.

---

## 5. Equivalencias tangibles

**Objetivo:** traducir el ahorro/gasto acumulado a algo tangible y fácil de entender (ej. "esto equivale a 2 libros"), junto a la proyección de inversión que ya existe.

**Catálogo de equivalencias (nuevo, ej. `src/lib/equivalences.ts`):**
- Lista fija para la v0 (sin configuración de usuario todavía): libro (~15€), entrada de cine (~9€), menú de restaurante (~12€), billete de tren ida/vuelta corto (~30€) — ajustar valores con el usuario si se desea.
- `getEquivalences(amount: number)`: devuelve, para una cantidad de dinero, cuántas unidades de cada elemento del catálogo equivale (ej. `Math.floor(amount / 15)` libros).

**UI (`src/screens/Impact.tsx`):**
- Junto a la proyección de inversión ya existente, añadir una frase destacada con la equivalencia más relevante (ej. la de mayor cantidad de unidades, o una rotación de 2-3 frases).

**Criterio de aceptación:** si el usuario ha gastado 30€ en un vicio este mes, ve una frase tipo "Esto son 2 libros" o equivalente, calculada automáticamente.

---

## 6. Celebración de racha sin consumir

**Objetivo:** cuando el usuario aguanta sin consumir un vicio, se celebra con hitos propios (independientes de los hitos de cantidad consumida, que se mantienen tal cual).

**Hitos:** 1, 3, 7, 14, 30, 60 y 90 días seguidos sin consumir (por vicio).

**Lógica (`src/screens/Home.tsx`, apoyándose en `getStreak` de `src/lib/streaks.ts`):**
- En el mismo `useEffect`/`tick` donde ya se revisan logros, comprobar si la racha actual de algún vicio (`getStreak(vice, taps)`) coincide exactamente con uno de los hitos de días, y si no se ha celebrado ya ese hito para ese vicio (guardar en `unlockedAchievements` con un id propio, ej. `streak-7-<viceId>`).
- Disparar una celebración **visualmente distinta** al confetti de consumo (`canvas-confetti` ya está instalado — se puede usar una configuración distinta: otros colores/forma, o un componente de celebración separado tipo medalla/badge en vez de confetti, a definir en diseño visual).

**Logros (`src/lib/achievements.ts`):** añadir nuevos ids de logro por racha de días (ej. `streak-1`, `streak-3`, `streak-7`, `streak-14`, `streak-30`, `streak-60`, `streak-90`), independientes de los logros existentes por cantidad consumida.

**Criterio de aceptación:** al llegar a 7 días seguidos sin tocar un vicio, se dispara una celebración distinta a la de "has consumido 50 veces", y queda registrada para no repetirse.

---

## Fuera de alcance de esta v0 (backlog)
- Detección automática de gasto por tarjeta (seguridad/gestión de datos bancarios).
- Contenido de apoyo psicológico integrado.
- Registro de cuenta con email y confirmación (versión final, fuera de esta v0).
