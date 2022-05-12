// https://github.com/electron/electron/blob/master/docs/api/web-view-tag.md

/**
 * Use the webview tag to embed 'guest' content (such as web pages) in your Electron app.
 * The guest content is contained within the webview container.
 * An embedded page within your app controls how the guest content is laid out and rendered.
 *
 * Unlike an iframe, the webview runs in a separate process than your app.
 * It doesn't have the same permissions as your web page and all interactions between your app
 * and embedded content will be asynchronous. This keeps your app safe from the embedded content.
 */
interface WebviewTag extends HTMLElement {
    /**
     * Returns the visible URL. Writing to this attribute initiates top-level navigation.
     * Assigning src its own value will reload the current page.
     * The src attribute can also accept data URLs, such as data:text/plain,Hello, world!.
     */
    src: string;
    /**
     * If "on", the webview container will automatically resize within the bounds specified
     * by the attributes minwidth, minheight, maxwidth, and maxheight.
     * These constraints do not impact the webview unless autosize is enabled.
     * When autosize is enabled, the webview container size cannot be less than
     * the minimum values or greater than the maximum.
     */
    autosize: string;
    /**
     * If "on", the guest page in webview will have node integration and can use node APIs
     * like require and process to access low level system resources.
     */
    nodeintegration: string;
    /**
     * If "on", the guest page in webview will be able to use browser plugins.
     */
    plugins: string;
    /**
     * Specifies a script that will be loaded before other scripts run in the guest page.
     * The protocol of script's URL must be either file: or asar:,
     * because it will be loaded by require in guest page under the hood.
     *
     * When the guest page doesn't have node integration this script will still have access to all Node APIs,
     * but global objects injected by Node will be deleted after this script has finished executing.
     */
    preload: string;
    /**
     * Sets the referrer URL for the guest page.
     */
    httpreferrer: string;
    /**
     * Sets the user agent for the guest page before the page is navigated to.
     * Once the page is loaded, use the setUserAgent method to change the user agent.
     */
    useragent: string;
    /**
     * If "on", the guest page will have web security disabled.
     */
    disablewebsecurity: string;
    /**
     * Sets the session used by the page. If partition starts with persist:,
     * the page will use a persistent session available to all pages in the app with the same partition.
     * If there is no persist: prefix, the page will use an in-memory session.
     * By assigning the same partition, multiple pages can share the same session.
     * If the partition is unset then default session of the app will be used.
     *
     * This value can only be modified before the first navigation,
     * since the session of an active renderer process cannot change.
     * Subsequent attempts to modify the value will fail with a DOM exception.
     */
    partition: string;
    /**
     * If "on", the guest page will be allowed to open new windows.
     */
    allowpopups: string;
    /**
     * A list of strings which specifies the blink features to be enabled separated by ,.
     */
    blinkfeatures: string;
    /**
     * Loads the url in the webview, the url must contain the protocol prefix, e.g. the http:// or file://.
     */
    loadURL(url: string, options?: LoadURLOptions): void;
    /**
     * @returns URL of guest page.
     */
    getURL(): string;
    /**
     * @returns The title of guest page.
     */
    getTitle(): string;
    /**
     * @returns Whether guest page is still loading resources.
     */
    isLoading(): boolean;
    /**
     * Returns a boolean whether the guest page is waiting for a first-response for the main resource of the page.
     */
    isWaitingForResponse(): boolean;
    /**
     * Stops any pending navigation.
     */
    stop(): void;
    /**
     * Reloads the guest page.
     */
    reload(): void;
    /**
     * Reloads the guest page and ignores cache.
     */
    reloadIgnoringCache(): void;
    /**
     * @returns Whether the guest page can go back.
     */
    canGoBack(): boolean;
    /**
     * @returns Whether the guest page can go forward.
     */
    canGoForward(): boolean;
    /**
     * @returns Whether the guest page can go to offset.
     */
    canGoToOffset(offset: number): boolean;
    /**
     * Clears the navigation history.
     */
    clearHistory(): void;
    /**
     * Makes the guest page go back.
     */
    goBack(): void;
    /**
     * Makes the guest page go forward.
     */
    goForward(): void;
    /**
     * Navigates to the specified absolute index.
     */
    goToIndex(index: number): void;
    /**
     * Navigates to the specified offset from the "current entry".
     */
    goToOffset(offset: boolean): void;
    /**
     * @returns Whether the renderer process has crashed.
     */
    isCrashed(): boolean;
    /**
     * Overrides the user agent for the guest page.
     */
    setUserAgent(userAgent: string): void;
    /**
     * @returns The user agent for guest page.
     */
    getUserAgent(): string;
    /**
     * Injects CSS into the guest page.
     */
    insertCSS(css: string): void;
    /**
     * Evaluates code in page. If userGesture is set, it will create the user gesture context in the page.
     * HTML APIs like requestFullScreen, which require user action, can take advantage of this option for automation.
     */
    executeJavaScript(code: string, userGesture?: boolean, callback?: (result: any) => void): void;
    /**
     * Opens a DevTools window for guest page.
     */
    openDevTools(): void;
    /**
     * Closes the DevTools window of guest page.
     */
    closeDevTools(): void;
    /**
     * @returns Whether guest page has a DevTools window attached.
     */
    isDevToolsOpened(): boolean;
    /**
     * @returns Whether DevTools window of guest page is focused.
     */
    isDevToolsFocused(): boolean;
    /**
     * Starts inspecting element at position (x, y) of guest page.
     */
    inspectElement(x: number, y: number): void;
    /**
     * Opens the DevTools for the service worker context present in the guest page.
     */
    inspectServiceWorker(): void;
    /**
     * Set guest page muted.
     */
    setAudioMuted(muted: boolean): void;
    /**
     * @returns Whether guest page has been muted.
     */
    isAudioMuted(): boolean;
    /**
     * Executes editing command undo in page.
     */
    undo(): void;
    /**
     * Executes editing command redo in page.
     */
    redo(): void;
    /**
     * Executes editing command cut in page.
     */
    cut(): void;
    /**
     * Executes editing command copy in page.
     */
    copy(): void;
    /**
     * Executes editing command paste in page.
     */
    paste(): void;
    /**
     * Executes editing command pasteAndMatchStyle in page.
     */
    pasteAndMatchStyle(): void;
    /**
     * Executes editing command delete in page.
     */
    delete(): void;
    /**
     * Executes editing command selectAll in page.
     */
    selectAll(): void;
    /**
     * Executes editing command unselect in page.
     */
    unselect(): void;
    /**
     * Executes editing command replace in page.
     */
    replace(text: string): void;
    /**
     * Executes editing command replaceMisspelling in page.
     */
    replaceMisspelling(text: string): void;
    /**
     * Inserts text to the focused element.
     */
    insertText(text: string): void;
    /**
     * Starts a request to find all matches for the text in the web page.
     * The result of the request can be obtained by subscribing to found-in-page event.
     * @returns The request id used for the request.
     */
    findInPage(text: string, options?: FindInPageOptions): number;
    /**
     * Stops any findInPage request for the webview with the provided action.
     */
    stopFindInPage(action: StopFindInPageAtion): void;
    /**
     * Prints webview's web page. Same with webContents.print([options]).
     */
    print(options?: PrintOptions): void;
    /**
     * Prints webview's web page as PDF, Same with webContents.printToPDF(options, callback)
     */
    printToPDF(options: PrintToPDFOptions, callback: (error: Error, data: Buffer) => void): void;
    /**
     * Send an asynchronous message to renderer process via channel, you can also send arbitrary arguments.
     * The renderer process can handle the message by listening to the channel event with the ipcRenderer module.
     * See webContents.send for examples.
     */
    send(channel: string, ...args: any[]): void;
    /**
     * Sends an input event to the page.
     * See webContents.sendInputEvent for detailed description of event object.
     */
    sendInputEvent(event: SendInputEvent): void;
    /**
     * @returns The WebContents associated with this webview.
     */
    getWebContents(): WebContents;
    /**
     * Fired when a load has committed. This includes navigation within the current document
     * as well as subframe document-level loads, but does not include asynchronous resource loads.
     */
    addEventListener(
        type: 'load-commit',
        listener: (event: WebViewElement.LoadCommitEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when the navigation is done, i.e. the spinner of the tab will stop spinning, and the onload event is dispatched.
     */
    addEventListener(
        type: 'did-finish-load',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * This event is like did-finish-load, but fired when the load failed or was cancelled, e.g. window.stop() is invoked.
     */
    addEventListener(
        type: 'did-fail-load',
        listener: (event: WebViewElement.DidFailLoadEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when a frame has done navigation.
     */
    addEventListener(
        type: 'did-frame-finish-load',
        listener: (event: WebViewElement.DidFrameFinishLoadEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Corresponds to the points in time when the spinner of the tab starts spinning.
     */
    addEventListener(
        type: 'did-start-loading',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Corresponds to the points in time when the spinner of the tab stops spinning.
     */
    addEventListener(
        type: 'did-stop-loading',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when details regarding a requested resource is available.
     * status indicates socket connection to download the resource.
     */
    addEventListener(
        type: 'did-get-response-details',
        listener: (event: WebViewElement.DidGetResponseDetails) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when a redirect was received while requesting a resource.
     */
    addEventListener(
        type: 'did-get-redirect-request',
        listener: (event: WebViewElement.DidGetRedirectRequestEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when document in the given frame is loaded.
     */
    addEventListener(type: 'dom-ready', listener: (event: WebViewElement.Event) => void, useCapture?: boolean): void;
    /**
     * Fired when page title is set during navigation. explicitSet is false when title is synthesized from file URL.
     */
    addEventListener(
        type: 'page-title-updated',
        listener: (event: WebViewElement.PageTitleUpdatedEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when page receives favicon URLs.
     */
    addEventListener(
        type: 'page-favicon-updated',
        listener: (event: WebViewElement.PageFaviconUpdatedEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when page enters fullscreen triggered by HTML API.
     */
    addEventListener(
        type: 'enter-html-full-screen',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when page leaves fullscreen triggered by HTML API.
     */
    addEventListener(
        type: 'leave-html-full-screen',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when the guest window logs a console message.
     */
    addEventListener(
        type: 'console-message',
        listener: (event: WebViewElement.ConsoleMessageEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when a result is available for webview.findInPage request.
     */
    addEventListener(
        type: 'found-in-page',
        listener: (event: WebViewElement.FoundInPageEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when the guest page attempts to open a new browser window.
     */
    addEventListener(
        type: 'new-window',
        listener: (event: WebViewElement.NewWindowEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Emitted when a user or the page wants to start navigation.
     * It can happen when the window.location object is changed or a user clicks a link in the page.
     *
     * This event will not emit when the navigation is started programmatically with APIs
     * like <webview>.loadURL and <webview>.back.
     *
     * It is also not emitted during in-page navigation, such as clicking anchor links
     * or updating the window.location.hash. Use did-navigate-in-page event for this purpose.
     *
     * Calling event.preventDefault() does NOT have any effect.
     */
    addEventListener(
        type: 'will-navigate',
        listener: (event: WebViewElement.NavigateEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Emitted when a navigation is done.
     *
     * This event is not emitted for in-page navigations, such as clicking anchor links
     * or updating the window.location.hash. Use did-navigate-in-page event for this purpose.
     */
    addEventListener(
        type: 'did-navigate',
        listener: (event: WebViewElement.NavigateEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Emitted when an in-page navigation happened.
     *
     * When in-page navigation happens, the page URL changes but does not cause
     * navigation outside of the page. Examples of this occurring are when anchor links
     * are clicked or when the DOM hashchange event is triggered.
     */
    addEventListener(
        type: 'did-navigate-in-page',
        listener: (event: WebViewElement.NavigateEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when the guest page attempts to close itself.
     */
    addEventListener(type: 'close', listener: (event: WebViewElement.Event) => void, useCapture?: boolean): void;
    /**
     * Fired when the guest page has sent an asynchronous message to embedder page.
     */
    addEventListener(
        type: 'ipc-message',
        listener: (event: WebViewElement.IpcMessageEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when the renderer process is crashed.
     */
    addEventListener(type: 'crashed', listener: (event: WebViewElement.Event) => void, useCapture?: boolean): void;
    /**
     * Fired when the gpu process is crashed.
     */
    addEventListener(type: 'gpu-crashed', listener: (event: WebViewElement.Event) => void, useCapture?: boolean): void;
    /**
     * Fired when a plugin process is crashed.
     */
    addEventListener(
        type: 'plugin-crashed',
        listener: (event: WebViewElement.PluginCrashedEvent) => void,
        useCapture?: boolean
    ): void;
    /**
     * Fired when the WebContents is destroyed.
     */
    addEventListener(type: 'destroyed', listener: (event: WebViewElement.Event) => void, useCapture?: boolean): void;
    /**
     * Emitted when media starts playing.
     */
    addEventListener(
        type: 'media-started-playing',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Emitted when media is paused or done playing.
     */
    addEventListener(type: 'media-paused', listener: (event: WebViewElement.Event) => void, useCapture?: boolean): void;
    /**
     * Emitted when a page's theme color changes. This is usually due to encountering a meta tag:
     * <meta name='theme-color' content='#ff0000'>
     */
    addEventListener(
        type: 'did-change-theme-color',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Emitted when DevTools is opened.
     */
    addEventListener(
        type: 'devtools-opened',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Emitted when DevTools is closed.
     */
    addEventListener(
        type: 'devtools-closed',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    /**
     * Emitted when DevTools is focused / opened.
     */
    addEventListener(
        type: 'devtools-focused',
        listener: (event: WebViewElement.Event) => void,
        useCapture?: boolean
    ): void;
    addEventListener(type: string, listener: (event: WebViewElement.Event) => void, useCapture?: boolean): void;
}

namespace WebViewElement {
    type Event = ElectronPrivate.GlobalEvent;

    interface LoadCommitEvent extends Event {
        url: string;
        isMainFrame: boolean;
    }

    interface DidFailLoadEvent extends Event {
        errorCode: number;
        errorDescription: string;
        validatedURL: string;
        isMainFrame: boolean;
    }

    interface DidFrameFinishLoadEvent extends Event {
        isMainFrame: boolean;
    }

    interface DidGetResponseDetails extends Event {
        status: boolean;
        newURL: string;
        originalURL: string;
        httpResponseCode: number;
        requestMethod: string;
        referrer: string;
        headers: Headers;
        resourceType: string;
    }

    interface DidGetRedirectRequestEvent extends Event {
        oldURL: string;
        newURL: string;
        isMainFrame: boolean;
        httpResponseCode: number;
        requestMethod: string;
        referrer: string;
        headers: Headers;
    }

    interface PageTitleUpdatedEvent extends Event {
        title: string;
        explicitSet: string;
    }

    interface PageFaviconUpdatedEvent extends Event {
        favicons: string[];
    }

    interface ConsoleMessageEvent extends Event {
        level: number;
        message: string;
        line: number;
        sourceId: string;
    }

    interface FoundInPageEvent extends Event {
        result: FoundInPageResult;
    }

    interface NewWindowEvent extends Event {
        url: string;
        frameName: string;
        disposition: NewWindowDisposition;
        options: BrowserWindowOptions;
    }

    interface NavigateEvent extends Event {
        url: string;
    }

    interface IpcMessageEvent extends Event {
        channel: string;
        args: any[];
    }

    interface PluginCrashedEvent extends Event {
        name: string;
        version: string;
    }
}

interface Document {
    createElement(tagName: 'webview'): Electron.WebViewElement;
}
