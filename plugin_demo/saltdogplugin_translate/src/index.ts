import { sample } from 'lodash';
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
    const statusbar = saltdog.statusbar.createStatusBarItem('translate', saltdog.StatusBarAlignment.Left, 0);
    statusbar.text = '$(mdi-star) 这里是翻译君~';
    statusbar.tooltip = '选中内容后悬停在此查看翻译！[haha](http://www.baidu.com)';
    statusbar.command = 'translate.translateNow';
    statusbar.color = 'white';
    statusbar.backgroundColor = '#409EFF';
    statusbar.show();

    const sidebar = saltdog.sidebar.getSidebarView('SaltDogTranslate.translateView');
    if (!sidebar) {
        console.error(`sidebar not exist`);
    }
    saltdog.reader.onTextSelect((txt: string) => {
        if (txt.trim().length == 0) return;
        statusbar.text = '$(mdi-autorenew) 正在翻译~';
        statusbar.backgroundColor = '#409EFF';
        statusbar.tooltip = `## 原文 \n ${txt}`;
        const text = normalizeAppend(txt);
        sidebar!.send('translate_getText', txt);
        if (text && text.trim().length != 0)
            google_translate(text).then((res) => {
                if (!res || res.error) {
                    sidebar!.send('translate_error', res.error);
                } else {
                    let restxt = '';
                    for (const a of res.sentences) {
                        if (a.trans) restxt += a.trans;
                    }
                    statusbar.text = '$(mdi-check-all) 翻译完成';
                    statusbar.backgroundColor = '#67C23A';
                    statusbar.tooltip = `## 原文 \n ${txt} \n ## 译文 \n ${restxt}`;
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
