import LibraryManager from './manager';
interface ILibraryInfoProvider {
    beforeRetrieve?: (retrieveConfig: { type: string; data: string }) => { type: string; data: string };
    afterRetrieve?: (data: any) => any;
}
function registerInfoProvider(infoProvider: ILibraryInfoProvider) {
    if (!infoProvider) throw new Error('infoProvider is required');
    if (infoProvider.beforeRetrieve && typeof infoProvider.beforeRetrieve === 'function') {
        LibraryManager.getInstance().addBeforeRetrieveHook(infoProvider.beforeRetrieve);
    }
    if (infoProvider.afterRetrieve && typeof infoProvider.afterRetrieve === 'function') {
        LibraryManager.getInstance().addAfterRetrieveHook(infoProvider.afterRetrieve);
    }
}
export { registerInfoProvider };
