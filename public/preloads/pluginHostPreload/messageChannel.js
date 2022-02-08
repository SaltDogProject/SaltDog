const bus = require('./bus');
const uniqId = require('licia/uniqId');
const callbackMap = {};
// plugin向host发请求
function invoke(api, args, callback) {
    let callbackId = -1;
    if (typeof callback === 'function') {
        callbackId = uniqId();
        callbackMap[callbackId] = callback;
    }
    process.send({
        type: 'PLUGINHOST_INVOKE',
        api,
        args: args,
        pluginInfo: global.__sdConfig,
        callbackId,
        hostIdentity:process.env.messageChannelTicket
    });
}
function on(channel, cb) {
    bus.on(`webviewMessage:${channel}`, function (data) {
        cb(data.data, function (cbdata) {
            console.log('[Plugin Host] Send reply to webview: ', {
                webviewId: data.webviewId,
                windowId: data.windowId,
                data: cbdata,
                callbackId: data.callbackId,
            });
            process.send({
                type: 'PLUGINWEBVIEW_INVOKE_CALLBACK',
                webviewId: data.webviewId,
                windowId: data.windowId,
                data: cbdata,
                callbackId: data.callbackId,
            });
        });
    });
}
function once(channel, cb) {
    bus.once(`webviewMessage:${channel}`, function (data) {
        cb(data.data, function (cbdata) {
            process.send({
                type: 'PLUGINWEBVIEW_INVOKE_CALLBACK',
                webviewId: data.webviewId,
                windowId: data.windowId,
                data: cbdata,
                callbackId: data.callbackId,
            });
        });
    });
}
// 接受plugin webview请求
function dealWebviewMessage(data) {
    bus.emit(`webviewMessage:${data.channel}`, data);
    console.log('[Plugin Host] Receive from webview: ', data);
}

// 订阅host事件
function subscribe(event, callback, once = false) {
    if (once) {
        bus.once(event, callback);
    } else {
        bus.on(event, callback);
    }
}
// 发布插件事件
function initListener() {
    process.on('message', function (data) {
        console.log('[Plugin Host] message', data);
        if (data.type === 'PLUGINHOST_INVOKE_CALLBACK') {
            if (data.callbackId in callbackMap) {
                callbackMap[data.callbackId](data.data);
                delete callbackMap[data.callbackId];
            }
        } else if (data.type === 'HOST_EVENT') {
            bus.emit(data.event, data.data);
        } else if (data.type === 'PLUGINWEBVIEW_INVOKE') {
            dealWebviewMessage(data);
        }
    });
}
module.exports = { invoke, on, once, subscribe, initListener };
