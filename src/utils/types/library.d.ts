interface IDirPath {
    dirID: number;
    name: string;
}
interface IDirInfo {
    dirID: number;
    libraryID: number;
    name: string;
    parentDirID: number;
    localKey: string;
    dateAdded: string;
    dateModified: string;
}
interface IDirListDir {
    dirID: number;
    name: string;
    dateAdded: string;
    dateModified: string;
    localKey: string;
}
interface IDirListItems {
    itemID: number;
    name: string;
    itemType: string;
    dateAdded: string;
    dateModified: string;
    localKey: string;
}
interface IDirList {
    meta: {
        parentDirID: number;
        libraryID: number;
        isRoot: boolean;
    };
    dirs: Array<IDirListDir>;
    items: Array<IDirListItems>;
}

interface ILibInfo {
    libraryID: number;
    rootDirID: number;
    name: string;
    type: string;
    editable: boolean;
    filesEditable: boolean;
    archived: boolean;
}
