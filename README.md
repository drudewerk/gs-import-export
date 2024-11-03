# Google Sheets Add-on: drudejson

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **VSCode**
- **Node.js**
- **npm**
- **Clasp (Command Line Apps Script Projects):** Install globally via npm.

```bash
  npm i -g @google/clasp
```

 > !!! Ensure that you are logged in only in one Google account in current session. There is a bug which prevents some Google Add-on debug features from working in sessions with multiple google accounts

## Setup Instructions

Follow these steps to set up and run the project from the repository.

### Install dependencies

```bash
npm run install
```

### Initialize Add-on

```bash
clasp login

clasp create --type sheets --title "drudejson" --rootDir ./
```

### Deploy Add-on

```bash
npm run deploy
```

### Open project

```bash
clasp open
```

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
  - Select your extension > Open sidebar
  - Sidebar should open


## License

This project is licensed under the MIT License with the [Commons Clause](https://commonsclause.com/).

The Commons Clause restricts this software from being used in commercial products or services. For more details, see the `LICENSE` file.
