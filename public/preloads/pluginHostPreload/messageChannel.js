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
    });
}
// 接受plugin webview请求
function dealWebviewMessage(msg, callback) {
    console.log('[Plugin Host] Receive from webview: ', msg);
}
function on() {}
// 订阅host事件
function subscribe(event, callback, once = false) {
    if (once) {
        bus.once(event, callback);
    } else {
        bus.on(event, callback);
    }
}
// 发布插件事件
function publish(fn, args) {}
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
            dealWebviewMessage(data.data, function (r) {
                process.send({
                    type: 'PLUGINWEBVIEW_INVOKE_CALLBACK',
                    data: r,
                    callbackId: data.callbackId,
                });
            });
        }
    });
}
module.exports = { invoke, on, subscribe, publish, initListener };
