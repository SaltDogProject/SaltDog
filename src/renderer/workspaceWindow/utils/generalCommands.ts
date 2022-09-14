import SaltDogMessageChannelRenderer from '../controller/messageChannel';
import { openExternal, showItemInFolder } from './external';
import { ElNotification, ElMessage } from 'element-plus';
import { ipcRenderer } from 'electron';
export default function initCommandListener() {
    SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.openExternal', (url) => {
        openExternal(url);
    });
    SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.showItemInFolder', (path, ask = true) => {
        showItemInFolder(path, ask);
    });
    SaltDogMessageChannelRenderer.getInstance().registerCommand(
        'saltdog.showNotification',
        (type: 'success' | 'warning' | 'info' | 'error', title, message) => {
            ElNotification({
                title,
                message,
                type,
            });
        }
    );
    SaltDogMessageChannelRenderer.getInstance().registerCommand(
        'saltdog.showMessage',
        (type: 'success' | 'warning' | 'info' | 'error', message) => {
            ElMessage({
                message,
                type,
            });
        }
    );
    SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.toggleDevtools', () => {
        ipcRenderer.send('toggleDevTools', 'WORKSPACE_WINDOW');
    });
    SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.toggleDevtoolsPlugin', () => {
        ipcRenderer.send('toggleDevTools', 'PLUGIN_HOST', 'detach');
    });
}
