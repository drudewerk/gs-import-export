type UploadOptions = {
    sheet: "active" | "new"
    startAt: "selection" | "lastRow"
}

type UploadedFile = {
    data: string,
    fileType: string,
    fileName: string,
}

type UploadData = {
    files: UploadedFile[],
    options: UploadOptions
}