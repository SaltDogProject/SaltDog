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
export function insertItem(item: any, libraryID: number, dirID: number): Promise<any> {
    return invokeLibraryMethodAsync('insertItem', item, libraryID, dirID) as Promise<any>;
}
