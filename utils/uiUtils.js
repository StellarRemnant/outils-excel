export function createJoinColumnSelector(index, headers, containerId = "columnSelectors") {
  const container = document.getElementById(containerId);

  const oldSelect = document.getElementById(`joinColumnSelect-${index}`);
  if (oldSelect) {
    oldSelect.remove();
  }

  const select = document.createElement("select");
  select.id = `joinColumnSelect-${index}`;
  select.dataset.index = index;
  select.innerHTML = `<option value="">--Colonne de jointure pour le fichier--</option>` +
    headers.map(h => `<option value="${h}">${h}</option>`).join("");

  container.appendChild(select);
}


export function createFileInput(name,func,index,parent){
  const label = document.createElement("label");
  label.textContent = name;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx,.xls";
  input.dataset.index = index;
  input.addEventListener("change", func);
  parent.appendChild(label);
  parent.appendChild(input);
  parent.appendChild(document.createElement("br"));
}

export function createColumnCheckboxes(elementId, headers) {
  const checkboxContainer = document.getElementById(elementId);
  checkboxContainer.innerHTML = '';

  // Create "Select All" checkbox
  const selectAllLabel = document.createElement('label');
  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.id = 'selectAllCheckbox';

  selectAllLabel.appendChild(selectAllCheckbox);
  selectAllLabel.appendChild(document.createTextNode(' Sélectionner tout'));
  checkboxContainer.appendChild(selectAllLabel);
  checkboxContainer.appendChild(document.createElement('br'));

  // Create column checkboxes
  headers.forEach(col => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'displayColumn';
    checkbox.value = col;
    checkbox.checked = false;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + col));
    checkboxContainer.appendChild(label);
  });

  selectAllCheckbox.addEventListener('change', (e) => {
    const allCheckboxes = checkboxContainer.querySelectorAll('input[name="displayColumn"]');
    allCheckboxes.forEach(cb => cb.checked = e.target.checked);
  });
}


export function createKeywordFilterUI(nonDateCols,id) {
  const container = document.getElementById(id);
  container.innerHTML = '';

  nonDateCols.forEach(col => {
    const div = document.createElement('div');
    div.className = 'singleKeywordFilter';

    const checkboxInclude = document.createElement('input');
    checkboxInclude.type = 'checkbox';
    checkboxInclude.id = 'enableKeywordFilter_' + col;
    checkboxInclude.name = 'enableKeywordFilter';

    const labelInclude = document.createElement('label');
    labelInclude.htmlFor = checkboxInclude.id;
    labelInclude.textContent = ` ${col} (Inclure):`;

    const br1 = document.createElement('br');

    // AND/OR Toggle
    const andOrLabel = document.createElement('label');
    andOrLabel.textContent = 'Logique: ';
    andOrLabel.htmlFor = 'andOrToggle_' + col;
    andOrLabel.style.marginRight = '5px';

    const andOrSelect = document.createElement('select');
    andOrSelect.id = 'andOrToggle_' + col;
    const andOption = document.createElement('option');
    andOption.value = 'and';
    andOption.textContent = 'ET';
    const orOption = document.createElement('option');
    orOption.value = 'or';
    orOption.textContent = 'OU';
    andOrSelect.appendChild(andOption);
    andOrSelect.appendChild(orOption);

    const br2 = document.createElement('br');

    const keywordLabelInclude = document.createElement('label');
    keywordLabelInclude.textContent = 'Mots clés (mot1/mot2/...): ';
    keywordLabelInclude.htmlFor = 'keywordInput_' + col;
    keywordLabelInclude.style.marginRight = '5px';

    const keywordInputInclude = document.createElement('input');
    keywordInputInclude.type = 'text';
    keywordInputInclude.id = 'keywordInput_' + col;
    keywordInputInclude.placeholder = "Enterez les mots clés séparés par /";

    const br3 = document.createElement('br');

    const checkboxExclude = document.createElement('input');
    checkboxExclude.type = 'checkbox';
    checkboxExclude.id = 'enableExcludeFilter_' + col;
    checkboxExclude.name = 'enableExcludeFilter';

    const labelExclude = document.createElement('label');
    labelExclude.htmlFor = checkboxExclude.id;
    labelExclude.textContent = ` ${col} (Exclure):`;

    const br4 = document.createElement('br');

    const keywordLabelExclude = document.createElement('label');
    keywordLabelExclude.textContent = 'Mots clés à exclure (mot1/mot2/...): ';
    keywordLabelExclude.htmlFor = 'excludeInput_' + col;
    keywordLabelExclude.style.marginRight = '5px';

    const keywordInputExclude = document.createElement('input');
    keywordInputExclude.type = 'text';
    keywordInputExclude.id = 'excludeInput_' + col;
    keywordInputExclude.placeholder = "Enterez les mots clés à exclure séparés par /";

    div.appendChild(checkboxInclude);
    div.appendChild(labelInclude);
    div.appendChild(br1);
    div.appendChild(andOrLabel);
    div.appendChild(andOrSelect);
    div.appendChild(br2);
    div.appendChild(keywordLabelInclude);
    div.appendChild(keywordInputInclude);
    div.appendChild(br3);

    div.appendChild(checkboxExclude);
    div.appendChild(labelExclude);
    div.appendChild(br4);
    div.appendChild(keywordLabelExclude);
    div.appendChild(keywordInputExclude);

    container.appendChild(div);
  });

  container.style.display = nonDateCols.length > 0 ? 'block' : 'none';
}


export function createDateFilterUI(arr,id) {
  const container = document.getElementById(id);
  container.innerHTML = '';
  console.log("createDateFilterUI got:", arr, typeof arr, Array.isArray(arr));

  arr.forEach(col => {
  const div = document.createElement('div');
  div.className = 'singleDateFilter';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'enableDateFilter_' + col;
  checkbox.name = 'enableDateFilter';

  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.textContent = ` ${col}`;

  const br1 = document.createElement('br');

  const startLabel = document.createElement('label');
  startLabel.textContent = 'Start Date: ';
  startLabel.htmlFor = 'startDate_' + col;
  startLabel.style.marginRight = '5px';

  const startInput = document.createElement('input');
  startInput.type = 'datetime-local';
  startInput.id = 'startDate_' + col;

  const br2 = document.createElement('br');

  const endLabel = document.createElement('label');
  endLabel.textContent = 'End Date: ';
  endLabel.htmlFor = 'endDate_' + col;
  endLabel.style.marginRight = '16px';

  const endInput = document.createElement('input');
  endInput.type = 'datetime-local';
  endInput.id = 'endDate_' + col;

  div.appendChild(checkbox);
  div.appendChild(label);
  div.appendChild(br1);
  div.appendChild(startLabel);
  div.appendChild(startInput);
  div.appendChild(br2);
  div.appendChild(endLabel);
  div.appendChild(endInput);

  container.appendChild(div);
  });

  container.style.display = arr.length > 0 ? 'block' : 'none';
}

export function showTable(data,id) {
  const container = document.getElementById(id);
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = '<p>No data to display.</p>';
    return;
  }

  const table = document.createElement('table');

  // Table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  Object.keys(data[0]).forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    Object.values(row).forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
}

export function getJoinKeys(selector) {
  const selects = document.querySelectorAll(selector);
  return Array.from(selects).map(sel => sel.value);
}

export function updateMatchCount(id, count) {
  document.getElementById(id).textContent = `Nombre des lignes correspondantes : ${count}`;
}
