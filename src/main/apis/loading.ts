import type { ILoadingQueueTask } from '#/types/renderer';
import SaltDogMessageChannelMain from './plugin/api/messageChannel';
import log from 'electron-log';
export function createLoading(task: ILoadingQueueTask) {
    log.debug('createLoading', task);
    SaltDogMessageChannelMain.getInstance().publish('saltdog.updateLoadingQueue', task);
}
export function cancelLoading(id: string) {
    log.debug('cancelLoading', id);
    SaltDogMessageChannelMain.getInstance().publish('saltdog.cancelLoadingQueue', id);
}
