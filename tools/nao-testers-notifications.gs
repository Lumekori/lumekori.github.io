/**
 * Avisos de Nao Testers · Lumekori Studio
 * Se ejecuta como script PRIVADO en Google Apps Script con la cuenta dueña
 * del proyecto Firebase lmk-nao. NO se publica como aplicación web.
 *
 * Nunca coloques claves privadas ni contraseñas en este archivo.
 */
const NAO_ALERTS = Object.freeze({
  project: 'lmk-nao',
  database: '(default)',
  collection: 'nao_tester_applications',
  inbox: 'hello@lumekori.dev',
  minutes: 10,
  batchSize: 100
});

function firestoreRoot_() {
  return 'https://firestore.googleapis.com/v1/projects/' +
    NAO_ALERTS.project + '/databases/' + NAO_ALERTS.database +
    '/documents';
}

function firestoreRequest_(path, method, body) {
  const options = {
    method: method || 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };
  if (body !== undefined) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(body);
  }
  const response = UrlFetchApp.fetch(firestoreRoot_() + path, options);
  if (response.getResponseCode() < 200 || response.getResponseCode() > 299) {
    throw new Error('Firestore devolvió HTTP ' + response.getResponseCode() +
      '. Verifica que uses la cuenta con acceso al proyecto LMK Nao y el permiso datastore.');
  }
  return JSON.parse(response.getContentText());
}

function fieldText_(document, name) {
  const value = document.fields && document.fields[name];
  return value && value.stringValue ? value.stringValue : '';
}

function dateKey_(value) {
  const match = /^(.+?)(?:\.(\d+))?Z$/.exec(value || '');
  return match ? match[1] + '.' + (match[2] || '').padEnd(9, '0') + 'Z' : value;
}

function isAfterCursor_(timestamp, docId, cursor) {
  if (!cursor) return true;
  const current = dateKey_(timestamp), old = dateKey_(cursor.timestamp);
  return current > old || (current === old && docId > cursor.id);
}

function checkNewNaoTesters() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('NAO_TESTERS_LAST_NOTIFIED');
    let cursor = stored ? JSON.parse(stored) : null;
    const structuredQuery = {
      from: [{ collectionId: NAO_ALERTS.collection }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }],
      limit: NAO_ALERTS.batchSize
    };
    if (cursor) {
      structuredQuery.where = { fieldFilter: {
        field: { fieldPath: 'createdAt' },
        op: 'GREATER_THAN_OR_EQUAL',
        value: { timestampValue: cursor.timestamp }
      } };
    }
    const data = firestoreRequest_(':runQuery', 'post', { structuredQuery });
    const rows = (Array.isArray(data) ? data : [])
      .filter(row => row.document && row.document.fields &&
        row.document.fields.createdAt && row.document.fields.createdAt.timestampValue)
      .map(row => row.document);
    rows.sort((a, b) => {
      const ta = dateKey_(a.fields.createdAt.timestampValue);
      const tb = dateKey_(b.fields.createdAt.timestampValue);
      if (ta !== tb) return ta < tb ? -1 : 1;
      const ia = a.name.split('/').pop(), ib = b.name.split('/').pop();
      return ia < ib ? -1 : ia > ib ? 1 : 0;
    });

    let sent = 0;
    rows.forEach(doc => {
      const docId = doc.name.split('/').pop();
      const timestamp = doc.fields.createdAt.timestampValue;
      if (!isAfterCursor_(timestamp, docId, cursor)) return;
      if (fieldText_(doc, 'status') === 'pending') {
        const nickname = fieldText_(doc, 'nickname').replace(/[\r\n]/g, ' ').slice(0, 45);
        const email = fieldText_(doc, 'email').replace(/[\r\n]/g, '').slice(0, 254);
        const body = [
          'Nueva solicitud para probar Nao (Pre-Alpha).',
          '',
          'Apodo: ' + nickname,
          'Correo de Google Play: ' + email,
          'Estado: pendiente de revisión manual',
          'Documento de Firestore: ' + docId,
          '',
          'Revisa la fecha de nacimiento y los demás datos desde Firebase:',
          'https://console.firebase.google.com/project/lmk-nao/firestore/data',
          '',
          'Para conceder acceso debes añadir manualmente el correo del',
          'solicitante en Google Play Console. Este aviso NO lo aprueba.'
        ].join('\n');
        MailApp.sendEmail({
          to: NAO_ALERTS.inbox,
          subject: 'Nao Testers: nueva solicitud pendiente',
          body: body,
          name: 'Lumekori · Nao Testers'
        });
        sent++;
      }
      // Se guarda después de que Gmail acepta el envío, nunca antes.
      // Ante un fallo aislado podría llegar un aviso duplicado; no se pierde el registro.
      cursor = { timestamp: timestamp, id: docId };
      props.setProperty('NAO_TESTERS_LAST_NOTIFIED', JSON.stringify(cursor));
    });
    console.log('Nao Testers: ' + sent + ' aviso(s) enviado(s).');
  } finally {
    lock.releaseLock();
  }
}

function testNaoNotifications() {
  const config = firestoreRequest_('/' + NAO_ALERTS.collection + '/config');
  if (!config.fields || !config.fields.status) {
    throw new Error('No se encontró nao_tester_applications/config.');
  }
  MailApp.sendEmail({
    to: NAO_ALERTS.inbox,
    subject: '[PRUEBA] Notificaciones de Nao Testers',
    body: 'La conexión entre Google Apps Script y Firestore funciona.\n' +
      'No se ha aprobado ninguna solicitud.\n' +
      'Estado de la convocatoria: ' + fieldText_(config, 'status') + '.',
    name: 'Lumekori · Nao Testers'
  });
  console.log('Prueba completada. Comprueba el correo hello@lumekori.dev.');
}

function enableNaoNotifications() {
  // Si falla el acceso a Firestore o MailApp, no se crea el temporizador.
  checkNewNaoTesters();
  const existing = ScriptApp.getProjectTriggers().some(trigger =>
    trigger.getHandlerFunction() === 'checkNewNaoTesters');
  if (!existing) {
    ScriptApp.newTrigger('checkNewNaoTesters')
      .timeBased().everyMinutes(NAO_ALERTS.minutes).create();
  }
  console.log('Avisos de Nao Testers programados cada 10 minutos.');
}

function disableNaoNotifications() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'checkNewNaoTesters')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  console.log('Avisos automáticos desactivados.');
}
