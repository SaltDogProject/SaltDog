import { saltDogApp } from '~/main/app';
import { app } from 'electron';
import fs from 'fs';
import { deleteFolder, copyFolder } from './utils/fs';
import path from 'path';
const isDevelopment = process.env.NODE_ENV === 'development';
// if (isDevelopment) {
//     // FIXME:自动注入测试插件
//     if (fs.existsSync(`${app.getPath('userData')}\\SaltDogPlugins\\saltdogplugin_demo`))
//         deleteFolder(`${app.getPath('userData')}\\SaltDogPlugins\\saltdogplugin_demo`);
//     copyFolder(
//         '../plugin_demo/saltdogplugin_demo',
//         `${app.getPath('userData')}\\SaltDogPlugins\\saltdogplugin_demo`,
//         true
//     );
// }
saltDogApp.launchApp();
