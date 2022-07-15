import MessageHandler from '../components/tabs/messageHandler';
import SaltDogMessageChannelRenderer from './messageChannel';
import { setSDPDFCoreAnnotate } from './library';
import tabManager from './tabManager';
import { ElMessage } from 'element-plus';
const TAG = '[Renderer/Reader]';
export default class ReaderManager {
    public static getInstance(): ReaderManager {
        if (!ReaderManager.instance) {
            ReaderManager.instance = new ReaderManager();
        }
        return ReaderManager.instance;
    }
    constructor() {
        // tabs/messagehandler.ts
        SaltDogMessageChannelRenderer.getInstance().on('reader.pdfModified', (data, id) => {
            if (this._readerMap.has(id)) {
                this.setModified(id, true);
                console.log(TAG, 'reader.pdfModified', true);
                return;
            }
            console.log(TAG, 'Invalid id', id);
        });
    }
    private static instance: ReaderManager;
    private _readerMap: Map<string, Electron.WebviewTag> = new Map(); // id webview
    private _modifiedStatusMap: Map<string, boolean> = new Map(); // id modified?
    private _messageHandlerMap: Map<string, MessageHandler> = new Map();
    public setReader(id: string, webview: Electron.WebviewTag, messageHandler: MessageHandler) {
        console.log(TAG, `Set reader ${id}`, messageHandler);
        SaltDogMessageChannelRenderer.getInstance().publish(
            'reader.readerCreated',
            webview.id,
            webview.getWebContentsId()
        );
        this._readerMap.set(webview.id, webview);
        this._modifiedStatusMap.set(webview.id, false);
        this._messageHandlerMap.set(webview.id, messageHandler);
    }
    public setModified(id: string, modified: boolean) {
        console.log(TAG, 'setModified', modified);
        this._modifiedStatusMap.set(id, modified);
    }
    public checkIfModified(id: string) {
        return this._modifiedStatusMap.get(id) || false;
    }
    public getReader(id: string) {
        return this._readerMap.get(id);
    }
    public distroyReader(id: string) {
        console.log(TAG, `Destroy reader ${id}`);
        SaltDogMessageChannelRenderer.getInstance().publish(
            'reader.readerDestroyed',
            id,
            this._readerMap.get(id)!.getWebContentsId()
        );
        this._readerMap.delete(id);
        this._modifiedStatusMap.delete(id);
        this._messageHandlerMap.delete(id);
    }
    public saveChanges(id: string) {
        console.log(TAG, `Save changes ${id}`);
        this._modifiedStatusMap.set(id, false);
        return new Promise((resolve, reject) => {
            this._messageHandlerMap.get(id)!.invokeWebview('saveAnnotations', '', (data: any) => {
                const { documentId, annotations } = data;
                setSDPDFCoreAnnotate(documentId, annotations)
                    .then(() => {
                        console.log(TAG, 'Annotation saved.');
                        resolve(true);
                    })
                    .catch(() => {
                        console.log(TAG, 'Annotation save failed.');
                        reject(false);
                    });
            });
        });
    }
    public addReader(tabName: string, path: string) {
        tabManager.addPdfTab(tabName, path);
    }
}
