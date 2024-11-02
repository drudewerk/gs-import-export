type UploadOptions = {
    sheet: "active" | "name"
    sheetName: string | null
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