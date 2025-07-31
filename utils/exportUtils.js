import { isValidDate, formatDateDDMMYYHHMM, parseDate } from './dateUtils.js';


export function isValidFilename(name) {
    const invalidChars = /[\\/:*?"<>|]/;
    return name.trim() !== "" && !invalidChars.test(name);
}

export function promptForFilename(defaultName = "export", message) {
    let baseName = null;
    
    while (true) {
        baseName = prompt(message, defaultName);
        if (baseName === null) return null; // user cancelled
        
        if (!isValidFilename(baseName)) {
            alert("Le nom contient des caractères invalides: \\ / : * ? \" < > |");
        } else {
            break;
        }
    }
    
    return baseName.trim();
}

export function formatRowForExport(row) {
    const newRow = {};
    for (const key in row) {
        const val = row[key];
        const parsedDate = parseDate(val);
        newRow[key] = (typeof val === "string" && isValidDate(val)) 
            ? formatDateDDMMYYHHMM(parsedDate) 
            : val;
    }
    return newRow;
}

export function downloadExcel(data, filename, sheetName = "Sheet1") {
    if (!data || data.length === 0) {
        alert("Pas de données à télécharger.");
        return false;
    }

    const formattedData = data.map(formatRowForExport);
    const ws = XLSX.utils.json_to_sheet(formattedData);
    
    ws['!cols'] = Object.keys(formattedData[0]).map(() => ({ wch: 20 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
    
    return true;
}

export function downloadFilteredData(filteredData, selectedColumns,defaultName) {
    if (filteredData.length === 0) {
        alert("Pas de données à télécharger");
        return;
    }

    if (selectedColumns.length === 0) {
        alert("Sélectionnez au moins une colonne à afficher.");
        return;
    }

    const exportData = filteredData.map(row => {
        const obj = {};
        selectedColumns.forEach(col => {
            const val = row[col];
            const parsedDate = parseDate(val);
            obj[col] = parsedDate ? formatDateDDMMYYHHMM(parsedDate) : val;
        });
        return obj;
    });

    const filename = promptForFilename(defaultName, "Entrez le nom du fichier:");
    if (!filename) return;

    downloadExcel(exportData, `${filename}.xlsx`, "FilteredData");
}

export function downloadJoinedData(joinColumns) {
    if (joinColumns.length === 0) {
        alert("No data to export.");
        return;
    }

    const filename = promptForFilename("table_croisée", "Entrez le nom du fichier:");
    if (!filename) return;

    downloadExcel(joinColumns, `${filename}.xlsx`, "Table filtrée");
}

export function downloadUnmatchedData(excelData, fullJoinResult, keys) {
    if (excelData.length < 2) {
        alert("Veuillez importer au moins 2 fichiers.");
        return;
    }

    const filename = promptForFilename("lignes_sans_correspondance", "Entrez le nom du fichier:");
    if (!filename) return;

    // Create key sets from join result
    const keySets = keys.map(() => new Set());

    for (const row of fullJoinResult) {
        keys.forEach((key, idx) => {
            if (row.hasOwnProperty(key)) {
                keySets[idx].add(row[key]);
            } else {
                const prefixedKey = `fichier${idx + 1}_${key}`;
                if (row.hasOwnProperty(prefixedKey)) {
                    keySets[idx].add(row[prefixedKey]);
                }
            }
        });
    }

    const wb = XLSX.utils.book_new();

    excelData.forEach((table, i) => {
        const key = keys[i];
        const existingKeys = keySets[i];

        const unmatched = table.filter(row => !existingKeys.has(row[key]));

        const formatted = unmatched.length > 0
            ? unmatched.map(formatRowForExport)
            : [Object.fromEntries(Object.keys(table[0] || {}).map(k => [k, ""]))];

        const ws = XLSX.utils.json_to_sheet(formatted);
        ws['!cols'] = Object.keys(formatted[0]).map(() => ({ wch: 20 }));
        XLSX.utils.book_append_sheet(wb, ws, `Sans Correspondance Fichier ${i + 1}`);
    });

    XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function downloadCSV(data, filename) {
    if (!data || data.length === 0) {
        alert("Pas de données à télécharger.");
        return;
    }

    const formattedData = data.map(formatRowForExport);
    const csv = Papa.unparse(formattedData);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}