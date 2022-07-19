// @ts-nocheck
import Datastore from 'lowdb';
import fs from 'fs-extra';
import FileSync from 'lowdb/adapters/FileSync';

import LodashId from 'lodash-id';
import { dbPathChecker, dbPathDir } from './dbChecker';
import { extend } from 'lodash';
import defaultSettingsTemplate from './settings_buildin';
import log from 'electron-log';
import keytar from 'keytar-sync';
import crypto from 'crypto';
const STORE_PATH = dbPathDir();

if (!fs.pathExistsSync(STORE_PATH)) {
    fs.mkdirpSync(STORE_PATH);
}
const CONFIG_PATH: string = dbPathChecker();

class ConfigStore {
    private db: Datastore.LowdbSync<Datastore.AdapterSync>;
    private encryptPass: Buffer;
    private encryptIv: Buffer;
    private accessGranted = false;
    constructor() {
        const adapter = new FileSync(CONFIG_PATH);
        this.db = Datastore(adapter);
        this.db._.mixin(LodashId);
        if (!this.get('_inited')) {
            this.initDefault();
        }
    }
    private getSecurePassword() {
        if (this.accessGranted) return { secret: this.encryptPass, iv: this.encryptIv };
        const secret = keytar.getPasswordSync('saltdog.encryptStore', 'saltdog-secret');
        const iv = keytar.getPasswordSync('saltdog.encryptStore', 'saltdog-iv');
        if (!secret || !iv) {
            // 生成默认加密的aes key，利用系统Keychain存储
            const randomKey = Math.random().toString(32).slice(-8) + Math.random().toString(32).slice(-8);
            const riv = Math.random().toString(32).slice(-8) + Math.random().toString(32).slice(-8);
            keytar.setPasswordSync('saltdog.encryptStore', 'saltdog-secret', randomKey);
            keytar.setPasswordSync('saltdog.encryptStore', 'saltdog-iv', riv);
            this.encryptPass = Buffer.from(randomKey);
            this.encryptIv = Buffer.from(riv);
            this.accessGranted = true;
        } else {
            this.encryptPass = Buffer.from(secret);
            this.encryptIv = Buffer.from(iv);
            this.accessGranted = true;
        }
        return { secret: this.encryptPass, iv: this.encryptIv };
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
    safeSet(key: string, value: any) {
        const { secret, iv } = this.getSecurePassword();
        const crt = crypto.createCipheriv('aes-128-cbc', secret, iv);
        let res = crt.update(value, 'utf-8', 'hex');
        res += crt.final('hex');
        return this.set(key, 'encrypt:' + res);
    }
    safeGet(key: string) {
        let value = this.get(key);
        if (!value || typeof value !== 'string') return value;
        const { secret, iv } = this.getSecurePassword();
        if (!value.startsWith('encrypt:')) return value;
        value = value.slice(8);
        const dct = crypto.createDecipheriv('aes-128-cbc', secret, iv);
        let re = dct.update(value, 'hex', 'utf-8');
        re += dct.final('utf-8');
        return re;
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
    initDefault() {
        log.info('First init default configs.');
        this.set('_inited', true);
        for (const i of Object.keys(defaultSettingsTemplate)) {
            const grp = defaultSettingsTemplate[i].subGroup || [];
            for (const j of grp) {
                const chi = j.children || {};
                for (const k of Object.keys(chi)) {
                    this.set(chi[k].id, chi[k].value);
                }
            }
        }
    }
}
const store = new ConfigStore();
export default store;

export function buildSettingsTemplate(pluginSettings: IPluginSettings[]) {
    const def = defaultSettingsTemplate;
    def.plugins.subGroup = pluginSettings;
    return def;
}
