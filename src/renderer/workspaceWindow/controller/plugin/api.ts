import webviewApi from './webview';
const testRendererApi = (arg: any, callback: any,rawData:any) => {
    console.log('Test Renderer Api has been successfully called!', arg);
    callback('From Renderer: OK!');
};
export default {
    testRendererApi,
    ...webviewApi
} as ISaltDogPluginApi;
