const { EventEmitter } = require('eventemitter3');
const WebviewContent = require('./webviewContent');
const messageChannel = require('../messageChannel.js');
const { WebviewAgent } = require('./webview');
const bus = require('../bus');
const uniqId = require('licia/uniqId');
const TAG = '[PDFViewAgent]';

class PDFViewAgent extends WebviewAgent {
    constructor(id, info) {
        super(id);
        this.isPdf = true;
    }
}

// 调用webview原生方法的途径：agent.xxx([electron规定的arg，按顺序写成一个list],callback方法)

// {title:,pdfPath:}
function createPDFView(args, callback) {
    messageChannel.invoke('createPDFView', args, (id) => {
        callback(
            new Proxy(new PDFViewAgent(id), {
                get(target, key) {
                    if (target[key]) return target[key];
                    else {
                        console.log(TAG, `Call PDFView Api "${key}".`);
                        return function (args, callback) {
                            messageChannel.invoke(
                                '_handlePDFViewMethod',
                                {
                                    webviewId: id,
                                    method: key,
                                    originalArgs: args,
                                },
                                (res) => {
                                    callback(res);
                                }
                            );
                        };
                    }
                },
            })
        );
    });
}

function getCurrentPDFView(args, callback) {
    messageChannel.invoke('getCurrentTabInfo', args, (info) => {
        if (info && info.isPdf) {
            callback(
                new Proxy(new PDFViewAgent(info.webviewId), {
                    get(target, key) {
                        if (target[key]) return target[key];
                        else {
                            console.log(TAG, `Call PDFView Api "${key}".`);
                            return function (args, callback) {
                                messageChannel.invoke(
                                    '_handlePDFViewMethod',
                                    {
                                        webviewId: info.webviewId,
                                        method: key,
                                        originalArgs: args,
                                    },
                                    (res) => {
                                        callback && callback(res);
                                    }
                                );
                            };
                        }
                    },
                })
            );
        } else {
            console.error(TAG, `Current tab is not a PDF Tab.`);
            callback && callback();
        }
    });
}
module.exports = {
    createPDFView,
    getCurrentPDFView,
};
