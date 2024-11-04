type UploadOptions = {
    sheet: "active" | "new";
    startAt: "selection" | "end";
    mergeFiles: boolean;
};

type UploadedFile = {
    data: string;
    fileType: string;
    fileName: string;
};

type UploadData = {
    files: UploadedFile[];
    options: UploadOptions;
};