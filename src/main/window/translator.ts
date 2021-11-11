import puppeteer from 'puppeteer';
export let translatePage: puppeteer.Page;
export let browser: puppeteer.Browser;
export function openTranslateWeb(): void {
    (async () => {
        browser = await puppeteer.launch({
            executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
            headless: false,
            defaultViewport: null,
        });
        translatePage = await browser.newPage();
        await translatePage.goto('https://translate.google.cn');
    })();
}
export function closeBrowser(): void {
    (async () => {
        await browser.close();
    })();
}
export function doTranslate(str: string): void {
    translatePage.goto(`https://translate.google.cn/?sl=auto&tl=zh-CN&text=${encodeURI(str)}&op=translate`);
}
