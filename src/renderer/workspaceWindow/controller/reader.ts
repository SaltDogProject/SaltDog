import MessageHandler from '../components/tabs/messageHandler';
import SaltDogMessageChannelRenderer from './messageChannel';
import { setSDPDFCoreAnnotate } from './library';
import tabManager from './tabManager';
import log from 'electron-log';
import { ElMessage } from 'element-plus';
const TAG = '[Renderer/Reader]';
export default class ReaderManager {
    private _msgChannel = SaltDogMessageChannelRenderer.getInstance();
    public static getInstance(): ReaderManager {
        if (!ReaderManager.instance) {
            ReaderManager.instance = new ReaderManager();
        }
        return ReaderManager.instance;
    }
    constructor() {
        // tabs/messagehandler.ts
        this._msgChannel.on('reader.pdfModified', (data, id) => {
            if (this._readerMap.has(id)) {
                this.setModified(id, true);
                log.log(TAG, 'reader.pdfModified', true);
                return;
            }
            log.log(TAG, 'Invalid id', id);
        });
        this._msgChannel.on('reader.openDetial', (raw_doi) => {
            const tab = tabManager.addTab('详情:' + raw_doi, `file:///${__static}/auxPages/jumpRedirect/index.html`);
            const tag = tabManager.getWebviewById(tab);
            if (raw_doi.semanticID) {
                tag && (tag.src = `https://www.semanticscholar.org/paper/${raw_doi.semanticID}`);
            } else {
                tag && (tag.src = `https://www.doi.org/${raw_doi.DOI}`);
            }
        });
    }
    private static instance: ReaderManager;
    private _readerMap: Map<string, Electron.WebviewTag> = new Map(); // id webview
    private _modifiedStatusMap: Map<string, boolean> = new Map(); // id modified?
    private _messageHandlerMap: Map<string, MessageHandler> = new Map();
    private _itemInfoMap: Map<string, any> = new Map();
    public setReader(id: string, webview: Electron.WebviewTag, messageHandler: MessageHandler) {
        console.log(TAG, `Set reader ${id}`, messageHandler);
        this._msgChannel.publish('reader.readerCreated', webview.id, webview.getWebContentsId());
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
        this._msgChannel.publish('reader.readerDestroyed', id, this._readerMap.get(id)!.getWebContentsId());
        this._readerMap.delete(id);
        this._modifiedStatusMap.delete(id);
        this._messageHandlerMap.delete(id);
        this._itemInfoMap.delete(id);
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
    public addReader(tabName: string, path: string, itemInfo: any = null) {
        const id = tabManager.addPdfTab(tabName, path, itemInfo);
        if (id) this._itemInfoMap.set(id, itemInfo);
        return id;
    }
    public getItemInfo(id: string) {
        if (this._itemInfoMap.has(id)) return this._itemInfoMap.get(id);
        return null;
    }
}
