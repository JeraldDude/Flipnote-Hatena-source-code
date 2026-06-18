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
if (typeof Hatena.UgoMemo.WidgetCustomizer == 'undefined') {
    Hatena.UgoMemo.WidgetCustomizer = { };
}

Hatena.UgoMemo.WidgetCustomizer = new Ten.Class({
    initialize: function (elem) {
        this.element = elem || Ten.DOM.getElementsByTagAndClassName('form', 'blogparts')[0];
        if (this.element == null) return;
        var sourceElements = Ten.DOM.getElementsByClassName('txt', this.element);
        this.htmlSourceElement   = sourceElements[0];
        this.hatenaSourceElement = sourceElements[1];
        this.previewLinkElement  = this.element.getElementsByTagName('a')[0];

        var self = this;

        // XXX ãªãŒã„
        this.styleSwitcher = new Hatena.UgoMemo.WidgetCustomizer.RadioButtonGroup(
            Ten.Selector.getElementsBySelector('span.viewmode img'), {
                onSelect: function (elem, index) {
                    elem.src = elem.src.replace(/_off/, '_on');
                    self.htmlSourceElement.value = self.htmlSourceElement.value.replace(/(\?mode=)(?:list|thumbnail)widget/, '$1' + ['listwidget', 'thumbnailwidget'][index])
                                                                               .replace(/\b(?:540|305)\b/, [540, 305][index]);
                    self.previewLinkElement.href = self.previewLinkElement.href.replace(/(\?mode=)(?:list|thumbnail)widget/, '$1' + ['listwidget', 'thumbnailwidget'][index]);
                },
                onUnselect: function (elem, index) {
                    elem.src = elem.src.replace(/_on/, '_off');
                }
            }
        );
        this.colorSwitcher = new Hatena.UgoMemo.WidgetCustomizer.RadioButtonGroup(
            Ten.Selector.getElementsBySelector('span.colormode img'), {
                onSelect: function (elem, index) {
                    elem.src = elem.src.replace(/_off/, '_on');
                    self.htmlSourceElement.value = self.htmlSourceElement.value.replace(/(mode=(?:list|thumbnail)widget)(?:&color=(?:wd|sd|sk|cs)|)/, '$1' + ['', '&color=wd', '&color=sd', '&color=sk', '&color=cs'][index]);
                    self.previewLinkElement.href = self.previewLinkElement.href.replace(/&color=(?:wd|sd|sk|cs)|$/, ['', '&color=wd', '&color=sd', '&color=sk', '&color=cs'][index]);
                },
                onUnselect: function (elem, index) {
                    elem.src = elem.src.replace(/_on/, '_off');
                }
            }
        );

        this.constructor.instance = this;
    }
}, {
});

Hatena.UgoMemo.WidgetCustomizer.RadioButtonGroup = new Ten.Class({
    initialize: function (elems, options) {
        if (!options) {
            options = { };
        }
        if (!options.onSelect) {
            options.onSelect = function () { };
        }
        if (!options.onUnselect) {
            options.onUnselect = function () { };
        }
        this.elements = elems;
        this.options  = options;
        for (var i = 0; i < elems.length; i++) {
            new Ten.Observer(elems[i], 'onclick', this._method('clickHandler', i))
        }
    }
}, {
    // XXX ã¾ã¨ã‚ã‚‹
    _method: function (name) {
        var self = this;
        var method = this[name];
        var boundArgs = Array.prototype.slice.call(arguments, 1);
        return function () {
            var args = boundArgs.slice();
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            return method.apply(self, args);
        }
    },
    clickHandler: function (index, e) {
        var elems = this.elements;
        for (var i = 0; i < elems.length; i++) {
            if (i == index) {
                this.options.onSelect.call(this, elems[i], index);
            } else {
                this.options.onUnselect.call(this, elems[i], index);
            }
        }
    }
});

Ten.DOM.addEventListener('DOMContentLoaded', function () { new Hatena.UgoMemo.WidgetCustomizer() });

}
