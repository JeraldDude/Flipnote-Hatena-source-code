var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
if (typeof Hatena == 'undefined') {
    var Hatena = { };
}
if (typeof Hatena.UgoMemo == 'undefined') {
    Hatena.UgoMemo = { };
}
if (typeof Hatena.UgoMemo.Form == 'undefined') {
    Hatena.UgoMemo.Form = { };
}

Hatena.UgoMemo.Timeout = new Ten.Class({
    initialize: function (code, delay) {
        this.handler = function () {
            code();
        };
        this.delay = delay;
    }
}, {
    start: function () {
        if (!this.timer) this.timer = setTimeout(this.handler, this.delay);
    },
    stop: function () {
        clearTimeout(this.timer);
        this.timer = 0;
    }
});

Ten.DOM.addEventListener('DOMContentLoaded', function () {
    var isDescendantOf = function (node, ancestor) {
        while (node) {
            if (node == ancestor) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };

    var thumbnails = Ten.Selector.getElementsBySelector('img.thumb');
    for (var i = 0; i < thumbnails.length; i++) {
        with ({ thumbnail: thumbnails[i], loadAnimation: null, item: null }) {
            var hasContainer;
            item = thumbnail;
            while (item.parentNode && item.parentNode.nodeType == 1) {
                item = item.parentNode;
                if (Ten.DOM.hasClassName(item, 'box-container') ||
                    Ten.DOM.hasClassName(item, 'ranking-box') ||
                    Ten.DOM.hasClassName(item, 'box') ||
                    item.nodeName == 'LI') {
                    hasContainer = true;
                    break;
                }
            }
            if (!hasContainer) item = thumbnail;

            loadAnimation = new Hatena.UgoMemo.Timeout(function () {
                thumbnail.src = thumbnail.src.replace(/_m.gif$/, '_as.gif');
            }, 600);

            new Ten.Observer(
                item,
                'onmouseover',
                function (ev) { loadAnimation.start() }
            );
            new Ten.Observer(
                item,
                'onmouseout',
                function (ev) {
                    if (!isDescendantOf(ev.event.relatedTarget || ev.event.toElement, item)) {
                        loadAnimation.stop();
                        thumbnail.src = thumbnail.src.replace(/_as.gif$/, '_m.gif');
                    }
                }
            );
        }
    }
});

}
