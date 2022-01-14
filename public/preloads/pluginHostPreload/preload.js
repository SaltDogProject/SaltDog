const saltdog = require('./pluginApi/index.js');
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

saltdog.on = messageChannel.on;
saltdog.once = messageChannel.once;
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
