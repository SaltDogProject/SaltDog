import SaltDogMessageChannelRenderer from '../controller/messageChannel';
import { openExternal } from './external';
import { ElNotification, ElMessage } from 'element-plus';
export default function initCommandListener() {
    SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.openExternal', (url) => {
        openExternal(url);
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
}
