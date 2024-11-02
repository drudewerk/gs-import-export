function importJsonFile(uploadData: UploadData) {
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
            insertDataToSheet(data, uploadData.options);
        } else {
            throw new Error("Unsupported file type. Please upload a JSON file.");
        }
    });
}

function insertDataToSheet(data: any[][], options: UploadOptions) {
    let sheet: GoogleAppsScript.Spreadsheet.Sheet;

    if (options.sheet == "active") {
        sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    } else {
        if (!options.sheetName) {
            throw "When import is into not active sheet: sheet name must be provided";
        }
        let sheetByName = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(options.sheetName);
        if (!sheetByName) {
            throw "Cannot find sheet by name";
        }
        sheet = sheetByName;
    }
    if (!sheet) {
        throw "Cannot import when no sheet is provided";
    }

    // Determine where to start inserting the data.
    const startRow = sheet.getLastRow() + 1;

    // Set the range for the rows to be added.
    const range = sheet.getRange(startRow, 1, data.length, data[0].length);
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
