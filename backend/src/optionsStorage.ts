function saveOptions(options: UploadOptions) {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty("options", JSON.stringify(options));
}

function getOptions(): UploadOptions {
    const scriptProperties = PropertiesService.getScriptProperties();
    const options = scriptProperties.getProperty("options");

    if (!options) {
        return {
            sheet: "active",
            startAt: "end",
            mergeFiles: false
        };
    }

    return JSON.parse(options) as UploadOptions;
}

