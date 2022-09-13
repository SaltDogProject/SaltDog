import { ipcRenderer } from 'electron';
import { uniqId } from 'licia';
const _libraryFns = new Map();
ipcRenderer.on('invokeLibraryMethodReply', (e, id, err, res) => {
    const fn = _libraryFns.get(id);
    if (fn) {
        fn(err, res);
        _libraryFns.delete(id);
    }
});
function invokeLibraryMethodAsync(fn: string, ...args: any[]) {
    return new Promise((resolve, reject) => {
        const id = uniqId();
        ipcRenderer.send('invokeLibraryMethod', fn, id, ...args);
        console.log('invokeLibraryMethod', fn, ...args);
        _libraryFns.set(id, (err: string, res: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

export function listDir(libraryID: number, dirID: number): Promise<IDirList> {
    return invokeLibraryMethodAsync('listDir', libraryID, dirID) as Promise<IDirList>;
}
export function listLib(): Promise<ILibList[]> {
    return invokeLibraryMethodAsync('listLib') as Promise<ILibList[]>;
}
export function mkdir(libraryID: number, parentDirID: number, dirname: string) {
    return invokeLibraryMethodAsync('mkdir', libraryID, parentDirID, dirname);
}
export function getDirInfoByID(dirID: number): Promise<IDirInfo | null> {
    return invokeLibraryMethodAsync('getDirInfoByID', dirID) as Promise<IDirInfo | null>;
}
export function getLibraryInfoByID(libraryID: number): Promise<ILibInfo | null> {
    return invokeLibraryMethodAsync('getLibraryInfoByID', libraryID) as Promise<ILibInfo | null>;
}

export function locateDir(dirID: number): Promise<IDirPath[]> {
    return invokeLibraryMethodAsync('locateDir', dirID) as Promise<IDirPath[]>;
}
export function insertItem(item: any, libraryID: number, dirID: number, localFile: any = null): Promise<any> {
    return invokeLibraryMethodAsync('insertItem', item, libraryID, dirID, localFile) as Promise<any>;
}
export function deleteItem(itemID: any): Promise<any> {
    return invokeLibraryMethodAsync('deleteItem', itemID) as Promise<any>;
}
export function getItemInfo(itemID: number): Promise<any> {
    return invokeLibraryMethodAsync('getItemInfo', itemID) as Promise<any>;
}
export function getSDPDFCoreAnnotate(docID: string): Promise<any> {
    return invokeLibraryMethodAsync('getSDPDFCoreAnnotate', docID) as Promise<any>;
}
export function setSDPDFCoreAnnotate(docID: string, annotations: any): Promise<any> {
    return invokeLibraryMethodAsync('setSDPDFCoreAnnotate', docID, annotations);
}
export function setReadHistory(title: string, filePath: string, operationType = 'open'): Promise<any> {
    return invokeLibraryMethodAsync('setReadHistory', title, filePath, operationType);
}
export function getReadHistory(operationType = 'open', limit = 5): Promise<IReadHistory[]> {
    return invokeLibraryMethodAsync('getReadHistory', operationType, limit) as Promise<IReadHistory[]>;
}
export function modifyItem(modifyObjs: { itemID: number; add: any[]; modify: any[]; delete: any[] }): Promise<boolean> {
    return invokeLibraryMethodAsync('modifyItem', modifyObjs) as Promise<boolean>;
}
export function addAttachment(
    itemID: number,
    attachmentObjs: { title: string; attachmentType: 'online' | 'local'; url: string }
): Promise<void> {
    return invokeLibraryMethodAsync('addAttachment', itemID, attachmentObjs) as Promise<void>;
}
export function deleteAttachment(attachmentID: number): Promise<void> {
    return invokeLibraryMethodAsync('deleteAttachment', attachmentID) as Promise<void>;
}
