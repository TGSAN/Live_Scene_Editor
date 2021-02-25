module SceneFilters {
    export interface SceneFilter {
        FilterConfig: any,
        FilterID: string;
        FilterName: string;
    }

    export interface SceneItem {
        Filter: SceneFilter;
        FitMode: string;
        IsShow: boolean;
        ItemWidth: number;
        ItemHeight: number;
        ItemTop: number;
        ItemLeft: number;
    }

    export interface SceneSource extends SceneFilter {
        FilterConfig: {
            SceneWidth: number,
            SceneHeight: number,
            SceneItems: Array<SceneItem>
        };
    }

    export interface CommonSource extends SceneFilter {
        source_id: number;
    }

    export interface TextSource extends SceneFilter {
        FilterConfig: {
            color: string, // HEX Color (include sharp)
            content: string, // Text
            scroll_orientation: string, // "None", "Horizontal", "Vertical"
            size: number,
            stroke_color: string, // HEX Color (include sharp)
            stroke_width: number,
            text_align: string // "Center", "Left", "Right"
        };
    }

    export interface ImageSource extends SceneFilter {
        FilterConfig: {
            image_from: string,
            image_path: string
        };
    }
}

export { SceneFilters };