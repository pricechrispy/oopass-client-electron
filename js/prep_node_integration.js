
// https://electronjs.org/docs/faq#i-can-not-use-jqueryrequirejsmeteorangularjs-in-electron

window.nodeRequire = require;

delete window.require;
delete window.exports;
delete window.module;
