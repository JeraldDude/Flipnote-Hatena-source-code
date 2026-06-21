var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
if (typeof Hatena == 'undefined')
    var Hatena = { };
if (typeof Hatena.UgoMemo == 'undefined')
    Hatena.UgoMemo = { };

/*----- Hatena.UgoMemo.LazyList -----*/
Hatena.UgoMemo.LazyList = new Ten.Class({
    initialize: function(element, apiURL, createFunc) {
        this.element = element; 
        this.apiURL  = apiURL;
        if (createFunc != undefined) {
            this.createItemElems = createFunc;
        }

        this.listElem = Ten.Selector.getElementsBySelector('.lazylist-list', this.element)[0];
        if (!this.listElem) return;

        this.moreElem = Ten.DOM.getElementsByTagAndClassName('span', 'lazylist-more', this.element)[0];
        if (!this.moreElem) return;
        this.moreElem.style.cursor = 'pointer';
        this.moreElem.style.textDecoration = 'underline';

        this.indicatorElem = Ten.DOM.getElementsByTagAndClassName('span', 'lazylist-indicator', this.element)[0];
        if (!this.indicatorElem) return;

        new Ten.Observer(this.moreElem, 'onclick', this, 'onClick');
    },
    load: function(apiURL, createFunc) {
        var elements = Ten.Selector.getElementsBySelector('.lazylist');
        for (var i = 0; i < elements.length; i++) {
            new Hatena.UgoMemo.LazyList(elements[i], apiURL, createFunc);
        }
    }
},{
    createItemElems: function (item) {
        // just be override
        return [];
    },
    createCheckObject: function() {
        var obj = {};
        var idElems = Ten.Selector.getElementsBySelector('span.lazylist-item-id');
        for (var i = 0; i < idElems.length; i++) {
            obj[idElems[i].innerHTML] = true;
        }
        return obj;
    },
    onClick: function(e) {
        var self = this;
        self.moreElem.style.visibility = 'hidden';
        self.indicatorElem.style.display = '';
        new Ten.XHR(self.apiURL, { method: 'GET' }, this, 'onComplete');
    },
    onComplete: function(req) {
        var checkObj = this.createCheckObject();
        var json = eval('(' + req.responseText + ')');
        var items = json.items;

        this.indicatorElem.style.display = 'none';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (checkObj[item.key]) { continue; }

            var elems = this.createItemElems(item);
            for (var j = 0; j < elems.length; j++) {
                this.listElem.appendChild(elems[j]);
            }
        }
    }
});
/*----- Hatena.UgoMemo.LazyList end -----*/
/*----- Hatena.UgoMemo.Form -----*/
if (typeof Hatena.UgoMemo.Form == 'undefined') {
    Hatena.UgoMemo.Form = { };
}
Hatena.UgoMemo.Form.ajaxize = function (form, options) {
    options = options || { };
    form = new Hatena.UgoMemo.Form.Ajax(form, options.params || { });

    var events = 'Submit Complete Error'.split(/ /);
    while (events.length) {
        var event = events.pop();
        if (options['on' + event]) {
            form.addEventListener(event.toLowerCase(), options['on' + event]);
        }
    }

    return form;
};

Hatena.UgoMemo.Form.Ajax = new Ten.Class({
    initialize: function (form, params) {
        this.form = form;
        this.additionalParams = params || { };
        this.observer = new Ten.Observer(form, 'onsubmit', this, 'submitHandler');
        Ten.EventDispatcher.implementEventDispatcher(this);
        this.constructor.all.push(this);
    },
    serialize: function (form) {
        var params = { };
        var elements = form.elements;
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            type = element.type;
            if (type == 'checkbox' || type == 'radio') {
                if (element.checked) {
                    params[element.name] = element.value;
                }
            } else {
                if (element.name != '') {
                    params[element.name] = element.value;
                }
            }
        }
        return params;
    },
    all: []
}, {
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
    params: function () {
        var params = this.constructor.serialize(this.form);
        for (var p in this.additionalParams) {
            params[p] = this.additionalParams[p];
        }
        return params;
    },
    submitHandler: function (e) {
        if (e && typeof e.stop == 'function') {
            e.stop();
        }
        var method = this.form.method.toUpperCase();
        var data = this.params();
        if (method == 'POST') {
            var uri = this.form.action;
            var options = { method: method, data: data };
        } else {
            var uri = this.form.action + '?' + Ten.XHR.makePostData(data);
            var options = { method: method };
        }
        with (this.xhr = new Ten.XHR(uri, options)) {
            addEventListener('complete', this._method('xhrCompleteHandler', this.xhr));
            addEventListener('error',    this._method('xhrErrorHandler', this.xhr));
        }
        this.dispatchEvent('submit');
    },
    xhrCompleteHandler: function (xhr) {
        this.dispatchEvent('complete', xhr);
    },
    xhrErrorHandler: function (xhr) {
        this.dispatchEvent('error', xhr);
    }
});

Hatena.UgoMemo.Form.Placeholder = new Ten.Class({
    initialize: function (el) {
        var self = this;
        this.element = el;

        // If @placeholder is natively supported:
        var tester = document.createElement(el.nodeName);
        if (typeof(tester.placeholder) != 'undefined') return;

        new Ten.Observer(el, 'onchange', this, 'disable');    
        new Ten.Observer(el, 'onfocus', this, 'hide');
        this.blurObserver = new Ten.Observer(el, 'onblur', this, 'show');

        // Prevent placeholder values from being cached
        if (Hatena.UgoMemo.Form.Placeholder.hasBfcache) {
            self._SetPageEvents();
        } else {
            self._OnBeforeunload = new Ten.Observer(window, 'onbeforeunload', this, 'hide');
            self._OnLoad = new Ten.Observer(window, 'onload', function () {
                self.show();
            });
            self._OnPageshow = new Ten.Observer(window, 'onpageshow', self, '_StopPageshow');
        }

        if (el.form) {
            new Ten.Observer(el.form, 'onsubmit', this, 'hide');
        }

        this.show();
    }
}, {
    _SetPageEvents: function () {
        new Ten.Observer(window, 'onpagehide', this, 'hide');
        new Ten.Observer(window, 'onpageshow', this, 'show');
    },
    _StopPageshow: function () {
      this._OnBeforeunload.stop();
      this._OnLoad.stop();
      this._SetPageEvents();
      this._OnPageshow.stop();
    },

    disable: function () {
        if (this.element.value == '') {
            this.blurObserver.start();
        } else {
            this.blurObserver.stop();
        }
        Ten.DOM.removeClassName(this.element, 'um-placeholder');
    },
    show: function () {
        if (this.shown()) return;

        if (this.element.value != '') return;

        var ph = this.element.getAttribute('placeholder');
        if (ph == null) return;

        this.element.value = ph;
        Ten.DOM.addClassName(this.element, 'um-placeholder');
    },
    hide: function () {
        if (!this.shown()) return;

        this.element.value = '';
        Ten.DOM.removeClassName(this.element, 'um-placeholder');
    },
    shown: function () {
        return Ten.DOM.hasClassName(this.element, 'um-placeholder');
    }
});

Hatena.UgoMemo.Form.MultiplePostPreventer = new Ten.Class({
    initialize: function (form) {
        this.form = form;
        this.submitObserver = new Ten.Observer(
            form, 'onsubmit', this, 'handleSubmit'
        );
        this.unloadObserver = new Ten.Observer(
            window, 'onunload', this, 'handleUnload'
        );
    }
}, {
    handleSubmit: function () {
        var _this = this;
        setTimeout(
            function () { _this.disableSubmit() },
            10
        );
    },
    disableSubmit: function () {
        var inputs = this.form.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) with ({ input: inputs[i] }) {
            if (input.type == 'submit' && !input.disabled) {
                input.disabled = true;
            }
        }
    },
    handleUnload: function () {
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) with ({ input: inputs[i] }) {
            if (input.disabled) input.disabled = false;
        }
    }
});

new Ten.Observer(window, 'onpageshow', function () {
    Hatena.UgoMemo.Form.Placeholder.hasBfcache = true;
});

Hatena.UgoMemo.getLoginStatusFromCookie = function () {
    var cookie = new Ten.Cookie();
    return cookie.get('rk') ? true : false;
};

Hatena.UgoMemo.scrollToLocationHash = function () {
    setTimeout(function() {
        if (location.hash == '') return;
        if (!arguments.callee.count) arguments.callee.count = 0;
        arguments.callee.count++;
        var target = document.getElementsByName(location.hash.replace(/^#/,''))[0];
        if (target) {
            window.scrollTo(0, Ten.Geometry.getElementPosition(target).y);
        } else if (arguments.callee.count < 20) {
            setTimeout(arguments.callee, 500);
        }
    }, 500);
};
/*----- Hatena.UgoMemo.Thumbnail -----*/
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

Hatena.UgoMemo.watchThumbnails = function () {
    var isDescendantOf = function (node, ancestor) {
        while (node) {
            if (node == ancestor) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };
    var type = "img.thumb_l,img.thumb".split(',');
    for (var j = 0, len = type.length ; j < len ; j++) {
//    var thumbnails = Ten.Selector.getElementsBySelector('img.thumb_l');
        var thumbnails = Ten.querySelectorAll(type[j]);
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
                    if (thumbnail.src.match(/_o.gif$/)) thumbnail.src = thumbnail.src.replace(/_o.gif$/, '_am.gif');
                    else  thumbnail.src = thumbnail.src.replace(/_m.gif$/, '_as.gif');
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
                            if (thumbnail.src.match(/_am.gif$/)) thumbnail.src = thumbnail.src.replace(/_am.gif$/, '_o.gif');
                            else  thumbnail.src = thumbnail.src.replace(/_as.gif$/, '_m.gif');
                        }
                    }
                );
            }
        }
    }
};

Ten.DOM.addEventListener('DOMContentLoaded', Hatena.UgoMemo.watchThumbnails);

/*----- Hatena.UgoMemo.Thumbnail end  -----*/
/*----- Hatena.UgoMemo.Player  -----*/
Hatena.UgoMemo.Player = {
    index: -1,
    receiveMovieInfo: function (path, index) {
        return function (xhr) {
            var info = eval('(' + xhr.responseText + ')');
            Hatena.UgoMemo.Player._movieInfo[path] = info;
            Hatena.UgoMemo.Player.renderMovieInfo(info, index);
        };
    },
    receiveMoviesInfo: function (xhr) {
        var info = eval('(' + xhr.responseText + ')');
        this.moviesInfo = info.movies;
        this.renderMovieInfo(this.moviesInfo, this.index);
    },
    renderMovieInfo: function (moviesInfo, index) {
        function padZero(s) { return new Array(Math.max(3 - s.toString().length, 0) + 1).join('0') + s }
        var info = moviesInfo[index];
        if (!info) return;

        var infoElements = this.infoElements();
        infoElements.username.innerHTML  = info.author.html_name;
        infoElements.timestamp.innerHTML = Hatena.Locale.datetimeHTML(new Date(info.created_on.epoch * 1000));
        infoElements.viewsNumber.innerHTML = Hatena.Locale.number(parseInt(info.play_count));
        infoElements.starsNumber.innerHTML = Hatena.Locale.number(parseInt(info.star_count));
        infoElements.messagesNumber.innerHTML = Hatena.Locale.number(parseInt(info.comment_count));
        infoElements.navigation.href     = info.path;
        infoElements.count.innerHTML     = padZero((index || 0) + 1) + ' / ' + padZero(moviesInfo.length);
        infoElements.profileImage.src    = info.author.profile_icon_path;
    },
    updateMovieInfo: function () {
        if (this.moviesInfo) {
            this.renderMovieInfo(this.moviesInfo, this.index);
        }
    },
    onEnterMovie: function (uri, index) {
        this.index = index;
        this.updateMovieInfo();
    },
    infoElements: function () {
        if (this._infoElements) {
            return this._infoElements;
        }

        var _infoElements = { };
        var container = Ten.querySelector('#screen-bottom div.screen-info');
        _infoElements = Ten.DOM.getElementsByStructure(container, [
          {key: 'username', className: 'username'},
          {key: 'timestamp', className: 'timestamp'},
          {key: 'views', className: 'views', descendants: [
            {key: 'viewsNumber', className: 'number'}
          ]},
          {key: 'stars', className: 'stars', descendants: [
            {key: 'starsNumber', className: 'number'}
          ]},
          {key: 'messages', className: 'messages', descendants: [
            {key: 'messagesNumber', className: 'number'}
          ]},
          {key: 'profileImage', className: 'profileimg'},
          {key: 'navigation', className: 'movie-nav-link'},
          {key: 'count', className: 'count'}
        ]);
        _infoElements._container  = container;

        return this._infoElements = _infoElements;
    },
    paddingZero : function(value) {
        if (value < 10) return ('0' + value);
        else return '' + value;
    },
    initialize: function () {
        var path = location.pathname;
        var pathname = (path.lastIndexOf('/') == path.length - 1)? path + 'index' : path;
        this.receiveMoviesInfoXHR = new Ten.XHR(pathname + '.json', { }, this, 'receiveMoviesInfo');
    }
};
/*----- Hatena.UgoMemo.Player end -----*/

/*----- Hatena.UgoMemo.WidgetCustomizer  -----*/
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

/*----- Hatena.UgoMemo.Thumbnail end  -----*/
/*----- Hatena.UgoMemo.Star -----*/
/* require HatenaStar.js */
if (Hatena.Star) {
if (typeof Hatena.UgoMemo.Star == 'undefined')
    Hatena.UgoMemo.Star = { };

Hatena.Star.EntryLoader._getElementByConfigSelector = Hatena.Star.EntryLoader.getElementByConfigSelector;

Hatena.Star.EntryLoader.getElementByConfigSelector = function (selector, parent) {
    var truncate = false;
    selector = selector.replace(/::-ten-truncate$/, function () {
        truncate = true; return '';
    });

    var result = this._getElementByConfigSelector(selector, parent);
    if (!truncate || !result) return result;

    if (typeof(result) != 'string') {
        result = Hatena.Star.EntryLoader.scrapeTitle(result) || result.title || result.alt || '';
    }
    if (truncate && result.length > 30) {
        result = result.substring (0, 30) + '...';
    }
    return result;
};

Hatena.UgoMemo.Star.addStar = function (entry) {
    var uri = entry.uri.replace(/\/movie\//, '/movie.star/');
    new Ten.XHR(uri, { method: 'POST', data: { add: '1', rks: Hatena.Visitor && Hatena.Visitor.RKS } });
};

Hatena.Star.User.prototype.userPage = function () {
    return '/' + this.name + (this.name.indexOf('@DSi') > -1 ? '/' : '/my');
};

Hatena.Star.Entry.prototype._bindStarEntry = Hatena.Star.Entry.prototype.bindStarEntry;

Hatena.Star.Entry.prototype.bindStarEntry = function (se) {
    var stars = se.stars;
    var dsiIDs = { };
    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        if (typeof star.name == 'string' && star.name.match(/(.+?)@DSi$/)) {
            dsiIDs[RegExp.$1]++;
        }
    }

    var uniqueDSiIDs = [];
    for (var id in dsiIDs) {
        uniqueDSiIDs.push(id);
    }

    if (uniqueDSiIDs.length > 0) {
        var params = [];
        for (var j = 0; j < uniqueDSiIDs.length; j++) {
            params.push('dsi_id');
            params.push(uniqueDSiIDs[j]);
        }
        var self = this;
        var xhr = new Ten.Extras.XHR('/users.names.json', function(){self.receiveDSiUsers(this._xhr);});
        xhr.post('application/x-www-form-urlencoded', Ten.Form.arrayToPostData(params));
    }

    return this._bindStarEntry(se);
};

Hatena.Star.Entry.prototype.receiveDSiUsers = function (xhr) {
    var json = eval('(' + xhr.responseText + ')');
    var users = json.users;
    for (var i = 0; i < this.stars.length; i++) {
        if (typeof this.stars[i].name == 'string' && !this.stars[i].name.match(/^([0-9A-Fa-f]+)@DSi$/)) continue;
        var dsiID = RegExp.$1;
        var dsiUser = users[dsiID];
        if (dsiUser) {
            this.stars[i].screen_name = dsiUser.html_name + '@DSi';
            this.stars[i].profile_icon = 'https://web.archive.org/web/20100901015228/http://www.hatena.ne.jp/users/us/user/profile_s.gif';
        }
    }
};

Hatena.Star.Entry.prototype._addCommentButton = Hatena.Star.Entry.prototype.addCommentButton

Hatena.Star.Entry.prototype.addCommentButton = function () {
    this._addCommentButton (arguments);
    Ten.DOM.removeElement(this.comment_container);
};

Hatena.Star.NameScreen.prototype.showName = function (name, quote, pos, src) {
    this.container.innerHTML = '';
    this.container.appendChild(Hatena.Star.User.getProfileIcon(name, src));
    var span = new Ten.Element('span');
    span.innerHTML = name;
    this.container.appendChild(span);
    if (quote) {
        var blockquote = document.createElement('blockquote');
        Ten.Style.applyStyle(blockquote, this.constructor.quoteStyle);
        blockquote.innerHTML = '&quot; ' + quote + ' &quot;';
        this.container.appendChild(blockquote);
    }
    this.show(pos);
};
} // if(Hatena.Star)

if (typeof Hatena.UgoMemo.Star == 'undefined') {
    Hatena.UgoMemo.Star = { };
}

Hatena.UgoMemo.Star.loadThumbnailStarCount = function (d) {
  var setEntryStarCount = function (entry, count) {
    var span = Ten.querySelector('span.stars span.star-count', entry);
    if (!span) return;
    span.innerHTML = count;
  };
  
  var allEntries = Ten.querySelectorAll('ul.memolist li', d);
  while (allEntries.length > 0) {
    var jsonpURL = 'https://web.archive.org/web/20100901015228/http://s.hatena.' + (/jp$/.exec(location.hostname) ? 'ne.jp' : 'com') + '/entry.count.json?';
    var urlToEntries = {};
    while (allEntries.length > 0 && jsonpURL.length < Ten.JSONP.MaxBytes - 11) {
      var entry = allEntries.shift();
      var link = entry.getElementsByTagName('a')[0];
      if (link && link.href) {
        var entryURL = link.href;
        entryURL = entryURL.replace(/^http:\/\/\w+\.hatena\.ne\.jp(:\d+)?/, 'https://web.archive.org/web/20100901015228/http://ugomemo.hatena.ne.jp');
        entryURL = entryURL.replace(/^http:\/\/\w+\.hatena\.com(:\d+)?/, 'https://web.archive.org/web/20100901015228/http://flipnote.hatena.com');
        entryURL = entryURL.replace(/\?.*/, '');
        jsonpURL += 'uri=' + encodeURIComponent(entryURL) + '&';
        if (!urlToEntries[entryURL]) {
            urlToEntries[entryURL] = [];
        }
        urlToEntries[entryURL].push(entry);
      }
    }
    if (!Hatena.Visitor) {
      jsonpURL += 'timestamp=1'; // length = 11
    }
  
    with ({ urlToEntries: urlToEntries }) {
      new Ten.JSONP(
        jsonpURL, function (res) {
          var starEntries = res.entries;
          if (!starEntries) return;
  
          for (var i = 0; i < starEntries.length; i++) {
            var starEntry = starEntries[i];
  
            var entries = urlToEntries[starEntry.uri];
            if (!entries) continue;
            delete urlToEntries[starEntry.uri];
  
            var total = 0;
            for (var c in starEntry.stars) {
              total += parseInt(starEntry.stars[c]);
            }
            for (var j = 0; j < entries.length; j++) {
              setEntryStarCount(entries[j], total);
            }
          }
  
          for (var u in urlToEntries) with ({ entries: urlToEntries[u] }) {
            for (var j = 0; j < entries.length; j++) {
              setEntryStarCount(entries[j], 0);
            }
          }
        }
      );
    }
  }
};

/*----- Hatena.UgoMemo.Star end -----*/

/*----- Hatena.UgoMemo.Command -----*/
Hatena.UgoMemo.Command = new Ten.Class({
    initialize: function(param) {
        this.buttonElements = param.buttonElements;
        this.displayField   = param.displayField;
        this.resultField    = param.resultField;
        this.maxLength      = param.maxLength || 10;
        this.isIncremental      = param.incrementalSearch || false;
        this.remainCommand();
        new Ten.Observer(this.buttonElements.N,'onclick',this,'putN');
        new Ten.Observer(this.buttonElements.S,'onclick',this,'putS');
        new Ten.Observer(this.buttonElements.W,'onclick',this,'putW');
        new Ten.Observer(this.buttonElements.E,'onclick',this,'putE');
        new Ten.Observer(this.buttonElements.X,'onclick',this,'putX');
        new Ten.Observer(this.buttonElements.Y,'onclick',this,'putY');
        new Ten.Observer(this.buttonElements.A,'onclick',this,'putA');
        new Ten.Observer(this.buttonElements.B,'onclick',this,'putB');
        new Ten.Observer(this.buttonElements.L,'onclick',this,'putL');
        new Ten.Observer(this.buttonElements.R,'onclick',this,'putR');
        new Ten.Observer(window.document,'onkeydown',this,'inputByKeyboard');
        new Ten.Observer(this.buttonElements.backspace,'onclick',this,'backspace');
        new Ten.Observer(this.buttonElements.submit,'onclick',this,'submit');
    },
    imageData : {
        N : 'U+E01B.gif',
        S : 'U+E01C.gif',
        W : 'U+E01A.gif',
        E : 'U+E019.gif',
        X : 'U+E002.gif',
        Y : 'U+E003.gif',
        A : 'U+E000.gif',
        B : 'U+E001.gif',
        L : 'U+E004.gif',
        R : 'U+E005.gif'
    }
},{
    submit: function() {
        if (this.commandLength()) {
            window.location.href = '/c/' + this.command();
        }
    },
    command: function() {
        var imgs = this.commandImgs();
        var command = '';
        for (var i = 0, len = imgs.length; i < len ; i++) {
            var src = imgs[i].src.split('/');
            imgName = src[src.length - 1];
            command += this.getCommandFromImgName(imgName);
        }
        return command;
    },
    getCommandFromImgName : function(imgName) {
        if (this._invertImageData) {
        } else {
            this._invertImageData = {};
            var data = Hatena.UgoMemo.Command.imageData;
            for (var p in data) {
                this._invertImageData[data[p]] = p;
            }
        }
        return this._invertImageData[imgName];
    },
    callXHR: function() {
        if (this.isIncremental && this.commandLength() >= 5) {
            var self = this;
            if (this._callXHRTimeout) {
              clearTimeout(this._callXHRTimeout);
            }
            this._callXHRTimeout = setTimeout(function () {
              var uri = '/c.xml?command_prefix=' + self.command();
              new Ten.XHR(uri, 'GET', self, 'incrementalCallback');
            }, 1000);
        }
    },
    putCommandImage: function (key, not_callXHR) {
        if (this.commandLength() >= this.maxLength) return ; 
        var img = document.createElement('img');
        img.src = '/images/dsi/m-2/' + Hatena.UgoMemo.Command.imageData[key];
        this.displayField.appendChild(img);
        if (!not_callXHR) this.callXHR();
    },
    commandImgs: function() {
        return this.displayField.getElementsByTagName('img');
    },
    commandLength: function () {
        return this.commandImgs().length;
    },
    inputByKeyboard: function(event) {
        if (!Ten.Browser.isIE && event.event.target.tagName && event.event.target.tagName == 'INPUT') return; 
        var keyCode = event.event.keyCode;
        switch(keyCode){
            case 38: this.putN();event.stop();break;
            case 40: this.putS();event.stop();break;
            case 37: this.putW();event.stop();break;
            case 39: this.putE();event.stop();break;
            case 88: this.putX();event.stop();break;
            case 89: this.putY();event.stop();break;
            case 65: this.putA();event.stop();break;
            case 66: this.putB();event.stop();break;
            case 76: this.putL();event.stop();break;
            case 82: this.putR();event.stop();break;
            case 8 : this.backspace();event.stop();break;
            case 13: this.submit();break;
            default: break;
        }
    },
    putN: function() {
        this.putCommandImage('N');
    },
    putS: function() {
        this.putCommandImage('S');
    },
    putW: function() {
        this.putCommandImage('W');
    },
    putE: function() {
        this.putCommandImage('E');
    },
    putA: function() {
        this.putCommandImage('A');
    },
    putB: function() {
        this.putCommandImage('B');
    },
    putX: function() {
        this.putCommandImage('X');
    },
    putY: function() {
        this.putCommandImage('Y');
    },
    putL: function() {
        this.putCommandImage('L');
    },
    putR: function() {
        this.putCommandImage('R');
    },
    backspace: function() {
        if (this.commandLength()) {
            var children = this.commandImgs();
            this.displayField.removeChild(children[children.length - 1]);
            this.callXHR();
        }
    },
    makeResultContent: function(result, itemName, itemArea, listArea) {
        var items = result.getElementsByTagName(itemName);
        if (items.length) {
            var itemHTML = '';
            for (var i = 0, len = items.length; i < len ; i++) {
                if (Ten.Browser.isIE) {
                    itemHTML += items[i].firstChild.nodeValue;
                } else {
                    itemHTML += items[i].textContent;
                }
            }
            listArea.innerHTML = itemHTML;
            Ten.DOM.show(itemArea);
        } else {
            listArea.innerHTML = '';
            Ten.DOM.hide(itemArea);
        }
    },
    incrementalCallback: function(xml) {
        var result = xml.responseXML;
        var $ = function (id) {return document.getElementById(id);};
        var responseCommand = result.getElementsByTagName('items')[0].getAttribute('command_prefix');
        if (this.command() != responseCommand) return;
        this.makeResultContent(result , 'movie'   , $('movie_result')   , $('movie_result_list'));
        this.makeResultContent(result , 'dsi_user', $('user_result')    , $('user_result_list'));
        this.makeResultContent(result , 'channel' , $('channel_result') , $('channel_result_list'));
        return ;
    },
    hasQuery: function() {
        return location.href.indexOf('?') > 0;
    },
    getCommandFromQuery: function() {
        if (location.href.match(/command_prefix=([ABXYLRNWSE]{1,10})/)) {
            return RegExp.$1;
        }
        return '';
    },
    remainCommand: function() { 
        if (this.hasQuery()) {
            var command = this.getCommandFromQuery();
            var len;
            for (var i = 0, len = command.length; i < len; i++) {
                var not_callXHR = (i != len - 1);
                this.putCommandImage(command.substr(i, 1).toUpperCase(), not_callXHR);
            }
        }
    }
});
/*----- Hatena.UgoMemo.Command end -----*/

/*----- Hatena.ToggleNext -----*/
Hatena.ToggleNext = new Ten.Class({
    toggle: function(e,tagName,className) {
        tagName = tagName.toLowerCase();
        var target;
        while (e = Ten.DOM.nextSiblingInSource(e)) {
            if (e.tagName && e.tagName.toLowerCase() == tagName) {
                if (className) {
                    if (Ten.DOM.hasClassName(e, className)) {
                        target = e;
                        break;
                    }
                } else {
                    target = e;
                    break;
                }
            }
        }
        if (target) {
            if (target.style.display == 'none') {
                target.style.display = 'block';
            } else {
                target.style.display = 'none';
            }
        }
    }
});
/*----- Hatena.ToggleNext end -----*/

Ten.AsyncLoader.executeWithObject('id=locale-selector-button', function () {
  var ls = document.getElementById('langselector-container');
  var dd = new Ten.Widget.DropDown(ls, [
    {key: 'button', className: 'button'},
    {key: 'panel', className: 'dropdown', descendants: [
      {arrayKey: 'langButtons', className: 'lang-button'},
      {arrayKey: 'regionButtons', className: 'region-button'}
    ]}
  ]);
  for (var i = 0; i < dd.elements.langButtons.length; i++) {
    new Ten.Observer(dd.elements.langButtons[i], 'onclick', function (ev) {
      var lang = ev.target.getAttribute('hreflang');
      if (!lang) return;

      Hatena.Locale.setAcceptLang(lang);
      Hatena.Locale.reload();
      ev.stop();
    });
  }
  for (var i = 0; i < dd.elements.regionButtons.length; i++) {
    new Ten.Observer(dd.elements.regionButtons[i], 'onclick', function (ev) {
      var region = ev.target.getAttribute('data-region');
      if (!region) return;

      Hatena.Locale.setRegionCode(region);
      Hatena.Locale.reload();
      ev.stop();
    });
  }
});

}

/*
     FILE ARCHIVED ON 01:52:28 Sep 01, 2010 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 04:16:19 Jun 21, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.605
  exclusion.robots: 0.058
  exclusion.robots.policy: 0.045
  esindex: 0.01
  cdx.remote: 9.778
  LoadShardBlock: 87.693 (3)
  PetaboxLoader3.datanode: 104.899 (4)
  load_resource: 81.124
  PetaboxLoader3.resolve: 37.593
*/