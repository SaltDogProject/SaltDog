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
    saltdog.reader.onTextSelect((text: string) => {
        console.log(`onTextSelect`, text);
        google_translate(text).then((res) => {
            console.log(res);
        });
    });
}
export function deactivate() {
    console.log('deactivate');
}
