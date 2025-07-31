import { detectDateColumns } from '../utils/dateUtils.js';
import { createColumnCheckboxes, createKeywordFilterUI, createDateFilterUI, updateMatchCount, showTable } from '../utils/uiUtils.js';
import { readExcelFile } from '../utils/fileUtils.js';
import { downloadFilteredData } from '../utils/exportUtils.js';
import { applyKeywordFilters, applyDateFilters, getSelectedColumns, prepareDisplayData, getUnmatchedRows } from '../utils/filterUtils.js';

// DOM element caching - query once, use many times
const elements = {
  fileInput: document.getElementById('fileInput'),
  filterButton: document.getElementById('filterButton'),
  downloadButton: document.getElementById('downloadButton'),
  downloadUnmatchedButton: document.getElementById('downloadUnmatchedButton'),
  tableContainer: document.getElementById('tableContainer'),
  columnCheckboxes: document.getElementById('columnCheckboxes'),
  dateFilterContainer: document.getElementById('dateFilterContainer')
};

const appState = {
  fullData: [],
  filteredData: [],
  detectedDateCols: [],
  nonDateCols: []
};

/**
 * Handles file input and initializes the application state
 */
async function handleFileInput(e) {
  try {
    const { json } = await readExcelFile(e);

    appState.fullData = json;
    const headers = Object.keys(json[0]);
    
    // Detect column types
    appState.detectedDateCols = detectDateColumns(json);
    appState.nonDateCols = headers.filter(col => !appState.detectedDateCols.includes(col));

    // Initialize UI
    initializeUI(headers);
    
  } catch (err) {
    console.error("Erreur lors de la lecture du fichier:", err.message);
  }
}

function resetUIState() {
  elements.filterButton.disabled = false;
  elements.downloadButton.disabled = true;
  updateMatchCount('result', 0);
  elements.tableContainer.innerHTML = '';
  appState.filteredData = [];
}

/**
 * Initializes the UI components after file load
 */
function initializeUI(headers) {
  createColumnCheckboxes('columnCheckboxes', headers);
  createDateFilterUI(appState.detectedDateCols, 'dateFilterContainer');
  createKeywordFilterUI(appState.nonDateCols, 'keywordFilterContainer');
  resetUIState();
}

/**
 * Main filter orchestrator - coordinates all filtering operations
 */
function performFilter() {
  try {
    // 1. Start with all data
    let tempFiltered = [...appState.fullData];

    // 2. Apply keyword filters
    tempFiltered = applyKeywordFilters(tempFiltered, appState.nonDateCols);

    // 3. Apply date filters
    tempFiltered = applyDateFilters(tempFiltered, appState.detectedDateCols);

    // 4. Store filtered results
    appState.filteredData = tempFiltered;

    // 5. Get selected display columns
    const selectedCols = getSelectedColumns('input[name="displayColumn"]:checked');
    if (!selectedCols.length) {
      alert("Veuillez sélectionner au moins une colonne à afficher.");
      return;
    }

    // 6. Prepare and display data
    const displayedData = prepareDisplayData(appState.filteredData, selectedCols);
    updateUI(displayedData);

  } catch (error) {
    console.error("Erreur lors du filtrage:", error.message);
    // Error handling is done in individual filter functions
  }
}

/**
 * Updates the UI with filtered results
 */
function updateUI(displayedData) {
  updateMatchCount('result', appState.filteredData.length);
  showTable(displayedData, 'tableContainer');
  elements.downloadButton.disabled = appState.filteredData.length === 0;
  elements.downloadUnmatchedButton.disabled = appState.filteredData.length === appState.fullData.length;
}

/**
 * Handles the download of filtered data
 */
function downloadFiltered() {
  const selectedCols = getSelectedColumns('input[name="displayColumn"]:checked');
  downloadFilteredData(appState.filteredData, selectedCols,"table_filtrée");
}

function downloadUnmatchedData() {
  const selectedCols = getSelectedColumns('input[name="displayColumn"]:checked');
  if (!selectedCols.length) {
    alert("Veuillez sélectionner au moins une colonne à afficher.");
    return;
  }

  // Get unmatched rows
  const unmatchedData = getUnmatchedRows(appState.fullData, appState.filteredData);

  const dataToDownload = prepareDisplayData(unmatchedData, selectedCols);
  downloadFilteredData(dataToDownload, selectedCols,"reste");
}

// Event listeners
elements.fileInput.addEventListener('change', handleFileInput);

// Expose functions to the global window object for HTML onclick access
window.performFilter = performFilter;
window.downloadFiltered = downloadFiltered;
window.downloadUnmatchedData = downloadUnmatchedData;