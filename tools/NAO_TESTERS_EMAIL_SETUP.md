# Notificaciones por correo para Nao Testers (plan Spark)

Este sistema mantiene los registros en Cloud Firestore y envía a **hello@lumekori.dev**
un correo por cada solicitud nueva con estado `pending`. La aprobación sigue
siendo **manual** desde Google Play Console. No guarda contraseñas.

El script comprueba la base de datos aproximadamente cada **10 minutos**. No
envía avisos instantáneos. Se ejecuta con Google Apps Script desde la cuenta
Google con permisos sobre el proyecto Firebase `lmk-nao`.

## Preparación

1. Abre https://script.google.com/ con la cuenta Google que administra Firebase.
2. Selecciona «Nuevo proyecto» y llámalo «Nao Testers — Avisos».
3. Borra el contenido de `Código.gs` y pega todo el contenido de
   [nao-testers-notifications.gs](nao-testers-notifications.gs).
4. Abre Configuración del proyecto y activa «Mostrar el archivo de manifiesto
   appsscript.json en el editor».
5. Abre `appsscript.json` y pega el contenido del archivo
   [appsscript.json.template](appsscript.json.template). Guarda.
6. En el selector de funciones, elige `testNaoNotifications` y pulsa Ejecutar.
   Concede permisos solamente al script creado en tu propia cuenta.
7. Comprueba que ha llegado **[PRUEBA] Notificaciones de Nao Testers** a
   `hello@lumekori.dev` (redirigido al buzón configurado).
8. Selecciona `enableNaoNotifications` y ejecútala **una sola vez**.
   Procesará solicitudes ya pendientes (incluida la solicitud de prueba)
   y creará el activador periódico.
9. Confirma los registros desde el apartado «Ejecuciones» de Apps Script y
   comprueba el correo recibido.

Para detener los avisos, ejecuta `disableNaoNotifications`.
Si el script informa HTTP 403, revisa que la cuenta con la que lo ejecutas
tenga permisos en `lmk-nao` y que la API de Firestore esté habilitada. No
compartas códigos de acceso OAuth, contraseñas ni claves privadas.

**Privacidad:** el correo incluye únicamente apodo, correo para Google Play e ID
del documento. La fecha de nacimiento sigue dentro de Firestore. El script es
privado; el código fuente guardado en este repositorio público no contiene
credenciales ni datos personales.

**Seguridad:** los avisos no reemplazan App Check, las reglas de Firestore ni
la revisión de solicitudes. Si la configuración `config.status` permanece en
`setup`, no se admiten nuevas solicitudes. Cuando vuelvas a abrir el
formulario, revisa antes las medidas contra abusos y la protección de App Check.

**Nota operativa:** esta implementación utiliza un cursor ordenado por fecha
de creación para evitar reavisos, pero si Gmail acepta el envío y el script
se interrumpe antes de guardar el cursor, podría enviarse un duplicado. El
cursor se mantiene en las propiedades privadas de Apps Script. Para una
convocatoria de gran volumen convendría un procesamiento transaccional
con servidor.
