var _____WB$wombat$assign$function_____=function(name){return (globalThis._wb_wombat && globalThis._wb_wombat.local_init && globalThis._wb_wombat.local_init(name))||globalThis[name];};if(!globalThis.__WB_pmw){globalThis.__WB_pmw=function(obj){this.__WB_source=obj;return this;}}{
let window = _____WB$wombat$assign$function_____("window");
let self = _____WB$wombat$assign$function_____("self");
let document = _____WB$wombat$assign$function_____("document");
let location = _____WB$wombat$assign$function_____("location");
let top = _____WB$wombat$assign$function_____("top");
let parent = _____WB$wombat$assign$function_____("parent");
let frames = _____WB$wombat$assign$function_____("frames");
let opener = _____WB$wombat$assign$function_____("opener");
/* Not the original file!  Don't edit! */

Ten.Browser.isIE6 = navigator.userAgent.indexOf('MSIE 6.') != -1;
Ten.Browser.isIE7 = navigator.userAgent.indexOf('MSIE 7.') != -1;
Ten.Browser.leIE7 = Ten.Browser.isIE6 || Ten.Browser.isIE7;
Ten.Browser.isDSi = navigator.userAgent.indexOf('Nintendo DSi') != -1;

Ten.Browser.noQuirks = document.compatMode == 'CSS1Compat';
if (!Ten.Browser.CSS) Ten.Browser.CSS = {};
Ten.Browser.CSS.noFixed = Ten.Browser.isIE6 || (Ten.Browser.isIE && !Ten.Browser.noQuirks);
Ten.DOM.firstElementChild = function (node) {
  var el = node.firstElementChild || node.firstChild;
  while (el && el.nodeType != 1) {
    el = el.nextSibling;
  }
  return el;
};

/*
  structure = [
    {key: 'root', className: 'container', descendants: [
      {key: 'title', id: 'title'},
      {class: 'section', descendants: [
        {arrayKey: 'items', className: 'item-type1'},
        {arrayKey: 'items', className: 'item-type2'}
      ]}
    ]}
  ];

  return = {
    root: containerElement || undefined,
    title: titleElement || undefined,
    items: [
      itemType1Element1,
      itemType1Element2,
      itemTypr2Element1
    ] || undefined,
  };
*/
Ten.DOM.getElementsByStructure = function (root, structure) {
  var result = {};

  var currentNode = root;
  var nextOfRoot = root.nextSibling;

  var cands = [structure];
  var depth = 0;
  while (currentNode != null && currentNode != nextOfRoot) {
    var currentCands = cands[depth];

    var match = null;
    for (var i = 0; i < currentCands.length; i++) {
      match = currentCands[i];
      /* 注意! className ちゃんとみてないよ */
      if ((match.className != null && currentNode.className &&
              (currentNode.className.indexOf(match.className) > -1)) ||
          (match.id != null && match.id == currentNode.id)) {
        if (match.key) {
          result[match.key] = currentNode;
        } else if (match.arrayKey) {
          if (!result[match.arrayKey]) result[match.arrayKey] = [];
          result[match.arrayKey].push(currentNode);
        }
        break;
      }
      match = null;
    }
    
    if (currentNode.firstChild) {
      currentNode = currentNode.firstChild;
      depth++;
      cands[depth] = (match ? match.descendants : null) || cands[depth - 1];
    } else if (currentNode.nextSibling) {
      currentNode = currentNode.nextSibling;
    } else {
      currentNode = currentNode.parentNode;
      depth--;
      while (currentNode != null && currentNode != root) {
        if (currentNode.nextSibling) {
          currentNode = currentNode.nextSibling;
          break;
        } else {
          currentNode = currentNode.parentNode;
          depth--;
        }
      }
      if (depth < 0) break; // In IE and the source document is not a tree
      if (currentNode == root) break;
    }
  }

  return result;
};

Ten.DOM.getElementSetByClassNames = function (map, container) {
  var elements = {root: []};

  if (map.root) {
    if (map.root instanceof Array) {
      elements.root = map.root;
    } else {
      if (Ten.DOM.hasClassName(container, map.root)) {
        elements.root = [container];
      } else {
        elements.root = Ten.DOM.getElementsByClassName(map.root, container);
      }
    }
    delete map.root;
  }

  var root = elements.root[0] || container || document.body || document.documentElement || document;
  for (var n in map) {
    if (map[n] instanceof Array) {
      elements[n] = map[n];
    } else if (map[n]) {
      elements[n] = Ten.DOM.getElementsByClassName(map[n], root);
    }
  }

  return elements;
};

Ten.DOM.getAncestorByClassName = function (className, node) {
  while (node != null) {
    node = node.parentNode;
    if (Ten.DOM.hasClassName(node, className)) {
      return node;
    }
  }
  return null;
};
Ten.JSON = new Ten.Class({
  parse: function (value) {
    try {
      if (self.JSON && JSON.parse) {
        return JSON.parse (value); // json2.js or ES3.1
      } else {
        return eval ('(' + value + ')');
      }
    } catch (e) {
      return {isError: true, errorMessage: (Ten.Browser.isIE ? e.message : ('' + e))};
    }
  }
});
if (!Ten.Extras) Ten.Extras = {};
Ten.Extras.XHR = new Ten.Class ({
  initialize: function (url, onsuccess, onerror) {
    try {
      this._xhr = new XMLHttpRequest ();
    } catch (e) {
      try {
        this._xhr = new ActiveXObject ('Msxml2.XMLHTTP');
      } catch (e) {
        try {
          this._xhr = new ActiveXObject ('Microsoft.XMLHTTP');
        } catch (e) {
          try {
            this._xhr = new ActiveXObject ('Msxml2.XMLHTTP.4.0');
          } catch (e) {
            this._xhr = null;
          }
        }
      }
    }

    this._url = url;
    this._onsuccess = onsuccess || function () { };
    this._onerror = onerror || function () { };
  }
}, {
  get: function () {
    if (!this._xhr) return;

    var self = this;
    try {
      this._xhr.open ('GET', this._url, true);
      this._xhr.onreadystatechange = function () {
        self._onreadystatechange ();
      }; // onreadystatechange
      this._xhr.send (null);
    } catch (e) {
      this._xhr = new Ten.Extras.XHR.ErrorXHR (e);
      this._onerror ();
    }
  },

  post: function (postCT, postData) {
    if (!this._xhr) return;

    var self = this;
    try {
      this._xhr.open ('POST', this._url, true);
      this._xhr.onreadystatechange = function () {
        self._onreadystatechange ();
      }; // onreadystatechange
      this._xhr.setRequestHeader('Content-Type', postCT);
      this._xhr.send(postData);
    } catch (e) {
      this._xhr = new Ten.Extras.XHR.ErrorXHR (e);
      this._onerror ();
    }
  },

  _onreadystatechange: function () {
    if (this._xhr.readyState == 4) {
      if (this.succeeded ()) {
        this._onsuccess ();
      } else {
        this._onerror ();
      }
    }
  },

  succeeded: function () {
    return (this._xhr.status >= 200 && this._xhr.status < 400);
  },

  getText: function () {
    try {
      return this._xhr.responseText;
    } catch (e) {
      return '';
    }
  },
  getDocument: function () {
    try {
      return this._xhr.responseXML;
    } catch (e) {
      return null;
    }
  },

  getRequestURL: function () {
    var doc = this.getDocument ();
    if (doc) {
      return doc.documentURI || doc.URL;
    }
    return this._url; // might be wrong if redirected
  },

  getMediaTypeNoParam: function () {
    // XXX maybe we should apply HTML5 content sniffing algorithm, at
    // least for unspecified case

    var type = this.getHeaderFieldBody ('Content-Type') || 'text/plain';
    type = (type.split(/;/, 2)[0] || 'text/plain').replace (/\s+/g, '').toLowerCase ();
    return type;
  },

  getHeaderFieldBody: function (name) {
    return this._xhr.getResponseHeader (name);
  },

  getSimpleErrorInfo: function () {
    var r;
    try {
      r = this._xhr.status;
      r += ' ';
      r += this._xhr.statusText;
    } catch (e) { }
    return r;
  }

});
Ten.Extras.XHR.ErrorXHR = new Ten.Class ({
  initialize: function (e) {
    this.status = 400;
    this.statusText = e + '';
  }
}, {
  responseText: '',
  responseXML: null,

  getResponseHeader: function () {
    return null;
  }
});
Ten.Draggable.prototype.startDrag = function (e) {
  if (e.targetIsFormElements()) return;

  var ep = NR.Element.getRects(this.element, window);
  var pos = {x: ep.marginBox.left, y: ep.marginBox.top};

  this.element.style.position = 'absolute';

  this.delta = Ten.Position.subtract(
    e.mousePosition(),
    // Ten.Geometry.getElementPosition(this.element)
    pos
  );
  this.handlers = [
    new Ten.Observer(document, 'onmousemove', this, 'drag'),
    new Ten.Observer(document, 'onmouseup', this, 'endDrag'),
    new Ten.Observer(this.element, 'onlosecapture', this, 'endDrag')
  ];
  e.stop();
};

(function () {
  var origEndDrag = Ten.Draggable.prototype.endDrag;
  Ten.Draggable.prototype.endDrag = function (ev) {
    origEndDrag.apply(this, arguments);

    // Used to emulate 'position: fixed'
    var el = this.element;
    if (el.ontenenddrag) {
      el.ontenenddrag.apply(this, [el]);
    }
  };
})();
Ten.Form = new Ten.Class({
  createDataSetArray: function (form) {
    var params = [];

    var els = form.elements;
    var elsL = els.length;
    for (var n = 0; n < elsL; n++) {
      var el = form.elements[n];
      var name = el.name;
      var type = el.type;
      if (!name || el.disabled) {
        //
      } else if (type == 'checkbox' || type == 'radio') {
        if (el.checked) {
          params.push(name);
          params.push(el.value || 'on');
        }
      } else if (type == 'hidden' && name == '_charset_') {
        params.push(name);
        params.push('utf-8');
      } else if (type == 'submit' || type == 'image' || type == 'reset' ||
                 type == 'button' || type == 'output' || type == 'add' ||
                 type == 'remove' || type == 'move-up' || type == 'move-down') {
        //
      } else {
        params.push(name);
        params.push(el.value || '');
      }
    }

    return params;
  },

  arrayToPostData: function (params) {
    var q = '';
    while (params.length) {
      q += '&' + encodeURIComponent(params.shift());
      q += '=' + encodeURIComponent(params.shift() || '');
    }
    return q.substring(1);
  }
});
if (!Ten.TextArea) Ten.TextArea = {};

/* |ta| is either |textarea| or |input| whose |type| attribute is
   |text| or similar value. */
Ten.TextArea.insertText = function (ta, added) {
  if (document.all && !window.opera) {
    ta.focus();

    var start;
    var end;
    var range = document.selection.createRange();
    if (ta.tagName == 'TEXTAREA') {
      var clone = range.duplicate();
      clone.moveToElementText(ta);
      clone.setEndPoint('EndToEnd', range);
      start = clone.text.length - range.text.length;
      end = clone.text.length - range.text.length + range.text.length;
    } else {
      var taRange = ta.createTextRange();
      taRange.setEndPoint('EndToStart', range);
      start = taRange.text.length;

      taRange = ta.createTextRange();
      taRange.setEndPoint('EndToEnd', range);
      end = taRange.text.length;
    }

    ta.value = ta.value.substring(0, start) + added + ta.value.substring(end);
    ta.focus();
  } else if (window.opera && /Nintendo DS/.test(navigator.userAgent)) {
    // DSi Browser does not preserve cursor position.
    ta.value += added;
  } else {
    var st = ta.scrollTop;
    var ss = ta.selectionStart;
    var se = (ss != ta.selectionEnd);
    ta.value = ta.value.substring (0, ta.selectionStart)
        + added + ta.value.substring (ta.selectionEnd);
    if (se) {
      ta.setSelectionRange (ss, ss + added.length);
    } else {
      ta.setSelectionRange (ss + added.length, ss + added.length);
    }
    ta.scrollTop = st;
    ta.focus ();
  }
}
if (!self.NR) self.NR = {};

if (!NR.index) NR.index = 0;

NR.resetIndex = function () {
  NR.index = 0;
}; // resetIndex


/* --- NR.Rect - Rectangle area --- */

/* Constructors */

NR.Rect = function (t, r, b, l, w, h) {
  if (t != null) {
    this.top = t;
    this.bottom = b != null ? b : t + h;
    this.height = h != null ? h : b - t;
  } else {
    this.bottom = b;
    this.top = b - h;
    this.height = h;
  }
  if (l != null) {
    this.left = l;
    this.right = r != null ? r : l + w;
    this.width = w != null ? w : r - l;
  } else {
    this.right = r;
    this.left = r - w;
    this.width = w;
  }
  this.index = NR.index++;
  this.label = null;
  this.invalid = isNaN (this.top + this.right + this.bottom + this.left + 0);
}; // Rect

NR.Rect.wh = function (w, h) {
  return new NR.Rect (0, null, null, 0, w, h);
}; // wh

NR.Rect.whCSS = function (el, w, h) {
  var px = NR.Element.getPixelWH (el, w, h);
  return NR.Rect.wh (px.width, px.height);
}; // whCSS

NR.Rect.trbl = function (t, r, b, l) {
  return new NR.Rect (t, r, b, l);
}; // trbl

NR.Rect.trblCSS = function (el, t, r, b, l) {
  var lt = NR.Element.getPixelWH (el, l, t);
  var rb = NR.Element.getPixelWH (el, r, b);
  return NR.Rect.trbl (lt.height, rb.width, rb.height, lt.width);
}; // trblCSS

NR.Rect.tlwh = function (t, l, w, h) {
  return new NR.Rect (t, null, null, l, w, h);
}; // tlwh

/* Box properties */

NR.Rect.prototype.isZeroRect = function () {
  return this.width == 0 && this.height == 0;
}; // isZeroRect

/* Box rendering properties */

NR.Rect.prototype.getRenderedLeft = function () {
  return this.left;
}; // getRenderedLeft

NR.Rect.prototype.getRenderedTop = function () {
  return this.top;
}; // getRenderedTop

NR.Rect.prototype.getRenderedWidth = function () {
  return this.width;
}; // getRenderedWidth

NR.Rect.prototype.getRenderedHeight = function () {
  return this.height;
}; // getRenderedHeight

/* Operations */

NR.Rect.prototype.add = function (arg) {
  var r;
  if (arg instanceof NR.Vector) {
      r = new this.constructor
          (this.top + arg.y, null, null, this.left + arg.x,
           this.width, this.height);
    r.prevOp = 'add-vector'; 
  } else if (arg instanceof NR.Band) {
    r = new this.constructor
        (this.top - Math.abs (arg.top),
         this.right + Math.abs (arg.right),
         this.bottom + Math.abs (arg.bottom),
         this.left - Math.abs (arg.left));
    r.prevOp = 'out-edge'; 
  } else {
    throw (arg + " is not a NR.Vector or NR.Band");
  }

  r.prev1 = this;
  r.prev2 = arg;
  r.invalid = this.invalid && arg.invalid;
  return r;
}; // add

NR.Rect.prototype.subtract = function (arg) {
  var r;
  if (arg instanceof NR.Vector) {
      r = new this.constructor
          (this.top - arg.y, null, null, this.left - arg.x,
           this.width, this.height);
    r.prevOp = 'add-vector'; 
  } else if (arg instanceof NR.Band) {
      r = new this.constructor
          (this.top + Math.abs (arg.top),
           this.right - Math.abs (arg.right),
           this.bottom - Math.abs (arg.bottom),
           this.left + Math.abs (arg.left));
      r.prevOp = 'in-edge'; 
  } else {
    throw (arg + " is not a NR.Vector or NR.Band");
  }

  r.prev1 = this;
  r.prev2 = arg;
  r.invalid = this.invalid && arg.invalid;
  return r;
}; // subtract

NR.Rect.prototype.getTopLeft = function () {
  var o = new NR.Vector (this.left, this.top);
  o.prevOp = 'topleft';
  o.prev1 = this;
  o.invalid = this.invalid;
  o.label = this.label + ', top-left corner';
  return o;
}; // getTopLeft

/* Stringifications */

NR.Rect.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Rect.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r += "Invalid \n";
  }
  r += 'Top: ' + this.top + " \n";
  r += 'Right: ' + this.right + " \n";
  r += 'Bottom: ' + this.bottom + " \n";
  r += 'Left: ' + this.left + " \n";
  r += 'Width: ' + this.width + " \n";
  r += 'Height: ' + this.height + " \n";
  return r;
}; // toString

/* Invalid */

NR.Rect.invalid = new NR.Rect (0, 0, 0, 0);
NR.Rect.invalid.label = 'Invalid';
NR.Rect.invalid.invalid = true;


/* --- NR.Vector - Vector --- */

/* Constructor */

NR.Vector = function (x /* width */, y /* height */) {
  this.x = x;
  this.y = y;
  this.width = Math.abs (x);
  this.height = Math.abs (y);
  this.invalid = isNaN (x + y + 0);
  this.index = NR.index++;
  this.label = null;
}; // Vector

/* Box rendering properties */

NR.Vector.prototype.getRenderedLeft = function () {
  return this.x < 0 ? -this.width : 0;
}; // getRenderedLeft

NR.Vector.prototype.getRenderedTop = function () {
  return this.y < 0 ? -this.height : 0;
}; // getRenderedTop

NR.Vector.prototype.getRenderedWidth = function () {
  return this.width;
}; // getRenderedWidth

NR.Vector.prototype.getRenderedHeight = function () {
  return this.height;
}; // getRenderedHeight

/* Operations */

NR.Vector.prototype.negate = function () {
  var r = new this.constructor (-this.x, -this.y);
  r.invalid = this.invalid;
  r.prevOp = 'negate';
  r.prev1 = this;
  r.label = this.label + ', negated';
  return r;
}; // negate

NR.Vector.prototype.add = function (arg) {
  if (!arg instanceof NR.Vector) {
    throw (arg + " is not a NR.Vector");
  }
  var r = new arg.constructor (this.x + arg.x, this.y + arg.y);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'add-vector';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // add

NR.Vector.prototype.subtract = function (arg) {
  if (!arg instanceof NR.Vector) {
    throw (arg + " is not a NR.Vector");
  }
  var r = new arg.constructor (this.x - arg.x, this.y - arg.y);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'sub-vector';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // subtract

/* Stringifications */

NR.Vector.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp === 'topleft' || this.prevOp === 'negate') {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ') ' +
        this.label;
  } else if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Vector.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r = 'Invalid \n';
  }
  r += '(horizontal, vertical) = (x, y) = (';
  r += this.x + ', ';
  r += this.y + ') \n';
  return r;
}; // toString

/* Invalid */

NR.Vector.invalid = new NR.Vector (0, 0);
NR.Vector.invalid.label = 'Invalid';
NR.Vector.invalid.invalid = true;


/* --- NR.Band - Rectangle area with rectangle hole --- */

/* Constructors */

NR.Band = function (t, r, b, l) {
  this.top = t;
  this.right = r;
  this.bottom = b;
  this.left = l;
  this.invalid = isNaN (t + r + b + l + 0);
  this.index = NR.index++;
  this.label = null;
}; // Band

NR.Band.css = function (el, t, r, b, l) {
  var lt = NR.Element.getPixelWH (el, l, t);
  var rb = NR.Element.getPixelWH (el, r, b);
  return new NR.Band (lt.height, rb.width, rb.height, lt.width);
}; // css

/* Box rendering properties */

NR.Band.prototype.getRenderedLeft = function () {
  return -this.left;
}; // getRenderedLeft

NR.Band.prototype.getRenderedTop = function () {
  return -this.top;
}; // getRenderedTop

NR.Band.prototype.getRenderedWidth = function () {
  return this.left + this.right;
}; // getRenderedWidth

NR.Band.prototype.getRenderedHeight = function () {
  return this.top + this.bottom;
}; // getRenderedHeight

/* Operations */

NR.Band.prototype.getTopLeft = function () {
  var r = new NR.Vector (-this.left, -this.top);
  r.invalid = this.invalid;
  r.prevOp = 'topleft';
  r.prev1 = this;
  r.label = this.label + ', outside edge top-left corner, from inside edge';
  return r;
}; // getTopLeft

NR.Band.prototype.add = function (arg) {
  if (!arg instanceof NR.Band) {
    throw (arg + " is not a NR.Band");
  }
  var r = new arg.constructor
      (this.top + arg.top, this.right + arg.right,
       this.bottom + arg.bottom, this.left + arg.left);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'out-edge';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // add

NR.Band.prototype.and = function (arg) {
  if (!arg instanceof NR.Band) {
    throw (arg + " is not a NR.Band");
  }
  var r = new arg.constructor
      (arg.top != 0 ? this.top : 0, arg.right != 0 ? this.right : 0,
       arg.bottom != 0 ? this.bottom : 0, arg.left != 0 ? this.left : 0);
  r.invalid = this.invalid && arg.invalid;
  r.prevOp = 'and';
  r.prev1 = this;
  r.prev2 = arg;
  return r;
}; // and

/* Stringifications */

NR.Band.prototype.getFullLabel = function () {
  var label;
  if (this.prevOp) {
    label = this.index + ' = ' +
        this.prevOp +
        ' (' + this.prev1.index + ', ' + this.prev2.index + ') ' +
        this.label;
  } else {
    label = this.index + ' ' + this.label;
  }
  return label;
}; // getFullLabel

NR.Band.prototype.toString = function () {
  var r = '';
  if (this.invalid) {
    r = 'Invalid \n';
  }
  r += 'Top: ' + this.top + ' \n';
  r += 'Right: ' + this.right + ' \n';
  r += 'Bottom: ' + this.bottom + ' \n';
  r += 'Left: ' + this.left + ' \n';
  return r;
}; // toString

/* Invalid */

NR.Band.invalid = new NR.Band (0, 0, 0, 0);
NR.Band.invalid.label = 'Invalid';
NR.Band.invalid.invalid = true;


/* --- NR.Element --- */

if (!NR.Element) NR.Element = {};

NR.Element.getPixelWH = function (el, w, h) {
  var testEl = el.ownerDocument.createElement ('div');
  testEl.style.display = 'block';
  testEl.style.position = 'absolute';
  testEl.style.margin = 0;
  testEl.style.borderWidth = 0;
  testEl.style.padding = 0;
  var ws = 1;
  w = (w + '').replace (/^-/, function () { ws = -1; return '' });
  if (w == 'auto') w = 0;
  var hs = 1;
  h = (h + '').replace (/^-/, function () { hs = -1; return '' });
  if (h == 'auto') h = 0;
  try {
    // TODO: border-width: medium and so on
    testEl.style.left = w;
    testEl.style.top = h;
  } catch (e) {
  }

  var parentEl = el;
  while (parentEl) {
    try {
      parentEl.appendChild (testEl);
      break;
    } catch (e) { // if |el| is e.g. |img|
      parentEl = parentEl.parentNode || parentEl.ownerDocument.body;
    }
  }
  var px = {width: testEl.style.pixelLeft, height: testEl.style.pixelTop};
  px.width *= ws;
  px.height *= hs;

  var iw = testEl.offsetWidth;
  var ih = testEl.offsetHeight;
  if (w == 'thin' || w == 'medium' || w == 'thick') {
    testEl.style.borderLeft = 'solid black ' + w;
    px.width += testEl.offsetWidth - iw;
  }
  if (h == 'thin' || h == 'medium' || h == 'thick') {
    testEl.style.borderTop = h + ' solid black';
    px.height += testEl.offsetHeight - ih;
  }

  if (testEl.parentNode) testEl.parentNode.removeChild (testEl);
  return px;
}; // getPixelWH

NR.Element.getCumulativeOffsetRect = function (oel, view) {
  var el = oel;

  var en = new NR.Band (0, 0, 0, 0);
  en.label = 'Zero-width band';

  if (/WebKit/.test (navigator.userAgent)) {
    var docEl = el.ownerDocument.documentElement;
    var bodyEl = el.ownerDocument.body;

    /* This correction does not always work when margin collapse
       occurs - to take that effect into account, all children in the layout
       structure have to be checked. */

    if (docEl) {
      var rects = NR.Element.getBoxAreas (docEl, view);

      if (docEl == oel) {
        /* BUG: If viewport is not the root element, this should not be added. */
        en = rects.padding;
      } else if (bodyEl == oel) {
        en = rects.border.add (rects.margin);
        en.label = docEl.nodeName + ' margin + border';
        en = en.add (rects.padding);
        en.label = docEl.nodeName + ' margin + border + padding';
      } else {
        en = rects.padding.add (rects.border);
        en.label = docEl.nodeName + ' border + padding';
        en = en.and (rects.border);
        en.label = docEl.nodeName + ' border ? border + padding : 0';
      }
    }

    if (bodyEl) {
      var rects = NR.Element.getBoxAreas (bodyEl, view);
      
      if (bodyEl == oel) {
        en = en.add (rects.margin);
        en.label += ', with ' + bodyEl.nodeName + ' margin';
      } else {
        en = en.add (rects.border);
        en.label += ', with ' + bodyEl.nodeName + ' border';
      }
    }

    /* td:first-child's offsetTop might not be correct - no idea when this
       occurs and how to fix this. */
  }

  var origin = en.getTopLeft ().negate ();

  var offsetChain = [];
  while (el) {
    offsetChain.unshift (el);
    el = el.offsetParent;
  }

  while (offsetChain.length) {
    var el = offsetChain.shift ();

    var offset = new NR.Vector (el.offsetLeft, el.offsetTop);
    offset.label = el.nodeName + '.offset';

    origin = origin.add (offset);
    origin.label = el.nodeName + ' cumulative offset';
    
    el = el.offsetParent;
  }

  if (view.opera && /* Opera 9.52 */
      oel == oel.ownerDocument.body) {
    var cssRects = NR.Element.getBoxAreas (oel, view);
    origin = origin.add (cssRects.margin.getTopLeft ());
    origin.label = oel.nodeName + ' adjusted offset';
  }

  var offsetBox = NR.Rect.wh (oel.offsetWidth, oel.offsetHeight);
  offsetBox.label = oel.nodeName + ' offset box (width/height)';

  var rect = offsetBox.add (origin);
  rect.label = oel.nodeName + ' cumulative offset box';

  return rect;
}; // getCumulativeOffsetRect

NR.Element.getBoxAreas = function (el, view) {
  var rects = {};
  if (view.getComputedStyle) {
    var cs = view.getComputedStyle (el, null);
    rects.margin = new NR.Band (
      parseFloat (cs.marginTop.slice (0, -2)),
      parseFloat (cs.marginRight.slice (0, -2)),
      parseFloat (cs.marginBottom.slice (0, -2)),
      parseFloat (cs.marginLeft.slice (0, -2))
    );
    rects.border = new NR.Band (
      parseFloat (cs.borderTopWidth.slice (0, -2)),
      parseFloat (cs.borderRightWidth.slice (0, -2)),
      parseFloat (cs.borderBottomWidth.slice (0, -2)),
      parseFloat (cs.borderLeftWidth.slice (0, -2))
    );
    rects.padding = new NR.Band (
      parseFloat (cs.paddingTop.slice (0, -2)),
      parseFloat (cs.paddingRight.slice (0, -2)),
      parseFloat (cs.paddingBottom.slice (0, -2)),
      parseFloat (cs.paddingLeft.slice (0, -2))
    );
    rects.margin.label = el.nodeName + ' computedStyle.margin';
    rects.border.label = el.nodeName + ' computedStyle.border';
    rects.padding.label = el.nodeName + ' computedStyle.padding';
  } else if (el.currentStyle) {
    var cs = el.currentStyle;
    rects.margin = NR.Band.css
        (el, cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft);
    var bs = [cs.borderTopStyle, cs.borderRightStyle,
              cs.borderBottomStyle, cs.borderLeftStyle];
    rects.border = NR.Band.css
        (el,
         bs[0] == 'none' ? 0 : cs.borderTopWidth,
         bs[1] == 'none' ? 0 : cs.borderRightWidth,
         bs[2] == 'none' ? 0 : cs.borderBottomWidth,
         bs[3] == 'none' ? 0 : cs.borderLeftWidth);
    rects.padding = NR.Band.css
        (el, cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft);
    rects.margin.label = el.nodeName + ' computedStyle.margin';
    rects.border.label = el.nodeName + ' computedStyle.border';
    rects.padding.label = el.nodeName + ' computedStyle.padding';
  } else {
    rects.margin = NR.Band.invalid;
    rects.border = NR.Band.invalid;
    rects.padding = NR.Band.invalid;
  }
  return rects;
}; // getBoxAreas

NR.Element.getAttrRects = function (el) {
  var rects = {};

  /* See <http://suika.fam.cx/%7Ewakaba/wiki/sw/n/offset%2A> for
     compatibility problems. */

  rects.offset = NR.Rect.tlwh
      (el.offsetTop, el.offsetLeft, el.offsetWidth, el.offsetHeight);
  rects.offset.label = el.nodeName + '.offset';

  rects.client = NR.Rect.tlwh
      (el.clientTop, el.clientLeft, el.clientWidth, el.clientHeight);
  rects.client.label = el.nodeName + '.client';

  rects.scrollableArea = NR.Rect.wh (el.scrollWidth, el.scrollHeight);
  rects.scrollableArea.label = el.nodeName + '.scroll (width, height)';

  rects.scrollState = new NR.Vector (el.scrollLeft, el.scrollTop);
  rects.scrollState.label = el.nodeName + '.scroll (left, top)';

  return rects;
}; // getAttrRects

NR.Element.getRects = function (el, view) {
  var rects = {};

  if (el.getBoundingClientRect) {
    var origin = NR.View.getViewportRects (view).boundingClientOrigin;

    var bb = el.getBoundingClientRect ();
    rects.boundingClient
        = NR.Rect.trbl (bb.top, bb.right, bb.bottom, bb.left);
    rects.boundingClient.label = el.nodeName + '.boundingClient';

    rects.borderBox = rects.boundingClient.add (origin);
    rects.borderBox.label = el.nodeName + ' border edge';
  } else {
    rects.boundingClient = NR.Rect.invalid;
    rects.boundingClient.label = el.nodeName + '.boundingClient';

    rects.borderBox = NR.Element.getCumulativeOffsetRect (el, view);
  }

  var elRects = NR.Element.getAttrRects (el);
  rects.offset = elRects.offset;
  rects.client = elRects.client;
  rects.scrollableArea = elRects.scrollableArea;
  rects.scrollState = elRects.scrollState;
  
  var cssRects = NR.Element.getBoxAreas (el, view);
  rects.margin = cssRects.margin;
  rects.border = cssRects.border;
  rects.padding = cssRects.padding;

  /* Wrong if |el| has multiple line boxes. */
  rects.marginBox = rects.borderBox.add (rects.margin);
  rects.marginBox.label = el.nodeName + ' margin edge';

  rects.clientAbs = rects.client.add (rects.borderBox.getTopLeft ());
  rects.clientAbs.label = el.nodeName + '.client (canvas origin)';

  if (rects.client.isZeroRect () ||
      (view.opera && (rects.client.width <= 0 || rects.client.height <= 0))) {
    // maybe inline or non-rendered element
    rects.paddingBox = rects.borderBox.subtract (rects.border);
    rects.paddingBox.label = el.nodeName + ' border edge - border';
  } else {
    rects.paddingBox = rects.clientAbs;
  }

  rects.contentBox = rects.paddingBox.subtract (rects.padding);
  rects.contentBox.label = el.nodeName + ' content box';

  return rects;
}; // getRects

NR.Element.getRectsExtra = function (el, view) {
  var rects = {};

  /* Gecko-only, deprecated */
  if (el.ownerDocument.getBoxObjectFor) {
    var bo = el.ownerDocument.getBoxObjectFor (el);
    rects.boxObject = NR.Rect.tlwh (bo.y, bo.x, bo.width, bo.height);
    rects.boxObjectScreen = new NR.Vector (bo.screenX, bo.screenY);
    rects.boxObject.label = el.nodeName + ' boxObject';
    rects.boxObjectScreen.label = el.nodeName + ' boxObject.screen';
  } else {
    rects.boxObject = NR.Rect.invalid;
    rects.boxObjectScreen = NR.Vector.invalid;
  }

  /* WinIE only */
  if (el.createTextRange) {
    var trs = NR.Range.getRectsExtra (el.createTextRange (), view);
    rects.textRangeBounding = trs.bounding;
    rects.textRangeBoundingClient = trs.boundingClient;
    rects.textRangeOffset = trs.offset;
  } else {
    rects.textRangeBounding = NR.Rect.invalid;
    rects.textRangeBoundingClient = NR.Rect.invalid;
    rects.textRangeOffset = NR.Rect.invalid;
  }

  /* Not supported by Gecko */
  if (el.style) {
    var css = el.style;

    rects.pos = new NR.Rect (css.posTop, css.posRight, css.posBottom, css.posLeft,
                             css.posWidth, css.posHeight); // Unit is not pixel.
    rects.pos.label = el.nodeName + '.style.pos';

    rects.px = new NR.Rect (css.pixelTop, css.pixelRight,
                            css.pixelBottom, css.pixelLeft,
                            css.pixelWidth, css.pixelHeight);
    rects.px.label = el.nodeName + '.style.pixel';
  } else {
    rects.pos = NR.Rect.invalid;
    rects.pixel = NR.Rect.invalid;
  }

  /* Not supported by Gecko, WebKit, and WinIE */
  if (el.currentStyle) {
    var css = el.currentStyle;

    rects.currentPos = new NR.Rect
        (css.posTop, css.posRight, css.posBottom, css.posLeft,
         css.posWidth, css.posHeight); // Unit is not pixel.
    rects.currentPos.label = el.nodeName + '.currentStyle.pos';

    rects.currentPx = new NR.Rect (css.pixelTop, css.pixelRight,
                                   css.pixelBottom, css.pixelLeft,
                                   css.pixelWidth, css.pixelHeight);
    rects.currentPx.label = el.nodeName + '.currentStyle.pixel';
  } else {
    rects.currentPos = NR.Rect.invalid;
    rects.currentPixel = NR.Rect.invalid;
  }

  /* Not supported by Gecko and WinIE */
  if (view.getComputedStyle) {
    var css = view.getComputedStyle (el, null);

    rects.computedPos = new NR.Rect
        (css.posTop, css.posRight, css.posBottom, css.posLeft,
         css.posWidth, css.posHeight); // Unit is not pixel.
    rects.computedPos.label = el.nodeName + ' computedStyle.pos';

    rects.computedPx = new NR.Rect (css.pixelTop, css.pixelRight,
                                    css.pixelBottom, css.pixelLeft,
                                    css.pixelWidth, css.pixelHeight);
    rects.computedPx.label = el.nodeName + ' computedStyle.pixel';
  } else {
    rects.computedPos = NR.Rect.invalid;
    rects.computedPixel = NR.Rect.invalid;
  }

  return rects;
}; // getRectsExtra

// Don't use - these stuffs are not interoperable at all
NR.Element.getLineRects = function (el, view) {
  var rects = {};

  /* Not supportedby WebKit */
  rects.clients = [];
  if (el.getClientRects) {
    var crs = el.getClientRects ();
    for (var i = 0; i < crs.length; i++) {
      var cr = crs[i];
      var rect = new NR.Rect (cr.top, cr.right, cr.bottom, cr.left,
                              cr.width, cr.height);
      rect.label = 'Range.getClientRects.' + i;
      rects.clients.push (rect);
    }
  }

  var doc = el.ownerDocument;

  var range;
  if (doc.createRange) {
    /* Gecko, WebKit, Opera */
    range = doc.createRange ();
    range.selectNodeContents (el);
  } else if (doc.body && doc.body.createTextRange) {
    /* WinIE only */
    range = doc.body.createTextRange ();
    range.moveToElementText (el);
  }
  var rr = NR.Range.getRectsExtra (range, view);
  rects.rangeClients = rr.clients;

  return rects;
}; // getLineRects



/* --- NR.Range --- */

if (!NR.Range) NR.Range = {};

// Don't use - these stuffs are not interoperable at all
NR.Range.getRectsExtra = function (range, view) {
  var rects = {};

  /* WinIE only */
  rects.bounding = NR.Rect.tlwh
      (range.boundingTop, range.boundingLeft,
       range.boundingWidth, range.boundingHeight);
  rects.bounding.label = 'Range.bounding';

  /* WinIE only */
  rects.offset = new NR.Vector (range.offsetLeft, range.offsetTop);
  rects.offset.label = 'Range.offset';

  /* WinIE only */
  rects.clients = [];
  if (range.getClientRects) {
    var crs = range.getClientRects ();
    for (var i = 0; i < crs.length; i++) {
      var cr = crs[i];
      var rect = new NR.Rect (cr.top, cr.right, cr.bottom, cr.left,
                              cr.width, cr.height);
      rect.label = 'Range.getClientRects.' + i;
      rects.clients.push (rect);
    }
  }

  /* WinIE only */
  if (range.getBoundingClientRect) {
    var bc = range.getBoundingClientRect ();
    rects.boundingClient = NR.Rect.trbl (bc.top, bc.right, bc.bottom, bc.left);
    rects.boundingClient.label = 'Range.getBoundingClientRect';
  } else {
    rects.boundingClient = NR.Rect.invalid;
  }

  return rects;
}; // getRectsExtra



/* --- NR.View --- */

if (!NR.View) NR.View = {};

NR.View.getBoundingClientRectOrigin = function (view, doc) {
  var parentEl = doc.body || doc.documentElement;
  var testEl = doc.createElement ('non-styled-element');

  if (!testEl.getBoundingClientRect) return NR.Vector.invalid;

  testEl.style.display = 'block';
  testEl.style.position = 'absolute';
  testEl.style.top = 0;
  testEl.style.left = 0;
  testEl.margin = 0;
  testEl.borderWidth = 0;
  testEl.padding = 0;
  parentEl.appendChild (testEl);

  var bc = testEl.getBoundingClientRect ();
  var origin = new NR.Vector (-bc.left, -bc.top);
  origin.label = 'Origin of getBoundingClientRect';

  parentEl.removeChild (testEl);

  return origin;
}; // getBoundingClientRectOrigin

NR.View.getViewportRects = function (view) {
  var doc = view.document;
  var docEl = doc.documentElement;
  var bodyEl = doc.body;

  var quirks = doc.compatMode != 'CSS1Compat';
  
  var rects = {};

  /* Not supported by WinIE */
  rects.windowPageOffset = new NR.Vector (view.pageXOffset, view.pageYOffset);
  rects.windowPageOffset.label = 'window.pageOffset';

  if (docEl) {
    var deRects = NR.Element.getAttrRects (docEl);
    rects.deOffset = deRects.offset;
    rects.deClient = deRects.client;
    rects.deScrollableArea = deRects.scrollableArea;
    rects.deScrollState = deRects.scrollState;
  } else {
    rects.deOffset = NR.Rect.invalid;
    rects.deClient = NR.Rect.invalid;
    rects.deScrollableArea = NR.Rect.invalid;
    rects.deScrollState = NR.Vector.invalid;
  }

  if (bodyEl) {
    var dbRects = NR.Element.getAttrRects (bodyEl);
    rects.bodyOffset = dbRects.offset;
    rects.bodyClient = dbRects.client;
    rects.bodyScrollableArea = dbRects.scrollableArea;
    rects.bodyScrollState = dbRects.scrollState;
  } else {
    rects.bodyOffset = NR.Rect.invalid;
    rects.bodyClient = NR.Rect.invalid;
    rects.bodyScrollState = NR.Rect.invalid;
    rects.bodyScrollableArea = NR.Vector.invalid;
  }

  if (document.all && !window.opera) {
    if (quirks) {
      rects.scrollState = rects.bodyScrollState;
    } else {
      rects.scrollState = rects.deScrollState;
    }
  } else {
    rects.scrollState = rects.windowPageOffset;
  }

  if (quirks) {
    rects.icb = rects.bodyClient;
    rects.icb = rects.icb.subtract (rects.icb.getTopLeft ()); // Safari
    /* This is not ICB in Firefox if the document is in the quirks mode
       and both |html| and |body| has scrollbars.  In such cases there
       is no way to obtain ICB (content edge), AFAICT. */

    if (document.all && !window.opera) {
      /*
          This returns wrong value if the author does not specify the border
          of the |body| element - default viewport border width is 2px, but
          |document.body.currentStyle.borderWidth|'s default is |medium|, which
          is interpreted as |4px| when it was specified by author.
      
      var docElRects = NR.Element.getBoxAreas (bodyEl, view);
      rects.boundingClientOrigin = docElRects.border.getTopLeft ();
      rects.boundingClientOrigin.label = 'Viewport border offset';
      */

      rects.boundingClientOrigin
          = NR.View.getBoundingClientRectOrigin (view, doc);
    }
  } else {
    if (document.all && !window.opera) {
      rects.icb = rects.deOffset;

      rects.boundingClientOrigin = rects.icb.subtract (rects.deClient.getTopLeft ());
      rects.boundingClientOrigin.label
          = rects.icb.label + ' - documentElement.client';

      rects.boundingClientOrigin = rects.boundingClientOrigin.getTopLeft ();
    } else {
      rects.icb = rects.deClient;
    }
  }

  /* Firefox's initial containing block is the padding box.  There is 
     no reliable way to detect the offset from the tl of canvas in Fx
     while returning zero in any other browsers AFAICT, sniffing Gecko by
     UA string. */
  if (navigator.userAgent.indexOf("Gecko/") >= 0) {
    var deBorder = rects.deOffset.getTopLeft ();
    deBorder.label = 'padding edge -> border edge of root element box';

    var debc = docEl.getBoundingClientRect ();
    debc = NR.Rect.trbl (debc.top, debc.right, debc.bottom, debc.left);
    debc.label = docEl.nodeName + ' boundingClientRect';

    var debcAbs = debc.add (rects.scrollState);
    debcAbs.label = debc.label + ', canvas origin';

    var deMargin = debcAbs.getTopLeft ();
    deMargin.label = 'margin edge -> border edge of root element box';

    rects.canvasOrigin = deBorder.add (deMargin.negate ());
    rects.canvasOrigin.label = 'Canvas origin';

    rects.icb = rects.icb.subtract (rects.canvasOrigin);
    rects.icb.label = 'ICB (origin: margin edge of root element box)';
  } else {
    rects.canvasOrigin = new NR.Vector (0, 0);
    rects.canvasOrigin.label = 'Canvas origin';
  }

  rects.contentBox = rects.icb.add (rects.scrollState);
  rects.contentBox.label = 'Viewport content box';

  if (rects.boundingClientOrigin) {
    if (document.all && !window.opera && quirks) {
      //
    } else {
      rects.boundingClientOrigin
          = rects.boundingClientOrigin.add (rects.scrollState);
      rects.boundingClientOrigin.label = 'Bounding client rect origin';
    }
  } else {
    rects.boundingClientOrigin = rects.scrollState;
  }

  rects.boundingClientOrigin
      = rects.boundingClientOrigin.add (rects.canvasOrigin);
  rects.boundingClientOrigin.label = 'Bounding client rect origin (canvas origin)';

  return rects;
}; // getViewportRects

NR.View.getViewportRectsExtra = function (view) {
  var rects = {};

  var doc = view.document;

  /* Fx, WebKit, Opera: entire viewport (including scrollbars),
     Not supported by WinIE */
  rects.windowInner = NR.Rect.wh (view.innerWidth, view.innerHeight);
  rects.windowInner.label = 'window.inner';

  /* Fx3, WebKit: Same as page offset; Not supported by Opera, WinIE */
  rects.windowScrollXY = new NR.Vector (view.scrollX, view.scrollY);
  rects.windowScrollXY.label = 'window.scroll (x, y)';

  /* Not supported by WebKit, Opera, WinIE */
  rects.windowScrollMax = new NR.Vector (view.scrollMaxX, view.scrollMaxY);
  rects.windowScrollMax.label = 'window.scrollMax';

  /* Not supported by Opera, WinIE */
  rects.document = NR.Rect.wh (doc.width, doc.height);
  rects.document.label = 'Document';

  return rects;
}; // getViewportRectsExtra

NR.View.getWindowRects = function (view) {
  var rects = {};

  /* Not supported by WinIE */
  rects.outer = NR.Rect.wh (view.outerWidth, view.outerHeight);
  rects.outer.label = 'window.outer';

  /* Opera: Wrong; Not supported by WinIE */
  rects.screenXY = new NR.Vector (view.screenX, view.screenY);
  rects.screenXY.label = 'window.screen (x, y)';

  /* Not supported by Fx3 */
  rects.screenTL = new NR.Vector (view.screenLeft, view.screenTop);
  rects.screenTL.label = 'window.screen (top, left)';

  return rects;
}; // getWindowRects

NR.View.getScreenRects = function (view) {
  var s = view.screen;

  var rects = {};
 
  /* top & left not supported by Opera, WinIE, WebKit */
  rects.device = NR.Rect.tlwh (s.top || 0, s.left || 0, s.width, s.height);
  rects.device.label = 'screen device';

  /* top & left not supported by Opera, WinIE */
  rects.avail = NR.Rect.tlwh
      (s.availTop || 0, s.availLeft || 0, s.availWidth, s.availHeight);
  rects.avail.label = 'screen.avail';

  return rects;
}; // getScreenRects

/* --- NR.Event --- */

if (!NR.Event) NR.Event = {};

NR.Event.getRects = function (ev, view, vpRects /* optional */) {
  var rects = {};

  rects.client = new NR.Vector (ev.clientX, ev.clientY);
  rects.client.label = 'event.client';

  /* Not supported by Gecko */
  rects.offset = new NR.Vector (ev.offsetX, ev.offsetY);
  rects.offset.label = 'event.offset';

  var vp = vpRects || NR.View.getViewportRects (view);

  rects.viewport = rects.client.add (vp.canvasOrigin);
  rects.viewport.label = 'event (viewport origin)';

  //rects.canvas = rects.page.add (vp.canvasOrigin);
  rects.canvas = rects.viewport.add (vp.scrollState);
  rects.canvas.label = 'event (canvas origin)';

  return rects;
}; // getRects

NR.Event.getRectsExtra = function (ev) {
  var rects = {};

  rects.screen = new NR.Vector (ev.screenX, ev.screenY);
  rects.screen.label = 'event.screen';

  /* Not supported by Gecko, WebKit, Opera, WinIE (was supported by NC4) */
  rects.wh = new NR.Vector (ev.width, ev.height);
  rects.wh.label = 'event.width, event.height';

  /* Not supported by WinIE */
  rects.page = new NR.Vector (ev.pageX, ev.pageY);
  rects.page.label = 'event.page';

  /* Not supported by Opera, WinIE */
  rects.layer = new NR.Vector (ev.layerX, ev.layerY);
  rects.layer.label = 'event.layer';

  /* Not supported by Gecko */
  rects.xy = new NR.Vector (ev.x, ev.y);
  rects.xy.label = 'event.x, event.y';

  return rects;
}; // getRectsExtra



if (self.NROnLoad) {
  NROnLoad ();
}

/* 

NR.js - Cross-browser wrapper for CSSOM View attributes

Documentation: <http://suika.fam.cx/%7Ewakaba/wiki/sw/n/NodeRect%2Ejs>.

Author: Wakaba <w@suika.fam.cx>.

*/

/* ***** BEGIN LICENSE BLOCK *****
 * Copyright 2008-2009 Wakaba <w@suika.fam.cx>.  All rights reserved.
 *
 * This program is free software; you can redistribute it and/or 
 * modify it under the same terms as Perl itself.
 *
 * Alternatively, the contents of this file may be used 
 * under the following terms (the "MPL/GPL/LGPL"), 
 * in which case the provisions of the MPL/GPL/LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of the MPL/GPL/LGPL, and not to allow others to
 * use your version of this file under the terms of the Perl, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the MPL/GPL/LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the Perl or the MPL/GPL/LGPL.
 *
 * "MPL/GPL/LGPL":
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * <http://www.mozilla.org/MPL/>
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is NodeRect code.
 *
 * The Initial Developer of the Original Code is Wakaba.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Wakaba <w@suika.fam.cx>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
Ten.Box = new Ten.Class({
  placePopupBottom: function (el, refEl) {
    var eb = NR.Element.getRects(refEl, window);

    var l = eb.borderBox.left;
    var t = eb.borderBox.bottom;

    var vp = NR.View.getViewportRects(window).contentBox;
    if (vp.right < l + el.offsetWidth) {
      l = vp.right - el.offsetWidth;
    }
    if (l < 0) l = 0;

    el.style.left = l + 'px';
    el.style.top  = t + 'px';
  },

  _copiedProps: [
      'fontFamily', 'fontSize', 'lineHeight',
      'borderTopStyle', 'borderTopColor', 'borderTopWidth',
      'borderRightStyle', 'borderRightColor', 'borderRightWidth',
      'borderBottomStyle', 'borderBottomColor', 'borderBottomWidth',
      'borderLeftStyle', 'borderLeftColor', 'borderLeftWidth', 'paddingTop',
      'paddingRight', 'paddingBottom', 'paddingLeft', 'backgroundImage',
      'backgroundColor', 'backgroundRepeat', 'backgroundAttachment',
      'backgroundPosition', 'backgroundPositionX', 'backgroundPositionY',
      'color', 'verticalAlign'
  ],
  placePopupOverlayWithStyles: function (el, refEl) {
    var eb = NR.Element.getRects(refEl, window);
    var box = Ten.Browser.leIE7 ? eb.contentBox : eb.borderBox;

    el.style.left = eb.borderBox.left + 'px';
    el.style.top = eb.borderBox.top + 'px';
    el.style.width = box.width + 'px';
    el.style.height = box.height + 'px';

    var props = this._copiedProps;
    for (var i in props) {
      var p = props[i];
      try {
        el.style[p] = Ten.Style.getElementStyle(refEl, p);
      } catch (e) { }
    }
  },

  /*
    Depending on the browser in use and at which phase in the process
    of the element creation, insertion, and rendering, coordinate values
    could be zero, negative, or NaN.  You might want to invoke this
    method in Ten.AsyncLoader.tryToExecute wrapper, that is why this
    method returns a boolean value.
  */
  placePopupBottomRight: function (el, refEl) {
    var l = 0;
    var t = 0;

    var eb = NR.Element.getRects(el, window);
    if (eb.contentBox.width <= 0) {
      return false;
    }

    var vp = NR.View.getViewportRects(window).contentBox;
    if (refEl) {
      var reb = NR.Element.getRects(refEl, window);
      l = reb.marginBox.right - eb.marginBox.width;
      t = reb.borderBox.top - eb.marginBox.height;
    } else {
      l = vp.right - eb.marginBox.width;
      t = vp.bottom - eb.marginBox.height;
    }

    if (isNaN(l) || isNaN(t)) {
      return false;
    }

    if (l < 0) l = 0;
    if (t < 0) t = 0;

    this.setPositionFixed(el, l, t);

    return true;
  },

  setPositionFixed: function (el, l, t) {
    // Don't use CSS's 'position: fixed' because Ten.Dragger does
    // not support it.
    //if (Ten.Browser.CSS.noFixed) {
      var vp = NR.View.getViewportRects(window);
      el.tenOriginalLeft = l - vp.scrollState.x;
      el.tenOriginalTop = t - vp.scrollState.y;
      el.style.position = 'absolute';
      var code = function () {
        var vp = NR.View.getViewportRects(window);
        el.style.left = (el.tenOriginalLeft + vp.scrollState.x) + 'px';
        el.style.top = (el.tenOriginalTop + vp.scrollState.y) + 'px';
      };
      code();
      new Ten.Observer(window, 'onscroll', code);
      el.ontenenddrag = function (el) {
        var ep = NR.Element.getRects(el, window);
        var t = ep.marginBox.top;
        var l = ep.marginBox.left;
        var vp = NR.View.getViewportRects(window);
        el.tenOriginalLeft = l - vp.scrollState.x;
        el.tenOriginalTop = t - vp.scrollState.y;
      };
    /*} else {
      el.style.position = 'fixed';
      el.style.left = l + 'px';
      el.style.top = t + 'px';
    }*/
  }
});
/*
// require Ten.js
*/

/* Ten.Resizable */
Ten.Resizable = new Ten.Class({
    initialize: function(window) {
        this.window = window;
        if (Ten.Selector.getElementsBySelector('span.toggle-button', this.window).length == 0) {
            this.setupToggleButton();
        }
        if (Ten.Selector.getElementsBySelector('span.resize-button', this.window).length == 0) {
            this.setupResizeButton();
        }
    }
}, {
    setupToggleButton: function() {
        this.toggleButton = new Ten.Element('span', {className: 'toggle-button'},
                                            new Ten.Element('img', {src: 'https://web.archive.org/web/20100901015223/http://ugomemo.hatena.ne.jp/images/maximize.gif'}));
        Ten.Style.applyStyle(this.toggleButton, this.toggleButtonStyle);
        this.window.appendChild(this.toggleButton);
        new Ten.Observer(this.toggleButton, 'onclick', this, 'toggleMaximum');
    },
    setupResizeButton: function() {
        this.resizeButton = new Ten.Element('span', {className: 'resize-button'},
                                            new Ten.Element('img', {src: 'https://web.archive.org/web/20100901015223/http://ugomemo.hatena.ne.jp/images/resize.gif'}));
        Ten.Style.applyStyle(this.resizeButton, this.resizeButtonStyle);
        this.window.appendChild(this.resizeButton);
        new Ten.Observer(this.resizeButton, 'onmousedown', this, 'startResize');
        this.handlers = [];
    },
    setAsMaximum: function() {
        this.maximum = true;
        Ten.Selector.getElementsBySelector('img', this.toggleButton)[0].src = 'https://web.archive.org/web/20100901015223/http://ugomemo.hatena.ne.jp/images/normalize.gif';
    },
    setAsNormal: function() {
        this.maximum = false;
        Ten.Selector.getElementsBySelector('img', this.toggleButton)[0].src = 'https://web.archive.org/web/20100901015223/http://ugomemo.hatena.ne.jp/images/maximize.gif';
    },
    toggleMaximum: function() {
        if (this.maximum) {
            this.normalize();
        } else {
            this.maximize();
        }
    },
    maximize: function() {
        this.normalStyle = {left: Ten.Style.getElementStyle(this.window, 'left'),
                            top: Ten.Style.getElementStyle(this.window, 'top'),
                            width: Ten.Style.getElementStyle(this.window, 'width'),
                            height: Ten.Style.getElementStyle(this.window, 'height')};
        Ten.Style.applyStyle(this.window, this.maximumStyle());
        this.setAsMaximum();
    },
    normalize: function() {
        Ten.Style.applyStyle(this.window, this.normalStyle);
        this.setAsNormal();
    },
    startResize: function(e) {
        if (e.targetIsFormElements()) return;
        this.delta = Ten.Position.subtract(
            Ten.Geometry.getElementPosition(this.window),
            Ten.Position.subtract(e.mousePosition(),Ten.Geometry.getElementPosition(this.resizeButton))
        );
        this.handlers = [
            new Ten.Observer(document, 'onmousemove', this, 'resize'),
            new Ten.Observer(document, 'onmouseup', this, 'endResize'),
            new Ten.Observer(this.resizeButton, 'onlosecapture', this, 'endResize')
        ];
        e.stop();
        this.setAsNormal();
    },
    resize: function(e) {
        var pos = Ten.Position.subtract(e.mousePosition(), this.delta);
        var newSize = {
            width: pos.x + 'px',
            height: pos.y + 'px'
        };
        Ten.Style.applyStyle(this.window, newSize);
        if (this.innerElement) {
            var newHeight = pos.y;
            if (this.rejectElement) {
                newHeight -= this.rejectElement.clientHeight;
            }
            newSize = {height: newHeight + 'px'};
            Ten.Style.applyStyle(this.innerElement, newSize);
        }
        e.stop();
    },
    endResize: function(e) {
        for (var i = 0; i < this.handlers.length; i++) {
            this.handlers[i].stop();
        }
        if(e) e.stop();
    },
    toggleButtonStyle: {
        position: 'absolute',
        top: '8px',
        right: '26px',
        cursor: 'pointer'
    },
    resizeButtonStyle: {
        position: 'absolute',
        bottom: '0px',
        right: '4px',
        cursor: 'nw-resize'
    },
    toggleButton: null,
    maximum: false,
    normalStyle: {},
    maximumStyle: function() {
        var scroll = Ten.Geometry.getScroll();
        return {
            left: scroll.x + 'px',
            top:  scroll.y + 'px',
            width: '100%',
            height: '100%'
        };
    }
});
if (!Ten.Widget) Ten.Widget = {};
Ten.Widget.OptionButtons = new Ten.Class({
  initialize: function (elements, onbeforechange, onchange, allowBlank) {
    this.elements = elements;
    this.onbeforechange = onbeforechange;
    this.onchange = onchange;
    this.allowBlank = allowBlank;

    var self = this;
    for (var i = 0; i < elements.length; i++) {
      new Ten.Observer(elements[i], 'onmousedown', (function (j) {
        return function (ev) { self._onChangeEvent(j); ev.stop() };
      })(i));
    }
  }
},{
  // selectedIndex: undefined/null/0..
  _onChangeEvent: function (index) {
    var selected = this.selectedIndex;
    if (selected === undefined) {
      selected = null;
      for (var i = 0; i < this.elements.length; i++) {
        if (this.elements[i].getAttribute('src', 2) == this.elements[i].getAttribute('data-on-src')) {
          selected = i;
          this.selectedIndex = i;
          break;
        }
      }
    }

    var self = this;
    var el = this.elements[index];
    if (selected == index) {
      if (this.allowBlank) {
        el.setAttribute('src', el.getAttribute('data-off-src'));
        this.selectedIndex = null;
        self.onbeforechange(el, false);
        self._callForDSi(function () { self.onchange(el, false) });
      }
    } else if (selected == null) {
      el.setAttribute('src', el.getAttribute('data-on-src'));
      this.selectedIndex = index;
      self.onbeforechange(el, true);
      self._callForDSi(function () { self.onchange(el, true) });
    } else {
      var oldEl = this.elements[selected];
      oldEl.setAttribute('src', oldEl.getAttribute('data-off-src'));
      el.setAttribute('src', el.getAttribute('data-on-src'));
      self.onbeforechange(el, true);
      this.selectedIndex = index;
      self._callForDSi(function () {
        self.onchange(oldEl, false);
        self.onchange(el, true);
      });
    }
  },

  _callForDSi:
    window.opera && /Nintendo DS/.test(navigator.userAgent)
      ? function (func) { var self = this; setTimeout(function () { func.call(self) }, 300) }
      : function (func) { func.call(this) },

  selectByIndex: function (i) {
    this._onChangeEvent(i);
  }
});
/*
  button: Dropdown button
  ref: Reference element used to place the panel (default: same as button)
  panel: Dropdown panel
  
  @data-panel-close-button on an element within the panel: Clicking
  the element will close the panel.

  @data-panel-align = left/right on the button: Controls how the panel
  is aligned with the reference element.
*/
Ten.Widget.DropDown = new Ten.Class({
  initialize: function (ancestor, structure) {
    var self = this;

    self.elements = Ten.DOM.getElementsByStructure(ancestor, structure);

    new Ten.Observer(self.elements.button, 'onmousedown', function (ev) {
      self.toggle();
      ev.stop();
    });
    new Ten.Observer(self.elements.panel, 'onmousedown', function (ev) {
      if (ev.target.getAttribute('data-panel-close-button') != null) {
        self.hide();
      }
      ev.stop();
    });
    new Ten.Observer(document.body, 'onmousedown', function (ev) {
      self.hide();
    });
    new Ten.Observer(window, 'onresize', self, 'setPanelPosition');
    self.setPanelPosition();
  }
}, {
  setPanelPosition: function () {
    var panel = this.elements.panel;
    var align = this.elements.button.getAttribute('data-panel-align');

    var ref = this.elements.ref || this.elements.button;

    var p = Ten.Geometry.getElementPosition(ref);
    p.bottom = p.y + ref.clientHeight;
    p.right = p.x + ref.offsetWidth;
    p.left = p.x;

    panel.style.top = p.bottom + 'px';
    if (align == 'right') {
      panel.style.right = Ten.Geometry.getWindowSize().w - p.right + 'px';
    } else { // left
      panel.style.left = p.left + 'px';
    }
  },

  shown: false,
  toggle: function () {
    if (this.shown) {
      this.hide();
    } else {
      this.show();
    }
  },
  show: function () {
    if (this.shown) return;
    this.setPanelPosition();
    this.elements.button.className += ' ten-open';
    this.elements.panel.className
        = this.elements.panel.className.replace(/\bten-hidden\b/g, '');
    this.shown = true;
  },
  hide: function () {
    if (!this.shown) return;
    this.elements.button.className
        = this.elements.button.className.replace(/\bten-open\b/g, '');
    this.elements.panel.className += ' ten-hidden';
    this.shown = false;
  }
});
if (!Ten.Storage) Ten.Storage = {};
Ten.Storage.Local = new Ten.Class({
  initialize: function () {
    if (self.localStorage) {
      this.localStorage = self.localStorage;
    } else if (self.globalStorage) {
      this.localStorage = self.globalStorage[document.domain];
    } else {
      return new Ten.Cookie();
    }
  }
}, {
  get: function (key) {
    return this.localStorage[key];
  },
  set: function (key, value) {
    return this.localStorage[key] = value;
  }
});
Ten.Array.find = function (arr, cond) {
  var code = (cond instanceof Function) ? cond : function (v) {
    return v == cond;
  };
  var arrL = arr.length;
  for (var i = 0; i < arrL; i++) {
    if (code(arr[i])) {
      return arr[i];
    }
  }
  return undefined; // not null
};

Ten.Array.forEach = function (arraylike, code) {
  var length = arraylike.length;
  for (var i = 0; i < length; i++) {
    var r = code(arraylike[i]);
    if (r && r.stop) return r.returnValue;
  }
  return null;
};
Ten.AsyncLoader = new Ten.Class({

  /* ------ Asynchronous communication ------ */

  loadScripts: function (urls, onload) {
    var number = urls.length;
    var counter = 0;
    var check = function () {
      if (counter == number) {
        onload();
      }
    };
    Ten.Array.forEach(urls, function (url) {
      /* XXX
      if (/\.css(?:\?|$)/.test(url)) {
        SAMI.Style.loadStyle(url, function () {
          counter++;
          check();
        });
        return;
      }
      */

      var script = document.createElement('script');
      script.src = url;
      script.charset = 'utf-8';
      script.onload = function () {
        counter++;
        check();
        script.onload = null;
        script.onreadystatechange = null;
      };
      if (Ten.Browser.isIE) {
        script.onreadystatechange = function () {
          if (!event.srcElement) return;
          if (script.readyState != 'complete' && script.readyState != 'loaded') {
            return;
          }
          counter++;
          check();
          script.onload = null;
          script.onreadystatechange = null;
        };
      }
      Ten.AsyncLoader.insert(script);
    });
  },

  _callbackCode: {},
  callJSONP: function (url, code, paramName) {
    paramName = paramName || 'callback';

    var key = 'k' + (Math.random() + '').replace(/\./, '');

    this._callbackCode[key] = function (result) {
      code(result);
      delete Ten.AsyncLoader._callbackCode[key];
    };

    if (/\?/.test(url)) {
      url += '&' + paramName + '=Ten.AsyncLoader._callbackCode.' + key;
    } else {
      url += '?' + paramName + '=Ten.AsyncLoader._callbackCode.' + key;
    }
    Ten.AsyncLoader.loadScripts([url], function () { });
  },

  /* ------ Asynchronous Fragment Loading Protocol ------ */

  pageFragmentLoader: function (urlOrForm, additionalParams) {
    return new Ten.AsyncLoader.PageFragmentLoader(urlOrForm, additionalParams);
  },
  asyncizeLinks: function (linkClassName, containers, code) {
    this.executeWhenFragmentLoadedOrNow(function (root) {
      var links = Ten.DOM.getElementsByClassName(linkClassName, root);
      for (var i = 0; i < links.length; i++) (function (link) {
        var url = link.href;
        new Ten.Observer(link, 'onclick', function (ev) {
          var pf = Ten.AsyncLoader.pageFragmentLoader(url);
          pf.openURLOnError = true;
          pf.setLoadStartEnd(null, function () {
            // XXX
            var query = this.url.replace(/\#.*/, '').split(/\?/, 2)[1] || '';
            query = query.replace(/^\?/, '').split(/[&;]/);
            var newQuery = ['async=' + linkClassName];
            for (var i = 0; i < query.length; i++) {
              var q = query[i];
              if (!/^(?:locale\..*|only)=/.test(q)) newQuery.push(q);
            }
            newQuery = newQuery.join('&');
            // XXX use location.hash = xxx when onhashchange is available
            location.replace('#' + newQuery);
          });
          pf.addElements(containers).start();
          if (code) {
            code.apply(pf, []);
          }
          ev.stop();
        });
      })(links[i])
    });

    this.setFragmentQueryParamHandler(linkClassName, function (params) {
      var url = location.pathname + '?' + params.join('&');
      var pf = this.pageFragmentLoader(url).addElements(containers);
      pf.openURLOnError = true;
      pf.start();
    });
  },
  asyncize: function (map, additionalParams, code) {
    this.executeWhenFragmentLoadedOrNow(function (root) {
      var subtrees = Ten.DOM.getElementSetByClassNames({
        root: map.root || map.target
      }, root).root;
      for (var i = 0; i < subtrees.length; i++) (function (subtree) {
        var origRoot = map.root;
        var origTarget = map.target;
        var sRoot;
        if (origRoot) {
          map.root = [subtree];
          sRoot = subtree;
        } else {
          map.target = [subtree];
          sRoot = null; // Intentionally ignores /root/ here
        }
        var elements = Ten.DOM.getElementSetByClassNames(map, sRoot);
        map.root = origRoot;
        map.target = origTarget;

        var targetEl = elements.target[0];
        var targetType = targetEl.nodeName.toLowerCase();
        var eventType = 'onclick';
        if (targetType == 'form') {
          eventType = 'onsubmit';
        } else if (targetType == 'noscript') {
          eventType = 'now';
        }
        var onEvent = function (ev) {
          var pf = Ten.AsyncLoader.pageFragmentLoader(targetEl, additionalParams);
          pf.elements = elements;
          pf.openURLOnError = !map.errors;
          if (eventType == 'now') pf.noIndicator = true;
          if (code) {
            code.apply(pf, []);
          }
          pf.start();
          if (ev) ev.stop();
        };
        if (eventType == 'now') {
          onEvent();
        } else {
          new Ten.Observer(targetEl, eventType, onEvent);
        }
      })(subtrees[i])
    });
  },

  /* ------ Asynchronous DOM manipulations ------ */

  insert: function (el) {
    if (Ten.Browser.isIE && !this.isLoadFired) {
      new Ten.Observer(window, 'onload', function () {
        document.body.appendChild(el);
      });
    } else {
      (document.body || document.documentElement.lastChild || document.documentElement || document).appendChild(el);
    }
  },
  insertToBody: function (el, onload) {
    if (Ten.Browser.isIE6 && !this.isLoadFired) {
      new Ten.Observer(window, 'onload', function () {
        document.body.appendChild(el);
        if (onload) {
          onload();
        }
      });
    } else if (document.body) {
      document.body.appendChild(el);
      if (onload) {
        onload();
      }
    } else {
      Ten.AsyncLoader.tryToExecute(function () {
        if (!document.body) return false;

        document.body.appendChild(el);
        if (onload) {
          onload();
        }
        return true;
      });
    }
  },

  /* ------ Asynchronous executions ------ */

  tryToExecute: function (code) {
    if (!code()) {
      setTimeout(function () {
        Ten.AsyncLoader.tryToExecute(code);
      }, 100);
    }
  },
  tryToExecuteReformatting: function (code) {
    if (code()) {
      new Ten.Observer(window, 'onresize', code);
    } else {
      setTimeout(function () {
        Ten.AsyncLoader.tryToExecute(code);
      }, 100);
    }
  },

  _registeredObjects: {},
  _pendingCodes: {},
  registerObject: function (key, value) {
    this._registeredObjects[key] = value;
    Ten.Array.forEach(this._pendingCodes[key] || [], function (code) {
      code(value);
    });
  },
  executeWithObject: function (key, code) {
    var obj = this._registeredObjects[key];
    if (obj) {
      code(obj);
    } else {
      if (!this._pendingCodes[key]) this._pendingCodes[key] = [];
      this._pendingCodes[key].push(code);
    }
  },

  /* ------ On-load processings ------ */

  _OnFragmentLoadedCodes: [],
  _OnFragmentLoaded: function (fragmentRoot) {
    var fr = fragmentRoot.getAttribute('data-ten-fragment-root');
    if (fr) {
      fragmentRoot = Ten.DOM.getAncestorByClassName(fr, fragmentRoot) || fragmentRoot;
    }

    var codes = this._OnFragmentLoadedCodes;
    for (var i = 0; i < codes.length; i++) {
      codes[i](fragmentRoot);
    }
  },
  executeWhenFragmentLoaded: function (code) {
    this._OnFragmentLoadedCodes.push(code);
    this.executeAfterDOMContentLoaded(function () {
      code(document.body);
    });
  },
  executeWhenFragmentLoadedOrNow: function (code) {
    this._OnFragmentLoadedCodes.push(code);
    if (Ten.Browser.isIE || !document.body) {
      this.executeAfterDOMContentLoaded(function () {
        code(document.body);
      });
    } else {
      code(document.body);
    }
  },

  _OnDOMContentLoadedCodes: [],
  _OnDOMContentLoaded: function () {
    while (this._OnDOMContentLoadedCodes.length) {
      var code = this._OnDOMContentLoadedCodes.shift();
      code();
    }
  },

  _OnLoadCodes: [],
  _OnLoad: function () {
    this._OnDOMContentLoaded();
    while (this._OnLoadCodes.length) {
      var code = this._OnLoadCodes.shift();
      code();
    }
  },

  _OnPageshowCodes: [],
  _OnPageshow: function () {
    this._OnLoad();
    while (this._OnPageshowCodes.length) {
      var code = this._OnPageshowCodes.shift();
      code();
    }
  },

  executeAfterDOMContentLoaded: function (code) {
    if (this.isDOMContentLoadedFired) {
      code();
    } else {
      this._OnDOMContentLoadedCodes.push(code);
    }
  },
  executeAfterLoad: function (code) {
    if (this.isLoadFired) {
      code();
    } else {
      this._OnLoadCodes.push(code);
    }
  },

  /* ------ Onhashchange processings ------ */

  _fragmentQueryParamHandler: {},
  //_onLoadFragmentProcessAdded: false,
  setFragmentQueryParamHandler: function (key, code) {
    this._fragmentQueryParamHandler[key] = code;

    if (this._onLoadFragmentProcessAdded) return;
    var self = this;
    // XXX もっとはやいタイミングで実行するべき?
    this.executeAfterDOMContentLoaded(function () {
      self._processFragment();
    });
    this._onLoadFragmentProcessAdded = true;
  },

  // XXX onhashchange support

  _processFragment: function () {
    var key;
    var newParams = [];
    var params = (location.hash || '').replace(/^\#/, '').split(/[&;]/);
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (/^async=/.test(param)) {
        key = decodeURIComponent(param.substring(6));
      } else {
        newParams.push(param);
      }
    }
    if (!key) return;
    var qph = this._fragmentQueryParamHandler[key];
    if (qph) qph.apply(this, [newParams]);
  }
});

new Ten.Observer(Ten.DOM, 'DOMContentLoaded', function () {
  Ten.AsyncLoader.isDOMContentLoadedFired = true;
  Ten.AsyncLoader._OnDOMContentLoaded();
});
new Ten.Observer(window, 'onload', function () {
  Ten.AsyncLoader.isLoadFired = true;
  Ten.AsyncLoader._OnLoad();
});
new Ten.Observer(window, 'onpageshow', function () {
  Ten.AsyncLoader.isPageshowFired = true;
  Ten.AsyncLoader._OnPageshow();
});
Ten.AsyncLoader.PageFragmentLoader = new Ten.Class({
  initialize: function (urlOrForm, additionalParams) {
    var nodeName = urlOrForm.nodeName;
    if (nodeName) {
      nodeName = nodeName.toLowerCase();
      if (nodeName == 'form') {
        this._initWithForm(urlOrForm, additionalParams);
      } else if (nodeName == 'noscript') {
        this._initWithURL(urlOrForm.getAttribute('data-src'));
      } else {
        this._initWithURL(urlOrForm);
      }
    } else {
      this._initWithURL(urlOrForm);
    }
    this.elements = {};
    this._loadStart = [];
    this._loadEnd = [];
  }
}, {
  _initWithURL: function (url) {
    this._onErrorURL = url;
    if (/\?/.test(url)) {
      url = url.replace(/\bonly=body\b/g, '').replace(/&&+/g, '&'); // XXX
      this._onErrorURL = url;
      url += '&only=body';
    } else {
      url += '?only=body';
    }
    if (Hatena.Locale) {
      if (!/local.hatena/.test(location.hostname)) { // XXX server.pl encoding workaround
        url = Hatena.Locale.urlWithLangAndRegion(url);
      }
    }
    this.url = url;
  },
  _initWithForm: function (form, additionalParams) {
    this._form = form;
    this._additionalParams = additionalParams || {};
    this._onErrorURL = location.href;
  },

  method: 'get',
  indicatorKey: 'global',
  //openURLOnError
  //noIndicator

  addElements: function (map) {
    var newElements = Ten.DOM.getElementSetByClassNames(map);
    for (var n in newElements) {
      this.elements[n] = newElements[n];
    }
    return this;
  },

  setLoadStartEnd: function (loadStart, loadEnd) {
    if (loadStart) this._loadStart.push(loadStart);
    if (loadEnd) this._loadEnd.push(loadEnd);
    return this;
  },

  start: function (code) {
    var self = this;
    if (!this.noIndicator) Ten.AsyncLoader.Indicator.start(this.indicatorKey);
    for (var c in this._loadStart) {
      this._loadStart[c].apply(this, []);
    }

    var url;
    var method;
    var postCT;
    var postData;
    if (this._form) {
      url = this._form.action;
      method = this._form.method.toLowerCase();

      var params = Ten.Form.createDataSetArray(this._form);

      if (!/local.hatena/.test(location.hostname)) { // XXX server.pl encoding workaround
        params.push('locale.lang');
        params.push(Hatena.Locale.getTextLang());

        params.push('locale.region');
        params.push(Hatena.Locale.getRegionCode());
      }

      params.push('only');
      params.push('body');

      for (var n in this._additionalParams) {
        params.push(n);
        params.push(this._additionalParams[n]);
      }

      postCT = 'application/x-www-form-urlencoded';
      postData = Ten.Form.arrayToPostData(params);
    } else {
      url = self.url;
      method = this.method;
    }

    var xhr = new Ten.Extras.XHR(url, function () {
      self._onload(this, code);
    }, function () {
      self._onload(this, code);
    });
    if (method == 'post') {
      xhr.post(postCT, postData);
    } else {
      xhr.get();
    }
  },
  _onload: function (xhr, code) {
    var imt = xhr.getMediaTypeNoParam();
    var data;
    if (imt == 'application/json') {
      data = new Ten.AsyncLoader.PageFragmentLoader.JSONData(Ten.JSON.parse(xhr.getText()));
    } else {
      var text = xhr.getText();
      if (text == '' && !xhr.succeeded()) {
        data = new Ten.AsyncLoader.PageFragmentLoader.HTTPData(xhr);
      } else {
        data = new Ten.AsyncLoader.PageFragmentLoader.TextData(text);
      }
    }
    this.data = data;

    var dataIsError = data.isError();
    if (this.openURLOnError && dataIsError) {
      location.href = this._onErrorURL;
      return;
    }

    for (var n in this.elements) {
      if (n == 'root' || n == 'target') continue;
      var value = data.getText(n);
      if (value == null && n != 'errors') continue;
      var els = this.elements[n];
      if (!els) continue;
      if (n == 'errors') {
        if (dataIsError) {
          if (value instanceof Array) {
            var container = document.createElement('div');
            container.className = 'error-message';
            for (var i = 0; i < value.length; i++) {
              var msg = document.createElement('p');
              msg.innerHTML = 'aaa';
              msg.firstChild.data = value[i];
              container.appendChild(msg);
            }
            value = container;
          }
        } else {
          if (!value && Hatena.Locale) {
            var msgid = els[0] ? els[0].getAttribute('data-ok-msgid') : '';
            if (msgid && msgid.length) {
              var msg = document.createElement('div');
              msg.className = 'ok-message';
              msg.innerHTML = 'aaa';
              msg.firstChild.data = Hatena.Locale.text(msgid);
              value = msg;
            }
          }
        }
      }
      for (var i in els) {
        var el = els[i];
        if (value.nodeType) {
          el.innerHTML = '';
          el.appendChild(value);
        } else {
          el.innerHTML = value;
        }
        Ten.AsyncLoader._OnFragmentLoaded(el);
      }
    }

    if (code) code.apply(this, []);
    if (!this.noIndicator) Ten.AsyncLoader.Indicator.stop(this.indicatorKey);
    for (var c in this._loadEnd) {
      this._loadEnd[c].apply(this, []);
    }
  }
});
Ten.AsyncLoader.PageFragmentLoader.TextData = new Ten.Class({
  initialize: function (s) {
    this._text = s;
  }
}, {
  getText: function (key) {
    if (key == 'body') {
      return this._text;
    } else {
      return null;
    }
  },

  isError: function () {
    return false; // XXX
  }
});

Ten.AsyncLoader.PageFragmentLoader.JSONData = new Ten.Class({
  initialize: function (json) {
    this.jsonObject = json;
  }
}, {
  getText: function (key) {
    if (key == 'body' && this.jsonObject[key] == null) {
      if (this.jsonObject.isError) {
        var div = document.createElement('div');
        div.innerHTML = 'xxx';
        div.firstChild.data = this.jsonObject.errorMessage;
        this.jsonObject[key] = '<div class=error-message>' + div.innerHTML + '</div>';
      }
    }
    return this.jsonObject[key];
  },

  isError: function () {
    return this.jsonObject.isError;
  }
});
Ten.AsyncLoader.PageFragmentLoader.HTTPData = new Ten.Class({
  initialize: function (xhr) {
    this._text = xhr.getSimpleErrorInfo();
    this._isError = xhr.succeeded();
  }
}, {
  getText: function (key) {
    if (key == 'body') {
      return this._text;
    } else {
      return null;
    }
  },
  isError: function () {
    return this._isError;
  }
});
Ten.AsyncLoader.Indicator = new Ten.Class({
  _indicator: {},
  _count: {},

  getIndicatorElement: function (key) {
    key = key || 'global';
    if (!this._indicator[key]) {
      this._indicator[key] = document.getElementById('global-indicator');
    }
    return this._indicator[key];
  },
  setIndicatorElement: function (key, el) {
    this._indicator[key] = el;
  },

  start: function (key) {
    key = key || 'global';
    this._count[key]++;
    if (!(this._count[key] > 0)) this._count[key] = 1;
    var el = this.getIndicatorElement(key);
    el.className = el.className.replace(/\bten-hidden\b/g, '');
  },
  stop: function (key) {
    key = key || 'global';
    this._count[key]--;
    if (!(this._count[key] > 0)) {
      var el = this.getIndicatorElement(key);
      el.className += ' ten-hidden';
    }
  }
});
Ten.Style.insertStyleRules = function (css) {
  if (Ten.Browser.isIE) {
    var ss = document.createStyleSheet('about:blank');
    ss.cssText = css;
  } else {
    var style = document.createElement('style');
    style.textContent = css;
    Ten.AsyncLoader.insert(style);
  }
};

}

/*
     FILE ARCHIVED ON 01:52:23 Sep 01, 2010 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 04:16:18 Jun 21, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.652
  exclusion.robots: 0.067
  exclusion.robots.policy: 0.055
  esindex: 0.011
  cdx.remote: 5.997
  LoadShardBlock: 119.511 (3)
  PetaboxLoader3.datanode: 136.278 (4)
  load_resource: 23.431
*/