function startImportFile() {

}

async function importJsonFile(data: string, fileType: string, fileName: string) {
    // Access the data as base64 encoded 

    const blob: GoogleAppsScript.Base.Blob = Utilities.newBlob(
        Utilities.base64Decode(data),
        fileType,
        fileName
    );

    // Convert Blob to String (assuming text-based file like CSV or JSON)
    const fileContent: string = blob.getDataAsString();

    // Create a JSON object depending on the file type
    let jsonObject: object | null = null;

    if (fileType === "application/json") {
        // Parse JSON content
        jsonObject = JSON.parse(fileContent);
        processJsonObject(jsonObject);
    } else if (fileType === "text/csv") {
        // Parse CSV content
        //jsonObject = parseCsvToJson(fileContent);
    } else {
        throw new Error("Unsupported file type. Please upload a JSON or CSV file.");
    }
}

function processJsonObject(jsonObject: any) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    if (!sheet) {
        throw "Cannot import when no sheet is active";
    }

    if (!Array.isArray(jsonObject)) {
        return "Only arrays are supported";
    }
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

    // Determine where to start inserting the data.
    const startRow = sheet.getLastRow() + 1;

    // Set the range for the rows to be added.
    const range = sheet.getRange(startRow, 1, result.length, result[0].length);
    // Insert all rows at once.
    range.setValues(result);
}
