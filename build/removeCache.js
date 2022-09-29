const fs = require('fs');
const path = require('path');
if (fs.existsSync('extraResources/translators/_cacheMeta.json')) {
    fs.unlinkSync('extraResources/translators/_cacheMeta.json');
}
if (fs.existsSync('../extraResources/translators/_cacheMeta.json')) {
    fs.unlinkSync('../extraResources/translators/_cacheMeta.json');
}
