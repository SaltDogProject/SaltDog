const saltdog = require('./pluginApi/index.js');
const messageChannel = require('./messageChannel.js');
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
