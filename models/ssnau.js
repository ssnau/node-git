var fs = require("fs"),
    Path = require("path");

var util = {};
util.getArgs = function () {
    var args = process.argv;
    return args.slice(2);
}
util.isFunction = function (obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}
/**
 * Usage: util.eachProp(obj, function(propVal, propName){....});
 * @param obj
 * @param fn
 */
util.eachProp = function (obj, fn) {
    var prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (fn(obj[prop], prop)) {
                break;
            }
        }
    }
}
/**
 * Simple function to mix in properties from source into target,
 * but only if target does not already have a property of the same name.
 * force表示是否强制覆盖，如果设置为true,则无论target是否已经有这个属性都会被source覆盖
 * deepStringMixin表示是否是深度拷贝，如果为true，则进行递归深拷贝
 */
util.mixin = function (target, source, force, deepStringMixin) {
    if (source) {
        util.eachProp(source, function (value, prop) {
            //如果target没有prop这个属性或force设置设true
            if (force || !hasProp(target, prop)) {
                //判断是否是深拷贝
                if (deepStringMixin && typeof value !== 'string') {
                    if (!target[prop]) {
                        target[prop] = {};
                    }
                    mixin(target[prop], value, force, deepStringMixin);
                } else {
                    target[prop] = value;
                }
            }
        });
    }
    return target;
}

/**
 *
 * @param root   String
 * @param config Object
 * @param f      Function
 */
util.traverseFolder = function (root, config, f) {
    //if only two parameters here, and config is a function
    if (util.isFunction(config)) {
        f = config;
        config = null;
    }
    //setup config
    config = util.mixin({
        "ignore":[]
    }, config, true);
    // if root does not exists, end
    if (!exists(root)) {
        console.log("root is not found!");
        return false;
    }

    //start traversing
    traverse(root);

    function traverse(path) {
        console.log("looking " + path);
        if (!exists(path)) {
            console.log("path not found!");
            return;
        }

        if (isDir(path)) {
            var subPaths = fs.readdirSync(path);
            subPaths.forEach(function (v, index) {
                var curPath = Path.resolve(path, v);
                if (config.ignore.indexOf(v) > -1) {
                    console.log("ignoring " + curPath);
                    return;
                }

                traverse(curPath);
            });
        }

        if (isFile(path)) {
            f(path);
        }

    }

    function isDir(path) {
        return fs.lstatSync(path).isDirectory();
    }

    function isFile(path) {
        return fs.lstatSync(path).isFile();
    }

    function exists(path) {
        return fs.existsSync(path)
    }
}
/**
 * 将数据存入相对于main文件的filename路径
 * 若目标文件或文件夹不存在，则递归创建之
 * @param  {[type]} filename 文件路径,如"a/b/c"会处理为[main所在位置]/a/b/c
 * @param  {[type]} data     内容
 * @param  {[type]} encode   默认为"utf8"
 * @return {[type]}          [description]
 */
util.saveToFile = function (filename, data, encode) {
    encode = encode || "utf8";
    //获得主文件所在目录
    main_folder_path = Path.dirname(require.main.filename);
    filename = Path.join(main_folder_path, filename);
    parent_path = Path.resolve(filename, '..');
    //判断其父路径是否存在, 若不存在，则创建之
    if (!fs.existsSync(parent_path)) {
        util.createFolderRecursively(parent_path);
    }

    fs.writeFileSync(filename, data, encode);
}
/**
 * 读入完整绝对路径，如"Z:\\dev\\lang\\hello"
 * 递归创建文件夹
 * @param  {[type]} filename 完整绝对路径
 * @return {[type]}
 */
util.createFolderRecursively = function (filename) {
    file_path_array = filename.split(Path.sep);
    if (!file_path_array.length) return;
    tmpPath = file_path_array.shift();

    while (true) {
        if (fs.existsSync(tmpPath)) {
            if (!file_path_array.length) break;
            tmpPath = Path.join(tmpPath, file_path_array.shift());
        } else {
            fs.mkdirSync(tmpPath);
            console.log("create folder: " + tmpPath);
        }
    }
}
exports.util = util;