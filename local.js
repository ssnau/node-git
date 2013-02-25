var fs = require('fs'),
    Path = require("path");
var util = require('./models/ssnau').util;
var args = util.getArgs();

var root = args[0];
var container = [];
util.traverseFolder(root, {"ignore": [".git"]}, function(path){
    var baseName = Path.basename(path);
    if (!container[baseName]) {
        container[baseName] = [];
    }
    container[baseName].push(path);
});

var result = [];
util.eachProp(container, function(val, prop){
    result.push(prop);
    if (val.length > 1) result.push("*multi*");
    val.forEach(function(v) {
        result.push("[Path]" + v);
    })
});

util.saveToFile("tmp/file_path", result.join("\r\n"));