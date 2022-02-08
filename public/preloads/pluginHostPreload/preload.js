const hostApi = require('./pluginApi/index.js');
const messageChannel = require('./messageChannel.js');
const { NodeVM } = require('vm2');
const fs = require('fs');

global.__sdConfig = {
    message: 'not inited',
};
messageChannel.initListener();
messageChannel.subscribe(
    'sdConfigReady',
    function (msg) {
        global.__sdConfig = msg;
        console.log('sdConfigReady', msg);
        messageChannel.invoke('getPluginInfo', {}, function (info) {
            console.log('pluginInfo by host:', info);
        });
    },
    true
);
console.log('[SaltDog Plugin Host] messageChannelTicket: ', process.env.messageChannelTicket);
console.log('[SaltDog Plugin Host] mainjs: ', process.env.mainjs);
console.log('[SaltDog Plugin Host] sdconfig: ', process.env.sdconfig);
if(process.env.sdconfig){
    global.__sdConfig = process.env.sdconfig;
}
const saltdog = new Proxy(hostApi, {
    get(target, key) {
        if (target[key]) return target[key];
        else if (key == 'on') return messageChannel.on;
        else if (key == 'once') return messageChannel.once;
        else {
            console.log(`Plugin Host] Call Unknown Api "${key}" , switching to mainprocess.`);
            return function (args, callback) {
                messageChannel.invoke(key, args, callback);
            };
        }
    },
});

const vm = new NodeVM({
    sandbox: {
        saltdog,
        __mainjs: process.env.mainjs,
        __messageChannelTicket: process.env.messageChannelTicket,
        __sdConfig: process.env.sdconfig,
    },
    require: {
        external: true,
        root: JSON.parse(process.env.sdconfig).rootDir,
    },
});

vm.run(`
console.log('Plugin Host Context for:', global.__mainjs);
const userCode = require(global.__mainjs);
userCode.activate(global.saltdog);
`);
