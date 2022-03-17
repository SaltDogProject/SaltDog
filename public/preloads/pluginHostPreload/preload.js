const hostApi = require('./pluginApi/index.js');
const messageChannel = require('./messageChannel.js');
const { NodeVM } = require('vm2');
const fs = require('fs');
const process = require('process');
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  });
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
        else if (key=='send') return messageChannel.send;
        else if (key=='_messageChannel') return messageChannel;
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
        __mainjs: process.env.mainjs,
        __messageChannelTicket: process.env.messageChannelTicket,
        __sdConfig: process.env.sdconfig,
    },
    require: {
        external: true,
        root: JSON.parse(process.env.sdconfig).rootDir,
    },
});
vm.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  });
vm.run(`

console.log('Plugin Host Context for:', global.__mainjs);
const userCode = require(global.__mainjs);

userCode.activate(global.saltdog);
`);

