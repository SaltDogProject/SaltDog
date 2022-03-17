// THIS FILE IS CREATED ONLY FOR RECORD EVENTS THAT SDPDFCORE EMITED
/**
 * Event: pageNumberChanged
 * Reason: 用户在toolbar输入跳转目标时
 * Value： 要跳转的位置(string) '1'
 */

/**
 * Event: scaleChanged
 * Reason: 用户在改变缩放页面比例时
 * Value： 0.1<=scale<=10 || 'auto' || 'page-actual' || 'page-fit' || 'page-width' || 'custom' || 'page-height'
 */

/**
 * Event:  
 */
const TAG = '[pdfView/event]'
const uniqId = require('licia/uniqId');
const listenerIdMap = {};
const listenerInfo = {};
function _requestAddEventListener(args,callback){
    console.log(TAG,'_requestAddEventListener',args);
    const {selector,eventName,invokeTime} = args;
    let ele;
    if(selector=='document'||selector==''){
        ele=document;
    }
    ele = document.querySelector(selector);
    const id=uniqId('CustomEvent_');
    listenerIdMap[id]=function(e){
        window.__sdJSBridge&&window.__sdJSBridge.publish(`_WebviewContentEvent`,{
            event:eventName,
            owner:args.owner,
            data:e,
            id
        });
    }
    listenerInfo[id]={
        target:ele,eventName,invokeTime
    }
    console.log(TAG,'_requestAddEventListener res:',ele,args.owner);
    if(ele){
        ele.addEventListener(eventName,listenerIdMap[id],invokeTime);
        callback({
            status:0,
            msg:'success',
            id
        })
    }else{
        callback({
            status:-1,
            msg:"error: cannot find select target."
        })
    }
}

function _requestRemoveAddEventListener(args,callback){
    const {id} = args;
    if(listenerInfo[id]){
        listenerInfo[id].target.removeEventListener(listenerInfo[id].eventName,listenerIdMap[id],listenerInfo[id].invokeTime);
    }
    callback({
        status:0,
        msg:'success'
    });
}
module.exports = {_requestAddEventListener,_requestRemoveAddEventListener}