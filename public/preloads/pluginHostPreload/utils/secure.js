function internalPluginName(name) {
    let pattern = new RegExp("[`~%!@#^=''?~《》！@#￥……&——‘”“'？*()（），,。.、<>]");
    let rs = '';
    for (let i = 0; i < name.length && name[i] !== ' '; i++) {
        rs += name.substr(i, 1).replace(pattern, '');
    }
    return rs;
}
module.exports = {
    internalPluginName,
};
