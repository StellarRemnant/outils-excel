import { isValidDate, formatDateDDMMYYHHMM, parseDate } from './dateUtils.js';


export function applyKeywordFilters(data, nonDateCols) {
  let filtered = [...data];

  nonDateCols.forEach(col => {
    // Apply include filters
    filtered = applyIncludeFilter(filtered, col);
    
    // Apply exclude filters
    filtered = applyExcludeFilter(filtered, col);
  });

  return filtered;
}

function applyIncludeFilter(data, col) {
  const enabledInclude = document.getElementById('enableKeywordFilter_' + col)?.checked;
  if (!enabledInclude) return data;

  const keywordsInput = document.getElementById('keywordInput_' + col).value;
  const keywords = keywordsInput.split('/').map(k => k.trim()).filter(k => k !== '');
  
  if (keywords.length === 0) return data;

  const andOrLogic = document.getElementById('andOrToggle_' + col).value;

  return data.filter(row => {
    const cellValue = (row[col] || "").toString().toLowerCase();
    
    const matchesKeywords = keywords.map(keyword => {
      // Special syntax for empty strings
      if (keyword === '{vide}') {
        return (row[col] || "").toString() === "";
      }
      return cellValue.includes(keyword.toLowerCase());
    });

    if (andOrLogic === 'and') {
      return matchesKeywords.every(match => match);
    } else {
      return matchesKeywords.some(match => match);
    }
  });
}

function applyExcludeFilter(data, col) {
  const enabledExclude = document.getElementById('enableExcludeFilter_' + col)?.checked;
  if (!enabledExclude) return data;

  const excludeInput = document.getElementById('excludeInput_' + col).value;
  const excludeKeywords = excludeInput.split('/').map(k => k.trim()).filter(k => k !== '');
  
  if (excludeKeywords.length === 0) return data;

  return data.filter(row => {
    const cellValue = (row[col] || "").toString().toLowerCase();
    
    const hasMatch = excludeKeywords.some(keyword => {
      // Special syntax for empty strings
      if (keyword === '{vide}') {
        return (row[col] || "").toString() === "";
      }
      return cellValue.includes(keyword.toLowerCase());
    });
    
    return !hasMatch;
  });
}

export function applyDateFilters(data, detectedDateCols) {
  const enabledDateFilters = detectedDateCols.filter(col => {
    return document.getElementById('enableDateFilter_' + col)?.checked;
  });

  let filtered = [...data];

  for (const col of enabledDateFilters) {
    try {
      filtered = applyDateFilterForColumn(filtered, col);
    } catch (error) {
      throw error;
    }
  }

  return filtered;
}

function applyDateFilterForColumn(data, col) {
  const startStr = document.getElementById('startDate_' + col).value;
  const endStr = document.getElementById('endDate_' + col).value;

  if (!startStr || !endStr) {
    alert(`Veuillez sélectionner 2 dates; celle du début et fin de période "${col}".`);
    throw new Error('Incomplete date range');
  }

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  
  if (startDate > endDate) {
    alert(`La date de début doit être avant celle du fin "${col}".`);
    throw new Error('Invalid date range');
  }

  return data.filter(row => {
    const rawVal = row[col];
    if (typeof rawVal !== 'string' || !isValidDate(rawVal)) return false;

    const dateVal = parseDate(rawVal);
    return dateVal >= startDate && dateVal <= endDate;
  });
}

export function getSelectedColumns(selector) {
  return Array.from(document.querySelectorAll(selector)).map(cb => cb.value);
}

export function prepareDisplayData(data, selectedCols) {
  return data.map(row => {
    const obj = {};
    selectedCols.forEach(col => {
      const val = row[col];
      const parsedDate = parseDate(val);
      obj[col] = (typeof val === 'string' && isValidDate(val))
        ? formatDateDDMMYYHHMM(parsedDate)
        : val;
    });
    return obj;
  });
}

export function validateFilterInputs(detectedDateCols) {
  const errors = [];
  
  // Validate date filters
  detectedDateCols.forEach(col => {
    const enabled = document.getElementById('enableDateFilter_' + col)?.checked;
    if (!enabled) return;
    
    const startStr = document.getElementById('startDate_' + col).value;
    const endStr = document.getElementById('endDate_' + col).value;
    
    if (!startStr || !endStr) {
      errors.push(`Missing date range for column "${col}"`);
    } else {
      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      if (startDate > endDate) {
        errors.push(`Période invalide pour la colonne: "${col}"`);
      }
    }
  });
  
  return errors;
}

export function getUnmatchedRows(fullData, filteredData) {
  const filteredSet = new Set(filteredData.map(row => JSON.stringify(row)));
  return fullData.filter(row => !filteredSet.has(JSON.stringify(row)));
}
