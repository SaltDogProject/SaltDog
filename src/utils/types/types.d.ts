interface IAppNotification {
    title: string;
    body: string;
    icon?: string;
}
declare const __static: string;

abstract class SaltDogMessageChannelRenderer {
    abstract invoke(api: string, args: any, callback: (data: any) => void):void;
    abstract invokeMain(api: string, args: any, callback: (data: any) => void):void;
    abstract invokeMainSync(api: string, args: any, callback: (data: any) => void):void;
    abstract on(api: string, args:any,callback: (data: any) => void):void;
    abstract publish(event: string, ...args:any):void;
    abstract subscribe(event: string, callback: (...args: any) => void):void;
}

