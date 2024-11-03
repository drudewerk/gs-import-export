# The JSON Import & Export Google Sheets™ Add-On by Drudewerk

The JSON Import & Export by Drudewerk Add-On is a powerful tool designed to enhance your experience with Google Sheets™ by providing import and export capabilities for JSON files. With this add-on, you can easily integrate JSON data into your spreadsheets, making data analysis and manipulation more efficient and intuitive.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **VSCode**
- **Node.js** - v22 or later
- **npm** - v10.9.0 or later
- **Clasp (Command Line Apps Script Projects):** - v2.4.2 or later. Install via npm:

```bash
  npm i -g @google/clasp
```

 > Ensure that you are logged in only in one Google account in current browser session. There is a bug which prevents some Google Add-on debug features from working in sessions with multiple google accounts

## Setup Instructions

Follow these steps to set up and run the project from the repository.

### Open VSCode workspace

Open [gs-import-export.code-workspace](https://github.com/drudewerk/gs-import-export/blob/main/.vscode/gs-import-export.code-workspace) in VSCode

### Install dependencies

```bash
npm run install-deps
```

### Initialize Add-on

```bash
clasp login

clasp create --type sheets --title "My Add-On" --rootDir ./
```

### Deploy Add-on

```bash
npm run deploy
```

### Open project

```bash
clasp open
```

## Testing

### Create a trigger

In the Apps Script Editor:

- Click on the Triggers (clock) icon on the left sidebar.
- Click Add Trigger.
- Configure as follows:
  - Choose which function to run: onOpen
  - Select event source: From spreadsheet
  - Select event type: On open
- Click Save.

### Test Deployment

In the Apps Script Editor:

- Click on Deploy > New Deployment.
- Choose Test Deployment.
- Select type > Editor Add-on
- Click Add test
  - Version > Latest code
  - Config > Installed and Enabled
  - Test document > New spreadsheet
- Save test, select it, click Execute
- In the spreadsheet, click Extensions
  - Select your extension > Import JSON files or Export as JSON file
  - Sidebar should open

## License

This project is licensed under the MIT License with the [Commons Clause](https://commonsclause.com/).

The Commons Clause restricts this software from being used in commercial products or services. For more details, see the [LICENSE](https://github.com/drudewerk/gs-import-export/blob/main/LICENSE) file.

## Contributions

We welcome and appreciate contributions from the community! If you have an idea, suggestion, or improvement, feel free to open an issue or submit a pull request.
