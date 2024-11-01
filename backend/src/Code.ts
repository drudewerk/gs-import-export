/**
 * Returns a greeting message.
 */
function getGreeting(name: string): string {
    Logger.log("greeting the name", name);

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
        .createMenu('My Add-on')
        .addItem('Open Sidebar', 'showSidebar')
        .addToUi();
}

/**
 * Shows the sidebar with the React app.
 */
function showSidebar() {
    const html = HtmlService.createHtmlOutputFromFile('index')
        .setTitle('My ReactTS Add-on');
    SpreadsheetApp.getUi().showSidebar(html);
}