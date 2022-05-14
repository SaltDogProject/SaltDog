"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const saltdog = __importStar(require("saltdog"));
const formatter_js_1 = require("./formatter.js");
const google_translate_js_1 = require("./google_translate.js");
function activate() {
    saltdog.commands.registerCommand('translate.translateNow', (text) => {
        (0, google_translate_js_1.google_translate)(text).then((res) => {
            if (!res || res.error) {
                //saltdog.send('translate_error', res.error);
            }
            else {
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
    saltdog.reader.onTextSelect((txt) => {
        if (txt.trim().length == 0)
            return;
        statusbar.text = '$(mdi-autorenew) 正在翻译~';
        statusbar.backgroundColor = '#409EFF';
        statusbar.tooltip = `## 原文 \n ${txt}`;
        const text = (0, formatter_js_1.normalizeAppend)(txt);
        sidebar.send('translate_getText', txt);
        if (text && text.trim().length != 0)
            (0, google_translate_js_1.google_translate)(text).then((res) => {
                if (!res || res.error) {
                    sidebar.send('translate_error', res.error);
                }
                else {
                    let restxt = '';
                    for (const a of res.sentences) {
                        if (a.trans)
                            restxt += a.trans;
                    }
                    statusbar.text = '$(mdi-check-all) 翻译完成';
                    statusbar.backgroundColor = '#67C23A';
                    statusbar.tooltip = `## 原文 \n ${txt} \n ## 译文 \n ${restxt}`;
                    sidebar.send('translate_result', res);
                }
            });
    });
    sidebar.onVisibilityChange('open', () => {
        console.log('SaltDogTranslate.translateView open');
    });
    sidebar.onVisibilityChange('close', () => {
        console.log('SaltDogTranslate.translateView closed');
    });
}
exports.activate = activate;
function deactivate() {
    console.log('deactivate');
}
exports.deactivate = deactivate;
