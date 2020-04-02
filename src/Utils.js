"use strict";

class Utils {

    static setImmediatePromise() {
        return new Promise((resolve) => {
            setImmediate(() => resolve());
        });
    }

}

module.exports = Utils;