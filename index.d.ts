declare module 'gyork-wbot' {
    import { Server, Socket } from 'net';
    import { GlobalKeyboardListener } from 'node-global-key-listener';

    interface Mutex {
        lock(): Promise<void>;
        release(): void;
    }

    interface WindowPosition {
        left: number;
        top: number;
        width: number;
        height: number;
    }

    interface FindImageOptions {
        region?: [number, number, number, number];
        sim?: number;
        threshold?: [number, number, number];
        multi?: number;
        mode?: boolean;
    }

    interface FindColorOptions {
        subColors?: Array<[number, number, string]>;
        region?: [number, number, number, number];
        sim?: number;
        mode?: boolean;
    }

    interface OcrOptions {
        region?: [number, number, number, number];
        threshold?: [number, number, number];
        mode?: boolean;
    }

    interface YoloOptions {
        mode?: boolean;
    }

    interface ElementPosition {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }

    interface ExcelObject {
        book: any;
        path: string;
    }

    interface CaptchaResult {
        err_no: number;
        err_str: string;
        pic_id: string;
        pic_str: string;
        md5: string;
    }

    interface FineTuneInfo {
        baseModel: string;
        object: string;
        fineTuneId: string;
        fineTunedModel: string;
        fineTuneStatus: string;
        fileName: string;
        fileId: string;
        fileStatus: string;
    }

    interface FileInfo {
        bytes: number;
        fileName: string;
        fileId: string;
        purpose: string;
    }

    class WindowsBot {
        private static rootpath: string;
        private static keylistener: GlobalKeyboardListener;
        private server: Server;
        private socket: Socket;
        private resolveHand: Function | null;
        private recvData: Buffer | string;
        private recvDataLen: number;
        private isFirstData: boolean;
        private waitTimeout: number;
        private intervalTimeout: number;
        private mutex: Mutex;

        constructor(clientSocket: Socket);

        static checkPort(port: number): Promise<boolean>;
        static setSwitchListener(projectRoot: string, keyName: string): void;
        static create(ip: string, port: number): Promise<WindowsBot>;
        static sleep(millisecond: number): Promise<void>;

        private setSendData(...arrArgs: any[]): string;
        private setSendFile(...args: any[]): Buffer;

        sendData(strData: string | Buffer): Promise<Buffer>;
        sleep(millisecond: number): Promise<void>;
        setImplicitTimeout(waitMs: number, intervalMs?: number): Promise<void>;
        findWindow(className: string, windowName: string): Promise<string | null>;
        findWindows(className: string, windowName: string): Promise<string[] | null>;
        findSubWindow(curHwnd: string | number, className: string, windowName: string): Promise<string | null>;
        findParentWindow(curHwnd: string | number): Promise<string | null>;
        findDesktopWindow(): Promise<string | null>;
        getWindowName(hwnd: string | number): Promise<string | null>;
        showWindow(hwnd: string | number, isShow: boolean): Promise<boolean>;
        setWindowTop(hwnd: string | number, isTop: boolean): Promise<boolean>;
        getWindowPos(hwnd: string | number): Promise<WindowPosition | null>;
        setWindowPos(hwnd: string | number, left: number, top: number, width: number, height: number): Promise<boolean>;
        moveMouse(hwnd: string | number, x: number, y: number, options?: { mode?: boolean, elementHwnd?: string | number }): Promise<boolean>;
        moveMouseRelative(hwnd: string | number, x: number, y: number, mode?: boolean): Promise<boolean>;
        rollMouse(hwnd: string | number, x: number, y: number, dwData: number, mode?: boolean): Promise<boolean>;
        clickMouse(hwnd: string | number, x: number, y: number, msg: number, options?: { mode?: boolean, elementHwnd?: string | number }): Promise<boolean>;
        sendKeys(text: string): Promise<boolean>;
        sendKeysByHwnd(hwnd: string | number, text: string): Promise<boolean>;
        sendVk(bVk: number, msg: number): Promise<boolean>;
        sendVkByHwnd(hwnd: string | number, bVk: number, msg: number): Promise<boolean>;
        saveScreenshot(hwnd: string | number, savePath: string, options?: { region?: [number, number, number, number], threshold?: [number, number, number], mode?: boolean }): Promise<boolean>;
        getColor(hwnd: string | number, x: number, y: number, mode?: boolean): Promise<string | null>;
        findImage(hwndOrBigImagePath: string | number, smallImagePath: string, options?: FindImageOptions): Promise<Array<{ x: number, y: number }> | null>;
        findAnimation(hwnd: string | number, frameRate: number, options?: { region?: [number, number, number, number], mode?: boolean }): Promise<Array<{ x: number, y: number }> | null>;
        findColor(hwnd: string | number, strMainColor: string, options?: FindColorOptions): Promise<{ x: number, y: number } | null>;
        compareColor(hwnd: string | number, mainX: number, mainY: number, strMainColor: string, options?: FindColorOptions): Promise<boolean>;
        extractImageByVideo(videoPath: string, saveFolder: string, jumpFrame?: number): Promise<boolean>;
        cropImage(imagePath: string, savePath: string, left: number, top: number, right: number, bottom: number): Promise<boolean>;
        initOcr(ocrServerIp: string, options?: { useAngleModel?: boolean, enableGPU?: boolean, enableTensorrt?: boolean }): Promise<boolean>;
        ocrByHwnd(hwnd: string | number, left: number, top: number, right: number, bottom: number, thresholdType: number, thresh: number, maxval: number, mode?: boolean): Promise<Array<[any[], string[]]> | null>;
        ocrByFile(imagePath: string, left: number, top: number, right: number, bottom: number, thresholdType: number, thresh: number, maxval: number): Promise<Array<[any[], string[]]> | null>;
        getWords(hwndOrFile: string | number, options?: OcrOptions): Promise<string | null>;
        findWords(hwndOrFile: string | number, words: string, options?: OcrOptions): Promise<Array<{ x: number, y: number }> | null>;
        initYolo(yoloServerIp: string, modelPath: string, classesPath: string): Promise<boolean>;
        yoloByHwnd(hwnd: string | number, mode?: boolean): Promise<any[] | null>;
        yoloByFile(imagePath: string): Promise<any[] | null>;
        yolo(hwndOrFile: string | number, mode?: boolean): Promise<any[] | null>;
        getElementName(hwnd: string | number, xpath: string): Promise<string | null>;
        getElementValue(hwnd: string | number, xpath: string): Promise<string | null>;
        getElementRect(hwnd: string | number, xpath: string): Promise<ElementPosition | null>;
        getElementWindow(hwnd: string | number, xpath: string): Promise<string | null>;
        clickElement(hwnd: string | number, xpath: string, msg: number): Promise<boolean>;
        invokeElement(hwnd: string | number, xpath: string): Promise<boolean>;
        setElementFocus(hwnd: string | number, xpath: string): Promise<boolean>;
        setElementValue(hwnd: string | number, xpath: string, value: string): Promise<boolean>;
        setElementScroll(hwnd: string | number, xpath: string, horizontalPercent: number, verticalPercent: number): Promise<boolean>;
        isSelected(hwnd: string | number, xpath: string): Promise<boolean>;
        closeWindow(hwnd: string | number, xpath: string): Promise<boolean>;
        setWindowState(hwnd: string | number, xpath: string, state: number): Promise<boolean>;
        setClipboardText(text: string): Promise<boolean>;
        getClipboardText(): Promise<string>;
        startProcess(commandLine: string, showWindow?: boolean, isWait?: boolean): Promise<boolean>;
        executeCommand(command: string, waitTimeout?: number): Promise<string>;
        downloadFile(url: string, filePath: string, isWait?: boolean): Promise<boolean>;
        openExcel(excelPath: string): Promise<any>;
        openExcelSheet(excelObject: ExcelObject, sheetName: string): Promise<any>;
        saveExcel(excelObject: ExcelObject): Promise<boolean>;
        writeExcelNum(sheetObject: any, row: number, col: number, value: number): Promise<boolean>;
        writeExcelStr(sheetObject: any, row: number, col: number, strValue: string): Promise<boolean>;
        readExcelNum(sheetObject: any, row: number, col: number): Promise<number>;
        readExcelStr(sheetObject: any, row: number, col: number): Promise<string>;
        removeExcelRow(sheetObject: any, rowFirst: number, rowLast: number): Promise<boolean>;
        removeExcelCol(sheetObject: any, colFirst: number, colLast: number): Promise<boolean>;
        getCaptcha(filePath: string, username: string, password: string, softId: string, codeType: string, lenMin?: number): Promise<CaptchaResult>;
        errorCaptcha(username: string, password: string, softId: string, picId: string): Promise<any>;
        scoreCaptcha(username: string, password: string): Promise<any>;
        initNLP(aipKey: string): Promise<boolean>;
        chatgpt(model: string, promptOrMessages: string, maxTokens: number, temperature: number, stop?: string): Promise<any>;
        chatgptEdit(model: string, input: string, instruction: string, maxTokens: number, temperature: number): Promise<any>;
        createFineTune(fileId: string, baseModel: string, suffix: string): Promise<string | null>;
        listFineTunes(): Promise<FineTuneInfo[] | null>;
        listFineTune(fineTuneId: string): Promise<any>;
        cancelFineTune(fineTuneId: string): Promise<boolean>;
        deleteFineTuneModel(fineTuneId: string): Promise<boolean>;
        uploadTrainFile(filePath: string): Promise<string | null>;
        listTrainFiles(): Promise<FileInfo[] | null>;
        listTrainFile(fileId: string): Promise<FileInfo | null>;
        downloadTrainFile(fileId: string): Promise<string | null>;
        deleteTrainFile(fileId: string): Promise<boolean>;
        initSpeechService(speechKey: string, speechRegion: string): Promise<boolean>;
        audioFileToText(filePath: string, language: string): Promise<string | null>;
        microphoneToText(language: string): Promise<string | null>;
        textToBullhorn(ssmlPathOrText: string, language: string, voiceName: string): Promise<boolean>;
        textToAudioFile(ssmlPathOrText: string, language: string, voiceName: string, audioPath: string): Promise<boolean>;
        microphoneTranslationText(sourceLanguage: string, targetLanguage: string): Promise<string | null>;
        audioFileTranslationText(audioPath: string, sourceLanguage: string, targetLanguage: string): Promise<string | null>;
        initMetahuman(metahumanModePath: string, metahumanScaleWidth: number, metahumanScaleHeight: number, isUpdateMetahuman?: boolean): Promise<boolean>;
        metahumanSpeech(saveAudioPath: string, text: string, language: string, voiceName: string, quality?: number, waitPlaySound?: boolean, speechRate?: number, voiceStyle?: string): Promise<boolean>;
        metahumanSpeechCache(saveAudioPath: string, text: string, language: string, voiceName: string, quality?: number, waitPlaySound?: boolean, speechRate?: number, voiceStyle?: string): Promise<boolean>;
        close(): Promise<boolean>;
    }

    export = WindowsBot;
}