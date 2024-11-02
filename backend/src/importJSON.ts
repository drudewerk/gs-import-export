function importJsonFile(uploadData: UploadData) {
    let offsetRows = 0;

    saveOptions(uploadData.options);

    const currentCell = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getSelection().getCurrentCell();

    if (uploadData.options.startAt == "selection" && currentCell == null) {
        throw "There is no active cell, please select a cell where you want to insert data";
    }

    const initialRow = currentCell?.getRow() ?? 0;
    const initialColumn = currentCell?.getColumn() ?? 0;

    offsetRows += initialRow;
    uploadData.files.forEach(file => {
        // Access the data as base64 encoded 
        const blob: GoogleAppsScript.Base.Blob = Utilities.newBlob(
            Utilities.base64Decode(file.data),
            file.fileType,
            file.fileName
        );

        // Convert Blob to String (assuming text-based file like CSV or JSON)
        const fileContent: string = blob.getDataAsString();

        // Create a JSON object depending on the file type
        let jsonObject: object | null = null;

        if (file.fileType === "application/json") {
            // Parse JSON content
            jsonObject = JSON.parse(fileContent);
            let data = processJsonObject(jsonObject, uploadData.options);

            insertDataToSheet(data, uploadData.options, {
                startRow: offsetRows,
                startColumn: initialColumn
            });
            offsetRows += data.length;
        } else {
            throw new Error("Unsupported file type. Please upload a JSON file.");
        }
    });
}

function insertDataToSheet(data: any[][], options: UploadOptions, activeCell: { startRow, startColumn }) {
    let sheet: GoogleAppsScript.Spreadsheet.Sheet;

    if (options.sheet == "active") {
        sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    } else {
        let newSheet = SpreadsheetApp.getActiveSpreadsheet()
            .insertSheet();
        sheet = newSheet;
    }
    if (!sheet) {
        throw "Cannot import when no sheet is provided";
    }

    // Determine where to start inserting the data.
    let startRow;
    let startColumn = 1;
    if (options.startAt == "selection") {
        startRow = activeCell.startRow;
        startColumn = activeCell.startColumn;
    } else {
        startRow = sheet.getLastRow() + 1;
    }

    // Set the range for the rows to be added.
    console.log("Inner", startRow, startColumn);
    const range = sheet.getRange(startRow, startColumn, data.length, data[0].length);
    // Insert all rows at once.
    range.setValues(data);
}

function processJsonObject(jsonObject: any, options: UploadOptions) {
    const result: any[][] = [];
    const rows: any[] = [];
    const keys: Set<string> = new Set();

    const flattenObject = (obj: any, parentKey: string = ''): any => {
        const flatObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    Object.assign(flatObj, flattenObject(obj[key], newKey));
                } else {
                    flatObj[newKey] = obj[key];
                    keys.add(newKey);
                }
            }
        }
        return flatObj;
    };

    for (const item of jsonObject) {
        rows.push(flattenObject(item));
    }

    const keysArray = Array.from(keys);
    result.push(keysArray);
    for (const row of rows) {
        const values = keysArray.map((key) => row[key] !== undefined ? row[key] : undefined);
        result.push(values);
    }


    return result;
}
