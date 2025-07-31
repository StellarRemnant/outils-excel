export function readExcelFile(e) {
  return new Promise((resolve, reject) => {
    const file = e.target.files[0];
    const index = parseInt(e.target.dataset.index || 0);

    if (!file) return reject(new Error("Pas de fichier sélectionné."));

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

        if (json.length === 0) {
          alert(`Le fichier ${index + 1} est vide.`);
          return reject(new Error(`Ficher ${index} vide`));
        }

        resolve({ file, index, reader, json, workbook, sheet });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsArrayBuffer(file);
  });
}
