// @ts-nocheck
import Datastore from 'lowdb';
import fs from 'fs-extra';
import FileSync from 'lowdb/adapters/FileSync';

import LodashId from 'lodash-id';
import { dbPathChecker, dbPathDir } from './dbChecker';
import { extend } from 'lodash';
import defaultSettingsTemplate from './settings_buildin';
const STORE_PATH = dbPathDir();

if (!fs.pathExistsSync(STORE_PATH)) {
    fs.mkdirpSync(STORE_PATH);
}
const CONFIG_PATH: string = dbPathChecker();

class ConfigStore {
    private db: Datastore.LowdbSync<Datastore.AdapterSync>;
    constructor() {
        const adapter = new FileSync(CONFIG_PATH);
        this.db = Datastore(adapter);
        this.db._.mixin(LodashId);
    }
    read() {
        return this.db.read();
    }
    get(key = '') {
        return this.read().get(key).value();
    }
    set(key: string, value: any) {
        return this.read().set(key, value).write();
    }
    has(key: string) {
        return this.read().has(key).value();
    }
    insert(key: string, value: any): void {
        // @ts-ignore
        return this.read().get(key).insert(value).write();
    }
    unset(key: string, value: any): boolean {
        return this.read().get(key).unset(value).value();
    }
    getById(key: string, id: string) {
        // @ts-ignore
        return this.read().get(key).getById(id).value();
    }
    removeById(key: string, id: string) {
        // @ts-ignore
        return this.read().get(key).removeById(id).write();
    }
    getConfigPath() {
        return CONFIG_PATH;
    }
}

export default new ConfigStore();

export function buildSettingsTemplate(pluginSettings: IPluginSettings[]) {
    const def = defaultSettingsTemplate;
    def.plugins.subGroup = pluginSettings;
    return def;
}
