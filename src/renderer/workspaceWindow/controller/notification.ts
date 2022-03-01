import { ElNotification,NotificationParams,ElMessage, MessageParams } from 'element-plus'


    // args: https://element-plus.gitee.io/zh-CN/component/notification.html#%E9%85%8D%E7%BD%AE%E9%A1%B9
    //
    export function showNotification(args:NotificationParams,callback?:any):void{
        ElNotification(args);
        if(callback && typeof callback=='function')
            callback();
    }

    // args: https://element-plus.gitee.io/zh-CN/component/message.html#options
    export function showMessage(args:MessageParams,callback?:any):void{
        ElMessage(args)
          if(callback && typeof callback=='function')
            callback();
    }