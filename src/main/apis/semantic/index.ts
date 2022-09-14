import log from 'electron-log';
import got from 'got-cjs';
import { getGotOptions } from '~/main/utils/network';
import SaltDogMessageChannelMain from '../plugin/api/messageChannel';
const TAG = '[Main/SemanticScholarClient]';
const PAPER_API = 'https://api.semanticscholar.org/graph/v1/paper/';
export default class SemanticScholarClient {
    private _msgChannel = SaltDogMessageChannelMain.getInstance();
    constructor() {
        this._msgChannel.onInvoke('semantic.getPaperHashByDOI', async (doi) => {
            return await this.doi2hash(doi);
        });
        log.log(TAG, 'Initialized.');
    }
    static getInstance() {
        if (!SemanticScholarClient.instance) {
            SemanticScholarClient.instance = new SemanticScholarClient();
        }
        return SemanticScholarClient.instance;
    }
    static instance: SemanticScholarClient;
    // DOI to SemanticScholar paper hash
    public async doi2hash(doi: string) {
        try {
            const data: any = await got(
                getGotOptions(`${PAPER_API}DOI:${doi}`, {
                    searchParams: { fields: 'paperId' },
                })
            ).json();
            return data && data.paperId ? data.paperId : null;
        } catch (e) {
            log.error(e);
            return null;
        }
    }
}
