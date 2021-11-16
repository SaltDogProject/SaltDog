// @ts-nocheck
// eslint-disable-next-line no-undef
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
global.saltdog = {
    print: (...args) => {
        console.log(...args);
    },
};
parentPort.postMessage('hello');
