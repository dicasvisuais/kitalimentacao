"""Derivação estática da captura SingleFile; não altera o arquivo de origem."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import base64, hashlib, html, json, re, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'paginas_download/kitalimentacao.com.br-raiz-3aa3df19/2026-10-25T20-05-20-0300-45b9e0'
HOST = 'https://kitalimentacao.com.br'
changes = []
downloads = {}

def sha(b): return hashlib.sha256(b).hexdigest()

def localize_js(text):
    for plugin in ('elementor-pro', 'elementor'):
        old = HOST + '/wp-content/plugins/' + plugin + '/assets/'
        new = './assets/' + plugin + '/'
        text = text.replace(old, new).replace(old.replace('/', '\\/'), new.replace('/', '\\/'))
    return text

class Scripts(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text=text; self.lines=[0]
        self.lines += [i+1 for i,c in enumerate(text) if c=='\n']
        self.rows=[]; self.current=None; self.feed(text)
    def position_offset(self):
        line,col=self.getpos(); return self.lines[line-1]+col
    def handle_starttag(self, tag, attrs):
        if tag=='script':
            self.current=(self.position_offset(),self.position_offset()+len(self.get_starttag_text()),dict(attrs))
    def handle_endtag(self, tag):
        if tag=='script' and self.current:
            start,end,attrs=self.current
            stop=self.text.index('>',self.position_offset())+1
            self.rows.append((start,stop,attrs,self.text[end:self.position_offset()]))
            self.current=None

raw=(SOURCE/'consulta.html').read_text()
source_sha=sha((SOURCE/'pagina.html').read_bytes())
# Revisão específica desta página: inicialização Meta/Google/Clarity e bridge
# do plugin Meta. Os hashes exatos ficam no manifesto desta derivação.
for start,stop,attrs,body in reversed(Scripts(raw).rows):
    reason=None
    if attrs.get('id')=='google_gtagjs-js-after': reason='Google tag initialization'
    elif 'https://www.clarity.ms/tag/' in body: reason='Clarity bootstrap'
    elif 'https://connect.facebook.net/en_US/fbevents.js' in body: reason='Meta pixel bootstrap'
    elif re.search(r"\bfbq\s*\(",body): reason='Meta pixel invocation'
    elif 'fb_pxl_code' in body and 'wpcf7mailsent' in body: reason='Meta form tracking bridge'
    elif 'window._wpemojiSettings =' in body: reason='WordPress emoji bootstrap; native Unicode retained'
    if reason:
        changes.append({'kind':'remove-script','reason':reason,'sha256':sha(body.encode())})
        raw=raw[:start]+raw[stop:]

raw=localize_js(raw)
# Na versão hospedável, dependências locais são permitidas pela política.
for directive in ('script-src','style-src','img-src','font-src','media-src','frame-src'):
    raw=raw.replace(directive+' ',directive+" 'self' ",1)

extensions={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif',
            'image/svg+xml':'svg','image/x-icon':'ico','font/woff2':'woff2',
            'font/woff':'woff','application/font-woff':'woff','video/mp4':'mp4',
            'application/javascript':'js','text/javascript':'js','text/css':'css',
            'application/octet-stream':'bin','font/ttf':'ttf'}
assets={}
def extract(match):
    mime,options,data=match.groups()
    binary=base64.b64decode(data)
    if mime in ('application/javascript','text/javascript'):
        binary=localize_js(binary.decode('utf-8')).encode()
    name='assets/embedded/'+sha(binary)[:20]+'.'+extensions.get(mime,'bin')
    p=ROOT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(binary)
    assets[name]={'mime':mime,'bytes':len(binary),'sha256':sha(binary)}
    return name
raw=re.sub(r'data:([\w.+-]+/[\w.+-]+)((?:;[^,\s"\x27<>]*)?;base64),([A-Za-z0-9+/=]+)',extract,raw)

class Links(HTMLParser):
    def __init__(self):super().__init__();self.urls=set()
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);u=a.get('href','')
        if tag=='a' and u.startswith(HOST+'/wp-content/uploads/'):self.urls.add(u)
links=Links();links.feed(raw);gallery=sorted(links.urls)
def fetch(item):
    url,name=item
    u=urlsplit(url)
    if u.scheme!='https' or u.hostname!='kitalimentacao.com.br':raise ValueError(url)
    p=ROOT/name;p.parent.mkdir(parents=True,exist_ok=True)
    if not p.exists():
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=30) as r:
            if urlsplit(r.url).hostname!='kitalimentacao.com.br':raise ValueError('Redirect outside source')
            b=r.read(20*1024*1024+1)
            if len(b)>20*1024*1024:raise ValueError('Resource over limit')
        p.write_bytes(b)
    b=p.read_bytes()
    return name,{'url':url,'bytes':len(b),'sha256':sha(b)}
jobs=[(u,'assets/galeria/'+Path(urlsplit(u).path).name) for u in gallery]
report=json.loads((SOURCE/'teste-offline.json').read_text())
chunks=sorted(set(re.findall(r'https://[^\s)]+\.js', '\n'.join(e for t in report['tests'] for e in t['errors']))))
for u in chunks:
    for plugin in ('elementor-pro','elementor'):
        prefix=HOST+'/wp-content/plugins/'+plugin+'/assets/'
        if u.startswith(prefix):jobs.append((u,'assets/'+plugin+'/'+u[len(prefix):]))
# Recursos carregados sob demanda pelo slideshow e módulos de UI.
normalized=raw.replace('\\/','/')
extra_images=sorted(set(re.findall(re.escape(HOST)+r'/wp-content/uploads/[^\s\"\x27<>\\&]+?\.(?:jpe?g|png|webp|gif)', normalized)))
for u in extra_images:
    if u not in gallery:jobs.append((u,'assets/galeria/'+Path(urlsplit(u).path).name))
for suffix in ('lib/share-link/share-link.min.js','lib/dialog/dialog.min.js','lib/swiper/v8/swiper.min.js'):
    jobs.append((HOST+'/wp-content/plugins/elementor/assets/'+suffix,'assets/elementor/'+suffix))
with ThreadPoolExecutor(max_workers=5) as pool:
    downloads.update(dict(pool.map(fetch,jobs)))
for url in sorted(set(gallery+extra_images)):
    name='assets/galeria/'+Path(urlsplit(url).path).name
    raw=raw.replace(url,name).replace(url.replace('/','\\/'),name.replace('/','\\/'))
# O hash de ação do Elementor também contém a URL da imagem em base64.
def action(match):
    payload=json.loads(base64.b64decode(unquote(match[1])))
    if payload.get('url') in gallery:
        payload['url']='assets/galeria/'+Path(urlsplit(payload['url']).path).name
    return 'settings%3D'+base64.b64encode(json.dumps(payload,separators=(',',':')).encode()).decode()
raw=re.sub(r'settings%3D([A-Za-z0-9+/%=]+)',action,raw)
# Remover caracteres invisíveis do número, preservando número e mensagem.
raw=raw.replace('%E2%80%8B','').replace('\u200b','')
# Correção autorizada por Diego em 25/10/2026.
raw=raw.replace('mailto:kitalimentacao@gmai.com','mailto:kitalimentacao@gmail.com')
raw=re.sub(r'(href=(?:"#doar"|#doar))\s+target=(?:"_blank"|_blank)',r'\1',raw)
# Metadados WordPress não são endpoints da nova hospedagem estática.
raw=re.sub(r'<link\b[^>]*\brel=(?:"alternate"|alternate)[^>]*>', '', raw)
raw=re.sub(r'<link\b[^>]*\brel=(?:"shortlink"|shortlink)[^>]*>', '', raw)
raw=raw.replace('<html ', '<!-- Derivação estática para migração; origem e hashes em verificacao/manifesto.json. -->\n<html ',1)
(ROOT/'index.html').write_text(raw)
manifest={'url':HOST+'/','contexto':'Pessoal','source_directory':str(SOURCE),
          'source_sha256':source_sha,'consultation_sha256':sha((SOURCE/'consulta.html').read_bytes()),
          'index_sha256':sha(raw.encode()),'removed_scripts':changes,'embedded_assets':assets,
          'downloaded_dependencies':downloads,'notes':['Somente página inicial. Nenhuma outra página, PDF ou endpoint WordPress migrado.',
          'WhatsApp e mailto mantidos. Email corrigido para kitalimentacao@gmail.com por autorização de Diego em 25/10/2026.',
          'Trackers conhecidos removidos; sem ativação de medição na nova hospedagem.']}
(ROOT/'verificacao/manifesto.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'index_bytes':len(raw.encode()),'embedded_assets':len(assets),'downloaded_dependencies':len(downloads),'removed_scripts':len(changes)}))
