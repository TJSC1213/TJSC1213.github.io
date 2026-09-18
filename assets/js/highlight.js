/* ===========================================================================
   highlight.js — 轻量语法高亮（无依赖、无 CDN）
   ---------------------------------------------------------------------------
   用法：给 <pre><code> 加上 language-xxx class 即可。

     <pre><code class="language-js">const a = 1;</code></pre>

   支持：js / ts / python / bash / c / cpp / json / yaml / css / html
   未识别的语言保持原样（内容已在 HTML 里转义过）。

   原理：把某种语言的所有规则合成一个多分支正则，用编号捕获组一次扫描完成
   分词，再对每一段做 HTML 转义，避免标签注入。
   注意：规则内部一律使用非捕获组 (?:...)，否则会打乱分支编号。
   =========================================================================== */
(function () {
  'use strict';

  /* --- 各语言的分词规则：[token 类型, 正则] ------------------------------ */
  var JS_KW =
    'as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|import|in|instanceof|let|new|of|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield|true|false|null|undefined|NaN|Infinity';
  var TS_KW =
    'abstract|any|as|asserts|async|await|boolean|break|case|catch|class|const|constructor|continue|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|namespace|never|new|number|object|of|override|private|protected|public|readonly|return|satisfies|set|static|string|super|switch|symbol|this|throw|try|type|typeof|undefined|unique|unknown|var|void|while|with|yield|true|false|null';
  var PY_KW =
    'and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|case|nonlocal|not|or|pass|raise|return|try|while|with|yield|True|False|None|self';

  var RULES = {
    js: [
      ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
      ['str', /`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
      ['num', /\b0[xXbBoO][\da-fA-F_]+|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?/],
      ['kw', new RegExp('\\b(?:' + JS_KW + ')\\b')],
      [
        'typ',
        /\b(?:Array|Boolean|Date|Error|JSON|Map|Math|Number|Object|Promise|RegExp|Set|String|Symbol|console|document|window|process|require|module|exports)\b/
      ],
      ['fn', /\b[A-Za-z_$][\w$]*(?=\s*\()/]
    ],

    ts: [
      ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
      ['str', /`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
      ['num', /\b0[xXbBoO][\da-fA-F_]+|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?/],
      ['kw', new RegExp('\\b(?:' + TS_KW + ')\\b')],
      [
        'typ',
        /\b(?:Array|Boolean|Date|Error|JSON|Map|Math|Number|Object|Promise|Record|RegExp|Set|String|Symbol|console|document|window)\b/
      ],
      ['fn', /\b[A-Za-z_$][\w$]*(?=\s*\()/]
    ],

    python: [
      ['com', /#[^\n]*/],
      [
        'str',
        /[rbfu]{0,3}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/
      ],
      ['dec', /@[\w.]+/],
      ['num', /\b0[xXbBoO][\da-fA-F_]+|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?/],
      ['kw', new RegExp('\\b(?:' + PY_KW + ')\\b')],
      [
        'typ',
        /\b(?:bool|bytes|dict|float|frozenset|int|list|object|set|str|tuple|type|print|len|range|enumerate|zip|map|filter|open|isinstance|super|Exception|ValueError|TypeError|KeyError|IndexError|RuntimeError)\b/
      ],
      ['fn', /\b[A-Za-z_]\w*(?=\s*\()/]
    ],

    bash: [
      ['com', /#[^\n]*/],
      ['str', /"(?:\\.|[^"\\])*"|'[^']*'/],
      ['var', /\$\{[^}]*\}|\$[A-Za-z_]\w*|\$\d+|\$[@*#?!$]/],
      [
        'kw',
        /\b(?:if|then|else|elif|fi|for|while|until|do|done|case|esac|in|function|return|local|export|readonly|declare|source|set|unset|shift|exit|trap|eval|exec|time)\b/
      ],
      [
        'cmd',
        /\b(?:cd|ls|mkdir|rm|rmdir|cp|mv|cat|echo|printf|grep|sed|awk|find|xargs|curl|wget|git|docker|make|npm|node|python|python3|pip|tar|zip|chmod|chown|kill|ps|which|head|tail|sort|uniq|wc|touch|sleep|tee|diff|ssh|scp)\b/
      ],
      ['num', /\b\d+\b/]
    ],

    c: [
      ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
      ['pre', /^[ \t]*#[ \t]*\w+[^\n]*/],
      ['str', /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
      ['num', /\b0[xX][\da-fA-F]+[uUlL]*\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFuUlL]*\b/],
      [
        'kw',
        /\b(?:auto|break|case|const|continue|default|do|else|enum|extern|for|goto|if|inline|register|restrict|return|sizeof|static|struct|switch|typedef|union|volatile|while)\b/
      ],
      [
        'typ',
        /\b(?:bool|char|double|float|int|long|short|signed|unsigned|void|size_t|ssize_t|int\w*|uint\w*|FILE)\b/
      ],
      ['fn', /\b[A-Za-z_]\w*(?=\s*\()/]
    ],

    json: [
      ['key', /"(?:\\.|[^"\\])*"(?=\s*:)/],
      ['str', /"(?:\\.|[^"\\])*"/],
      ['num', /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/],
      ['kw', /\b(?:true|false|null)\b/]
    ],

    yaml: [
      ['com', /#[^\n]*/],
      ['key', /[\w.$/-]+(?=\s*:)/],
      ['str', /"(?:\\.|[^"\\\n])*"|'(?:''|[^'\n])*'/],
      ['num', /\b\d+(?:\.\d+)?\b/],
      ['kw', /\b(?:true|false|null|yes|no|on|off)\b/]
    ],

    css: [
      ['com', /\/\*[\s\S]*?\*\//],
      ['str', /"[^"\n]*"|'[^'\n]*'/],
      ['at', /@[\w-]+/],
      [
        'num',
        /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch)?\b/
      ],
      ['prop', /[-\w]+(?=\s*:)/],
      ['fn', /\b[\w-]+(?=\()/]
    ],

    html: [
      ['com', /<!--[\s\S]*?-->/],
      ['doctype', /<!DOCTYPE[^>]*>/],
      ['tag', /<\/?[A-Za-z][\w:-]*/],
      ['str', /"[^"]*"|'[^']*'/],
      ['attr', /[A-Za-z-][\w-]*(?==)/],
      ['punc', /\/?>/]
    ]
  };

  /* C++ 复用 C 的词法，只替换关键字与类型表（下标必须和 RULES.c 对齐） */
  RULES.cpp = [
    RULES.c[0], // com
    RULES.c[1], // pre
    RULES.c[2], // str
    RULES.c[3], // num
    [
      'kw',
      /\b(?:alignas|alignof|auto|break|case|catch|class|const|constexpr|consteval|constinit|continue|co_await|co_return|co_yield|decltype|default|delete|do|else|enum|explicit|export|extern|final|for|friend|goto|if|inline|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|requires|return|sizeof|static|static_assert|struct|switch|template|this|thread_local|throw|try|typedef|typename|union|using|virtual|volatile|while|true|false)\b/
    ],
    [
      'typ',
      /\b(?:bool|char|double|float|int|long|short|signed|unsigned|void|wchar_t|size_t|string|vector|map|unordered_map|set|unordered_set|pair|tuple|optional|variant|unique_ptr|shared_ptr|weak_ptr|ostream|istream|string_view)\b/
    ],
    RULES.c[6] // fn
  ];

  /* 语言别名 → 规则表键名 */
  var ALIAS = {
    js: 'js',
    javascript: 'js',
    mjs: 'js',
    cjs: 'js',
    jsx: 'js',
    node: 'js',
    ts: 'ts',
    typescript: 'ts',
    tsx: 'ts',
    py: 'python',
    python: 'python',
    python3: 'python',
    sh: 'bash',
    shell: 'bash',
    bash: 'bash',
    zsh: 'bash',
    console: 'bash',
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    'c++': 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    hpp: 'cpp',
    json: 'json',
    jsonc: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    css: 'css',
    scss: 'css',
    html: 'html',
    htm: 'html',
    xml: 'html',
    vue: 'html'
  };

  /* --- 工具 ------------------------------------------------------------- */
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* 把规则数组编译成一个正则：编号捕获组的序号 = 规则下标 */
  var cache = {};

  function compiled(lang) {
    if (cache[lang]) return cache[lang];

    var rules = RULES[lang];
    var parts = [];
    var types = [];

    for (var i = 0; i < rules.length; i++) {
      parts.push('(' + rules[i][1].source + ')');
      types.push(rules[i][0]);
    }

    // m 标志供 C/C++ 的预处理器行首匹配使用；其余规则不含 ^/$，无副作用
    cache[lang] = { re: new RegExp(parts.join('|'), 'gm'), types: types };
    return cache[lang];
  }

  function highlight(source, lang) {
    var c = compiled(lang);
    var re = c.re;
    var types = c.types;
    var out = '';
    var last = 0;
    var m;

    re.lastIndex = 0;

    while ((m = re.exec(source)) !== null) {
      // 零宽匹配保护，避免死循环
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }

      var type = null;
      for (var k = 1; k < m.length; k++) {
        if (m[k] !== undefined) {
          type = types[k - 1];
          break;
        }
      }

      out += escapeHtml(source.slice(last, m.index));
      out += '<span class="tok-' + type + '">' + escapeHtml(m[0]) + '</span>';
      last = m.index + m[0].length;
    }

    out += escapeHtml(source.slice(last));
    return out;
  }

  /* --- 对外接口 --------------------------------------------------------- */
  function run(root) {
    var blocks = (root || document).querySelectorAll('code[class*="language-"]');

    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      if (el.getAttribute('data-highlighted') === 'yes') continue;

      var match = /language-([\w+-]+)/.exec(el.className);
      if (!match) continue;

      var lang = ALIAS[match[1].toLowerCase()];
      if (!lang || !RULES[lang]) continue; // 未支持的语言：保持原样

      el.innerHTML = highlight(el.textContent, lang);
      el.setAttribute('data-highlighted', 'yes');
    }
  }

  window.highlightCode = run;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      run();
    });
  } else {
    run();
  }
})();
