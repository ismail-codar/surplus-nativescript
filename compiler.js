const fs = require("fs")
const path = require("path")
const watch = require('watch')
const glob = require("glob")
const sp = require("surplus-preprocessor")
const ts = require("typescript")

const nativeComponents = [
    "AbsoluteLayout",
    "ActivityIndicator",
    "Border",
    "Button",
    "ContentView",
    "DatePicker",
    "DockLayout",
    "GridLayout",
    "HtmlView",
    "Image",
    "img",
    "Label",
    "ListPicker",
    "ListView",
    "Page",
    "Placeholder",
    "Progress",
    "ProxyViewContainer",
    "Repeater",
    "ScrollView",
    "SearchBar",
    "SegmentedBar",
    "SegmentedBarItem",
    "Slider",
    "StackLayout",
    "FlexboxLayout",
    "Switch",
    "TabView",
    "TextField",
    "TextView",
    "TimePicker",
    "WebView",
    "WrapLayout",
    "FormattedString",
    "Span",
    "DetachedContainer",
    "View"]
let tsOptions = null
let appFolder = "app"
let projectRootDir = null

const loadTsOptions = () => {
    const tsconfigPath = path.join(projectRootDir, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
        throw Error('tsconfig.json file not found in project.');
    }
    tsOptions = JSON.parse(fs.readFileSync(tsconfigPath))
}

const compileFile = (f, callback) => {
    const ext = f.substr(f.indexOf("."))
    if (ext.startsWith(".ts") == false)
        return callback && callback()
    if (tsOptions == null)
        loadTsOptions()
    console.log("COMPILING " + f)
    fs.readFile(f, (err, data) => {
        if (err)
            return callback && callback()
        let code = data.toString()
        try {
            if (ext == ".tsx") {
                nativeComponents.forEach((componentName) => {
                    const newName = componentName[0].toLowerCase() + componentName.substr(1)
                    code = code.replace(new RegExp("<" + componentName, "g"), "<" + newName).replace(new RegExp(componentName + ">", "g"), newName + ">")
                })
                code = sp.preprocess(code)
                if (code.indexOf(" Surplus = ") == -1)
                    code += '\nvar Surplus = require("surplus");'
            }
            code = ts.transpileModule(code, { tsOptions }).outputText

            const newFilePath = f.substr(0, f.lastIndexOf(".")) + ".js"
            fs.writeFile(newFilePath, code, callback && callback)
            console.log("COMPILED " + newFilePath)
        } catch (e) {
            console.log(code)
            console.log(e)
            callback && callback()
        }
    })
}

const compileProject = (projectDir) => {
    projectRootDir = projectDir
    return new Promise(function (resolve, reject) {
        glob(path.join(projectDir, appFolder, "**/*.ts*"), (err, files) => {
            let count = 0;
            files.forEach((file) => {
                compileFile(file, function () {
                    count++;
                    if (count == files.length) {
                        resolve()
                    }
                })
            })
        });
    })
}

const watchProject = (projectDir) => {
    projectRootDir = projectDir
    return new Promise(function (resolve, reject) {
        watch.createMonitor(path.join(projectDir, appFolder), function (monitor) {
            monitor.on("created", function (f, stat) {
                compileFile(f, resolve)
            });
            monitor.on("changed", function (f, curr, prev) {
                compileFile(f, resolve)
            });
        });
    })
}

module.exports = {
    setProjectRootDir: function (dir, app_folder) {
        projectRootDir = dir
        if (app_folder)
            appFolder = app_folder
    },
    compileFile: compileFile,
    compileProject: compileProject,
    watchProject: watchProject
}
