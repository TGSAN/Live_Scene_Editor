import { SceneFilters } from './scene-filter';

const viewBox = document.getElementById("view-box");
const mainSceneName: HTMLInputElement = document.getElementById("scene-name") as HTMLInputElement;
const mainSceneWidth: HTMLInputElement = document.getElementById("scene-width") as HTMLInputElement;
const mainSceneHeight: HTMLInputElement = document.getElementById("scene-height") as HTMLInputElement;
const forceRedarwBtn: HTMLButtonElement = document.getElementById("force-redarw") as HTMLButtonElement;

let mainSceneViewItems: Array<SceneViewItem> = [];

interface ItemSize {
    width: number | undefined;
    height: number | undefined;
}

interface ItemPosition {
    top: number | undefined;
    left: number | undefined;
}

class SceneViewItem {
    public sceneItem: SceneFilters.SceneItem;
    public htmlElement: HTMLDivElement;
    public resizeCtrlHtmlElement: HTMLDivElement;
    public borderHtmlElement: HTMLDivElement;
    public contentHtmlElement: HTMLElement;

    public constructor(sceneItem: SceneFilters.SceneItem) {
        this.sceneItem = sceneItem;
        this.borderHtmlElement = document.createElement("div");
        this.borderHtmlElement.classList.add("sub-scene-item-border");
        this.borderHtmlElement.hidden = true;
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("sub-scene-item");
        this.htmlElement.classList.add("moveable-item");
        this.contentHtmlElement = this.createContentHtmlElement(sceneItem);
        this.contentHtmlElement.classList.add("sub-scene-item-content");
        this.contentHtmlElement.style.width = "100%";
        this.contentHtmlElement.style.height = "100%";
        this.htmlElement.appendChild(this.contentHtmlElement);
        this.resizeCtrlHtmlElement = document.createElement("div");
        this.resizeCtrlHtmlElement.classList.add("resize-ctrl-btn");
        this.resizeCtrlHtmlElement.hidden = true;
        this.htmlElement.appendChild(this.borderHtmlElement); // 其次
        this.htmlElement.appendChild(this.resizeCtrlHtmlElement); // 最顶层
        this.initEditor();
        this.redrawHTML();
    }

    private createContentHtmlElement(sceneItem: SceneFilters.SceneItem): HTMLElement {
        let contentHtmlElement: HTMLElement;
        switch (sceneItem.Filter.FilterID) {
            case "SceneSource": {
                contentHtmlElement = document.createElement("div");
                break;
            }
            case "TextSource": {
                let filter: SceneFilters.TextSource = sceneItem.Filter as SceneFilters.TextSource;
                contentHtmlElement = document.createElement("div");
                let textSourceAreaHtmlElement = document.createElement("div");
                textSourceAreaHtmlElement.classList.add("text-source-area");
                textSourceAreaHtmlElement.style.fontSize = `${filter.FilterConfig.size / 1.75}pt`;
                textSourceAreaHtmlElement.style.fontWeight = `bold`;
                textSourceAreaHtmlElement.style.color = filter.FilterConfig.color;
                switch (filter.FilterConfig.scroll_orientation) {
                    case "None": {
                        let textSourceNoneContentHtmlElement = document.createElement("span");
                        textSourceNoneContentHtmlElement.classList.add("text-source-none-content");
                        textSourceNoneContentHtmlElement.innerText = filter.FilterConfig.content;
                        textSourceAreaHtmlElement.appendChild(textSourceNoneContentHtmlElement);
                        break;
                    }
                    case "Horizontal": {
                        let textSourceHorizontalLeftScrollHtmlElement = document.createElement("div");
                        textSourceHorizontalLeftScrollHtmlElement.classList.add("text-source-horizontal-left-scroll");
                        let textSourceScrollContentHtmlElement = document.createElement("span");
                        textSourceScrollContentHtmlElement.classList.add("text-source-scroll-content");
                        textSourceScrollContentHtmlElement.innerText = filter.FilterConfig.content + " " + filter.FilterConfig.content;
                        // 加两个
                        textSourceHorizontalLeftScrollHtmlElement.innerHTML = textSourceScrollContentHtmlElement.outerHTML + textSourceScrollContentHtmlElement.outerHTML;
                        textSourceAreaHtmlElement.appendChild(textSourceHorizontalLeftScrollHtmlElement);
                        break;
                    }
                    default: {
                        break;
                    }
                }
                contentHtmlElement.appendChild(textSourceAreaHtmlElement);
                break;
            }
            case "CommonSource": {
                contentHtmlElement = document.createElement("div");
                contentHtmlElement.style.backgroundImage = "url(./static/demo/bg_streaming_camera_private_mode.png)";
                contentHtmlElement.style.backgroundPosition = "center";
                contentHtmlElement.style.backgroundRepeat = "no-repeat";
                contentHtmlElement.style.backgroundColor = "white";
                break;
            }
            case "ImageSource": {
                contentHtmlElement = document.createElement("img");
                let filter: SceneFilters.ImageSource = sceneItem.Filter as SceneFilters.ImageSource;
                let reSrcUrl = filter.FilterConfig.image_path;
                if (filter.FilterConfig.image_from == "file") {
                    reSrcUrl = filter.FilterConfig.image_path.replace("/data/user/0/com.bilibili.bilibililive/files/scene/scene2/", "./static/demo/");
                }
                (contentHtmlElement as HTMLImageElement).src = reSrcUrl;
                break;
            }
            default: {
                contentHtmlElement = document.createElement("div");
                break;
            }
        }
        return contentHtmlElement;
    }

    private initEditor() {
        this.htmlElement.addEventListener("mouseover", () => {
            this.borderHtmlElement.hidden = false;
            this.resizeCtrlHtmlElement.hidden = false;
        });
        this.htmlElement.addEventListener("mouseleave", () => {
            this.borderHtmlElement.hidden = true;
            this.resizeCtrlHtmlElement.hidden = true;
        });
        // 移动
        const onmousedownContent = (ev) => {
            if (ev.button === 0) {
                let oEvent = ev;
                // 浏览器有一些图片的默认事件,这里要阻止
                oEvent.preventDefault();
                let disX = oEvent.clientX - this.htmlElement.offsetLeft;
                let disY = oEvent.clientY - this.htmlElement.offsetTop;
                const onmousemoveViewbox = (ev) => {
                    oEvent = ev;
                    oEvent.preventDefault();
                    let x = oEvent.clientX - disX;
                    let y = oEvent.clientY - disY;

                    // 图形移动的边界判断
                    // x = x <= 0 ? 0 : x;
                    // x = x >= fa.offsetWidth-box.offsetWidth ? fa.offsetWidth-box.offsetWidth : x;
                    // y = y <= 0 ? 0 : y;
                    // y = y >= fa.offsetHeight-box.offsetHeight ? fa.offsetHeight-box.offsetHeight : y;
                    this.htmlElement.style.top = y + 'px';
                    this.htmlElement.style.left = x + 'px';
                    this.setPosition({top: y, left: x}, false);
                }
                // 图形移出父盒子取消移动事件,防止移动过快触发鼠标移出事件,导致鼠标弹起事件失效
                const onmouseleaveViewbox = () => {
                    viewBox.removeEventListener("mousemove", onmousemoveViewbox);
                    viewBox.removeEventListener("mouseup", onmouseupViewbox);
                }
                // 鼠标弹起后停止移动
                const onmouseupViewbox = () => {
                    viewBox.removeEventListener("mousemove", onmousemoveViewbox);
                    viewBox.removeEventListener("mouseup", onmouseupViewbox);
                }
                viewBox.addEventListener("mousemove", onmousemoveViewbox);
                viewBox.addEventListener("mouseleave", onmouseleaveViewbox);
                viewBox.addEventListener("mouseup", onmouseupViewbox);
            }
        }
        this.htmlElement.addEventListener("mousedown", onmousedownContent);
        // 缩放
        const onmousedownResizeCtrl = (ev) => {
            if (ev.button === 0) {
                // 阻止冒泡,避免缩放时触发移动事件
                ev.stopPropagation();
                ev.preventDefault();
                let pos = {
                    'w': this.htmlElement.offsetWidth,
                    'h': this.htmlElement.offsetHeight,
                    'x': ev.clientX,
                    'y': ev.clientY
                };
                let aspectRatio = pos.h / pos.w;
                const onmousemoveViewbox = (ev) => {
                    ev.preventDefault();
                    // 设置最小缩放为20*20
                    let w;
                    let h;
                    let firstwidth = ev.clientX - pos.x + pos.w;
                    if (ev.shiftKey == true) {
                        w = Math.max(20 / aspectRatio, firstwidth);
                    } else {
                        w = Math.max(20, firstwidth);
                    }
                    if (ev.shiftKey == true) {
                        h = Math.max(20, aspectRatio * w);
                    } else {
                        h = Math.max(20, ev.clientY - pos.y + pos.h);
                    }
                    // console.log(w,h)

                    // 设置最大宽高
                    w = w >= viewBox.offsetWidth - this.htmlElement.offsetLeft ? viewBox.offsetWidth - this.htmlElement.offsetLeft : w;
                    h = h >= viewBox.offsetHeight - this.htmlElement.offsetTop ? viewBox.offsetHeight - this.htmlElement.offsetTop : h;
                    this.htmlElement.style.width = w + 'px';
                    this.htmlElement.style.height = h + 'px';
                    this.setSize({width: w, height: h}, false);
                    // console.log(box.offsetWidth,box.offsetHeight)
                }

                const onmouseleaveViewbox = () => {
                    viewBox.removeEventListener("mousemove", onmousemoveViewbox);
                    viewBox.removeEventListener("mouseup", onmouseupViewbox);
                }
                const onmouseupViewbox = () => {
                    viewBox.removeEventListener("mousemove", onmousemoveViewbox);
                    viewBox.removeEventListener("mouseup", onmouseupViewbox);
                }
                viewBox.addEventListener("mousemove", onmousemoveViewbox);
                viewBox.addEventListener("mouseleave", onmouseleaveViewbox);
                viewBox.addEventListener("mouseup", onmouseupViewbox);
            }
        }
        this.resizeCtrlHtmlElement.addEventListener("mousedown", onmousedownResizeCtrl);
    }

    public redrawHTML() {
        this.htmlElement.style.width = `${this.sceneItem.ItemWidth}px`;
        this.htmlElement.style.height = `${this.sceneItem.ItemHeight}px`;
        this.htmlElement.style.top = `${this.sceneItem.ItemTop}px`;
        this.htmlElement.style.left = `${this.sceneItem.ItemLeft}px`;
        this.htmlElement.style.display = this.sceneItem.IsShow ? "block" : "none";
    }

    public setSize(newSize: ItemSize, needRedraw: boolean = true) {
        if (newSize.width != undefined) {
            this.sceneItem.ItemWidth = newSize.width;
        }
        if (newSize.height != undefined) {
            this.sceneItem.ItemHeight = newSize.height;
        }
        if (needRedraw === true) {
            this.redrawHTML();
        }
    }

    public setPosition(newPosition: ItemPosition, needRedraw: boolean = true) {
        if (newPosition.top != undefined) {
            this.sceneItem.ItemTop = newPosition.top;
        }
        if (newPosition.left != undefined) {
            this.sceneItem.ItemLeft = newPosition.left;
        }
        if (needRedraw === true) {
            this.redrawHTML();
        }
    }

    public sizeVisible() {
        this.sceneItem.IsShow = !(this.sceneItem.IsShow);
        this.redrawHTML();
    }
}

forceRedarwBtn.addEventListener("click", (ev) => {
    if (ev.button === 0) {
        mainSceneViewItems.forEach((sceneViewItems) => {
            sceneViewItems.redrawHTML();
        });
    }
})

mainSceneWidth.addEventListener("change", (ev) => {
    reloadViewBoxSize();
});

mainSceneHeight.addEventListener("change", (ev) => {
    reloadViewBoxSize();
});

function reloadViewBoxSize() {
    viewBox.style.width = `${mainSceneWidth.value}px`;
    viewBox.style.height = `${mainSceneHeight.value}px`;
}

function fetchText(url: string, callback: (ok: boolean, response: any) => void) {
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("readystatechange", function () {
        if (oReq.readyState == 4) { // 4 = "loaded"
            if (oReq.status == 200) { // 200 = OK
                callback(true, oReq.response);
            } else {
                callback(false, oReq.response);
            }
        }
    });
    oReq.open("GET", url);
    oReq.send();
}

function loadSceneProfile(profile: any) {
    if (profile?.FilterID == "SceneSource") {
        mainSceneViewItems = [];
        viewBox.innerHTML == "";
        let mainScene: SceneFilters.SceneSource = profile;
        mainSceneName.value = mainScene.FilterName;
        mainSceneWidth.value = mainScene.FilterConfig.SceneWidth.toString();
        mainSceneHeight.value = mainScene.FilterConfig.SceneHeight.toString();
        reloadViewBoxSize();
        loadSceneItems(mainScene);
    }
}

function loadSceneItems(sceneSource: SceneFilters.SceneSource) {
    sceneSource.FilterConfig.SceneItems.forEach((sceneItem) => {
        mainSceneViewItems.push(new SceneViewItem(sceneItem));
    });
    redrawSceneItemsToViewBox();
}

function redrawSceneItemsToViewBox() {
    mainSceneViewItems.forEach((sceneViewItems) => {
        viewBox.appendChild(sceneViewItems.htmlElement);
    });
}

fetchText("./static/demo/theme.json", (ok: boolean, response: any) => {
    if (ok === true) {
        let profile = JSON.parse(response);
        console.log(profile);
        loadSceneProfile(profile);
    }
});