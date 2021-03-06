import { ipcRenderer } from 'electron';
import { ElMessageBox } from 'element-plus';
import SaltDogMessageChannelRenderer from '../controller/messageChannel';
export function openExternal(url: string, ask = true) {
    if (ask) {
        ElMessageBox.confirm(`是否打开外部链接: ${url}`)
            .then(() => {
                console.log(`Accept: openExternal: ${url}`);
                ipcRenderer.send('open-url', url);
            })
            .catch(() => {
                console.log(`Canceled: openExternal: ${url}`);
            });
    } else {
        ipcRenderer.send('open-url', url);
    }
}
