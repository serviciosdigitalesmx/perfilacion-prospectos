// ============================================================
// BACKEND - Directorio de Talleres de Reparación
// Usa la hoja "Alta confianza nacional"
// ============================================================

// URL pública que obtendrás al desplegar (se reemplaza en el frontend)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';

/**
 * Maneja peticiones GET.
 * - ?action=search&q=texto → búsqueda en todos los campos.
 * - ?action=search&q=texto&entidad=Nombre → búsqueda con filtro por entidad.
 * - ?action=export&q=texto → exporta los resultados en CSV.
 * - Sin parámetros → devuelve el frontend HTML.
 */
function doGet(e) {
  const action = e?.parameter?.action || '';
  const query = e?.parameter?.q?.trim() || '';
  const entidad = e?.parameter?.entidad?.trim() || '';

  if (action === 'search') {
    const results = searchRecords(query, entidad);
    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'export') {
    const results = searchRecords(query, entidad);
    const csv = convertToCSV(results);
    return ContentService.createTextOutput(csv)
      .setMimeType(ContentService.MimeType.CSV)
      .downloadAsFile('talleres.csv');
  }

  if (action === 'entidades') {
    const entidades = getUniqueEntidades();
    return ContentService.createTextOutput(JSON.stringify(entidades))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Si no hay acción, devuelve el frontend
  return HtmlService.createHtmlOutputFromFile('index');
}

/**
 * Maneja peticiones POST (para búsquedas con filtros).
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const query = body.q?.trim() || '';
    const entidad = body.entidad?.trim() || '';
    const results = searchRecords(query, entidad);
    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lee los datos de la hoja "Alta confianza nacional".
 * La primera fila contiene los encabezados.
 */
function getData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Alta confianza nacional');
  if (!sheet) {
    throw new Error('No se encontró la hoja "Alta confianza nacional". Verifica el nombre.');
  }
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  const rows = values.slice(1);
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

/**
 * Busca registros que contengan `query` en cualquier campo,
 * y opcionalmente filtra por `entidad` (si se proporciona).
 * Búsqueda insensible a mayúsculas.
 */
function searchRecords(query, entidad = '') {
  const records = getData();
  let filtered = records;

  if (entidad) {
    const lowerEntidad = entidad.toLowerCase();
    filtered = filtered.filter(r => r['Entidad']?.toLowerCase() === lowerEntidad);
  }

  if (!query) return filtered;

  const lowerQuery = query.toLowerCase();
  return filtered.filter(record => {
    return Object.values(record).some(value =>
      String(value).toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Obtiene la lista de entidades únicas (para el filtro del frontend).
 */
function getUniqueEntidades() {
  const records = getData();
  const entidades = new Set();
  records.forEach(r => {
    const ent = r['Entidad'];
    if (ent) entidades.add(ent);
  });
  return Array.from(entidades).sort();
}

/**
 * Convierte un arreglo de objetos a formato CSV.
 */
function convertToCSV(records) {
  if (!records || records.length === 0) return 'No hay datos';

  const headers = Object.keys(records[0]);
  let csv = headers.join(',') + '\n';
  records.forEach(row => {
    const values = headers.map(h => {
      let val = row[h] || '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    csv += values.join(',') + '\n';
  });
  return csv;
}
