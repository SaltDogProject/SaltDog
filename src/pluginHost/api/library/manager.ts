import SaltDogMessageChannelRenderer from '../../messageChannel';
import { extend } from 'lodash';
export default class LibraryManager {
    static getInstance() {
        if (!LibraryManager.instance) {
            LibraryManager.instance = new LibraryManager();
        }
        return LibraryManager.instance;
    }
    static instance: LibraryManager;
    constructor() {
        /**
         * 这里我是这么想的：
         * 每个插件可以注册一个beforeRetrieveHook，这个hook会在插件获取到数据之前被调用，
         * 参数就是搜索类型和参数，这个由saltdog本体来调用，beforeRetrieveHook是对这个参数进行处理的
         * 处理完以后返回saltdog本体来调zotero-translator进行查询
         * 我能想到的应用场景是 在有proxy的环境下，url和真实的论文地址不一样，可以做一个deproxy
         * 但有可能有多个注册的hook，就比较难办, 感觉要用户自己选了
         */
        SaltDogMessageChannelRenderer.getInstance().onInvoke(
            '_beforeRetrieve',
            (this._dealBeforeRetrive as (args: any) => any).bind(this)
        );
        SaltDogMessageChannelRenderer.getInstance().onInvoke(
            '_afterRetrieve',
            (this._dealAfterRetrive as (args: any) => any).bind(this)
        );
        SaltDogMessageChannelRenderer.getInstance().onInvoke(
            '_beforeDisplay',
            (this._dealBeforeDisplay as (args: any) => any).bind(this)
        );
    }
    private _beforeRetriveHooks: Array<
        (retrieveConfig: { type: string; data: string }) => { type: string; data: string }
    > = [];
    private _afterRetriveHooks: Array<(data: any) => any> = [];
    private _beforeDisplayHooks: Array<(data: any) => any> = [];
    public addBeforeRetrieveHook(
        fn: (retrieveConfig: { type: string; data: string }) => { type: string; data: string }
    ) {
        this._beforeRetriveHooks.push(fn);
    }
    public addAfterRetrieveHook(fn: (data: any) => any) {
        this._afterRetriveHooks.push(fn);
    }
    public addBeforeDisplayHook(fn: (data: any) => any) {
        this._beforeDisplayHooks.push(fn);
    }
    private async _dealBeforeRetrive(args: { type: string; data: string }) {
        console.log('_dealBeforeRetrive', args);
        const result = [];
        for (let i = 0; i < this._beforeRetriveHooks.length; i++) {
            const fn = this._beforeRetriveHooks[i];
            result.push((await fn(args)) || null);
        }
        if (result.length != 0) return result[0];
        else return args;
    }
    private async _dealAfterRetrive(args: any) {
        for (let i = 0; i < this._afterRetriveHooks.length; i++) {
            const fn = this._afterRetriveHooks[i];
            extend(args, await fn(args));
        }
        return args;
    }
    private async _dealBeforeDisplay(args: any) {
        for (let i = 0; i < this._beforeDisplayHooks.length; i++) {
            const fn = this._beforeDisplayHooks[i];
            await fn(args);
        }
        return args;
    }
}
LibraryManager.getInstance();
