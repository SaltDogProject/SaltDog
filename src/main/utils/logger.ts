import { app, dialog } from 'electron';
import log from 'electron-log';

const isDevelopment = process.env.NODE_ENV !== 'production';
export const initLog = function () {
    if (isDevelopment) {
        log.transports.file.level = false;
    }
    log.catchErrors({
        showDialog: false,
        onError(error, versions, submitIssue) {
            dialog
                .showMessageBox({
                    title: '啊噢，SaltDog遇到了一个错误 ╥﹏╥... ，以下是详细信息。给您造成的不便，我们深表歉意。',
                    message: error.message,
                    detail: error.stack,
                    type: 'error',
                    buttons: ['忽略', '上报', '退出程序'],
                })
                .then((result: any) => {
                    if (result.response === 1) {
                        submitIssue &&
                            submitIssue('https://github.com/SaltDogProject/SaltDog/issues/new', {
                                title: `Error report for ${versions!.app}: ${error.message}`,
                                body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions!.os}`,
                            });
                        return;
                    }
                    if (result.response === 2) {
                        app.quit();
                    }
                });
        },
    });
};
