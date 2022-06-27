import { ipcMain } from 'electron';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import got from 'got';
import SaltDogMessageChannelMain from './api/messageChannel';
import log from 'electron-log';
import { resolve } from 'path';
import { reject } from 'lodash';
import { Parser, DomUtils, DomHandler } from 'htmlparser2';
import render from 'dom-serializer';
import xss from 'xss';
const TAG = '[Main/PluginInstaller]';
export default class SaltDogPluginInstaller {
    private _searchURL = '';
    private _pluginPath = '';
    private _npmmirror = 'https://registry.npmmirror.com';
    private _msgChannel = SaltDogMessageChannelMain.getInstance();
    constructor(pluginPath: string) {
        this._pluginPath = pluginPath;
        this._msgChannel.onInvoke('plugin.search', async (key: string) => {
            const res = (await this.search(key)) as any;
            res.objects = res.objects.filter((obj: any) => {
                return obj.package.name.startsWith('saltdogplugin_');
            });
            return res;
        });
        ipcMain.once('WorkspaceWindowReady', () => {
            this.checkEnv().then((allow: any) => {
                console.log(TAG, 'check', allow);
                if (!allow) {
                    this._msgChannel.publish('plugin._envInvalid');
                }
            });
        });
        this._msgChannel.onInvoke('plugin.install', async (name: string) => {
            return this.install(name);
        });
        this._msgChannel.onInvoke('plugin.getReadme', async (npmurl: string) => {
            return await this.getReadme(npmurl);
        });
    }
    public checkEnv(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            exec('npm -v', { cwd: this._pluginPath }, (err, stdout, stderr) => {
                if (err) {
                    log.error(TAG, 'checkEnv npm failed.', stderr, err);
                    resolve(false);
                } else {
                    console.debug(TAG, 'checkEnv success, npm version:', stdout);
                    this.initNodeDependents();
                    resolve(true);
                }
            });
        });
    }
    public async initNodeDependents() {
        exec(
            'npm install saltdog ' + (this._npmmirror.length != 0 ? '--registry ' + this._npmmirror : ''),
            { cwd: this._pluginPath },
            (err, stdout, stderr) => {
                if (err) {
                    log.error(TAG, 'install saltdog failed', stderr, err);
                } else {
                    console.debug(TAG, 'install saltdog success');
                }
            }
        );
    }
    public async search(keywords = '') {
        return await got(
            `https://registry.npmjs.com/-/v1/search?text=saltdogplugin_${keywords}&size=200&popularity=1.0`
        ).json();
        /**
         * objects:[
         *  {
         *      package:{name,date,description,scope,version,links:{npm,repository,homepage,bugs},maintainers:[{username,email}],publisher:{email,username}}
         *  }
         * ],time,total
         */
    }
    public getReadme(npmlink: string): Promise<any> {
        const xssoptions = {
            whiteList: {
                a: ['href', 'title', 'target'],
                img: ['src'],
                p: [],
                span: [],
                h1: [],
                h2: [],
                h3: [],
                h4: [],
                h5: [],
                h6: [],
                pre: [],
                div: ['id'],
                code: [],
                hr: [],
            },
        };
        return new Promise((resolve, reject) => {
            got(npmlink, { cache: false }).then((req) => {
                const content = xss(req.body, xssoptions);
                const handler = new DomHandler((error, dom) => {
                    if (error) {
                        throw error;
                    } else {
                        const nodes = DomUtils.getElementById('readme', dom);
                        // @ts-ignore
                        if (nodes) resolve(render(nodes));
                        else reject('No readme.');
                    }
                });
                const parser = new Parser(handler);
                parser.write(content);
                parser.end();
            });
        });
    }

    public install(pluginName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (typeof pluginName != 'string' || pluginName.length == 0 || !pluginName.startsWith('saltdogplugin_'))
                throw new Error('Invalid pluginName');
            pluginName = pluginName.split(' ')[0];
            exec(
                `npm install ${pluginName} ${this._npmmirror.length != 0 ? '--registry ' + this._npmmirror : ''}`,
                (e, stdout, stderr) => {
                    if (e || stderr) {
                        log.error(TAG, `Installed failed for plugin ${pluginName}`, e);
                        throw e;
                    }
                    const pattern = /added [0-9]+ packages/;
                    const isSuccess = pattern.test(stdout);
                    if (isSuccess) resolve(true);
                }
            );
        });
    }
}
