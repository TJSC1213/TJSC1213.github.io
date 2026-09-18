/* ===========================================================================
   i18n.js — 中英双语切换（无依赖）
   ---------------------------------------------------------------------------
   约定：需要翻译的元素直接在标签上写双语属性，中文文本同时作为无 JS 时的默认值。

     <a href="/" data-zh="首页" data-en="Home">首页</a>

   支持的写法：
     data-zh / data-en                  → 替换 textContent
     data-zh-html / data-en-html        → 替换 innerHTML（值里可以含标签）
     data-zh-<attr> / data-en-<attr>    → 替换任意属性，例如
                                          data-zh-aria-label / data-en-title

   当前语言存在 <html data-lang="zh|en">，由各页面 <head> 里的内联脚本在
   首次绘制前设置，避免语言闪烁。
   =========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'lang';
  var DEFAULT_LANG = 'zh';
  var HTML_LANG = { zh: 'zh-CN', en: 'en' };
  var ATTR_RE = /^data-(zh|en)(?:-(.+))?$/;

  /* 读取当前语言（由 head 内联脚本预先写好） */
  function currentLang() {
    var l = document.documentElement.getAttribute('data-lang');
    return Object.prototype.hasOwnProperty.call(HTML_LANG, l) ? l : DEFAULT_LANG;
  }

  /* 把单个元素切换到指定语言 */
  function applyTo(el, lang) {
    var attrs = el.attributes;
    var text = null;
    var html = null;
    var i;

    for (i = 0; i < attrs.length; i++) {
      var m = ATTR_RE.exec(attrs[i].name);
      if (!m || m[1] !== lang) continue;

      var suffix = m[2];
      if (!suffix) {
        text = attrs[i].value; // data-zh / data-en
      } else if (suffix === 'html') {
        html = attrs[i].value; // data-zh-html / data-en-html
      } else {
        el.setAttribute(suffix, attrs[i].value); // 其它属性
      }
    }

    // 先写 innerHTML，再写 textContent：两个都写了的话文本优先
    if (html !== null) el.innerHTML = html;
    if (text !== null) el.textContent = text;
  }

  /* 遍历全页元素完成替换。
     注意不能写成 querySelectorAll('[data-zh], [data-en]')，
     否则 data-zh-aria-label 这类属性形式匹配不到属性选择器。 */
  function apply(lang) {
    var nodes = document.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].attributes.length > 0) applyTo(nodes[i], lang);
    }
  }

  function set(lang) {
    if (!Object.prototype.hasOwnProperty.call(HTML_LANG, lang)) lang = DEFAULT_LANG;

    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', HTML_LANG[lang]);

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* 隐私模式下 localStorage 可能不可用，忽略 */
    }

    apply(lang);
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  /* 给 JS 用的取词助手：i18n.text('中文', 'English') */
  function text(zh, en) {
    return currentLang() === 'en' ? en : zh;
  }

  var api = {
    get lang() {
      return currentLang();
    },
    set: set,
    toggle: function () {
      set(currentLang() === 'zh' ? 'en' : 'zh');
    },
    apply: function () {
      apply(currentLang());
    },
    text: text
  };

  window.i18n = api;

  function init() {
    var lang = currentLang();
    document.documentElement.setAttribute('lang', HTML_LANG[lang]);
    apply(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
