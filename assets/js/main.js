/* ===========================================================================
   main.js — 站点交互（无依赖）
   ---------------------------------------------------------------------------
   1. 主题切换（浅色 / 深色，记忆到 localStorage）
   2. 语言切换按钮（真正干活的是 i18n.js）
   3. 移动端导航菜单
   4. 滚动时给顶栏加阴影
   5. 代码块复制按钮
   6. 页脚年份
   =========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'theme';
  var i18n = window.i18n;

  /* 取词：优先用 i18n 助手，脚本加载顺序意外时退回中文 */
  function t(zh, en) {
    return i18n && i18n.text ? i18n.text(zh, en) : zh;
  }

  /* --- 1. 主题 ----------------------------------------------------------- */
  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function syncThemeButton() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var isDark = currentTheme() === 'dark';
    btn.setAttribute(
      'aria-label',
      isDark ? t('切换到浅色主题', 'Switch to light theme') : t('切换到深色主题', 'Switch to dark theme')
    );
    btn.setAttribute('title', btn.getAttribute('aria-label'));
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {
        /* localStorage 不可用时忽略 */
      }
    }
    syncThemeButton();
  }

  /* --- 2. 语言按钮 ------------------------------------------------------- */
  function syncLangButton() {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;

    var isEn = i18n && i18n.lang === 'en';
    // 按钮显示的是「点一下会切到哪种语言」
    btn.textContent = isEn ? '中文' : 'EN';
    btn.setAttribute('aria-label', isEn ? '切换到中文' : 'Switch to English');
    btn.setAttribute('title', btn.getAttribute('aria-label'));
  }

  /* --- 3. 移动端菜单 ----------------------------------------------------- */
  function initMenu() {
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    // 点击导航项或按 Esc 时收起
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    // 视口变大后重置，避免桌面上残留展开状态
    window.addEventListener('resize', function () {
      if (window.innerWidth > 780) setOpen(false);
    });
  }

  /* --- 4. 顶栏滚动阴影 --------------------------------------------------- */
  function initHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* --- 5. 代码块复制按钮 ------------------------------------------------- */
  function initCodeBlocks() {
    var pres = document.querySelectorAll('.prose pre');

    for (var i = 0; i < pres.length; i++) {
      (function (pre) {
        var code = pre.querySelector('code');
        if (!code) return;

        // 包一层容器，用来定位复制按钮
        var block = pre.parentElement;
        if (!block || !block.classList.contains('code-block')) {
          block = document.createElement('div');
          block.className = 'code-block';
          pre.parentNode.insertBefore(block, pre);
          block.appendChild(pre);
        }

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.textContent = t('复制', 'Copy');
        block.appendChild(btn);

        var timer = null;

        btn.addEventListener('click', function () {
          var text = code.textContent;

          function done() {
            btn.textContent = t('已复制', 'Copied');
            clearTimeout(timer);
            timer = setTimeout(function () {
              btn.textContent = t('复制', 'Copy');
            }, 1600);
          }

          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done, fallback);
          } else {
            fallback();
          }

          // 老浏览器 / 非 https 环境下的兜底方案
          function fallback() {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.top = '-1000px';
            document.body.appendChild(ta);
            ta.select();
            try {
              document.execCommand('copy');
              done();
            } catch (e) {
              /* 复制失败就静默放过，不影响阅读 */
            }
            document.body.removeChild(ta);
          }
        });
      })(pres[i]);
    }
  }

  /* --- 6. 页脚年份 ------------------------------------------------------- */
  function initFooterYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --- 启动 -------------------------------------------------------------- */
  function init() {
    setTheme(currentTheme(), false); // 主题已在 head 内联脚本里定好，这里只同步按钮状态

    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
      });
    }

    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        if (i18n) i18n.toggle();
      });
    }

    // 语言变化后，重新渲染那些由 JS 生成的双语文本
    document.addEventListener('langchange', function () {
      syncLangButton();
      syncThemeButton();
      var btns = document.querySelectorAll('.copy-btn');
      for (var i = 0; i < btns.length; i++) btns[i].textContent = t('复制', 'Copy');
    });

    syncLangButton();
    initMenu();
    initHeaderShadow();
    initCodeBlocks();
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
