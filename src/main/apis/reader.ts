import SaltDogMessageChannelMain from './plugin/api/messageChannel';
import { webContents } from 'electron';
const TAG = '[Main/Reader]';
class Reader {
    static getInstance() {
        if (!Reader.instance) {
            Reader.instance = new Reader();
        }
        return Reader.instance;
    }
    static instance: Reader;
    private _readerWebviewContent: Map<number, boolean> = new Map(); // webviewContentID
    constructor() {
        SaltDogMessageChannelMain.getInstance().on('reader.readerCreated', (webviewId, webContentsId) => {
            console.log('reader.readerCreated', webContentsId);
            this._readerWebviewContent.set(webContentsId, true);
            webContents.fromId(webContentsId).on('will-navigate', (e, url) => {
                SaltDogMessageChannelMain.getInstance().publish('onCommand:saltdog.openExternal', url);
                // e.preventDefault();
            });
        });
        SaltDogMessageChannelMain.getInstance().on('reader.readerDestroyed', (webviewId, webContentsId) => {
            this._readerWebviewContent.delete(webContentsId);
        });
    }
    public isReader(webContentsId: number) {
        return this._readerWebviewContent.has(webContentsId);
    }
}

export default Reader;
