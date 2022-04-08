module.exports = function (fn) {
    if (typeof fn != 'function') return;
    return function (args = {}, callback) {
        if (callback && typeof callback == 'function') {
            fn(args, callback);
        } else
            return new Promise((resolve, reject) => {
                try {
                    fn(args, (data) => {
                        resolve(data);
                    });
                } catch (e) {
                    reject(e);
                }
            });
    };
};
