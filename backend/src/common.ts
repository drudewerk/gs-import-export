/**
 * On open trigger to add a custom menu.
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createAddonMenu()
        .addItem("Import JSON files", "showImportSidebar")
        .addItem("Export as JSON file", "showExportSidebar")
        .addToUi();
}

const CSTATE = "state";
/**
 * Shows the sidebar with the React app.
 */
function showImportSidebar() {
    showSidebar("import", "Import JSON files");
}

function showExportSidebar() {
    showSidebar("export", "Export as JSON file");
}

function showSidebar(state: "import" | "export", title: string) {
    const props = PropertiesService.getScriptProperties();
    props.setProperty(CSTATE, state);
    const html = HtmlService.createHtmlOutputFromFile("index")
        .setTitle(title);
    SpreadsheetApp.getUi().showSidebar(html);
}


function getCurrentState() {
    const props = PropertiesService.getScriptProperties();
    let options = getOptions();
    return {
        state: props.getProperty(CSTATE),
        options: options
    }
}
