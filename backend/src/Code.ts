/**
 * Returns a greeting message.
 */
function getGreeting(name: string): string {
    Logger.log("greeting the name", name);


    var sheet = SpreadsheetApp.getActiveSheet();
    for (let i = 0; i < 120; i++) {
        Utilities.sleep(1000);
        sheet.appendRow([Date.now(), new Date().toISOString()]);
    }


    if (!name) {
        throw new Error('Name is required.');
    }

    return `Hello, ${name}! Welcome to the ReactTS Add-on.`;
}

/**
 * On open trigger to add a custom menu.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Import & Export JSON')
        .addItem('Import JSON files', 'showSidebar')
        .addItem('Export as JSON file', 'exportJson')
        .addToUi();
}

/**
 * Shows the sidebar with the React app.
 */
function showSidebar() {
    const html = HtmlService.createHtmlOutputFromFile('index')
        .setTitle('Import JSON files');
    SpreadsheetApp.getUi().showSidebar(html);
}

function exportJson() {
    const html = HtmlService.createHtmlOutput(
        `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">    
    <script type="module" crossorigin>
        // Call this function directly to trigger download
        async function downloadJSON () {
            const p = document.getElementById("Export");
            try {
                await google.script.run.withSuccessHandler((response) => {
                    const data = response.data;
                    const fileName = response.fileName;
                    const byteCharacters = atob(response.data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/json' });

                    // Create a temporary download link
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    const currentTimestamp = Date.now();
                    link.download = response.fileName + "_" + currentTimestamp + '.json'; // Set the filename
                    link.click(); // Trigger the download
                    
                    p.innerText = "Finished. You can close the dialog";
                })
                    .withFailureHandler(() => {
                        p.innerText = "Error, please try again";
                    })
                    .sheetDataToArray();
            } catch (error) {
                console.error('Error downloading the file:', error);
                p.innerText = "Error, please try again";
            }         
        }; 
        window.onload = downloadJSON;    
    </script>
  </head>
  <body>
      <span id="Export">Please, wait. Exporting File...</span>   
  </body>
</html>
        `    );
    SpreadsheetApp.getUi().showModalDialog(html, 'Export as JSON');
}