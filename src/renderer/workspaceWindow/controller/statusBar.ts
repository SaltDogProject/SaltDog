import { noop } from 'lodash';
import { ref } from 'vue';
import SaltDogMessageChannelRenderer from './messageChannel';
import MarkdownIt from 'markdown-it';
enum StatusBarAlignment {
    Right = 1,
    Left = 0,
}
interface IStatusBarItem {
    alignment: StatusBarAlignment;
    backgroundColor?: string;
    color?: string;
    command?: string;
    id: string;
    name?: string;
    priority?: number;
    text: string;
    tooltip?: string;
}
class StatusBarManager {
    private _mdParser = new MarkdownIt({
        html: true,
        breaks: false,
    }).use((mdit) => {
        mdit.normalizeLink = (link) => {
            if (link.startsWith('command:')) {
                return `saltdog://command/${link.substring('command:'.length)}`;
            } else {
                return `saltdog://command/saltdog.openExternal/${link}`;
            }
        };
    });
    private _parseIcons(markdown: string) {
        const a = markdown.match(/\$\(mdi-([\w-]+)\)/g) || [];
        for (const str of a) {
            markdown = markdown.replace(str, `<i class="mdi ${str.substring(2, str.length - 1)}"></i>`);
        }
        return markdown;
    }
    private _leftStatusBar = ref<IStatusBarItem[]>([
        {
            alignment: StatusBarAlignment.Left,
            id: 'test',
            command: 'aaa',
            text: this._parseIcons('$(mdi-star) 准备就绪'),
            priority: 1,
            tooltip: this._mdParser.render(
                this._parseIcons(
                    '## 说明 \n 这里是支持Markdown格式的 \n 您可以在这里添加您的提示消息 \n - 放置一个列表 \n\n 或者一个图标: $(mdi-star) \n\n 甚至一个链接: [SaltDog](https://www.saltdog.cn)'
                )
            ),
        },
    ]);
    constructor() {
        noop();
    }
    public getLeftStatusBarRef() {
        return this._leftStatusBar;
    }
    public getRightStatusBarRef() {
        return this._leftStatusBar;
    }
}
export default new StatusBarManager();
