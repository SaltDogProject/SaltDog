import { ElMessageBox, ElNotification } from 'element-plus';
import SaltDogMessageChannelRenderer from './controller/messageChannel';
import MarkdownIt from 'markdown-it';

export function initWorkspace() {
    SaltDogMessageChannelRenderer.getInstance().onInvoke('update._askUpdateDownload', (info) => {
        return new Promise((resolve, reject) => {
            const _mdParser = new MarkdownIt({
                html: true,
                breaks: false,
            });
            ElMessageBox.alert(
                `<div style="font-size: var(--el-messagebox-content-font-size);color:var(--el-messagebox-content-color)"><div>版本号：${
                    info.version
                }</div><div>发布日期：${new Date(info.releaseDate).toLocaleString()}</div><div>` +
                    _mdParser.render(info.releaseNote.replace('\\\\', '\\')) +
                    '</div></div>',
                'HTML String',
                {
                    title: '发现新版本',
                    dangerouslyUseHTMLString: true,
                    confirmButtonText: '立即更新',
                    cancelButtonText: '暂不更新',
                }
            )
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    });
    SaltDogMessageChannelRenderer.getInstance().on('update._updateError', (msg) => {
        ElNotification({
            title: '更新出错TAT',
            message: '更新时出错啦:' + msg + '请稍后重试',
            type: 'error',
        });
    });
    SaltDogMessageChannelRenderer.getInstance().onInvoke('update._askUpdateInstall', (info) => {
        return new Promise((resolve, reject) => {
            ElMessageBox.confirm('更新准备好啦，是否立刻安装？点击否则会在软件关闭时尝试安装。', '更新下载完成', {
                confirmButtonText: '立即安装',
                cancelButtonText: '暂不安装',
            })
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    });
}
