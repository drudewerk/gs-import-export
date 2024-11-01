function importJsonFile(data: string, fileType: string, fileName: string) {
    // Access the data as base64 encoded
    console.log(data);
    const fileData = data;
    const contentType = fileType; 

    const blob: GoogleAppsScript.Base.Blob = Utilities.newBlob(
        Utilities.base64Decode(fileData),
        contentType,
        fileName
    );

    // Convert Blob to String (assuming text-based file like CSV or JSON)
    const fileContent: string = blob.getDataAsString();

    // Create a JSON object depending on the file type
    let jsonObject: object | null = null;

    if (contentType === "application/json") {
        // Parse JSON content
        jsonObject = JSON.parse(fileContent);
        processJsonObject(jsonObject);
    } else if (contentType === "text/csv") {
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
    const data: any[][] = [];

    const keys = Object.keys(jsonObject[0]);
    data.push(keys);

    for (const item of jsonObject) {
        const values = keys.map((key) => item[key]);
        data.push(values);
    }

    // Determine where to start inserting the data.
    const startRow = sheet.getLastRow() + 1;

    // Set the range for the rows to be added.
    const range = sheet.getRange(startRow, 1, data.length, data[0].length);
    // Insert all rows at once.
    range.setValues(data);
}
