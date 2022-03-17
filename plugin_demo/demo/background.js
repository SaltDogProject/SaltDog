function activate(saltdog){
    saltdog.on('ping',()=>{
        console.log("receive ping");
    })
    saltdog.createWebview({
        url:"https://scholar.google.com",
        title:"谷歌学术插件"
    },(webview)=>{ //webviewAgent
        webview.on('dom-ready',(data)=>{
            console.log('domReady!!!',data);
        });
        webview.on('will-navigate',(data)=>{
            console.log('navigate!!!',data);
        })
        setInterval(()=>{webview.goBack([],()=>{console.log('go back ok!')})},10000);
    });
}

module.exports = {
    activate
}