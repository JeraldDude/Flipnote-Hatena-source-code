var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");

if (!self.Hatena) self.Hatena = {};
if (!Hatena.User) Hatena.User = {};

Hatena.User._getUserInfoFromElement = function () {
  if (this._userInfoFromElementLoaded) return;
  var hui = document.getElementById('hatena-user-info');

  if (!this._hasPlus) this._hasPlus = {};
  if (!hui) return;
  this._userInfoFromElementLoaded = true;
  
  this._hasPlus.UgoMemo = hui.getAttribute('data-has-ugomemo-plus') == '1';
};

Hatena.User.hasPlus = function (service) {
  this._getUserInfoFromElement();
  return this._hasPlus[service];
};

Hatena.User.asyncObject = function () {
  Ten.AsyncLoader.executeWithObject('id=hatena-user-info', function (user) {
    Ten.AsyncLoader.registerObject('Hatena.User', this);
  });
  return 'Hatena.User';
};
if (!Hatena.AC) Hatena.AC = {};
Hatena.AC.User = new Ten.Class({
  asyncObject: function () {
    if (!this._asyncObjectRegistered) {
      Ten.AsyncLoader.executeWithObject(Hatena.User.asyncObject(), function (user) {
        Ten.AsyncLoader.registerObject('Hatena.AC.User', Hatena.AC.User);
      });
      this._asyncObjectRegistered = true;
    }
    return 'Hatena.AC.User';
  },
  useEmojiPalette: function () {
    return Hatena.User.hasPlus('UgoMemo');
  }
});Hatena.API = {};
Hatena.API.Google = {};
/*
  Document: <http://code.google.com/intl/ja/apis/ajaxlanguage/documentation/>
*/

Hatena.API.Google.Language = new Ten.Class({
  _code: {},

  translateHTML: function (s, code, srcLang, toLang) {
    srcLang = srcLang || '';
    toLang = toLang || Hatena.Locale.getTextLang();

    var url = 'https://web.archive.org/web/20130719181356/http://ajax.googleapis.com/ajax/services/language/translate?v=1.0&q=' + encodeURIComponent(s) + '&langpair=' + srcLang + '%7C' + toLang;
    Ten.AsyncLoader.callJSONP(url, function (result) {
      if (result.responseData && result.responseData.translatedText) {
        code(result.responseData.translatedText);
      }
    });
  },

  _translateCallback: function (code, result) {
    if (result.responseData && result.responseData.translatedText) {
      code(result.responseData.translatedText);
    }
  },
  
  brandingHTML: '<span lang=en style="vertical-align: middle; font-family: arial,sans-serif; font-size: 11px;" class="gBrandingText">powered by<img style="padding-left: 1px; vertical-align: middle;" src="https://web.archive.org/web/20130719181356/http://www.google.com/uds/css/small-logo.png"></span>'
});

}
