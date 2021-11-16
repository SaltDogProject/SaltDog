import { fork } from 'child_process';
import { fromPairs, noop } from 'lodash';
import SaltDogPlugin from '.';
import windowManager from '~/main/window/windowManager';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
import path from 'path';
export class SaltDogPluginActivator {
    constructor(private _plugin: SaltDogPlugin) {}
    activatePlugin(pluginInfo: ISaltDogPluginInfo): void {
        // @ts-ignore
        const worker = new Worker(__static + '/plugin/pluginPreload.js');
        worker.on('message', (message: any) => {
            console.log(message);
        });
    }
}
