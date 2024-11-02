function sheetDataToArray() {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const range = sheet.getDataRange();
    const startingColumnNumber = range.getColumn();
    const values = range.getValues();
    const obj = arrayToJson(values, startingColumnNumber);

    const json = JSON.stringify(obj, null, 2);
    const blob = Utilities.newBlob(json, 'application/json', 'data.json');

    return {
        fileName: getSpreadsheetName(),
        data: Utilities.base64Encode(blob.getBytes())
    };
}

function arrayToJson(array: any[][], startingColumnNumber: number): any[] | null {
    if (array.length < 2) {
        return null;
    }

    console.log(array);

    const [keys, ...values] = array;
    const result: any[] = [];

    for (const valueRow of values) {
        const obj: any = {};
        let rowHasData = false;
        for (let i = 0; i < keys.length; i++) {
            const keyParts = keys[i].split('.');

            let currentObj = obj;
            for (let j = 0; j < keyParts.length; j++) {
                let part = keyParts[j];
                if (part == "") {
                    const currentColumn = i + startingColumnNumber;
                    const columnName = columnToLetter(currentColumn);
                    part = "UNNAMED_" + columnName;
                }
                
                if (j === keyParts.length - 1) {
                    currentObj[part] = valueRow[i];
                    rowHasData = rowHasData || (valueRow[i] !== "");
                } else {
                    if (!currentObj[part] || typeof currentObj[part] !== 'object') {
                        currentObj[part] = {};
                    }
                    currentObj = currentObj[part];
                }
            }
        }
        if (rowHasData) {
            result.push(obj);
        }
    }

    return result;
}

function getSpreadsheetName() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    return spreadsheet.getName();
}

function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}
