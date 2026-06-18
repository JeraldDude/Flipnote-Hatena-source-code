var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
function disableSubmit(form, enable) {
  var elements = form.elements;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].type == 'submit') {
      elements[i].disabled = !enable;
    }
  }
}

Hatena.UgoMemo.getChannelElementFromPath = function(path) {
    var channels = Ten.querySelectorAll('#channelbox .box-body li');
    var exp = typeof(path) == 'string' ? new RegExp(path) : path;
    for (var i=0; i < channels.length; i++) {
        if ( exp.test(Ten.querySelector('a', channels[i]).href) ) return channels[i];
    }
    return null;
};

Hatena.UgoMemo.loadChannels = function(path) {
    if (!path) return;
    Ten.querySelector('#channelbox .box-body .indicator').style.display = 'block';
    new Ten.XHR(path, { method: 'GET' }, function (data) {
        Ten.querySelector('#channelbox .box-body .indicator').style.display = 'none';
        Ten.querySelector('#channelbox .box-body').innerHTML += data.responseText;
        var items = Ten.querySelectorAll('#channelbox .box-body li');
        for (var i=0; i < items.length; i++) {
            Hatena.UgoMemo.ajaxizeDeleteChannel(items[i]);
        }
    });
};

Hatena.UgoMemo.ajaxizeDeleteChannel = function (li) {
    if (!li) return;
    var elem = Ten.querySelector('form.delete-channel',li);
    if (!elem) return;
    var form = Hatena.UgoMemo.Form.ajaxize(
        elem, {
            params: { mode: 'js' },
            onSubmit: function () {
                Ten.querySelector('input.deletebtn',elem).disabled = true;
            },
            onComplete: function (xhr) {
                var json = eval('(' + xhr.request.responseText + ')');
                if (json.success) {
                    Ten.DOM.removeElement(li);
                } else {
                    Ten.querySelector('input.deletebtn',elem).disabled = false;
                }
            },
            onError: function (xhr) {
                Ten.querySelector('input.deletebtn',elem).disabled = false;
            }
        }
    );
};

Ten.DOM.addEventListener('DOMContentLoaded', function () {
    var elem = Ten.DOM.getElementsByTagAndClassName('form', 'add-channel')[0];
    if (!elem) return;
    var addingChannel;
    var form = Hatena.UgoMemo.Form.ajaxize(
        elem, {
            params: { mode: 'js' },
            onSubmit: function () {
                Ten.querySelector('#channelbox .toggle .indicator').style.visibility = 'visible';
                elem['channel-name'].disabled = true;
                disableSubmit(elem, false);
                addingChannel = elem['channel-name'].value;
                var errorsInPage = Ten.querySelectorAll('#channelbox div.error-message');
                for (var i = 0; i < errorsInPage.length; i++) {
                    Ten.DOM.removeElement(errorsInPage[i]);
                }
                var errorElem = Ten.DOM.prevElement(elem);
                while (errorElem && errorElem.className == 'error-message') {
                    var prevElem = Ten.DOM.prevElement(errorElem);
                    Ten.DOM.removeElement(errorElem);
                    errorElem = prevElem;
                }
            },
            onComplete: function (xhr) {
                elem['channel-name'].disabled = false;
                disableSubmit(elem, true);
                Ten.querySelector('#channelbox .toggle .indicator').style.visibility = 'hidden';
                var E = Ten.Element;
                var json = eval('(' + xhr.request.responseText + ')');
                if (json.success) {
                    elem['channel-name'].value    = ''; // æˆåŠŸã—ãŸã¨ãã ã‘æ¶ˆã™ï¼Œå¤±æ•—ã—ãŸã‚‰æ‰“ã¡é–“é•ã„ã‹ã‚‚ã—ã‚Œãªã„
                    var ch = json.channel;
                    var prevElem = Ten.DOM.prevElement(elem.parentNode);
                    var ul = prevElem.getElementsByTagName('ul')[0];
                    if (!ul) {
                        ul = E('ul', { className: 'basiclist' });
                        Ten.DOM.insertBefore(
                            E('div', { className: 'box-body' }, ul),
                            elem.parentNode
                        );
                    }

                    // æ—¢ã«ã‚ã‚‹ã¨ãï¼Œæœ€å¾Œã«ã‚‚ã£ã¦ãã‚‹
                    var oldch = Hatena.UgoMemo.getChannelElementFromPath(ch.path);
                    if (oldch) {
                        ul.appendChild(oldch);
                        return;
                    }

                    var li = E('li', { },
                               E('a', { href: ch.path },
                                 E('img', { className: 'channelicon', width: 32, height: 32, alt: ch.name, src: ch.image_path })
                                ),
                               E('a', { href: ch.path , className: 'related-channel' }, ch.name_in_locale)
                              );
                    var add_form = Ten.querySelector('form.add-channel');
                    if (add_form) {
                        var rkm = add_form.rkm.value;
                        var action = add_form.action.replace(/add_channel/, 'delete_channel');
                        if (rkm && action) {
                            li.appendChild(
                                E('form', { method: 'POST', className: 'delete-channel', action: action },
                                  E('input', {type: 'hidden', name: 'id', value: ch.muid }),
                                  E('input', {type: 'hidden', name: 'rkm', value: rkm }),
                                  E('input', {type: 'image', src: '/images/icon-delete.gif', className: 'deletebtn csschanger',
                                              alt: Hatena.Locale.text('user.movie.channel.delete'), title: Hatena.Locale.text('user.movie.channel.delete')})
                                 )
                            );
                            Hatena.UgoMemo.ajaxizeDeleteChannel(li);
                        }
                    }
                    ul.appendChild(li);
                } else {
                    var input = Ten.querySelector('input#channel-name-form-text');
                    if (input) input.focus();
                    var ul = E('div', { className: 'error-message' });
                    for (var i = 0; i < json.errors.length; i++) {
                      var error = (json.errors[i] instanceof Array) ? json.errors[i][0] : json.errors[i];
                      ul.appendChild(E('p', { innerHTML: error.replace(/ch.create"/, 'ch.create?name=' + encodeURIComponent(addingChannel) + '"') })); // XXX
                    }
                    Ten.DOM.insertAfter(ul, elem);
                }
            },
            onError: function (xhr) {
                elem['channel-name'].disabled = false;
                disableSubmit(elem, true);
                Ten.querySelector('#channelbox .toggle .indicator').style.visibility = 'hidden';
            }
        }
    );

    if (elem['channel-name']) {
        new Hatena.UgoMemo.Form.Placeholder(elem['channel-name']);
    }
});
Ten.DOM.addEventListener('DOMContentLoaded', function () {
    var anchors = Ten.DOM.getElementsByTagAndClassName('span','toggle-btn');
    for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        a.style.cursor = 'pointer';
        new Ten.Observer(a, 'onclick', function(e) {
            Hatena.ToggleNext.toggle(e.target ,'form');
        });
    }
});
Ten.DOM.addEventListener('DOMContentLoaded', function () {
    Hatena.UgoMemo.LazyList.load(document.body.getAttribute('data-children-path') + '?mode=js', function(item) {
        var E = Ten.Element;
        return [new E('li', { },
            new E('a', { href: item.path },
                new E('img', {
                    src: item.small_thumbnail_path,
                    className: 'thumb',
                    alt: item.safe_name,
                    title: item.safe_name
                })
            )
        )];
    });

    var commentbody = document.getElementById('commentbody');
    if (commentbody && commentbody.form) {
        new Ten.Observer(
            commentbody.form,
            'onsubmit',
            function (e) {
                var matches = commentbody.value.match(/\[?(?:ugomemo|flipnote):([0-9A-Fa-f]{16}):([0-9A-Za-z_]{24})\]?|http:\/\/(?:ugo|flip)\w+\.hatena\.(?:ne\.jp|com)\/([0-9A-Fa-f]{16})@DSi\/movie\/([0-9A-Za-z_]{24})(?:\?(?:\w|[&;=])+)?(?:\#(?:\w|-)+)?/g);
                if (matches && matches.length > 1) {
                    alert(Hatena.Locale.text('comment.error.one_memo_in_one_comment'));
                    e.stop();
                    disableSubmit(commentbody.form, true);
                    return;
                }
                disableSubmit(commentbody.form);
            }
        );
    }
});

/* ---------- Comments ---------- */

Hatena.UgoMemo.AjaxComment = {};
Ten.EventDispatcher.implementEventDispatcher(Hatena.UgoMemo.AjaxComment);
Hatena.UgoMemo.AjaxComment.addListenerToPager = function (){
    var links = Ten.querySelectorAll('span.pagenum a');
    for (var i = 0 , len = links.length ; i < len ; i++ ){
    new Ten.Observer(links[i],'onclick',function(e){
      var url = e.target.href;
      url = url.replace('/movie/','/movie.comment/');
      document.getElementById('comment_load_area').innerHTML = '';
      var indicators  = Ten.querySelectorAll('.comment-post-indicator');
      for (var i=0; i<indicators.length; i++) {
          indicators[i].style.display = 'block';
      }
      url = url.split('#')[0];
      url = url.replace(/[?&]id=\d+/,''); //?id=ã‚’å–ã‚‹
      if (url.indexOf('?') == -1 && url.indexOf('&') > -1) url = url.replace(/&/, '?'); // å…ˆé ­ãŒ&ãªã‚‰?ã«ã™ã‚‹
      url = url + ((url.indexOf('?') > -1) ? '&' : '?') + new Date().getTime();
      url = url.replace(/(\?|&)\d+=(&|$)/, '$1$2').replace(/&&/, '&').replace(/\?&/, '?');
      Hatena.UgoMemo.AjaxComment.loadComment(url);
      e.stop();
      });
    }
};

// å¿…è¦ã«é§†ã‚‰ã‚Œã¦ä½œã£ãŸ
Ten.DOM.getElementsByName = function(name, parent) {
    if (typeof(parent) == 'undefined') parent = document;
    var ret = [];
    if (!name) return ret;
    (function(parent) {
        var elems = parent.childNodes;
        for (var i = 0; i < elems.length; i++) {
            var e = elems[i];
            if (e.name == name) {
                ret.push(e);
            }
            arguments.callee(e);
        }
    })(parent);
    ret = Ten.Array.flatten(ret);
    return ret;
};
                                                                       
Hatena.UgoMemo.AjaxComment.loadComment = function loadComment(url){
    // location.hashã§ç¤ºã•ã‚ŒãŸã‚³ãƒ¡ãƒ³ãƒˆã‚’ãƒ­ãƒ¼ãƒ‰ã§ãã¦ã„ãªãã¦ï¼Œidãªã—ã®ã¨ãï¼Œidã¤ãã§ãƒªãƒˆãƒ©ã‚¤ã™ã‚‹
    // idã¤ãã§ãƒªã‚¯ã‚¨ã‚¹ãƒˆã‚’é€ã‚‹ã¨ï¼Œãã®idã®ã‚³ãƒ¡ãƒ³ãƒˆãŒã‚ã‚Œã°ï¼Œãƒšãƒ¼ã‚¸ãƒ£ãƒ¼ã®ä¸Šã«ãã®ã‚³ãƒ¡ãƒ³ãƒˆãŒã¤ã

    Hatena.UgoMemo.AjaxComment.dispatchEvent('loading');
    var error = function() {
        Ten.querySelector('.comment-post-indicator').style.display='none';
        var area = document.getElementById('comment_load_area');
        area.innerHTML = '<p>' + Hatena.Locale.text('global.message.failed') + '</p>';
    };
    var timeOutTimer = setTimeout(error, 30 * 1000);
    var xhr = new Ten.XHR(url, null, function (xhr) {
        clearTimeout(timeOutTimer);
        try {
            var text = xhr.responseText;
        } catch (e) {
            return;
        }
        var shouldRetry = false;
        if (/-c\d+$/.test(location.hash) && ! /page=\d+/.test(url)) {
            var dummyNode = new Ten.Element('div');
            dummyNode.innerHTML = text;
            var gotNeededComment = !!(Ten.DOM.getElementsByName(location.hash.replace(/^#/,''), dummyNode)[0]);
            var requestedWithId = /id=\d+/.test(url);
            shouldRetry = !(gotNeededComment || requestedWithId);
        }
        if (shouldRetry) {
            url += ((/\?/.test(url)) ? '&' : '?') + 'id=' + location.hash.match(/\d+$/);
            loadComment(url);
        } else {
            var area = document.getElementById('comment_load_area');
            area.innerHTML = text;
            Hatena.UgoMemo.AjaxComment.addListenerToPager();
            Hatena.UgoMemo.AjaxComment.addTranslateButton();
            delete Hatena.Star.SiteConfig.entryNodes['div#sidebar'];
            Hatena.Star.EntryLoader.loadNewEntries();
            var indicators  = Ten.querySelectorAll('.comment-post-indicator');
            for (var i=0; i<indicators.length; i++) {
                indicators[i].style.display = 'none';
            }
            // ã‚³ãƒ¡ãƒ³ãƒˆç”»åƒã‚¯ãƒªãƒƒã‚¯ã§æ‹¡å¤§
            var bodies = Ten.querySelectorAll('.commentbody a');
            for (var j = 0, len = bodies.length; j<len; j++) {
                new Ten.Observer(bodies[j], 'onclick', (function(a) {
                    return function(ev) {
                        var img = Ten.querySelector('img', a);
                        if (img && img.className != 'thumb') {
                            var tmp = img.src;
                            img.src = a.href;
                            a.href = tmp;
                            ev.stop();
                        }
                    };
                })(bodies[j]));
            }

            Hatena.UgoMemo.AjaxComment.dispatchEvent('loaded');
        }
    });

    new Ten.Observer(xhr, 'error', function(e) {
        clearTimeout(timeOutTimer);
        error();
    });
        

};

Hatena.UgoMemo.AjaxComment.addTranslateButton = function (buttons){
  buttons = buttons || document.getElementsByTagName('button');
  for (var i = 0 , len = buttons.length; i < len ; i++ ){
    var btn = buttons[i];
    if (Ten.DOM.hasClassName(btn, 'translate-button')) {
      new Ten.Observer(btn, 'onclick', function(e) {
        var commentId = e.target.id.split('-')[2];
        var text = document.getElementById("comment-" + commentId).innerHTML;

        try { pageTracker._trackPageview('/_click/comment_translate_' + commentId) } catch(e) {}

        document.getElementById("translate-button-" + commentId).className += ' ten-hidden';
        var translated = document.getElementById("comment-translated-" + commentId);
        jQuery.getJSON (
          "/comment.translated?id=" + commentId,
          null,
          function (data) {
            translated.innerText = data.translated;
            translated.textContent = data.translated;
            Ten.DOM.show(translated);
          }
        );
      });
    }
  }
};

if (!Hatena.UgoMemo.Comment) {
    Hatena.UgoMemo.Comment = {};
}

Hatena.UgoMemo.Comment.onDeleteFormSubmit = function (form) {
    var $E = Ten.Element;
    var $T = function (msgid) { return Hatena.Locale.text(msgid) };

    var popup = document.getElementById('comment-delete-confirm-popup');
    var subform = popup.getElementsByTagName('form')[0];

    if (arguments.callee.submitObserver) {
        arguments.callee.submitObserver.stop();
    }

    arguments.callee.submitObserver = new Ten.Observer(subform, 'onsubmit', function (e) {
        e.stop();
        Ten.DOM.addClassName(popup, 'ten-hidden');

        form.elements.namedItem('deny_user').value = (subform.elements.namedItem('deny_user').checked ? 1 : 0);
        var container = form;
        while (container && container.tagName.toUpperCase() != 'LI') {
            container = container.parentNode;
        }

        var indicator = document.getElementById('comment-delete-indicator').cloneNode(true);
        container.appendChild(indicator);
        indicator.style.display = '';

        if (!form._ajaxied) {
            var onComplete = function (xhr) {
                try {
                    var result = eval('(' + xhr.request.responseText + ')');
                } catch (e) {
                }

                if (!result.success) return onError(xhr);

                Ten.DOM.removeElement(indicator);

                Ten.DOM.removeAllChildren(container);
                Ten.DOM.removeClassName(container, 'movie_author');

                var message = $E('div', { className: 'ok-message' });
                message.innerHTML = result.message;
                container.appendChild(message);
            };
            var onError = function (xhr) {
                Ten.DOM.removeElement(indicator);
                container.appendChild(
                    $E('div', { className: 'error-message' }, $T('global.message.failed'))
                );
            };
            form._ajaxied = Hatena.UgoMemo.Form.ajaxize(
                form, {
                    params: { mode: 'js' },
                    onComplete: onComplete,
                    onError: onError
                }
            );
        }
        form._ajaxied.submitHandler();
        form._ajaxied.observer.stop();
    });

    if (arguments.callee.mousedownObserver) {
        arguments.callee.mousedownObserver.stop();
    }

    arguments.callee.mousedownObserver = new Ten.Observer(document.body, 'onmousedown', function (e) {
        for (var node = e.target; node; node = node.parentNode) {
            if (node == popup) return;
        }
        Ten.DOM.addClassName(popup, 'ten-hidden');
    });

    var button = Ten.DOM.getElementsByTagAndClassName('input', 'csschanger', form)[0];
    //var pos = Ten.Geometry.getElementPosition(button);
    popup.style.position = 'absolute';
    popup.style.left = $(button).position().left + 'px'; // XXX: jQuery
    popup.style.top  = $(button).position().top + 'px'; // XXX: jQuery
    Ten.DOM.removeClassName(popup, 'ten-hidden');

    return false;
};
Ten.DOM.addEventListener('DOMContentLoaded', function () {
    if (!Ten.Browser.isDSi) Hatena.UgoMemo.AjaxComment.addListenerToPager();
    Hatena.UgoMemo.AjaxComment.addTranslateButton();
});
Ten.DOM.addEventListener('DOMContentLoaded', function () {
    var elem = Ten.querySelectorAll('form.commentform')[0];
    var indicators  = Ten.querySelectorAll('.comment-post-indicator');
    var postButtons = Ten.querySelectorAll('input.ajax-post');
    var commentbody = document.getElementById('commentbody');
    if (!elem || !indicators.length || !commentbody) return;
    var form = Hatena.UgoMemo.Form.ajaxize(
        elem, {
            params: { mode: "js" },
            onSubmit: function () {
                var errorElem = Ten.Selector.getElementsBySelector('div.error-message', elem);
                for(var i = 0, len = errorElem.length; i < len; i++) {
                    Ten.DOM.removeElement(errorElem[i]);
                }
                for (var i = 0, len = indicators.length; i < len; i++) {
                    indicators[i].style.display = 'block';
                }
                for (var i = 0, len = postButtons.length; i <len; i++) {
                    postButtons[i].disabled = true;
                }
            },
            onComplete: function (xhr) {
                disableSubmit(commentbody.form, true); 
                for (var i = 0, len = postButtons.length; i <len; i++) {
                    postButtons[i].disabled = false;
                }
                for (var i = 0, len = indicators.length; i < len; i++) {
                    indicators[i].style.display = "none";
                }

                var count = document.getElementById('comment-count');
                count.innerHTML = Hatena.Locale.number(parseInt(count.getAttribute('data-value')) + 1);
                var area = document.getElementById('comment_load_area');
                var div = Ten.Element('div', { id: 'tmp-div' });
                div.style.display = 'none';
                area.appendChild(div);
                div.innerHTML = xhr.request.responseText;
                var li = Ten.DOM.firstElementChild(div);
                var pager = Ten.querySelectorAll('div.comment-pager');
                if (pager.length > 0) {
                    Ten.DOM.insertBefore(li, pager[pager.length - 1]);
                } else {
                    area.appendChild(li);
                }
                Ten.DOM.removeElement(div);
                var buttons = li.getElementsByTagName('button');
                Hatena.UgoMemo.AjaxComment.addTranslateButton(buttons);
                commentbody.value = '';
            },
            onError: function (xhr) {
                var json;
                if (/^application\/json\b/i.test(xhr.request.getResponseHeader('Content-Type'))) {
                    json = eval('(' + xhr.request.responseText + ')');
                } else {
                    json = {error: 1, messages: [xhr.request.responseText]};
                }

                disableSubmit(commentbody.form, true); 
                for (var i = 0, len = postButtons.length; i <len; i++) {
                    postButtons[i].disabled = false;
                }
                for (var i = 0, len = indicators.length; i < len; i++) {
                    indicators[i].style.display = "none";
                }

                var div = Ten.Element('div', { className: 'error-message' });
                for (var i = 0, len = json.messages.length; i < len; i++) {
                    div.innerHTML += '<p>' + Hatena.Locale.text(json.messages[i]) + '</p>'
                }
                Ten.DOM.insertBefore(div, commentbody);
            }
        }
    );
});

Hatena.UgoMemo.QuickmemoColorChanger = new Ten.Class({
  initialize: function (container, iframe) {
    var self = this;

    this.elements = Ten.DOM.getElementsByStructure(container, [
      {key: 'form', className: 'quickmemo-change-color-form', descendants: [
        {key: 'color', className: 'quickmemo-color-param'},
        {arrayKey: 'colorButtons', className: 'comment-color-button'},
        {key: 'submit', className: 'quickmemo-color-submit'}
      ]},
      {key: 'changed', className: 'quickmemo-color-changed'}
    ]);
    this.elements.container = container;

    var ob = new Ten.Widget.OptionButtons(this.elements.colorButtons, function () {
    }, function (el, checked) {
      if (checked) {
        self.elements.color.value = el.getAttribute('data-color');
      }
    }, false);

    var currentColor = this.elements.color.value;
    if (currentColor != '') {
      for (var i = 0; i < this.elements.colorButtons.length; i++) {
        var cb = this.elements.colorButtons[i];
        if (cb.getAttribute('data-color') == currentColor) {
          ob._onChangeEvent(i);
          break;
        }
      }
    }

    new Ten.Observer(this.elements.submit, 'onclick', function (ev) {
      if (confirm(Hatena.Locale.text('comment.recolor.messages.confirm'))) {
        self.elements.changed.className
            = self.elements.changed.className.replace(/\bten-hidden\b/g, '');
        self.elements.form.className += ' ten-hidden';
        self.elements.form.submit();
      }
      ev.stop();
    });
    self.elements.iframe = iframe;
    self.elements.form.target = iframe.name;
  }
}, {
});
    

  Hatena.Locale.loadTextData();

}
