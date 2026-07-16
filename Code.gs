const API_SECRET_KEY = 'f1x1_2026_secreto';
const SHEET_ID = '1aJ_Me-i2sbvyT-dvaSGLTiRzPuMy7C4K';

function doGet(e) {
  try {
    if (e.parameter.token !== API_SECRET_KEY) return createJsonResponse({ error: 'No autorizado' }, 401);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const action = e.parameter.action;

    if (action === 'getTree') {
      const dataNodos = ss.getSheetByName('Nodos').getDataRange().getValues();
      const dataRutas = ss.getSheetByName('Rutas').getDataRange().getValues();
      return createJsonResponse({ success: true, data: { nodos: formatData(dataNodos), rutas: formatData(dataRutas) } });
    }
    return createJsonResponse({ error: 'Acción inválida' }, 400);
  } catch (error) { return createJsonResponse({ error: error.message }, 500); }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (e.parameter.token !== API_SECRET_KEY) return createJsonResponse({ error: 'No autorizado' }, 401);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    ss.getSheetByName('Llamadas').appendRow([new Date(), payload.taller_id, payload.resultado, payload.objecion_principal, payload.interes, payload.accion, JSON.stringify(payload)]);
    return createJsonResponse({ success: true });
  } catch (error) { return createJsonResponse({ error: error.message }, 500); }
}

function createJsonResponse(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function formatData(data) {
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => obj[header] = row[index]);
    return obj;
  });
}
