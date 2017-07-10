const elementMap = new Map();
const camelCaseSplit = /([a-z0-9])([A-Z])/g;
const defaultViewMeta = { skipAddToDom: false };

function isDetachedElement(element) {
    return (element && element.meta && element.meta.skipAddToDom);
}

function isKnownView(elementName) {
    return elementMap.has(elementName);
}

function getViewClass(elementName) {
    const entry = elementMap.get(elementName);
    if (!entry) {
        throw new TypeError(`No known component for element ${elementName}.`);
    }

    try {
        return entry.resolver();
    } catch (e) {
        throw new TypeError(`Could not load view for: ${elementName}.${e}`);
    }
}

function getViewMeta(nodeName) {
    const entry = elementMap.get(nodeName) || elementMap.get(nodeName.toLowerCase());
    return (entry && entry.meta) || defaultViewMeta;
}
function registerElement(
    elementName,
    resolver,
    meta
) {
    if (elementMap.has(elementName)) {
        throw new Error(`Element for ${elementName} already registered.`);
    } else {
        const entry = { resolver: resolver, meta: meta };
        elementMap.set(elementName, entry);
        elementMap.set(elementName.toLowerCase(), entry);
        elementMap.set(elementName.replace(camelCaseSplit, "$1-$2").toLowerCase(), entry);
    }
}


// Register default NativeScript components
// Note: ActionBar related components are registerd together with action-bar directives.
registerElement("absoluteLayout", () => require("tns-core-modules/ui/layouts/absolute-layout").AbsoluteLayout);
registerElement("activityIndicator", () => require("tns-core-modules/ui/activity-indicator").ActivityIndicator);
registerElement("border", () => require("tns-core-modules/ui/border").Border);
registerElement("button", () => require("tns-core-modules/ui/button").Button);
registerElement("contentView", () => require("tns-core-modules/ui/content-view").ContentView);
registerElement("datePicker", () => require("tns-core-modules/ui/date-picker").DatePicker);
registerElement("dockLayout", () => require("tns-core-modules/ui/layouts/dock-layout").DockLayout);
registerElement("gridLayout", () => require("tns-core-modules/ui/layouts/grid-layout").GridLayout);
registerElement("htmlView", () => require("tns-core-modules/ui/html-view").HtmlView);
registerElement("image", () => require("tns-core-modules/ui/image").Image);
// Parse5 changes <Image> tags to <img>. WTF!
registerElement("img", () => require("tns-core-modules/ui/image").Image);
registerElement("label", () => require("tns-core-modules/ui/label").Label);
registerElement("listPicker", () => require("tns-core-modules/ui/list-picker").ListPicker);
registerElement("listView", () => require("tns-core-modules/ui/list-view").ListView);
registerElement("page", () => require("tns-core-modules/ui/page").Page);
registerElement("placeholder", () => require("tns-core-modules/ui/placeholder").Placeholder);
registerElement("progress", () => require("tns-core-modules/ui/progress").Progress);
registerElement("proxyViewContainer", () => require("tns-core-modules/ui/proxy-view-container").ProxyViewContainer);
registerElement("repeater", () => require("tns-core-modules/ui/repeater").Repeater);
registerElement("scrollView", () => require("tns-core-modules/ui/scroll-view").ScrollView);
registerElement("searchBar", () => require("tns-core-modules/ui/search-bar").SearchBar);
registerElement("segmentedBar", () => require("tns-core-modules/ui/segmented-bar").SegmentedBar);
registerElement("segmentedBarItem", () => require("tns-core-modules/ui/segmented-bar").SegmentedBarItem);
registerElement("slider", () => require("tns-core-modules/ui/slider").Slider);
registerElement("stackLayout", () => require("tns-core-modules/ui/layouts/stack-layout").StackLayout);
registerElement("flexboxLayout", () => require("tns-core-modules/ui/layouts/flexbox-layout").FlexboxLayout);
registerElement("switch", () => require("tns-core-modules/ui/switch").Switch);
registerElement("tabView", () => require("tns-core-modules/ui/tab-view").TabView);
registerElement("textField", () => require("tns-core-modules/ui/text-field").TextField);
registerElement("textView", () => require("tns-core-modules/ui/text-view").TextView);
registerElement("timePicker", () => require("tns-core-modules/ui/time-picker").TimePicker);
registerElement("webView", () => require("tns-core-modules/ui/web-view").WebView);
registerElement("wrapLayout", () => require("tns-core-modules/ui/layouts/wrap-layout").WrapLayout);
registerElement("formattedString", () => require("tns-core-modules/text/formatted-string").FormattedString);
registerElement("span", () => require("tns-core-modules/text/span").Span);

registerElement("detachedContainer", () => require("tns-core-modules/ui/proxy-view-container").ProxyViewContainer,
    { skipAddToDom: true });

module.exports = {
    isDetachedElement: isDetachedElement,
    isKnownView: isKnownView,
    getViewClass: getViewClass,
    getViewMeta: getViewMeta
}