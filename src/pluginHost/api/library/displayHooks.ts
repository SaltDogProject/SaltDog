import LibraryManager from './manager';
interface ILibraryDisplayElement {
    displayType?: 'tag' | 'text';
    text: string;
    color?: string;
    backgroundColor?: string;
}
interface ILibraryCustomField {
    [props: string]: ILibraryDisplayElement;
}
interface ILibraryDisplayTableRow {
    id: number;
    itemType?: string;
    name?: string;
    type: 'item' | 'dir';
    customFields?: ILibraryCustomField;
    [props: string]: any;
}
interface ILibraryDisplayTableColumn {
    indexName: string;
    displayName: string;
}
interface ILibraryDisplayTable {
    column: ILibraryDisplayTableColumn[];
    row: ILibraryDisplayTableRow[];
}
// class LibraryTable {
//     private _table: ILibraryDisplayTable|null;
//     constructor(data: any) {
//         this._table=data;
//     }
//     public addColumn(indexName:string,displayName:string){
//         if(!this._table) return;
//         this._table.column.push({indexName,displayName});
//         }
//     }

//     public get row(id:number) : ILibraryDisplayTableRow {
//         return this._table
//     }
// }
function registerDisplayProvider(displayProvider: (data: ILibraryDisplayTable) => any) {
    if (!displayProvider) throw new Error('displayProvider is required');
    LibraryManager.getInstance().addBeforeDisplayHook(displayProvider);
}
export { registerDisplayProvider };
