import * as saltdog from 'saltdog';
export function activate(){
    saltdog.commands.registerCommand('translate.translateNow', (text: string) => {
        console.log(text);
    });
}
export function deactivate(){
    console.log('deactivate');
}