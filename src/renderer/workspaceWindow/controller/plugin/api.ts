import webviewApi from './webview';
import {showNotification,showMessage} from '../notification';
const testRendererApi = (arg: any, callback: any,rawData:any) => {
    console.log('Test Renderer Api has been successfully called!', arg);
    callback('From Renderer: OK!');
};
export default {
    testRendererApi,
    ...webviewApi,
    showNotification,
    showMessage
} as ISaltDogPluginApi;
