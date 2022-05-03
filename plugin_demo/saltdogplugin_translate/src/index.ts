import * as saltdog from 'saltdog';
import { normalizeAppend } from './formatter.js';
import { google_translate } from './google_translate.js';
export function activate() {
    // saltdog.commands.registerCommand('translate.translateNow', (text: string) => {
    //     google_translate(text).then((res) => {
    //         if (!res || res.error) {
    //             //saltdog.send('translate_error', res.error);
    //         } else {
    //             //saltdog.send('translate_result', res);
    //         }
    //     });
    // });
    // saltdog.sidebar.on('SaltDogTranslate.translateView', 'panelOpen', (...args) => {
    //     console.log('panelOpen', ...args);
    //     console.log('isOpen', saltdog.sidebar.isOpen('SaltDogTranslate.translateView'));
    // });
    // saltdog.reader.onTextSelect((text: string) => {
    //     console.log(`onTextSelect`, text);
    //     google_translate(text).then((res) => {
    //         console.log(res);
    //     });
    // });
    saltdog.reader.onTextSelect((txt: string) => {
        if (txt.trim().length == 0) return;
        const text = normalizeAppend(txt);
        saltdog.sidebar.send('SaltDogTranslate.translateView', 'translate_getText', txt);
        if (text && text.trim().length != 0)
            google_translate(text).then((res) => {
                if (!res || res.error) {
                    saltdog.sidebar.send('SaltDogTranslate.translateView', 'translate_error', res.error);
                } else {
                    saltdog.sidebar.send('SaltDogTranslate.translateView', 'translate_result', res);
                }
            });
    });
    saltdog.sidebar.onVisibilityChange('SaltDogTranslate.translateView', 'open', () => {
        console.log('SaltDogTranslate.translateView open');
    });
    saltdog.sidebar.onVisibilityChange('SaltDogTranslate.translateView', 'close', () => {
        console.log('SaltDogTranslate.translateView closed');
    });
}
export function deactivate() {
    console.log('deactivate');
}
