import { app, dialog } from 'electron';
import log from 'electron-log';

const isDevelopment = process.env.NODE_ENV === 'development';
export const initLog = function () {
    if (isDevelopment) {
        log.transports.file.level = false;
    }
    log.log('Current App Path', app.getAppPath());
    log.catchErrors({
        showDialog: false,
        onError(error, versions, submitIssue) {
            log.error(error.message);
            // dialog
            //     .showMessageBox({
            //         title: '出错啦 ╥﹏╥... ',
            //         message: '很抱歉，SaltDog遇到了一个错误。',
            //         detail: error.message,
            //         type: 'error',
            //         buttons: ['忽略', '上报', '退出程序'],
            //     })
            //     .then((result: any) => {
            //         if (result.response === 1) {
            //             submitIssue &&
            //                 submitIssue('https://github.com/SaltDogProject/SaltDog/issues/new', {
            //                     title: `Error report for ${versions!.app}: ${error.message}`,
            //                     body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions!.os}`,
            //                 });
            //             return;
            //         }
            //         if (result.response === 2) {
            //             app.quit();
            //         }
            //     });
        },
    });
};
