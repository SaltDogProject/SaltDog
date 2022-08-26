import Database from 'better-sqlite3';
import { readFileSync, existsSync, Stats } from 'fs-extra';
import lodash from 'lodash';
import uuid from 'licia/uuid';
import { join } from 'path';
import { app } from 'electron';
import * as path from 'path';
import log from 'electron-log';
import { LocalFileDB, LocalFileDesc } from './localFileDB';
import grobid, { GrobidClient } from '../../grobid/index';
const TAG = '[Main/LibraryDB]';
const schemaJSOHPath = path.resolve(__static, 'libraryDB', './schema.json');
const internalInitSQLPath = path.resolve(__static, 'libraryDB', './internalInit.sql');
const triggersSQLPath = path.resolve(__static, 'libraryDB', './triggers.sql');
export default class SaltDogItemDB extends Database {
    constructor(path: string, config = {}) {
        let _firstLoad = false;
        if (!existsSync(path)) {
            _firstLoad = true;
        }
        super(path, config);
        if (_firstLoad) {
            _initDBSchema(this);
        }
        _initSchemaData(this);
        _initLibrary(this);
        this._cacheDBMaps();
        this._localFileDB = new LocalFileDB();
    }
    private static saltdogItemDB: SaltDogItemDB;
    private _localFileDB: LocalFileDB | null = null;
    private static dbPath: string;
    static getInstance(): SaltDogItemDB {
        const isDev = process.env.NODE_ENV === 'development';
        if (this.saltdogItemDB === undefined) {
            this.dbPath = isDev ? join(__static, '../saltdog.sqlite') : app.getPath('userData') + '/saltdog.sqlite';
            console.log(TAG, `Create instance SaltDogItemDB isDev: ${isDev}, dbPath: ${this.dbPath}`);
            this.saltdogItemDB = new SaltDogItemDB(this.dbPath, { verbose: isDev ? console.log : null });
        }
        return this.saltdogItemDB;
    }
    private _isConnect = false;
    private _type2id = new Map();
    private _field2id = new Map();
    private _creator2id = new Map();
    private _cacheDBMaps() {
        // 暂存id对应关系
        this.prepare(this._sqlTemplate.getAllTypes)
            .all()
            .map((item: any) => {
                this._type2id.set(item.typeName, item.itemTypeID);
            });
        this.prepare(this._sqlTemplate.getAllFields)
            .all()
            .map((field: any) => {
                this._field2id.set(field.fieldName, field.fieldID);
            });
        this.prepare(this._sqlTemplate.getAllCreatorTypes)
            .all()
            .map((ct: any) => {
                this._creator2id.set(ct.creatorType, ct.creatorTypeID);
            });
    }
    public _sqlTemplate = {
        // schemas
        getVersion: 'SELECT * FROM version WHERE schema=?;',
        setVersion: 'REPLACE INTO version (schema,version) VALUES (?,?);',
        getAllFields: 'SELECT * FROM fields;',
        getFieldsID: 'SELECT fieldID FROM fields WHERE fieldName=?',
        getTypeFields:
            'SELECT fieldID,fieldName FROM itemTypeFields LEFT JOIN fields USING(fieldID) WHERE itemTypeID=?;',
        getTypesID: 'SELECT itemTypeID from itemTypes WHERE typeName=?;',
        getCreatorTypesID: 'SELECT creatorTypeID from creatorTypes WHERE creatorType=?;',
        getAllTypes: 'SELECT itemTypeID,typeName FROM itemTypes;',
        getAllCreatorTypes: 'SELECT creatorTypeID,creatorType FROM creatorTypes;',
        insertFields: 'INSERT INTO fields (fieldName) VALUES (?);',
        insertTypes: 'INSERT INTO itemTypes (typeName) VALUES (?);',
        insertCreatorTypes: 'INSERT INTO creatorTypes (creatorType) VALUES (?);',
        insertTypeFieldRelations: 'INSERT INTO itemTypeFields (itemTypeID,fieldID,hide,orderIndex) VALUES (?,?,?,?);',
        insertBaseFieldRelations: 'INSERT INTO baseFieldMappings (itemTypeID,baseFieldID,fieldID) VALUES (?,?,?);',
        insertCreatorTypeRelations:
            'INSERT INTO itemTypeCreatorTypes (itemTypeID,creatorTypeID,primaryField) VALUES (?,?,?);',
        clearTypeFieldRelations: 'DELETE FROM itemTypeFields;',
        clearBaseFieldRelations: 'DELETE FROM baseFieldMappings;',
        clearCreatorTypeRelations: 'DELETE FROM itemTypeCreatorTypes;',

        // fs
        insertDir: 'INSERT INTO dirs (libraryID,parentDirID,dirname,key,synced) VALUES (?,?,?,?,?);',
        insertLibrary: 'INSERT INTO libraries (libraryName,type,editable,filesEditable) VALUES (?,?,?,?);',
        getLibraryByType: 'SELECT * FROM libraries WHERE type=?;',
        getLibraryDir: 'SELECT * FROM dirs WHERE libraryID=? AND parentDirID=?;',
        getParentDirID: 'SELECT parentDirID FROM dirs WHERE dirID=?;',
        getDirItems: 'SELECT * FROM items LEFT JOIN itemTypes USING(itemTypeID) WHERE dirID=?;',
        getDirInfoByID: 'SELECT * FROM dirs WHERE dirID=?;',
        getLibraries:
            'SELECT * FROM libraries l LEFT JOIN dirs d WHERE d.parentDirID=d.dirID AND d.libraryID=l.libraryID',
        getLibraryInfoByID: `SELECT * FROM libraries l LEFT JOIN dirs d WHERE l.libraryID=d.libraryID AND d.dirname='root' AND l.libraryID=?`,
        checkDirSameName: 'SELECT * FROM dirs WHERE parentDirID=? AND dirname=?',

        // items
        insertItem: 'INSERT INTO items (itemTypeID,libraryID,dirID,itemName,extra,key) VALUES (?,?,?,?,?,?);',
        checkSameDOI:
            'SELECT i.dirID FROM items i LEFT JOIN itemData id USING(itemID) LEFT JOIN itemDataValues idv USING(valueID) WHERE idv.value=? AND i.libraryID=?;',
        getItemByID: `SELECT *,DATETIME(items.dateAdded, 'localtime') as localAddTime,DATETIME(items.dateModified, 'localtime') as localModTime FROM items LEFT JOIN itemTypes USING(itemTypeID) WHERE itemID=?;`,
        getItemAllProps:
            'SELECT fieldName,value FROM itemData as id LEFT JOIN fields as f LEFT JOIN itemDataValues as idv WHERE id.fieldID = f.fieldID AND idv.valueID = id.valueID AND id.itemID=?;',
        getItemCreator:
            'SELECT ic.creatorID,ic.orderIndex,c.firstName,c.lastName,c.extra,ct.creatorType FROM itemCreators ic LEFT JOIN creators c USING(creatorID) LEFT JOIN creatorTypes ct USING(creatorTypeID) WHERE ic.itemID=?',
        getItemTags: 'SELECT * FROM itemTags it LEFT JOIN tags USING(tagID) WHERE it.itemID=?;',
        getItemAttachments: 'SELECT * FROM itemAttachments WHERE parentItemID=?;',
        insertItemValue: 'INSERT INTO itemDataValues (value) VALUES (?);',
        insertItemValueRelation: 'INSERT INTO itemData (itemID,fieldID,valueID) VALUES (?,?,?);',
        getCreatorByName: 'SELECT * FROM creators WHERE firstName=? AND lastName=?',
        getCreatorByExtra: 'SELECT * FROM creators WHERE extra=?',
        insertCreator: 'INSERT INTO creators (firstName,lastName,extra) VALUES (?,?,?);',
        insertItemCreatorRelation:
            'INSERT INTO itemCreators (itemID,creatorID,creatorTypeID,orderIndex) VALUES (?,?,?,?);',
        getTagID: 'SELECT tagID FROM tags WHERE name=?;',
        insertTag: 'INSERT INTO tags (name) VALUES (?);',
        insertItemTagRelation: 'INSERT INTO itemTags (itemID,tagID,color,type) VALUES (?,?,?,?);',
        insertAttachments: 'INSERT INTO itemAttachments (parentItemID,name,contentType,url) VALUES (?,?,?,?);',
        updateAttachments:
            'UPDATE itemAttachments SET path=?,syncState=?,storageModTime=?,storageHash=?,lastProcessedModificationTime=? WHERE attachmentID=?;',
        getSDPDFCoreAnnotate: 'SELECT annotations from pdfAnnotations WHERE key=?;',
        setSDPDFCoreAnnotate: 'REPLACE INTO pdfAnnotations (key,annotations) VALUES (?,?);',
    };
    public insertItem(item: any, libraryID: number, dirID: number, localFile: any): any {
        const itemTypeID = this._type2id.get(item.itemType);
        if (!itemTypeID) {
            console.error(`Unsupport type ${item.itemType}`);
            throw new Error(`Unsupport type ${item.itemType}`);
        }
        const validFields = this.prepare(this._sqlTemplate.getTypeFields)
            .all(itemTypeID)
            .map((item: any) => {
                return item.fieldName;
            });
        const insertedFieldID = [];
        const insert_key = uuid();
        if (item.DOI) {
            // 查找是否有DOI相同的两篇文献。在同一个library内不允许两篇相同的。
            // item.DOI = item.DOI.trim();
            const same = this.prepare(this._sqlTemplate.checkSameDOI).get(item.DOI, libraryID);
            let str = '/';
            if (same && same.dirID) {
                const p = this.locateDir(same.dirID);
                for (let i = 0; i < p.length; i++) {
                    if (i > 0) str += p[i].name + '/';
                }
                throw new Error(`DOI ${item.DOI} already exists in ${str}`);
            }
        }
        try {
            const localFileDB = this._localFileDB as LocalFileDB;
            this.transaction((item: any, libraryID: number, dirID: number) => {
                // 插入条目
                const itemID = this.prepare(this._sqlTemplate.insertItem).run(
                    itemTypeID,
                    libraryID,
                    dirID,
                    item.title || '未命名条目',
                    '',
                    insert_key
                ).lastInsertRowid;
                for (const f in Object.keys(item)) {
                    const fn = Object.keys(item)[f];
                    // 这些字段单独处理
                    if (['key', 'version', 'itemType', 'creators', 'tags', 'seeAlso', 'attachments'].indexOf(fn) != -1)
                        continue;
                    if (validFields.indexOf(fn) == -1) {
                        console.warn(`Unsupport fields '${fn}' in itemType '${item.itemType}' ,ignore.`);
                        continue;
                    }
                    // 插入值
                    const valueID = this.prepare(this._sqlTemplate.insertItemValue).run(item[fn]).lastInsertRowid;
                    // 插入field对应关系
                    this.prepare(this._sqlTemplate.insertItemValueRelation).run(
                        itemID,
                        this._field2id.get(fn),
                        valueID
                    );
                }
                // 处理creators
                for (const c in item.creators) {
                    const creator = item.creators[c];
                    let insertCreatorID: number | bigint = -1;
                    if (creator.semanticID) {
                        // 有semanticID，可以识别重名作者，直接用这个作者。
                        const cid = this.prepare(this._sqlTemplate.getCreatorByExtra).get(creator.semanticID).creatorID;
                        if (cid && cid > 0) insertCreatorID = cid;
                        else {
                            // 插入该作者
                            insertCreatorID = this.prepare(this._sqlTemplate.insertCreator).run(
                                creator.firstName,
                                creator.lastName,
                                creator.semanticID
                            ).lastInsertRowid;
                        }
                    } else {
                        // 没有semanticID，gg，这里和zotero不太一样，考虑到重名问题哪怕有重名也照样新增一条，后期用户可以手动绑定哪个作者是一样的。
                        insertCreatorID = this.prepare(this._sqlTemplate.insertCreator).run(
                            creator.firstName ? creator.firstName : creator.name,
                            creator.lastName ? creator.lastName : '',
                            '-1'
                        ).lastInsertRowid;
                    }
                    let ctid = -1;
                    if (!creator.creatorType || !this._creator2id.get(creator.creatorType)) {
                        // 要是没给就用primary
                        ctid = this.prepare(
                            'SELECT creatorTypeID FROM itemTypeCreatorTypes WHERE itemTypeID=? AND primaryField=?'
                        ).get(itemTypeID, 1).creatorTypeID;
                    } else {
                        ctid = this._creator2id.get(creator.creatorType);
                    }
                    // 设置对应关系
                    this.prepare(this._sqlTemplate.insertItemCreatorRelation).run(itemID, insertCreatorID, ctid, c);
                }
                const tags = {};
                // 处理tags
                for (const c in item.tags) {
                    const tag = item.tags[c];
                    if (tags[tag.tag]) continue;

                    const row = this.prepare(this._sqlTemplate.getTagID).get(tag.tag);
                    let tagID: number | bigint = -1;
                    if (row && row.tagID > 0) tagID = row.tagID;
                    else {
                        tagID = this.prepare(this._sqlTemplate.insertTag).run(tag.tag).lastInsertRowid;
                    }
                    this.prepare(this._sqlTemplate.insertItemTagRelation).run(itemID, tagID, '#D9ECFF', tag.type || 1);
                    tags[tag.tag] = true;
                }
                // 'seeAlso' 暂时让用户手动设置，在这里不处理。
                // 处理 attachments
                for (const a in item.attachments) {
                    const att = item.attachments[a];
                    if (att.mimeType == 'application/pdf') {
                        log.debug(TAG, 'Begin downloading attachment:', att.url);
                        this._bindingAttachment(insert_key, itemID, att, localFile);
                    } else {
                        this.prepare(this._sqlTemplate.insertAttachments).run(itemID, att.title, att.mimeType, att.url);
                    }
                }
            })(item, libraryID, dirID);
        } catch (e) {
            console.error(`Failed to insert items`);
            throw e;
        }
    }

    public deleteItem(itemID: number) {
        try {
            this.transaction((itemID: number) => {
                // 查询并移除单一作者
                const creatorIDs = this.prepare(this._sqlTemplate.getItemCreator).all(itemID);
                for (const c of creatorIDs) {
                    const creatorID = c.creatorID;
                    const creatorCount = this.prepare('SELECT creatorID from itemCreators WHERE creatorID=?;').all(
                        creatorID
                    );
                    this.prepare('DELETE from itemCreators WHERE itemID=?;').run(itemID);
                    if (creatorCount.length == 1) {
                        this.prepare('DELETE from creators WHERE creatorID=?;').run(creatorID);
                    }
                }
                // 查询并移除单一标签
                const tagIDs = this.prepare(this._sqlTemplate.getItemTags).all(itemID);
                for (const t of tagIDs) {
                    const tagID = t.tagID;
                    const tagCount = this.prepare('SELECT tagID,type from itemTags WHERE tagID=?;').all(tagID);
                    this.prepare('DELETE from itemTags WHERE itemID=?;').run(itemID);
                    if (tagCount.length == 1 && tagCount[0].type == 1) {
                        this.prepare('DELETE from tags WHERE tagID=?;').run(tagID);
                    }
                }
                // 查询并移除单一附件
                const itemKey = this.prepare('SELECT key from items WHERE itemID=?;').get(itemID).key;
                this.prepare('DELETE from itemAttachments WHERE parentItemID=?;').run(itemID);
                this._localFileDB!.deleteItem(itemKey);
                // 移除itemFields
                const fields = this.prepare('SELECT itemID,valueID from itemData WHERE itemID=?;').all(itemID);
                for (const f of fields) {
                    const valueID = f.valueID;
                    const valueCount = this.prepare('SELECT valueID from itemData WHERE valueID=?;').all(valueID);
                    this.prepare('DELETE from itemData WHERE itemID=?;').run(itemID);
                    if (valueCount.length == 1) {
                        this.prepare('DELETE from itemDataValues WHERE valueID=?;').run(valueID);
                    }
                }
                // 移除items
                this.prepare('DELETE from items WHERE itemID=?;').run(itemID);
            })(itemID);
        } catch (e) {
            log.error('Delete Failed', e);
            throw e;
        }
    }
    // 创建新文件夹
    public mkdir(libraryID: number, parentDirID: number, dirname: string) {
        try {
            const smdir = this.prepare(this._sqlTemplate.checkDirSameName).get(parentDirID, dirname);
            if (smdir && smdir.dirID) throw new Error(`Already have ${dirname} in this folder.`);
            const key = uuid();
            const dir = this.prepare(this._sqlTemplate.insertDir).run(libraryID, parentDirID, dirname, key, 0);
            return {
                dirID: dir.lastInsertRowid,
                localKey: key,
            };
        } catch (e) {
            console.error(`Error while mkdir in (library ${libraryID},dir ${parentDirID},mkdir ${dirname}.`);
            throw e;
        }
    }
    // 定位DIR的路径，返回dirID对应的路径(包括root)
    public locateDir(dirID: number): IDirPath[] {
        const pathReverse = [];
        let dirInfo = this.getDirInfoByID(dirID);
        if (!dirInfo) {
            throw new Error(`init locate dir with unvalid dirID ${dirID}`);
        }
        while (dirInfo!.parentDirID != dirInfo!.dirID) {
            pathReverse.push({
                dirID: dirInfo!.dirID,
                name: dirInfo!.name,
            } as IDirPath);
            dirInfo = this.getDirInfoByID(dirInfo!.parentDirID);
            if (!dirInfo) {
                throw new Error(`locate dir with unvalid dirID ${dirID}`);
            }
        }
        // push root
        pathReverse.push({
            dirID: dirInfo.dirID,
            name: dirInfo.name,
        });
        return pathReverse.reverse();
    }
    // 获取library信息
    public getLibraryInfoByID(libraryID: number): ILibInfo | null {
        const info = this.prepare(this._sqlTemplate.getLibraryInfoByID).get(libraryID);
        if (info && info.libraryID) {
            return {
                libraryID: info.libraryID,
                rootDirID: info.dirID,
                name: info.libraryName,
                type: info.type,
                editable: !!info.editable,
                filesEditable: !!info.filesEditable,
                archived: !!info.archived,
            };
        } else {
            return null;
        }
    }
    // 获取Dir信息
    public getDirInfoByID(dirID: number): IDirInfo | null {
        const info = this.prepare(this._sqlTemplate.getDirInfoByID).get(dirID);
        if (!info || !info.dirID) return null;
        return {
            dirID: info.dirID,
            libraryID: info.libraryID,
            name: info.dirname,
            parentDirID: info.parentDirID,
            localKey: info.key,
            dateAdded: info.dateAdded,
            dateModified: info.dateModified,
        };
    }
    // 获取libraries列表
    public listLib(): ILibList[] {
        const libs = this.prepare(this._sqlTemplate.getLibraries).all();
        const l: ILibList[] = [];
        for (const i of libs) {
            l.push({
                libraryID: i.libraryID,
                libraryName: i.libraryName,
                type: i.type,
                rootDir: i.dirID,
                archived: i.archived == 1,
                editable: i.editable == 1,
                filesEditable: i.filesEditable == 1,
            });
        }
        return l;
    }
    //
    public listDir(libraryID: number, dirID: number): IDirList {
        const itemList = {
            meta: { parentDirID: dirID, libraryID, isRoot: false },
            dirs: [],
            items: [],
        };
        let pdirid = this.prepare(this._sqlTemplate.getParentDirID).get(dirID).parentDirID;
        if ((pdirid = dirID)) itemList.meta.isRoot = true;

        const dirs = this.prepare(this._sqlTemplate.getLibraryDir).all(libraryID, dirID);
        for (const dir of dirs) {
            // 两个ID相等时是root，不显示了
            if (dir.dirID == dir.parentDirID) continue;
            (itemList.dirs as IDirListDir[]).push({
                dirID: dir.dirID,
                name: dir.dirname,
                dateAdded: dir.dateAdded,
                dateModified: dir.dateModified,
                localKey: dir.key,
            });
        }
        const items = this.prepare(this._sqlTemplate.getDirItems).all(dirID);
        for (const item of items) {
            if (item.display > 0)
                (itemList.items as IDirListItems[]).push({
                    itemID: item.itemID,
                    name: item.itemName,
                    itemType: item.typeName,
                    itemTypeID: item.itemTypeID,
                    dateAdded: item.dateAdded,
                    dateModified: item.dateModified,
                    localKey: item.key,
                });
        }
        return itemList;
    }
    public getItemInfo(itemID: number) {
        const item = this.prepare(this._sqlTemplate.getItemByID).get(itemID);
        const props = this.prepare(this._sqlTemplate.getItemAllProps).all(itemID);
        const creators = this.prepare(this._sqlTemplate.getItemCreator).all(itemID);
        const tags = this.prepare(this._sqlTemplate.getItemTags).all(itemID);
        const attachments = this.prepare(this._sqlTemplate.getItemAttachments).all(itemID);
        // console.log(TAG, JSON.stringify(props));
        return {
            title: item.itemName,
            typeName: item.typeName,
            typeID: item.itemTypeID,
            itemID: item.itemID,
            localKey: item.key,
            dateAdded: item.localAddTime,
            dateModified: item.localModTime,
            synced: item.synced,
            props,
            creators,
            tags,
            attachments,
        };
    }
    public getSDPDFCoreAnnotate(docID: string) {
        const doc = this.prepare(this._sqlTemplate.getSDPDFCoreAnnotate).get(docID);
        // console.log(doc);
        try {
            return JSON.parse(doc.annotations);
        } catch (e) {
            return null;
        }
    }
    public setSDPDFCoreAnnotate(docID: string, annotations: string) {
        this.prepare(this._sqlTemplate.setSDPDFCoreAnnotate).run(docID, JSON.stringify(annotations));
        return true;
    }

    public setReadHistory(title: string, filePath: string, operationType = 'open') {
        const res = this.prepare('SELECT parentItemID FROM itemAttachments WHERE path=?').get(filePath);
        const itemID = res && res.length != 0 ? res.parentItemID : -1;
        log.log(TAG, 'Set read history', title, itemID);
        this.prepare('INSERT INTO readHistory (operationType,title,filePath,itemID) VALUES (?,?,?,?)').run(
            operationType,
            title,
            filePath,
            itemID
        );
    }
    public getReadHistory(operationType = 'open', limit = 5) {
        const history = this.prepare(
            "SELECT historyID,itemID,operationType,filePath,title,DATETIME(max(operationDate), 'localtime') as operationDate FROM readHistory WHERE operationType=? GROUP BY filePath ORDER BY operationDate DESC LIMIT ?"
        ).all(operationType, limit);
        return history as IReadHistory[];
    }

    private _bindingAttachment(key: string, itemID: number | bigint, att: any, localFile: any) {
        const attID = this.prepare(this._sqlTemplate.insertAttachments).run(
            itemID,
            att.title,
            att.mimeType,
            att.url
        ).lastInsertRowid;
        // path=?,syncState=?,storageModTime=?,storageHash=?,lastProcessedModificationTime=?
        this.prepare(this._sqlTemplate.updateAttachments).run(null, -1, null, null, null, attID);
        localFile ? log.debug(TAG, 'Import attachment with localFile', localFile.path) : null;
        const task = localFile
            ? this._localFileDB!.bindLocalFile(key, path.parse(localFile.path).base, localFile.path)
            : this._localFileDB!.downloadAndSave(key, att.title + '.pdf', att.url);
        task.then((stats: LocalFileDesc) => {
            log.debug('Downloaded attachment:', stats.path, stats.md5);
            const time = new Date().getTime();
            this.prepare(this._sqlTemplate.updateAttachments).run(
                stats.path,
                0,
                stats.stats.mtime.getTime(),
                stats.md5,
                time,
                attID
            );
            // GrobidClient.getInstance().getMarker(stats.path);
        }).catch((err: any) => {
            log.error('Download attachment Error:', err);
            const time = new Date().getTime();
            this.prepare(this._sqlTemplate.updateAttachments).run(null, -2, null, null, time, attID);
        });
    }
}

function _initDBSchema(db: SaltDogItemDB) {
    const initSchema = readFileSync(internalInitSQLPath, 'utf8');
    const triggers = readFileSync(triggersSQLPath, 'utf8');
    try {
        db.exec(initSchema);
        db.exec(triggers);
    } catch (e) {
        console.error(`Error while creating tables and triggers.`);
        throw e;
    }
}

function _initLibrary(db: SaltDogItemDB): void {
    const allLib = db.prepare(db._sqlTemplate.getLibraryByType).all('user');
    const hasUserLib =
        allLib &&
        allLib.filter((i: any) => {
            return i.type == 'user';
        }).length > 0;
    if (hasUserLib) {
        console.log(`Detect user Library, skip init Libraries`);
    } else {
        console.log(`Init user library`);
        try {
            db.prepare(db._sqlTemplate.insertLibrary).run('我的图书馆', 'user', 1, 1);
        } catch (e) {
            console.error(`Error while creating library.`, e);
            throw e;
        }
    }
    // 有可能是刚刚插入的，再检索一遍
    try {
        const defaultlibid = db.prepare(db._sqlTemplate.getLibraryByType).all('user')[0].libraryID;
        const rootDirExist = db.prepare(db._sqlTemplate.getLibraryDir).all(defaultlibid, 1).length > 0;
        if (rootDirExist) {
            console.log(`Default Library ${defaultlibid} has root dir ,skip.`);
            return;
        }
        console.log(`Creating Root dir for library ${defaultlibid}`);
        db.prepare(db._sqlTemplate.insertDir).run(defaultlibid, 1, 'root', uuid(), 0);
    } catch (e) {
        console.error('Error while creating root dir.', e);
        throw e;
    }
}
function _initSchemaData(db: SaltDogItemDB): void {
    const _schemaJSON = JSON.parse(readFileSync(schemaJSOHPath, 'utf-8'));
    const currentVersion = db.prepare(db._sqlTemplate.getVersion).get('globalSchema');
    if (!currentVersion || currentVersion.version != _schemaJSON.version) {
        console.log(
            `GlobalSchema Version not match (${_schemaJSON.version}[now]!=${currentVersion}[db]) update schema.`
        );
    } else {
        console.log(`GlobalSchema do not need to update.`);
        return;
    }
    const existFields = db
        .prepare(db._sqlTemplate.getAllFields)
        .all()
        .map((v: any) => {
            return v.fieldName;
        });
    const existTypes = db
        .prepare(db._sqlTemplate.getAllTypes)
        .all()
        .map((v: any) => {
            return v.typeName;
        });
    const existCreators = db
        .prepare(db._sqlTemplate.getAllCreatorTypes)
        .all()
        .map((v: any) => {
            return v.creatorType;
        });
    const schemaFields = {};
    const schemaTypes = {};
    const creatorTypes = {};
    // 第一次循环，插入基本types
    for (const i in _schemaJSON.itemTypes) {
        const item = _schemaJSON.itemTypes[i];
        for (const j in item.fields) {
            const field = item.fields[j];
            schemaFields[field.field] = true;
            if (field.baseField) schemaFields[field.baseField] = true;
        }
        for (const k in item.creatorTypes) {
            const creatorType = item.creatorTypes[k];
            creatorTypes[creatorType.creatorType] = true;
        }
        schemaTypes[item.itemType] = true;
    }
    // 考虑到有可能是后期增加的，不要用修改的方式，这样会改变id对应关系
    const newFields = lodash.difference(Object.keys(schemaFields), existFields);
    const newTypes = lodash.difference(Object.keys(schemaTypes), existTypes);
    const newCreatorTypes = lodash.difference(Object.keys(creatorTypes), existCreators);
    // console.log('These args will be added',newFields,newTypes,newCreatorTypes);
    try {
        newFields.map((field: any) => {
            db.prepare(db._sqlTemplate.insertFields).run(field);
        });
        newTypes.map((type: any) => {
            db.prepare(db._sqlTemplate.insertTypes).run(type);
        });
        newCreatorTypes.map((ct: any) => {
            db.prepare(db._sqlTemplate.insertCreatorTypes).run(ct);
        });
    } catch (e) {
        console.error('Error occured when insert extra data', e);
        throw e;
    }
    try {
        // 再循环一次，插入itemType和field对应关系, creator关系
        // 删除之前的关系
        db.exec(db._sqlTemplate.clearTypeFieldRelations);
        db.exec(db._sqlTemplate.clearBaseFieldRelations);
        db.exec(db._sqlTemplate.clearCreatorTypeRelations);
        for (const i in _schemaJSON.itemTypes) {
            const item = _schemaJSON.itemTypes[i];
            const itemType = item.itemType;
            const fields = item.fields;
            const creatorTypes = item.creatorTypes;
            const itemTypeID = db.prepare(db._sqlTemplate.getTypesID).get(itemType).itemTypeID;
            for (const j in fields) {
                const fieldName = fields[j].field;
                const fieldID = db.prepare(db._sqlTemplate.getFieldsID).get(fieldName).fieldID;
                // 插入关系
                db.prepare(db._sqlTemplate.insertTypeFieldRelations).run(itemTypeID, fieldID, 0, j);
                if (fields[j].baseField) {
                    // 插入baseField关系
                    const _bfid = db.prepare(db._sqlTemplate.getFieldsID).get(fields[j].baseField).fieldID;
                    db.prepare(db._sqlTemplate.insertBaseFieldRelations).run(itemTypeID, _bfid, fieldID);
                }
            }
            // 插入创造者关系
            for (const k in creatorTypes) {
                const creatorType = creatorTypes[k];
                const creatorTypeID = db
                    .prepare(db._sqlTemplate.getCreatorTypesID)
                    .get(creatorType.creatorType).creatorTypeID;
                db.prepare(db._sqlTemplate.insertCreatorTypeRelations).run(
                    itemTypeID,
                    creatorTypeID,
                    creatorType.primary ? 1 : 0
                );
            }
        }
    } catch (e) {
        console.error('An error occured when linking relations.', e);
        throw e;
    }
    // 所有的都成功了，更新一下version。
    db.prepare(db._sqlTemplate.setVersion).run('globalSchema', _schemaJSON.version);

    return;
}

// export default new SaltDogItemDB('saltdog.db', { verbose: console.log });
// process.on('exit', () => db.close());
// process.on('SIGHUP', () => process.exit(128 + 1));
// process.on('SIGINT', () => process.exit(128 + 2));
// process.on('SIGTERM', () => process.exit(128 + 15));

// console.log(db.prepare('SELECT creatorTypeID FROM itemTypeCreatorTypes WHERE itemTypeID=? AND primaryField=?').get(3,1).creatorTypeID);
//db._initDBSchema();
// db._initSchemaData();
// db._initLibrary();
// console.log(db.prepare(db._sqlTemplate.insertItemValue).run('asaas'))
// try {
//   db.exec(migration);
//   } catch (err) {
//     if (!db.inTransaction) throw err; // (transaction was forcefully rolled back)
// }
