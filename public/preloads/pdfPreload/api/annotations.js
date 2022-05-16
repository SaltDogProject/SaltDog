const saveAnnotations = function (args, callback) {
    callback({
        documentId: window._documentId,
        annotations: window._annotations,
    });
};

module.exports = { saveAnnotations };
