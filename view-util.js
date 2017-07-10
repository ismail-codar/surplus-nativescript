const platformNames = require("tns-core-modules/platform").platformNames
const ContentView = require("tns-core-modules/ui/content-view").ContentView
const LayoutBase = require("tns-core-modules/ui/layouts/layout-base").LayoutBase
const elementRegistry = require("./element-registry")

const ELEMENT_NODE_TYPE = 1;

class CommentNode {
    constructor(){
        this.templateParent = null
        this.meta = { skipAddToDom: true }
    }
}

class ViewUtil {
    constructor(device) {
        this.isIos = device.os === platformNames.ios;
        this.isAndroid = device.os === platformNames.android;
    }
	
	isView(view) {
		return view instanceof View
	}

	isLayout(view) {
		return view instanceof LayoutBase
	}

	isContentView(view) {
		return view instanceof ContentView
	}

	isCommentNode(view) {
		return view instanceof CommentNode
	}
    
    insertChild(parent, child, atIndex) {
        if (atIndex == undefined)
            atIndex = -1;
        if (child instanceof CommentNode) {
            child.templateParent = parent;
            return;
        }

        if (!parent || elementRegistry.isDetachedElement(child)) {
            return;
        }

        if (parent.meta && parent.meta.insertChild) {
            parent.meta.insertChild(parent, child, atIndex);
        } else if (this.isLayout(parent)) {
            if (child.parent === parent) {
                const index = (parent).getChildIndex(child);
                if (index !== -1) {
                    parent.removeChild(child);
                }
            }
            if (atIndex !== -1) {
                parent.insertChild(child, atIndex);
            } else {
                parent.addChild(child);
            }
        } else if (this.isContentView(parent)) {
            parent.content = child;
        } else if (parent && parent._addChildFromBuilder) {
            parent._addChildFromBuilder(child.nodeName, child);
        } else {
            // throw new Error("Parent can"t contain children: " + parent.nodeName + ", " + parent);
        }
    }

    removeChild(parent, child) {
        if (!parent ||
            child instanceof CommentNode ||
            elementRegistry.isDetachedElement(child)) {

            return;
        }

        if (parent.meta && parent.meta.removeChild) {
            parent.meta.removeChild(parent, child);
        } else if (this.isLayout(parent)) {
            parent.removeChild(child);
        } else if (this.isContentView(parent)) {
            if (parent.content === child) {
                parent.content = null;
            }
        } else if (this.isView(parent)) {
            parent._removeView(child);
        } else {
            // throw new Error("Unknown parent type: " + parent);
        }
    }

    createComment() {
        return new CommentNode();
    }

    createText() {
        return new CommentNode();
    }

    createView(name) {
        if (!elementRegistry.isKnownView(name)) {
            name = "proxyViewContainer";
        }

        const viewClass = elementRegistry.getViewClass(name);
        let view = new viewClass();
        view.nodeName = name;
        view.meta = elementRegistry.getViewMeta(name);

        // we're setting the node type of the view
        // to 'element' because of checks done in the
        // dom animation engine:
        // tslint:disable-next-line:max-line-length
        // https://github.com/angular/angular/blob/master/packages/animations/browser/src/render/dom_animation_engine.ts#L70-L81
        view.nodeType = ELEMENT_NODE_TYPE;

        return view;
    }
}

module.exports = ViewUtil