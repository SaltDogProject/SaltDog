import { noop } from 'lodash';
import { ref } from 'vue';
import SaltDogMessageChannelRenderer from './messageChannel';
import MarkdownIt from 'markdown-it';
const TAG = `[Renderer/StatusBar]`;
enum StatusBarAlignment {
    Right = 0,
    Left = 1,
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
        if (!markdown || typeof markdown !== 'string' || markdown.length == 0) return '';
        const a = markdown.match(/\$\(mdi-([\w-]+)\)/g) || [];
        for (const str of a) {
            markdown = markdown.replace(str, `<i class="mdi ${str.substring(2, str.length - 1)}"></i>`);
        }
        return markdown;
    }
    private _leftStatusBar = ref<IStatusBarItem[]>([]);
    private _rightStatusBar = ref<IStatusBarItem[]>([]);
    constructor() {
        SaltDogMessageChannelRenderer.getInstance().subscribe(
            'statusbar.createStatusBarItem',
            this.createStatusBarItem.bind(this)
        );
        SaltDogMessageChannelRenderer.getInstance().subscribe('statusbar.fieldChange', this._onfieldChange.bind(this));
    }
    public createStatusBarItem(obj: IStatusBarItem) {
        if (obj.alignment == StatusBarAlignment.Left) this._leftStatusBar.value.push(this._parseItem(obj));
        else if (obj.alignment == StatusBarAlignment.Right) this._rightStatusBar.value.push(this._parseItem(obj));
        else console.error(TAG, `Create item with wrong alignment ${obj.alignment}`);
    }
    private _parseItem(item: IStatusBarItem) {
        return {
            alignment: item.alignment || StatusBarAlignment.Right,
            id: item.id,
            command: item.command || '',
            text: this._parseIcons(item.text) || '',
            priority: item.priority || 0,
            tooltip: this._mdParser.render(this._parseIcons(item.tooltip || '')),
            color: item.color || '',
            backgroundColor: item.backgroundColor || '',
            show: item.show || false,
        };
    }
    private _onfieldChange(id: string, field: string, value: any) {
        let target = null;
        target =
            this._leftStatusBar.value.filter((item) => {
                return item.id === id;
            }) ||
            this._rightStatusBar.value.filter((item) => {
                return item.id === id;
            });
        console.log(TAG, 'fieldChange', id, field, value, target, target[field]);
        if (!target || !target[0] || typeof target !== 'object') {
            console.error(TAG, '_onfieldChange', `item ${id} not exist.`, field, value);
        }
        if (field === 'text') value = this._parseIcons(value);
        if (field === 'tooltip') value = this._mdParser.render(this._parseIcons(value || ''));
        target[0][field] = value;
    }
    public getLeftStatusBarRef() {
        return this._leftStatusBar;
    }
    public getRightStatusBarRef() {
        return this._rightStatusBar;
    }
}
export default new StatusBarManager();
