const testRendererApi = (arg: any, callback?: any) => {
    console.log('Test Renderer Api has been successfully called!', arg);
    callback('From Renderer: OK!');
};
export default {
    testRendererApi,
} as ISaltDogPluginApi;
