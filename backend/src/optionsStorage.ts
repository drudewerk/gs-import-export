function saveOptions(options: UploadOptions) {
    const props = PropertiesService.getUserProperties();
    props.setProperty("options", JSON.stringify(options));
}

function getOptions(): UploadOptions {
    const props = PropertiesService.getUserProperties();
    const options = props.getProperty("options");

    if (!options) {
        return {
            sheet: "active",
            startAt: "end",
            mergeFiles: false
        };
    }

    return JSON.parse(options) as UploadOptions;
}

