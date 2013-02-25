var fs = require('fs'),
    Path = require("path");
var util = require('./models/ssnau').util;
var args = util.getArgs();

var root = args[0];
var container = [],
    ignoreList = [".git", /(gif|jpg|png|bmp|\d|~)$/i];

util.traverseFolder(root, {"ignore": ignoreList}, function(path){
    var baseName = Path.basename(path);
    var relative = Path.relative(root, path);
    if (!container[baseName]) {
        container[baseName] = [];
    }
    container[baseName].push(relative);
});

var result = [];
util.eachProp(container, function(val, prop){
    var isMutil = val.length > 1;
    result.push(prop);
    isMutil && result.push("*start multi*");
    val.forEach(function(v) {
        result.push("[Path]" + v);
    });
    isMutil && result.push("*end multi*");
});

util.saveToFile("tmp/file_path", result.join("\r\n"));