export function isValidDate(val) {
    const patterns = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[ T](\d{1,2}):(\d{2}))?$/,
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/
    ];

    return typeof val === 'string' && patterns.some(pat => pat.test(val.trim()));
}

export function formatDateDDMMYYHHMM(date) {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(-2);
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
}


export function parseDate(val) {
    if (!val || typeof val !== 'string') return null;
    val = val.trim();

    // Try DD/MM/YYYY format
    let match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[ T](\d{1,2}):(\d{2}))?$/);
    if (match) {
    let [ , day, month, year, hour = '0', minute = '0' ] = match;
    if (year.length === 2) year = '20' + year;
    return new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute.padStart(2,'0')}`);
    }

    // Try ISO format: YYYY-MM-DD
    match = val.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/);
    if (match) {
    let [ , year, month, day, hour = '0', minute = '0' ] = match;
    return new Date(`${year}-${month}-${day}T${hour.padStart(2,'0')}:${minute.padStart(2,'0')}`);
    }

    return null;
}

export function detectDateColumns(data) {
  if (data.length === 0) return [];

  const cols = Object.keys(data[0]);
  const dateCols = [];

  cols.forEach(col => {
    let allValid = true;
    let hasNonEmpty = false;

    for (let i = 0; i < data.length; i++) {
      const val = data[i][col];
      if (!val) continue;

      hasNonEmpty = true;

      if (typeof val !== 'string' || !isValidDate(val)) {
        allValid = false;
        break;
      }
    }

    if (hasNonEmpty && allValid) {
      dateCols.push(col);
    }
  });

  return dateCols;
}
