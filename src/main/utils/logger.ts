import fse from 'fs-extra';
import path from 'path';
import dayjs from 'dayjs';
import util from 'util';
import { app } from 'electron';
const LOG_PATH = path.join(app.getPath('userData'), '/saltdog.log');

export const loggerWriter = (msg: string, error?: Error) => {
    let log = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} [SaltDog ERROR] ${msg}`;
    if (error && error.stack) {
        log += `\n------Error Stack Begin------\n${util.format(error.stack)}\n-------Error Stack End-------\n`;
    } else {
        const msg = JSON.stringify(error);
        log += `${msg}\n`;
    }
    fse.appendFileSync(LOG_PATH, log);
};

const handleProcessError = (error: Error) => {
    console.error(error);
    loggerWriter('Process Error', error);
};

process.on('uncaughtException', (error) => {
    handleProcessError(error);
});

process.on('unhandledRejection', (error: any) => {
    handleProcessError(error);
});
