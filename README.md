# VicioTracker

PWA mobile-first para tracking de consumos (Monster, café, cerveza, tabaco…) con cálculo de coste de oportunidad financiero.

## Stack
React 18 · Vite · TypeScript · TailwindCSS · Framer Motion · Recharts · LocalStorage · vite-plugin-pwa

---

## Instalación y arranque local

```bash
# 1. Clona el repo
git clone https://github.com/Afriend1998/VICIOTRACKER.git
cd VICIOTRACKER

# 2. Instala dependencias
npm install

# 3. Arranca el servidor de desarrollo
npm run dev
# → Abre http://localhost:5173
```

## Build de producción

```bash
npm run build
npm run preview  # previsualiza el build
```

---

## Despliegue en Vercel (recomendado)

1. Ve a vercel.com → New Project → importa el repo de GitHub.
2. Framework preset: Vite. Sin cambiar nada más.
3. Deploy. URL disponible en ~30 segundos.

## Despliegue en GitHub Pages

1. Añade al `package.json` en `"scripts"`: `"deploy": "npm run build && gh-pages -d dist"`
2. Instala: `npm install -D gh-pages`
3. Ejecuta: `npm run deploy`
4. En GitHub → Settings → Pages → Source: `gh-pages` branch.

---

## Iconos PWA (para producción)

El manifest necesita `public/pwa-192.png` y `public/pwa-512.png`.
Puedes generarlos en https://realfavicongenerator.net subiendo el `pwa-icon.svg` que ya está en `/public`.

---

## Arquitectura

```
src/
  types/index.ts          # Tipos TypeScript (Vice, Tap, Settings…)
  lib/
    storage.ts            # Wrapper de LocalStorage
    finance.ts            # Cálculos DCA / interés compuesto
    health.ts             # Umbrales OMS y rachas
  components/
    Layout.tsx            # Shell + navegación inferior
    ViceButton.tsx        # Botón tap con animación spring
    ImpactCard.tsx        # Tarjeta de gasto
    HealthCard.tsx        # Barra de salud con umbral
    StreakBadge.tsx       # Racha de días sin consumir
  screens/
    Onboarding.tsx        # Configuración inicial
    Home.tsx              # Pantalla principal con botones
    Impact.tsx            # Impacto financiero + gráfico
    Health.tsx            # Métricas de salud + rachas
    Settings.tsx          # Configuración y datos
```

## Cómo añadir features

**Nuevo vicio predefinido:** En `Onboarding.tsx`, añade en el objeto `PRESETS`.

**Cambiar tasa de inversión por defecto:** En `storage.ts`, cambia `annualReturn: 0.08`.

**Aumentar límite de vicios (3 → más):** En `Settings.tsx`, busca `vices.length < 3`.

**Nueva pantalla:** Crea el componente en `screens/`, añade la ruta en `App.tsx` y el enlace en `Layout.tsx`.

---

## LocalStorage schema v0.1

```json
{
  "version": "0.1",
  "vices": [{ "id": "uuid", "name": "Monster Ultra", "emoji": "⚡", "unitPrice": 1.95,
    "category": "energy-drink", "healthMetrics": { "caffeine": 160, "calories": 110, "sugar": 27 },
    "dailyLimit": 2, "createdAt": "ISO" }],
  "taps": [{ "viceId": "uuid", "timestamp": "ISO", "priceAtTap": 1.95 }],
  "settings": { "currency": "EUR", "annualReturn": 0.08, "startDate": "ISO" }
}
```
