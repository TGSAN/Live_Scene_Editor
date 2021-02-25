import JSZip from "jszip";
import { type } from "os";
import { FileSystemEvent, FileSystemEventType, SceneFileSystem } from "./scene-filesystem";

let importSceneBtn = window.document.getElementById("importSceneBtn") as HTMLButtonElement;
let localSceneZipFileInput = window.document.getElementById("localSceneZipFileInput") as HTMLInputElement;
let localSceneZipFileName = window.document.getElementById("localSceneZipFileName") as HTMLSpanElement;

function onFileSystemEvent(ev: FileSystemEvent) {
    alert(ev.message);
    switch(ev.type) {
        case FileSystemEventType.PROFILE_NOTFOUND:
        case FileSystemEventType.PROFILE_READ_ERROR:
        case FileSystemEventType.UNKWON_ERROR:
            localSceneZipFileName.innerText = "--";
            localSceneZipFileInput.value = "";
            break;
        default: 
            break;
    }
}

importSceneBtn.addEventListener("click", () => {
    localSceneZipFileInput.click();
});

localSceneZipFileInput.addEventListener("change", function () {
    console.log(`已选择文件个数：${this.files.length}`);
    if (this.files.length > 0) {
        this.files[0].arrayBuffer().then((dataBuffer) => {
            // dataBuffer
            JSZip.loadAsync(dataBuffer).then((zip) => {
                let sceneFileSystem = new SceneFileSystem(zip, onFileSystemEvent);
                
            }).catch((readError) => {
                alert("读取场景包失败：" + readError);
            });
        });
    }
});