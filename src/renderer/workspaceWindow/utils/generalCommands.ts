import SaltDogMessageChannelRenderer from '../controller/messageChannel';
import { openExternal } from './external';
export default function initCommandListener() {
    SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.openExternal', (url) => {
        openExternal(url);
    });
}
