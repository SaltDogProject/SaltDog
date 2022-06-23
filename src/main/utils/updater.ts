import config from '../apis/db/index';
import log from 'electron-log';
import { BrowserWindow, ipcMain, app } from 'electron';
import { UpdateInfo, MacUpdater, NsisUpdater, AppImageUpdater } from 'electron-updater';
import SaltDogMessageChannelMain from '../apis/plugin/api/messageChannel';

const TAG = '[Main/Updater]';
export async function checkUpdate() {
    if (!config.get('preferences.autoCheckUpdate')) return;
    const server = config.get('preferences.updateURL');
    log.debug(TAG, 'Begin Checking Updates.');
    log.debug(TAG, 'Update Server:', server);
    let autoUpdater: AppImageUpdater | MacUpdater | NsisUpdater | null = null;

    switch (process.platform) {
        case 'linux':
            autoUpdater = new AppImageUpdater({
                provider: 'generic',
                url: server,
            });
            break;
        case 'darwin':
            autoUpdater = new MacUpdater({
                provider: 'generic',
                url: server,
            });
            break;
        case 'win32':
            autoUpdater = new NsisUpdater({
                provider: 'generic',
                url: server,
            });
            break;
        default:
            log.error(TAG, 'Unsupport platform,Exit.');
            return;
    }
    autoUpdater.autoDownload = false;
    autoUpdater.fullChangelog = true;
    autoUpdater.autoInstallOnAppQuit = true;
    // 开始检查更新
    autoUpdater.on('checking-for-update', () => {
        log.debug(TAG, 'checking-for-update');
    });
    // 检查更新出错
    autoUpdater.on('error', (e: any, msg: any) => {
        log.error(TAG, 'Error checking update', msg, e);
        SaltDogMessageChannelMain.getInstance().publish('update._updateError', msg);
    });
    // 检查到新版本
    autoUpdater.on('update-available', (info: UpdateInfo) => {
        log.debug(TAG, 'New version detected', info.version, info.files, info.releaseNotes);
        SaltDogMessageChannelMain.getInstance().invokeWorkspace(
            'update._askUpdateDownload',
            JSON.parse(JSON.stringify(info)),
            (allowUpdate) => {
                if (allowUpdate) {
                    log.debug(TAG, 'User allowed to download.');
                    // @ts-ignore
                    autoUpdater.downloadUpdate();
                } else {
                    log.debug(TAG, 'User reject to download.');
                }
            }
        );
        // window.webContents.send(IPC.UPDATA_AVAILABLE, {
        //     message: `检查到新版本 v ${info.version}，开始下载`,
        // });
    });
    // // 已经是新版本
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
        log.debug(TAG, 'Already newest version');
    });
    // // 更新下载中
    //
    autoUpdater.on('download-progress', (info) => {
        if (info.percent == 100) {
            SaltDogMessageChannelMain.getInstance().invokeWorkspace(
                'update._askUpdateInstall',
                null,
                (allowInstall) => {
                    if (allowInstall) {
                        log.debug(TAG, 'User allowed to install.');
                        // @ts-ignore
                        autoUpdater.quitAndInstall();
                    } else {
                        log.debug(TAG, 'User reject to install.');
                    }
                }
            );
        }
    });
    // // // 更新下载完毕
    // autoUpdater.on('update-downloaded', () => {
    //     window.webContents.send(IPC.UPDATA_DOWNLOADED, {
    //         message: '新版本下载完毕',
    //     });
    // });
    // // 立即更新
    // ipcMain.handle(IPC.UPDATA_QUITANDINSTALL, () => {
    //     autoUpdater.quitAndInstall();
    // });
    autoUpdater.checkForUpdates();
    // setInterval(() => {
    //     autoUpdater.checkForUpdatesAndNotify();
    // }, 1000 * 60 * 5);
}
