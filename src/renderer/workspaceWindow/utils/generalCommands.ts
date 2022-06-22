import { ElMessageBox } from 'element-plus';
import SaltDogMessageChannelRenderer from '../controller/messageChannel';
import { openExternal } from './external';
import MarkdownIt from 'markdown-it';
export default function initCommandListener() {
    SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.openExternal', (url) => {
        openExternal(url);
    });
    SaltDogMessageChannelRenderer.getInstance().onInvoke('_askUpdateDownload', (info) => {
        console.log(info);
        return new Promise((resolve, reject) => {
            const _mdParser = new MarkdownIt({
                html: true,
                breaks: false,
            });
            ElMessageBox.alert(
                `<div style="font-size: var(--el-messagebox-content-font-size);color:var(--el-messagebox-content-color)"><div>版本号：${
                    info.version
                }</div><div>发布日期：${new Date(info.releaseDate).toLocaleString()}</div><div>` +
                    _mdParser.render('该版本的改进有: \n - 修复了若干问题 \n - 新增了若干功能') +
                    '</div></div>',
                'HTML String',
                {
                    title: '发现新版本★~★',
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
}
