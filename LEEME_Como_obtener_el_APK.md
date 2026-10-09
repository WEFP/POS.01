# SuperPacks POS · Claro Guatemala

## Cómo obtener tu APK (sin programar)

1. Crea una cuenta gratis en https://github.com.
2. Arriba a la derecha: **+ → New repository**. Ponle un nombre (ej. `superpacks-pos`), déjalo **Private** y toca **Create repository**.
3. Descomprime este ZIP en tu computadora. En el repositorio nuevo toca **uploading an existing file** y arrastra **todo el contenido** de la carpeta (incluida `.github`). Toca **Commit changes**.
   - Si `.github` no se sube: **Add file → Create new file**, escribe el nombre `.github/workflows/build-apk.yml` y pega el contenido del archivo `build-apk.yml` que te entregué aparte.
4. Ve a la pestaña **Actions → Construir APK → Run workflow**. Tarda entre 10 y 20 minutos.
5. Cuando termine con ✅, entra a esa ejecución y baja a **Artifacts**: descarga **SuperPacksPOS-apk** (viene en un ZIP con `app-release.apk`).
6. Pasa el APK al celular, ábrelo y permite "instalar apps de origen desconocido". Al abrir la app, acepta los permisos de Llamadas y SMS.

Si el paso 4 falla (❌), abre la ejecución, copia el texto del paso en rojo y pásamelo para corregirlo.

## Estructura (por si algún día quieres modificar)
```
App.js                      navegación, permisos, listener SMS, historial de consola
src/data/catalog.js         secciones y paquetes del tarifario
src/data/lessons.js         lecciones de la Consola del Desarrollador
src/utils/ussd.js           validación (teléfono 8 dígitos, PIN 4-6) y comando USSD
src/utils/smsParser.js      lectura de SMS (estado, transacción, monto, destino)
src/storage/history.js      historial local (sin PIN)
src/native/ClaroNative.js   puente JS ↔ Android
android-native/             módulo Kotlin: sendUssdRequest, ACTION_CALL, receiver SMS, inbox
.github/workflows/          receta que construye el APK en la nube
```
