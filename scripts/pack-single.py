"""Упаковка сборки Angular (dist/hcm-ui/browser) в один HTML, который открывается без сервера.

- части приложения (chunk-*.js) подключаются через import map: ссылки "./chunk-X.js" -> "chunk-X.js" -> data: URL;
- основной скрипт — встроенный <script type="module">;
- стили, шрифты, картинки (assets/, media/, favicon) — data: URL;
- старый прототип (legacy/index.html) — встроен base64 и подставляется в iframe через srcdoc (с диска blob:-рамки запрещены); параметры embed/ng — в data-q рамки.
"""
import base64, mimetypes, os, re, sys

SRC, DST = sys.argv[1], sys.argv[2]

def b64(data: bytes) -> str:
    return base64.b64encode(data).decode()

def mime(path: str) -> str:
    ext = path.rsplit('.', 1)[-1].lower()
    return {'webp': 'image/webp', 'woff2': 'font/woff2', 'woff': 'font/woff', 'svg': 'image/svg+xml',
            'ico': 'image/x-icon', 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'gif': 'image/gif'}.get(ext) or mimetypes.guess_type(path)[0] or 'application/octet-stream'

cache = {}
def data_uri(rel):
    rel = rel.split('?')[0].split('#')[0]
    p = os.path.join(SRC, rel)
    if not os.path.isfile(p):
        return None
    if rel not in cache:
        cache[rel] = 'data:%s;base64,%s' % (mime(rel), b64(open(p, 'rb').read()))
    return cache[rel]

ASSET_RE = re.compile(r'(?<![\w/.-])((?:assets|media)/[A-Za-z0-9_\-./]+\.(?:webp|png|jpe?g|svg|gif|woff2?|ico))')

def inline_assets(text: str) -> str:
    def rep(m):
        u = data_uri(m.group(1))
        return u if u else m.group(0)
    return ASSET_RE.sub(rep, text)

def css_urls(css: str) -> str:
    def rep(m):
        u = m.group(2).strip()
        if u.startswith(('data:', 'http', '#')):
            return m.group(0)
        d = data_uri(u.lstrip('./'))
        return 'url("%s")' % d if d else m.group(0)
    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', rep, css)

CHUNK_RE = re.compile(r'(["\'])\./(chunk-[A-Z0-9]+\.js)\1')

def fix_js(js: str) -> str:
    js = CHUNK_RE.sub(r'\1\2\1', js)
    js = js.replace('"legacy/index.html?embed=1&ng="', '"about:blank#embed=1&ng="')
    js = js.replace("'legacy/index.html?embed=1&ng='", '"about:blank#embed=1&ng="')
    return inline_assets(js)

files = os.listdir(SRC)
chunks = sorted(f for f in files if re.match(r'chunk-[A-Z0-9]+\.js$', f))
main = next(f for f in files if re.match(r'main-[A-Z0-9]+\.js$', f))
css_file = next(f for f in files if re.match(r'styles-[A-Z0-9]+\.css$', f))

imap = {c: 'data:text/javascript;base64,' + b64(fix_js(open(os.path.join(SRC, c), encoding='utf-8').read()).encode()) for c in chunks}
main_js = fix_js(open(os.path.join(SRC, main), encoding='utf-8').read())
assert 'about:blank#embed=1' in main_js or any('about:blank#embed=1' in base64.b64decode(v.split(',', 1)[1]).decode() for v in imap.values()), 'legacy src not patched'
css = css_urls(open(os.path.join(SRC, css_file), encoding='utf-8').read())

# старый прототип: параметры embed/ng читает из # (у blob: URL нет query)
legacy = open(os.path.join(SRC, 'legacy', 'index.html'), encoding='utf-8').read()
old = 'var qs = new URLSearchParams(location.search);'
assert old in legacy, 'legacy params line not found'
legacy = legacy.replace(old, "var qs = new URLSearchParams(location.search || (window.frameElement && frameElement.getAttribute('data-q')) || '');")
legacy = inline_assets(legacy)

html = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
html = re.sub(r'<link rel="modulepreload"[^>]*>\s*', '', html)
# <base href="./"> в одном файле не нужен и ломает адрес: смена #/… уводила бы на папку без имени файла (на file:// — ошибка)
html = re.sub(r'<base href="[^"]*">\s*', '', html)
html = re.sub(r'<link rel="stylesheet"[^>]*>\s*', '', html)
html = re.sub(r'<noscript>.*?</noscript>\s*', '', html, flags=re.S)
html = re.sub(r'<script src="main-[A-Z0-9]+\.js" type="module"></script>', '', html)
fav = data_uri('favicon.ico')
html = html.replace('href="favicon.ico"', 'href="%s"' % fav if fav else 'href="data:,"')
html = css_urls(html)  # url() во встроенных критических стилях

import json
# старый прототип — srcdoc у iframe (работает и с диска, где blob:-рамки запрещены); параметры embed/ng — в data-q рамки
boot = (
    '<script>(function(){var b=atob(%s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);'
    'var L=new TextDecoder().decode(u);'
    'function fix(f){var s=f.getAttribute("src")||"";if(f.__hcm||s.indexOf("about:blank#embed=")!==0)return;'
    'f.__hcm=1;f.setAttribute("data-q",s.split("#")[1]);f.srcdoc=L;}'
    'new MutationObserver(function(){document.querySelectorAll("iframe").forEach(fix);})'
    '.observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:["src"]});})();</script>\n'
) % json.dumps(b64(legacy.encode('utf-8')))
head_add = (
    '<style>%s</style>\n' % css.replace('</style', '<\\/style') +
    '<script type="importmap">%s</script>\n' % json.dumps({'imports': imap}) +
    boot
)
body_add = '<script type="module">%s</script>\n' % main_js.replace('</script', '<\\/script')
html = html.replace('</head>', head_add + '</head>', 1).replace('</body>', body_add + '</body>', 1)
html = html.replace('<title>Q.HCM</title>', '<title>Q.HCM — прототип</title>', 1)

open(DST, 'w', encoding='utf-8').write(html)
print('chunks', len(chunks), 'assets', len(cache), 'size MB', round(len(html.encode()) / 1e6, 1))
