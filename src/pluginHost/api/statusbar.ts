import SaltDogMessageChannelRenderer from '../messageChannel';
import { StatusBarAlignment } from './enum';
const statusbarMap = new Map();
class StatusBar {
    private _id: string | null = null;
    private _alignment = StatusBarAlignment.Right;
    private _command: string | null = null;
    private _text: string | null = null;
    private _priority = 0;
    private _tooltip: string | null = null;
    private _color: string | null = null;
    private _backgroundColor: string | null = null;
    private _show = false;
    private _created = false;

    constructor(id: string, alignment?: StatusBarAlignment, priority?: number) {
        this._id = id;
        if (alignment == StatusBarAlignment.Left || alignment == StatusBarAlignment.Right) {
            this._alignment = alignment;
        }
        if (typeof priority === 'number') {
            this._priority = priority;
        }
        // 等一会儿，不知道Electron的ipc是否保证有序，有可能还没创建就进行了一堆prop设置就g了。
        setTimeout(() => {
            SaltDogMessageChannelRenderer.getInstance().publish(`statusbar.createStatusBarItem`, {
                id: this._id,
                alignment: this._alignment,
                command: this.command,
                text: this._text,
                color: this._color,
                backgroundColor: this._backgroundColor,
                priority: this._priority,
                tooltip: this._tooltip,
                show: this._show,
            });
            this._created = true;
        }, 100);
    }

    public get alignment(): StatusBarAlignment {
        return this._alignment;
    }

    public set alignment(v: StatusBarAlignment) {
        throw new Error(`StatusBarItem.alignment cannot reset after created.`);
    }

    public get command(): string | null {
        return this._command;
    }

    public set command(v: string | null) {
        this._command = v;
        if (this._created)
            SaltDogMessageChannelRenderer.getInstance().publish(`statusbar.fieldChange`, this._id, 'command', v);
    }

    public get id(): string {
        return this._id as string;
    }

    public set id(v: string) {
        throw new Error(`StatusBarItem.id cannot reset after created.`);
    }

    public get text(): string {
        return this._text as string;
    }

    public set text(v: string) {
        this._text = v;
        if (this._created)
            SaltDogMessageChannelRenderer.getInstance().publish(`statusbar.fieldChange`, this._id, 'text', v);
    }

    public get priority(): number {
        return this._priority;
    }

    public set priority(v: number) {
        throw new Error(`StatusBarItem.priority cannot reset after created.`);
    }

    public set tooltip(v: string | null) {
        this._tooltip = v;
        if (this._created)
            SaltDogMessageChannelRenderer.getInstance().publish(`statusbar.fieldChange`, this._id, 'tooltip', v);
    }

    public get tooltip(): string | null {
        return this._tooltip;
    }

    public set color(v: string | null) {
        this._color = v;
        if (this._created)
            SaltDogMessageChannelRenderer.getInstance().publish(`statusbar.fieldChange`, this._id, 'color', v);
    }

    public get color(): string | null {
        return this._color;
    }
    public set backgroundColor(v: string | null) {
        this._backgroundColor = v;
        if (this._created)
            SaltDogMessageChannelRenderer.getInstance().publish(
                `statusbar.fieldChange`,
                this._id,
                'backgroundColor',
                v
            );
    }

    public get backgroundColor(): string | null {
        return this._backgroundColor;
    }
    public show() {
        this._show = true;
        if (this._created)
            SaltDogMessageChannelRenderer.getInstance().publish(`statusbar.fieldChange`, this._id, 'show', true);
    }
    public hide() {
        this._show = false;
        if (this._created)
            SaltDogMessageChannelRenderer.getInstance().publish(`statusbar.fieldChange`, this._id, 'show', false);
    }
}

function createStatusBarItem(id: string, alignment?: StatusBarAlignment, priority?: number): StatusBar {
    if (!id || typeof id !== 'string') {
        throw new Error(`StatusBarItem.id must provide a string`);
    }
    if (statusbarMap.has(id)) {
        throw new Error(`StatusBarItem.id already exist`);
    }
    const item = new StatusBar(id, alignment, priority);
    statusbarMap.set(id, true);
    return item;
}

export default { createStatusBarItem };
