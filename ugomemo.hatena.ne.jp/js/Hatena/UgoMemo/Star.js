var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
/* require HatenaStar.js */

if (typeof Hatena == 'undefined')
    var Hatena = { };
if (typeof Hatena.UgoMemo == 'undefined')
    Hatena.UgoMemo = { };
if (typeof Hatena.UgoMemo.Star == 'undefined')
    Hatena.UgoMemo.Star = { };

Hatena.UgoMemo.Star.isCommentURI = function (uri) {
    return /#/.test(uri);
};

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

/*
Hatena.Star.EntryLoader.addEventListener(
    'load',
    function () {
        var entries = Hatena.Star.EntryLoader.entries;
        for (var i = 0; i < entries.length; i++) (function (e) {
            if (!Hatena.UgoMemo.Star.isCommentURI(e.uri)) {
                new Ten.Observer(e.addButton, 'onclick', function() { Hatena.UgoMemo.Star.addStar(e) });
            }
        })(entries[i]);
    }
);
*/

Hatena.UgoMemo.Star.addStar = function (entry) {
    var uri = entry.uri.replace(/\/movie\//, '/movie.star/');
    new Ten.XHR(uri, { method: 'POST', data: { add: '1', rks: Hatena.Visitor && Hatena.Visitor.RKS } });
};

Hatena.Star.User.prototype.userPage = function () {
    return '/' + this.name + (this.name.indexOf('@DSi') > -1 ? '/' : '/my');
};

Hatena.Star.Entry.prototype._bindStarEntry = Hatena.Star.Entry.prototype.bindStarEntry;

Hatena.Star.Entry.prototype.bindStarEntry = function (se) {
    if (!Hatena.UgoMemo.Star.isCommentURI(se.uri)) {

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
            var queries = [];
            for (var i = 0; i < uniqueDSiIDs.length; i++) {
                queries.push('dsi_id=' + uniqueDSiIDs[i]);
            }
            new Ten.XHR('/users.names.json?' + queries.join('&'), { }, this, 'receiveDSiUsers');
        }
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
            this.stars[i].profile_icon = 'https://web.archive.org/web/20130820230853/http://www.hatena.ne.jp/users/us/user/profile_s.gif';
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

/* delete star when star callback api
Hatena.Star.Star.prototype._deleteStar = Hatena.Star.Star.prototype.deleteStar;

Hatena.Star.Star.prototype.deleteStar = function () {
    if (!Hatena.UgoMemo.Star.isCommentURI(this.entry.uri)) {
        var uri = this.entry.uri.replace(/\/movie\//, '/movie.star/');
        new Ten.XHR(uri, { method: 'POST', data: { 'delete': '1', rks: Hatena.Visitor && Hatena.Visitor.RKS } });
    }
    return this._deleteStar();
};
*/


}
