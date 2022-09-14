import log from 'electron-log';
import { Method, Options } from 'got-cjs';
import { HttpsProxyAgent, HttpProxyAgent } from 'hpagent';
import sysCfg from '../apis/db/index';
import { extend, throttle } from 'lodash';

const TAG = '[Utils/Network]';
export function getGotOptions(url: URL | string, options?: any) {
    if (typeof url == 'string') url = new URL(url);
    let defaultOptions: any = {
        url,
        method: 'GET' as Method,
        headers: {
            'user-agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            // referer: url.protocol + '//' + url.hostname,
        },
        // isStream: true,
    };
    if (sysCfg.get('preferences.allowNetworkProxy')) {
        log.debug(TAG, 'Using proxy.');
        const httpsProxy = sysCfg.get('preferences.httpsProxyAddress') || null;
        const httpProxy = sysCfg.get('preferences.httpProxyAddress') || null;
        if (url.protocol === 'https:' && httpsProxy) {
            log.debug(TAG, 'Using https proxy.', httpsProxy);
            defaultOptions.agent = {
                https: new HttpsProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo',
                    proxy: httpsProxy,
                }),
            };
        } else if (url.protocol === 'http:' && httpProxy) {
            log.debug(TAG, 'Using http proxy.', httpsProxy);
            defaultOptions.agent = {
                http: new HttpProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo',
                    proxy: httpProxy,
                }),
            };
        }
    }
    if (options) {
        defaultOptions = extend(defaultOptions, options);
    }
    return defaultOptions;
}
