# Patrimonio Unificado — App (PWA + iOS + Android)

Esta app existe en **3 formas** a partir del mismo código (`index.html`):

1. **Web** — https://patrimonio-unificado.vercel.app (lo de siempre).
2. **App instalable (PWA)** — se instala en el móvil **hoy mismo, gratis, sin tiendas**.
3. **App nativa (iOS + Android)** — proyectos listos en `ios/` y `android/` para subir a
   App Store y Google Play (requiere tus cuentas de desarrollador y, para iOS, un Mac).

---

## 1) Instalarla en el móvil AHORA (PWA, gratis)

No necesitas tiendas ni pagar nada. Abre la web en el móvil y:

- **iPhone (Safari):** botón Compartir → **«Añadir a pantalla de inicio»**.
- **Android (Chrome):** menú ⋮ → **«Instalar aplicación»** (o aparece solo un aviso «Instalar»).

Queda como una app: icono propio, pantalla completa (sin barras del navegador),
funciona sin conexión para abrir, y los precios se actualizan al recuperar internet.

---

## 2) Publicar en **Google Play** (Android)

Necesitas: **Android Studio** (descarga gratis, incluye todo lo necesario) y una
**cuenta Google Play Console** (pago único de **25 USD**).

```bash
# en esta carpeta:
npm install            # una vez
npm run sync           # vuelca la última web al proyecto Android
npm run open:android   # abre el proyecto en Android Studio
```

En Android Studio:
1. Espera a que termine de sincronizar Gradle.
2. **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**.
3. Crea una **clave de firma (keystore)** la primera vez y **GUÁRDALA con su contraseña**
   (sin ella no podrás volver a actualizar la app — haz copia de seguridad).
4. Sube el `.aab` en https://play.google.com/console → crea la ficha (nombre,
   descripción, capturas, icono 512, política de privacidad) y publica.

Para **probarla en tu teléfono** sin la tienda: Android Studio → **Run ▶** con el móvil
conectado por USB (modo desarrollador activado), o **Build → Build APK** y pasa el `.apk`.

---

## 3) Publicar en la **App Store** (iPhone)

Requiere **un Mac con Xcode** (Apple no permite compilar iOS en Windows) y una cuenta
**Apple Developer** (**99 USD/año**).

Copia esta carpeta al Mac y allí:

```bash
npm install
npm run sync
sudo gem install cocoapods   # si no lo tiene
npx cap open ios             # abre Xcode (App.xcworkspace)
```

En Xcode:
1. Selecciona el proyecto **App** → pestaña **Signing & Capabilities** → elige tu
   **Team** (tu cuenta Apple Developer). El *Bundle Identifier* ya es `com.patrimoniounificado.app`.
2. **Product → Archive** → **Distribute App → App Store Connect**.
3. En https://appstoreconnect.apple.com completa la ficha y envía a revisión.

---

## Actualizar la app tras cambiar la web

Cada vez que cambie `index.html` (o se despliegue la web):

```bash
npm run sync      # copia la web a iOS y Android
```

Luego vuelve a generar el `.aab` (Android) o a hacer **Archive** (iOS) y sube la nueva versión.
La **PWA** se actualiza sola: los usuarios reciben los cambios al reabrirla.

---

## Datos técnicos

| Dato | Valor |
|---|---|
| ID de la app (iOS/Android) | `com.patrimoniounificado.app` |
| Nombre | Patrimonio Unificado |
| Carpeta web empaquetada | `www/` (la genera `npm run build:www`) |
| Plataformas nativas | `android/`, `ios/` |
| Wrapper | Capacitor 6 + plugins App, StatusBar, SplashScreen, Haptics, Keyboard, Network |

> Nota: dentro de la app nativa, las llamadas a la función `/api/yahoo` apuntan
> automáticamente a `https://patrimonio-unificado.vercel.app`. Firebase (login/sync)
> y los precios (CoinGecko, Stooq) funcionan igual que en la web.

### Regenerar el proyecto nativo desde cero (si hiciera falta)

```bash
npm install
node scripts/make-app-assets.mjs
npm run build:www
npx cap add android
npx cap add ios          # (en Mac)
npx @capacitor/assets generate \
  --iconBackgroundColor '#0A0A08' --splashBackgroundColor '#0A0A08' \
  --iconBackgroundColorDark '#0A0A08' --splashBackgroundColorDark '#0A0A08'
npx cap sync
```
