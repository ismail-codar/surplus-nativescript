const device = require("tns-core-modules/platform").device
const View = require("tns-core-modules/ui/core/view/view").View
const ViewUtil = require("./view-util")
const viewUtil = new ViewUtil(device)

const eventsMap = {
    button: ["tap"],
    textField: ["returnPress"]
    //TODO other component events...
}

global["Node"] = View

View.prototype.appendChild = function (child, index) {
    viewUtil.insertChild(this, child, index)
    child["parentNode"] = this
    return child
}

View.prototype.replaceChild = function (newChild, oldChild) {
    var index = this._subViews.indexOf(oldChild)
    this.appendChild(newChild, index)
    viewUtil.removeChild(this, oldChild)
    return this
}

View.prototype.insertBefore = function (newChild, oldChild) {
    var index = this._subViews.indexOf(oldChild)
    return this.appendChild(newChild, index)
}

Object.defineProperty(View.prototype, "nextSibling", {
    get: function nextSibling() {
        if (this.parentNode) {
            const parentNodes = this.parentNode._subViews;
            return parentNodes[parentNodes.indexOf(this) + 1] || null;
        }
        return null;
    }
})

Object.defineProperty(View.prototype, "previousSibling", {
    get: function previousSibling() {
        if (this.parentNode) {
            const parentNodes = this.parentNode._subViews;
            return parentNodes[parentNodes.indexOf(this) - 1] || null;
        }
        return null;
    }
})

Object.defineProperty(View.prototype, "lastChild", {
    get: function lastChild() {
        return this.parentNode._subViews[this.parentNode._subViews.length - 1];
    }
})

//TODO textContent
Object.defineProperty(View.prototype, "textContent", {
    get: function textContent() {
        return "textContent";
    },
    set: function textContent(value) {
        console.log(value)
    }
})

global["document"] = {
    createElement(tag) {
        const view = viewUtil.createView(tag)
        view["prototype"] = View.prototype
        eventsMap[tag] && eventsMap[tag].forEach(evt => {
            let nativeEvent = evt, viewEvent = evt;
            if (typeof evt != "string") {
                nativeEvent = Object.keys(evt)[0]
                viewEvent = evt[nativeEvent]
            }
            view.on(nativeEvent, (e) => {
                view[viewEvent] && view[viewEvent].call(view, e)
            })
        });
        return view
    },
    createComment(text) {
        const view = viewUtil.createComment()
        view["prototype"] = View.prototype
        return view
    },
    createTextNode(text) {
        const view = viewUtil.createText()
        view.nodeType = 3
        view["prototype"] = View.prototype
        return view
    }
}
