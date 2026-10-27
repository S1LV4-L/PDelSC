# Frontend – App de Asistencia (Expo + React Native)

Aplicación móvil y web para la gestión de asistencia escolar, con perfiles de **Administrador (preceptor)**, **Profesor** y **Alumno**. Está construida con Expo, React Native y Expo Router, y se comunica con el backend Express/MySQL (`pdeisc_integrador`) mediante peticiones HTTP.

## Tecnologías principales

| Tecnología | Versión |
|---|---|
| Expo SDK | ~58.0 |
| React / React DOM | 19.3.0 |
| React Native | 0.88.0 |
| Expo Router | ~58.0 (rutas basadas en archivos en `src/app`) |
| TypeScript | ~6.0 |
| React Native Reanimated | 4.7.1 |
| React Native Web | ^0.21 |

Librerías destacadas: `expo-camera` (escaneo de QR), `react-native-qrcode-svg` (QR del profesor), `expo-secure-store` (token de sesión), `expo-image-picker` y `expo-document-picker` (justificaciones e importación CSV), `expo-print`, `expo-sharing` y `expo-file-system` (exportación PDF/CSV), `jspdf` y `jspdf-autotable`.

## Requisitos previos

- **Node.js** (versión LTS actual) y **npm**.
- **Backend en ejecución** (por defecto en el puerto `3000`). Ver el README del backend.
- Para Android: un emulador (Android Studio) o un celular con la app **Expo Go** / un *development build*.
- Para generar builds: una cuenta en [expo.dev](https://expo.dev) y **EAS CLI**:

```bash
npm install -g eas-cli
```

## Estructura del proyecto

```
src/
  app/           Pantallas y rutas (Expo Router): (auth), (app), auth-callback
  components/    admin/, home/, layout/, profesor/, ui/
  constants/     Tema (claro/oscuro)
  context/       AuthContext (sesión)
  hooks/         useAuth, useCatalogo, useResponsive, useSeleccion
  services/      Llamadas a la API (api.ts es la base de todas)
  storage/       secureStorage (SecureStore en nativo, localStorage en web)
  types/         Tipos de TypeScript
  utils/         Exportación CSV/PDF, formatos y validaciones
```

## Instalación

```bash
# 1. Clonar el repositorio y entrar a la carpeta del frontend
cd front

# 2. Instalar dependencias
npm install
```

Si Expo informa versiones incompatibles de algún paquete, se pueden alinear con:

```bash
npx expo install --check
```

## Variables de entorno

La app lee **una sola variable**: `EXPO_PUBLIC_API_URL`, la URL base del backend. Se usa en `src/services/api.ts`:

```ts
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
```

Si no se define, se usa `http://localhost:3000`.

Crear un archivo `.env` en la raíz del frontend (junto a `package.json`):

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> **Importante:** las variables `EXPO_PUBLIC_*` se incrustan en el código **al momento de compilar/iniciar Metro**. Si cambiás el valor, hay que reiniciar con caché limpia: `npx expo start -c`.
>
> No guardes secretos en variables `EXPO_PUBLIC_*`: quedan visibles dentro de la app.

### Qué valor usar según dónde corre la app

| Dónde se ejecuta | Valor de `EXPO_PUBLIC_API_URL` |
|---|---|
| Navegador (web) en la misma PC que el backend | `http://localhost:3000` |
| Emulador de Android | `http://10.0.2.2:3000` |
| Celular físico (misma red Wi‑Fi que la PC) | `http://<IP-LOCAL-DE-LA-PC>:3000` (ej. `http://192.168.1.20:3000`) |
| Producción / build de EAS | URL pública del backend, preferentemente `https://...` |

Para el celular físico, el backend tiene que aceptar conexiones desde la red local y el firewall de la PC debe permitir el puerto `3000`.

### Configuración necesaria en el backend

- **`FRONTEND_URL`**: el backend la usa para volver a la web después del login con OAuth (`FRONTEND_URL/auth-callback?token=...`). En desarrollo web, apunta normalmente a `http://localhost:8081`.
- **CORS**: debe permitir el origen del frontend web.
- **Login OAuth (Google, GitHub, Jira) en nativo**: la app abre el navegador del sistema y espera volver mediante un *deep link* (`Linking.createURL("auth-callback")`). Para eso, el `app.json` / `app.config` debe tener un `scheme` definido, por ejemplo:

```json
{
  "expo": {
    "scheme": "asistencia"
  }
}
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia Metro (`expo start --max-workers 2`) y muestra el QR para Expo Go |
| `npm run web` | Inicia la app en el navegador |
| `npm run android` | Inicia y abre la app en un emulador/dispositivo Android |
| `npm run ios` | Inicia y abre la app en el simulador de iOS (solo macOS) |
| `npm run lint` | Ejecuta el linter de Expo |
| `npm run bundle` | Genera `expo-project-bundle.md` con todo `src/` (repomix) |
| `npm run reset-project` | Restablece el proyecto a la plantilla base de Expo (⚠️ destructivo) |

## Ejecutar en desarrollo

1. **Levantar el backend** (puerto `3000`) y verificar que la base de datos MySQL esté activa.
2. **Configurar** `EXPO_PUBLIC_API_URL` según la tabla anterior.
3. **Iniciar el frontend** según la plataforma:

### Web

```bash
npm run web
```

Se abre en `http://localhost:8081`. Notas sobre la versión web:

- El token de sesión se guarda en `localStorage` (en nativo se usa SecureStore).
- La exportación a PDF carga `jspdf` y `jspdf-autotable` desde CDN, por lo que **necesita conexión a internet**.
- El login con OAuth redirige la pestaña actual y vuelve a `/auth-callback`.

### Android

**Con emulador:**

1. Abrir Android Studio → *Device Manager* y arrancar un dispositivo virtual.
2. Usar `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`.
3. Ejecutar:

```bash
npm run android
```

**Con celular físico (Expo Go):**

1. Conectar celular y PC a la misma red Wi‑Fi.
2. Usar `EXPO_PUBLIC_API_URL=http://<IP-LOCAL-DE-LA-PC>:3000`.
3. Ejecutar `npm start` y escanear el QR con Expo Go.

> Si la versión de Expo Go de la tienda no es compatible con el SDK 58, o si alguna librería nativa no funciona en Expo Go, usar un *development build* (ver más abajo).

### iOS (solo macOS)

```bash
npm run ios
```

## Permisos de la app

- **Cámara**: escaneo del QR de asistencia (alumno) y fotos para justificaciones.
- **Galería / archivos**: adjuntar imagen en justificaciones e importar CSV (carga masiva y calificaciones).
- **Almacenamiento (Android)**: al exportar PDF se pide elegir una carpeta de destino; si se cancela, se abre el menú de compartir.

## Build con EAS (Expo Application Services)

### 1. Iniciar sesión y configurar el proyecto

```bash
eas login
eas build:configure
```

Esto crea el archivo `eas.json` y vincula el proyecto con tu cuenta de Expo (agrega el `projectId` en la configuración de la app).

### 2. Definir los perfiles de build en `eas.json`

Ejemplo, con `EXPO_PUBLIC_API_URL` por perfil:

```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "http://192.168.1.20:3000" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": { "EXPO_PUBLIC_API_URL": "https://api-staging.midominio.com" }
    },
    "production": {
      "env": { "EXPO_PUBLIC_API_URL": "https://api.midominio.com" }
    }
  }
}
```

> Los valores de ejemplo (IP, dominios, `cli.version`) son orientativos: reemplazalos por los tuyos.

Alternativa: cargar la variable en los servidores de EAS en lugar de escribirla en `eas.json`:

```bash
eas env:create --environment production --name EXPO_PUBLIC_API_URL --value https://api.midominio.com --visibility plaintext
```

Recordá que el archivo `.env` local **no** se sube a EAS si está en `.gitignore`; por eso la variable debe definirse en `eas.json` o con `eas env:create`.

### 3. Generar los builds

| Objetivo | Comando |
|---|---|
| APK instalable para pruebas (Android) | `eas build --platform android --profile preview` |
| *Development build* (reemplaza a Expo Go) | `eas build --platform android --profile development` |
| Build de producción (AAB para Play Store) | `eas build --platform android --profile production` |
| Build de iOS (requiere cuenta de Apple Developer) | `eas build --platform ios --profile production` |

Al terminar, EAS entrega un enlace de descarga (y un QR) del `.apk` o `.aab`. Para un *development build*, luego se inicia el servidor con:

```bash
npx expo start --dev-client
```

### 4. Publicar en las tiendas (opcional)

```bash
eas submit --platform android
eas submit --platform ios
```

### 5. Build de la versión web (opcional)

```bash
npx expo export --platform web
```

Genera la carpeta `dist/` con los archivos estáticos, listos para servir en cualquier hosting estático. Recordá configurar `FRONTEND_URL` y CORS en el backend con el dominio final.

### Consideraciones para builds de producción en Android

- Android bloquea por defecto el tráfico HTTP sin cifrar en builds de release. Usá **HTTPS** en `EXPO_PUBLIC_API_URL`; si necesitás HTTP para pruebas con el perfil `preview`, hay que habilitar `usesCleartextTraffic` mediante el plugin `expo-build-properties`.
- Todo cambio en `EXPO_PUBLIC_API_URL` requiere **generar un nuevo build**, porque el valor se incrusta al compilar.

## Solución de problemas

| Problema | Posible causa / solución |
|---|---|
| "No se pudo conectar con el servidor" | `EXPO_PUBLIC_API_URL` incorrecta, backend apagado, o se está usando `localhost` desde un emulador/celular (usar `10.0.2.2` o la IP local) |
| Cambié el `.env` y no se refleja | Reiniciar con `npx expo start -c` |
| Error de CORS en la web | Agregar el origen del frontend (`http://localhost:8081`) a los orígenes permitidos del backend |
| El celular no encuentra el backend | Verificar la misma red Wi‑Fi y que el firewall permita el puerto `3000` |
| El login OAuth no vuelve a la app (nativo) | Falta definir `scheme` en `app.json` o el backend no redirige al deep link |
| Dependencias desalineadas con el SDK | `npx expo install --check` |
| Errores raros de caché | `npx expo start -c` y, si persiste, borrar `node_modules` y reinstalar |