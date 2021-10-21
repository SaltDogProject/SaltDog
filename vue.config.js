const path = require('path')
function resolve (dir) {
  return path.join(__dirname, dir)
}
const arch = process.argv.includes('--ia32') ? 'ia32' : 'x64';
const config = {
  configureWebpack: {
    // FIXME: debug mode
    devtool: 'cheap-module-eval-source-map'
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src/renderer'))
      .set('~', resolve('src'))
      .set('root', resolve('./'))
  },
    pluginOptions: {
      electronBuilder: {
        customFileProtocol: 'saltdog://./',
      externals: ['saltdog'],
      chainWebpackMainProcess: config => {
        config.resolve.alias
          .set('@', resolve('src/renderer'))
          .set('~', resolve('src'))
          .set('root', resolve('./'))
      },
        mainProcessFile: 'src/background.ts',
        outputDir: 'saltdog_electron',
        nodeIntegration: true,
        builderOptions: {
          appId: 'top.lgyserver.saltdog',
          productName: 'SaltDog',
          copyright: 'Copyright © 2021 Dorapocket',
          publish: [
            {
              provider: 'github',
              owner: 'Dorapocket',
              repo: 'SaltDog',
              // FIXME: beta
              releaseType: 'beta'
            }
          ],
          directories: {
            output: './saltdog_dist',
          },
          // FIXME: icons
          dmg: {
            contents: [
              {
                x: 410,
                y: 150,
                type: 'link',
                path: '/Applications'
              },
              {
                x: 130,
                y: 150,
                type: 'file'
              }
            ]
          },
          mac: {
            icon: 'build/icons/icon.icns',
            extendInfo: {
              LSUIElement: 1
            }
          },
          win: {
            icon: './electron/ico/install 256x256.ico',
            artifactName: `SaltDog Setup \${version}-${arch}.exe`,
            target: [
              {
                target: 'nsis',
                arch: [arch],
              },
            ],
          },
          nsis: {
            // https://www.jianshu.com/p/1701baa240fd
            oneClick: false,
            perMachine: true,
            allowElevation: true,
            allowToChangeInstallationDirectory: true,
            installerIcon: './electron/ico/install 256x256.ico',
            uninstallerIcon: './electron/ico/uninstall 256x256.ico',
            installerHeaderIcon: './electron/ico/install 256x256.ico',
            createDesktopShortcut: true,
            createStartMenuShortcut: true,
            shortcutName: 'SaltDog',
          },
          linux: {
            icon: 'build/icons/'
          },
          snap: {
            publish: ['github']
          }
        },
      },
    },
  }
  if (process.env.NODE_ENV === 'development') {
    config.configureWebpack = {
      devtool: 'source-map'
    }
    // for dev main process hot reload
    config.pluginOptions.electronBuilder.mainProcessWatch = ['src/main/**/*']
  }
  module.exports={
    ...config
  }