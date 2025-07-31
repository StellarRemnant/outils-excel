export function validateJoinInputs(excelData, expectedCount, selects) {
  const uploadedCount = excelData.filter(data => Array.isArray(data)).length;

  if (uploadedCount < expectedCount) {
    alert(`Vous avez spécifié ${expectedCount} fichiers mais seulement ${uploadedCount} ont été importés.`);
    return false;
  }

  if (selects.length < 2) {
    alert("Veuillez importer au moins deux fichiers.");
    return false;
  }

  for (let sel of selects) {
    if (!sel.value) {
      alert("Veuillez sélectionner une colonne de jointure pour chaque fichier.");
      return false;
    }
  }

  return true;
}

export function performJoinOperation(excelData, keys) {
  if (excelData.length === 0) return [];
  if (excelData.length === 1) return excelData[0];

  // Find keys that exist in ALL files
  const keyCountMap = new Map();
  
  // Count occurrences of each key across all files
  for (let fileIndex = 0; fileIndex < excelData.length; fileIndex++) {
    const seenKeys = new Set();
    for (const row of excelData[fileIndex]) {
      const key = row[keys[fileIndex]];
      if (key !== undefined && key !== null && !seenKeys.has(key)) {
        seenKeys.add(key);
        keyCountMap.set(key, (keyCountMap.get(key) || 0) + 1);
      }
    }
  }

  // Filter to only keys that appear in ALL files
  const commonKeys = new Set();
  for (const [key, count] of keyCountMap.entries()) {
    if (count === excelData.length) {
      commonKeys.add(key);
    }
  }

  // Build result with only common keys
  let result = excelData[0].filter(row => commonKeys.has(row[keys[0]]));

  for (let i = 1; i < excelData.length; i++) {
    const map = new Map();
    for (const row of excelData[i]) {
      const key = row[keys[i]];
      if (commonKeys.has(key)) {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
      }
    }

    result = result.flatMap(r1 => {
      const matches = map.get(r1[keys[0]]) || [];
      return matches.map(r2 => {
        const r2Prefixed = {};
        for (const [k, v] of Object.entries(r2)) {
          r2Prefixed[(k in r1) ? `file${i + 1}_${k}` : k] = v;
        }
        return { ...r1, ...r2Prefixed };
      });
    });
  }

  return result;
}