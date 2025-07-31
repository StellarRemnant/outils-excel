import {createJoinColumnSelector,createColumnCheckboxes,createFileInput, updateMatchCount, showTable} from '../utils/uiUtils.js';
import { readExcelFile } from '../utils/fileUtils.js';
import { downloadJoinedData, downloadUnmatchedData } from '../utils/exportUtils.js';
import { validateJoinInputs, performJoinOperation } from '../utils/joinUtils.js';
import { prepareDisplayData, getSelectedColumns} from '../utils/filterUtils.js';

// DOM element caching - query once, use many times
const elements = {
  output: document.getElementById("output"),
  columnSelector: document.getElementById("columnSelector"),
  columnSelectors: document.getElementById("columnSelectors"),
  fileForm: document.getElementById("fileForm"),
  fileCount: document.getElementById("fileCount"),
  downloadUnmatchedBtn: document.getElementById("downloadUnmatchedBtn")
};

const appState = {
  excelData: [],
  joinColumns: [],
  fullJoinResult: [],
  selectedCols: []
};

function resetUIState() {
  // Clear app state
  appState.excelData = [];
  appState.joinColumns = [];
  appState.fullJoinResult = [];
  appState.selectedCols = [];

  // Clear DOM
  elements.output.innerHTML = "";
  elements.columnSelector.innerHTML = "";
  elements.columnSelectors.innerHTML = "";
  elements.fileForm.innerHTML = "";

  // Reset buttons and match count
  elements.downloadUnmatchedBtn.style.display = "none";
  updateMatchCount("matchCount", 0);
}

async function handleFile(e) {
  try {
    const { index, json } = await readExcelFile(e);
    appState.excelData[index] = json;

    const headers = Object.keys(json[0]);
    createJoinColumnSelector(index, headers);
  } catch (err) {
    console.error("Erreur lors du traitement du fichier:", err.message);
  }
}

function createInputs() {
    resetUIState();

    const count = parseInt(elements.fileCount.value);

    for (let i = 0; i < count; i++) {
        createFileInput(`Fichier ${i + 1}: `, handleFile, i, elements.fileForm);
    }
}

function performJoin() {
  const selects = elements.columnSelectors.querySelectorAll('select');
  const expectedCount = parseInt(elements.fileCount.value);

  if (!validateJoinInputs(appState.excelData, expectedCount, selects)) return;

  const keys = getSelectedColumns('#columnSelectors select');
  const result = performJoinOperation(appState.excelData, keys);

  appState.fullJoinResult = result;

  const allColumns = [...new Set(result.flatMap(row => Object.keys(row)))];
  createColumnCheckboxes("columnSelector", allColumns);

  elements.downloadUnmatchedBtn.style.display = "inline-block";
}

function finalizeDisplay() {
    appState.selectedCols = getSelectedColumns('input[name="displayColumn"]:checked');
    if (appState.selectedCols.length === 0) {
        alert("Veuillez sélectionner au moins une colonne à afficher.");
        return;
    }

    const filtered = prepareDisplayData(appState.fullJoinResult, appState.selectedCols);

    updateMatchCount("matchCount", filtered.length);
    appState.joinColumns = filtered;
    showTable(filtered, 'output');
}

function exportExcel() {
    downloadJoinedData(appState.joinColumns);
}

function downloadUnmatchedRows() {
  const selects = elements.columnSelectors.querySelectorAll('select');
  const expectedCount = appState.excelData.length;

  if (!validateJoinInputs(appState.excelData, expectedCount, selects)) return;

  const keys = getSelectedColumns('#columnSelectors select');
  downloadUnmatchedData(appState.excelData, appState.fullJoinResult, keys);
}

window.createInputs = createInputs;
window.performJoin = performJoin;
window.finalizeDisplay = finalizeDisplay;
window.exportExcel = exportExcel;
window.downloadUnmatchedRows = downloadUnmatchedRows;