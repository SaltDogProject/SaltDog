import * as saltdog from 'saltdog';
import { normalizeAppend } from './formatter.js';
import { google_translate } from './google_translate.js';
export function activate() {
    saltdog.commands.registerCommand('translate.translateNow', (text: string) => {
        google_translate(text).then((res) => {
            if (!res || res.error) {
                //saltdog.send('translate_error', res.error);
            } else {
                //saltdog.send('translate_result', res);
            }
        });
    });
    const sidebar = saltdog.sidebar.getSidebarView('SaltDogTranslate.translateView');
    if (!sidebar) {
        console.error(`sidebar not exist`);
    }
    saltdog.reader.onTextSelect((txt: string) => {
        if (txt.trim().length == 0) return;
        const text = normalizeAppend(txt);
        sidebar!.send('translate_getText', txt);
        if (text && text.trim().length != 0)
            google_translate(text).then((res) => {
                if (!res || res.error) {
                    sidebar!.send('translate_error', res.error);
                } else {
                    sidebar!.send('translate_result', res);
                }
            });
    });
    sidebar!.onVisibilityChange('open', () => {
        console.log('SaltDogTranslate.translateView open');
    });
    sidebar!.onVisibilityChange('close', () => {
        console.log('SaltDogTranslate.translateView closed');
    });
}
export function deactivate() {
    console.log('deactivate');
}
