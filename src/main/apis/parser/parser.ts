import { resolve } from "path";
import {ChildProcess, fork} from 'child_process';
import got from 'got';
const TAG = '[Main/parser]'

export default class Parser {
    private static _instance: Parser|null=null;
    private _isDev = process.env.NODE_ENV === 'development';
    private _serverPath = this._isDev?resolve(__static,'../third_party/translation-server/src/server.js'):'';
    private _server:ChildProcess|null=null;
    public isServerReady = false;
    private _serverPort = 1969;
    private _pendingQuery:any= {};

    private _initConfig = {
        "allowedOrigins": [], // CORS
        "blacklistedDomains": [],
        "deproxifyURLs": false, // Automatically try deproxified versions of URLs
        "identifierSearchLambda": "", // Identifier search Lambda function for text search
        "port": this._serverPort,
        "host": "0.0.0.0", // host to listen on
        "httpMaxResponseSize": 10, // Max size of requested response to load; triggers 400 ResponseSize error when exceeded
        "textSearchTimeout": 5,
        "translators": {
            "CrossrefREST.email": "service@saltdog.cn" // Pass an email to Crossref REST API to utilize the faster servers pool
        },
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/61.0 SaltDog/1.0",
        "translatorsDirectory": this._isDev?resolve(__static,'../third_party/translation-server/modules/translators'):'',
    };
    private constructor() {
        console.log(TAG,`Init Parser in ${this._serverPath}`);
        const worker = fork(this._serverPath,{});
        this._server = worker;
        worker.send({
            type: 'init',
            data: this._initConfig
        });
        worker.on('message', (message:any) => {
            if(message.type === 'ready'){
              console.log(TAG,'Receive server ready');
              for(const i in this._pendingQuery){
                this._pendingQuery[i]();
              };
              delete this._pendingQuery;
              this.isServerReady = true;
            }
          });
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new Parser();
        }
        return this._instance;
    }
    public _query(type:'import'|'web'|'export'|'search',data:string){
        console.log(TAG,`Execute query ${type} with payload: ${data}`);
        return new Promise((resolve,reject)=>{
          try{import('got').then(
            got=>{
            const url =  `http://127.0.0.1:${this._serverPort}/${type}`;
            got.default.post(url,{
              headers:{
                'Content-Type':'text/plain'
              },
              body:data
            }).json().then(res=>{
              resolve(res);
            });
          })}catch(e){
            reject(e);
          }
        });
    }
    public query(type:'import'|'web'|'export'|'search',data:string,callback:any){
            if(this.isServerReady){
              this._query(type,data).then(data=>{
                callback(data);
              });
            }else{
              this._pendingQuery.push(()=>{
                this._query(type,data).then(data=>{
                  callback(data);
                });
              })
            }
    }
}