/**
 * Returns a greeting message.
 */
function getGreeting(name: string): string {
    Logger.log("greeting the name", name);


    var sheet = SpreadsheetApp.getActiveSheet();
    for(let i=0; i<120; i++){
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
        .createMenu('Drude-bar')
        .addItem('Open Sidebar', 'showSidebar')
        .addToUi();
}

/**
 * Shows the sidebar with the React app.
 */
function showSidebar() {
    const html = HtmlService.createHtmlOutputFromFile('index')
        .setTitle('Drude Add-on');
    SpreadsheetApp.getUi().showSidebar(html);
}