import JSZip from "jszip";

export enum FileSystemEventType {
    UNKWON_ERROR,            // 未知错误
    PROFILE_NOTFOUND,        // 主配置文件（索引）找不到
    PROFILE_READ_ERROR       // 主配置文件（索引）读取失败
}

export interface FileSystemEvent {
    type: FileSystemEventType,
    message: string
}

export class SceneFileSystem {
    private onFileSystemEvent: (ev: FileSystemEvent) => void;
    private zipCtx: JSZip;
    private fileSystemPathIndex: Array<string>;
    private fileSystemFiles: Map<string, JSZip.JSZipObject>; // RelativePath, File

    constructor(zipCtx: JSZip, onFileSystemEvent: (ev: FileSystemEvent) => void) {
        this.zipCtx = zipCtx;
        this.onFileSystemEvent = onFileSystemEvent;
        this.zipCtx.forEach((relativePath, file) => {
            this.fileSystemPathIndex.push(relativePath);
            this.fileSystemFiles.set(relativePath, file);
        });
        this.initScene();
    }

    private initScene() {
        let themeFile = this.zipCtx.file("theme.json");
        if (themeFile) {
            themeFile.async("string").then((fileData) => {
                console.log("读取场景配置：" + fileData);
            }).catch((readError) => {
                this.onFileSystemEvent({
                    type: FileSystemEventType.PROFILE_READ_ERROR,
                    message: "读取场景配置文件失败：" + readError
                });
            });
        } else {
            this.onFileSystemEvent({
                type: FileSystemEventType.PROFILE_NOTFOUND,
                message: "找不到场景配置文件"
            });
        }
    }

    public readFile() {

    }

    public writeFile() {

    }
}