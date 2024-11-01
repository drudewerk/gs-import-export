type UploadOptions = {
    sheet: "active" | "name"
    sheetName: string | null
    startAt: "selection" | "lastRow"
}

type UploadData = {
    data: string, 
    fileType: string, 
    fileName: string,
    options: UploadOptions
}