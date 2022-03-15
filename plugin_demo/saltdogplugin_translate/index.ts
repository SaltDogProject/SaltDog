function activate(saltdog){
    console.log('activate');
}
function deactivate(saltdog){
    console.log('deactivate');
}
activate(null);
module.exports = {
    activate,
    deactivate
}