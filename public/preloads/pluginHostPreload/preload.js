const fse = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const util = require('util');
const { internalPluginName } = require('./utils/secure.js');

let LOG_PATH;
try {
    LOG_PATH = path.join(JSON.parse(process.env.sdConfig).logDir, 'saltdog_plugin.log');
} catch (e) {
    console.error(e);
    LOG_PATH = path.join('C:\\', 'saltdog_plugin.log');
}
const loggerWriter = (msg, error = null) => {
    let log = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} [SaltDog Plugin] ${msg}`;
    if (error && error.stack) {
        log += `\n------Error Stack Begin------\n${util.format(error.stack)}\n-------Error Stack End-------\n`;
    } else {
        const msg = JSON.stringify(error);
        if (msg) log += `${msg}\n`;
        else log += `\n`;
    }
    fse.appendFileSync(LOG_PATH, log);
};
loggerWriter('begin');
try {
    const fs = require('fs');
    const process = require('process');

    process.on('unhandledRejection', (reason, promise) => {
        loggerWriter('PluginHost Unhandled Rejection', reason);
        console.log('PluginHost Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (reason, promise) => {
        console.log('PluginHost Unhandled Rejection at:', promise, 'reason:', reason);
        loggerWriter('PluginHost Unhandled Rejection at:', reason);
    });

    const hostApi = require('./pluginApi/index.js');
    const messageChannel = require('./messageChannel.js');
    const { NodeVM } = require('vm2');
    const bus = require('./bus.js');

    global.__sdConfig = {
        message: 'not inited',
    };
    messageChannel.initListener();
    bus.on('_activatePlugin', (data) => {
        console.log(`Activating Plugin ${data.name} ...`, data);
    });

    //     console.log('[SaltDog Plugin Host] messageChannelTicket: ', process.env.messageChannelTicket);
    //     loggerWriter(`messageChannelTicket: ${process.env.messageChannelTicket}`);
    //     console.log('[SaltDog Plugin Host] mainjs: ', process.env.mainjs);
    //     loggerWriter(`mainjs: ${process.env.mainjs}`);
    console.log('[SaltDog Plugin Host] sdConfig: ', process.env.sdConfig);
    loggerWriter(`sdConfig: ${process.env.sdconfig}`);
    if (process.env.sdConfig) {
        global.__sdConfig = process.env.sdConfig;
    }
    const saltdog = new Proxy(hostApi, {
        get(target, key) {
            if (target[key]) return target[key];
            else if (key == 'on') return messageChannel.on;
            else if (key == 'subscribe') return messageChannel.subscribe;
            else if (key == 'once') return messageChannel.once;
            else if (key == 'send') return messageChannel.send;
            else if (key == '_messageChannel') return messageChannel;
            else {
                // console.log(`[Plugin Host] Call Unknown Api "${key}" , switching to mainprocess.`);
                return function (args, callback) {
                    messageChannel.invoke(key, args, callback);
                };
            }
        },
    });
    global.saltdog = saltdog;

    const vm = new NodeVM({
        sandbox: {
            saltdog,
            __sdConfig: process.env.sdConfig,
        },
        eval: false,
        require: {
            external: true,

            context: 'host',
            // FIXME: debug
            // root: JSON.parse(process.env.sdConfig).rootDir,
        },
    });
    vm.on('unhandledRejection', (reason, promise) => {
        console.log('Unhandled Rejection at:', promise, 'reason:', reason);
        loggerWriter('VM Unhandled Rejection at:', reason);
    });
    vm.on('uncaughtException', (reason, promise) => {
        console.log('Unhandled Rejection at:', promise, 'reason:', reason);
        loggerWriter('VM Unhandled Rejection at:', reason);
    });
    global._internalName = new Map(); // name inername
    global._loadedPlugins = new Map(); // name info
    global._pluginExecPath = new Map(); // name mainjspath
    vm.run(`
            const _pluginModule = new Map();
            global._pluginModule = _pluginModule;
            global._sdRequire = (modulename)=>{
                console.log('hack!',modulename,require)
                const ori_require = require;
                if(modulename=='saltdog'){
return saltdog;
                }
                return ori_require(modulename);
            }
        `);
    bus.on('_activatePlugin', (data) => {
        // main\apis\plugin\activator.ts
        const secname = internalPluginName(data.name);
        // 过滤字符,secname要直接放到vm运行的。。
        global._internalName.set(data.name, secname);
        global._loadedPlugins.set(secname, data.pluginManifest);
        global._pluginExecPath.set(secname, data.mainjs);
        vm.run(`
        try{
            console.log(String.raw\`${data.mainjs}\`);
            require=global._sdRequire;
            global._plugin_${secname} = require(String.raw\`${data.mainjs}\`);
            global._pluginModule.set('${secname}',global._plugin_${secname});
            global._plugin_${secname}.activate(saltdog);
        }catch(e){
            console.error('Error load ${secname}:',e);
        }
        `);
    });
} catch (e) {
    loggerWriter('PluginError', e);
}
