module.exports = {
    "extends": "eslint:recommended",
    "env": {
        "es6": true,
        "amd": true,
        "browser": true,
        "node": true
    },
    "rules": {
        "semi": "error",
        "no-console": "off"
    },
    "globals": {
        "io": "readonly",
        "Vue": "readonly"
    }
};