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
                    title: '出错啦 ╥﹏╥... ',
                    message:
                        '很抱歉，SaltDog遇到了一个错误。您可以点击忽略继续运行程序，但部分功能将不可用。如果您经常看到这条信息，可以点击上报告诉我们。感激不尽！',
                    detail: error.message,
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
