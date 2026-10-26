# Kit Alimentação — página inicial estática

Fonte: https://kitalimentacao.com.br/ — captura em 25/10/2026. Contexto: Pessoal.

O arquivo de entrada é `index.html`. A pasta `assets/` contém imagens, fontes,
vídeo e JavaScript locais, incluindo os módulos de galeria/carrossel carregados
sob demanda pelo Elementor. Não exige WordPress, PHP, banco de dados, Node ou
etapa de build para hospedar.

## Publicação posterior

Publicar `index.html` e **toda a pasta `assets/`**, mantendo a estrutura relativa.
O documento pode ser servido na raiz do domínio ou em uma subpasta. `.nojekyll`
permite servir estes arquivos diretamente no GitHub Pages.

O domínio canônico permanece `https://kitalimentacao.com.br/`. Repositório,
hospedagem, HTTPS e DNS serão configurados em outra etapa. Esta entrega não
executa essas alterações. As páginas `/catalogo/`, `/pagina-principal/`,
`/author/admin/` e o catálogo PDF estão fora do escopo.

## Preservação e alterações

A captura original e sua consulta offline permanecem fora deste projeto:
`../paginas_download/kitalimentacao.com.br-raiz-3aa3df19/2026-10-25T20-05-20-0300-45b9e0/`.

`verificacao/manifesto.json` registra hashes, recursos incorporados, downloads
complementares e scripts removidos. A versão hospedável deriva da consulta
sanitizada: rastreadores identificados de Google, Meta e Clarity foram retirados;
a política embutida permite os recursos locais e impede conexões automáticas
externas. A medição não será ativada automaticamente no novo servidor.

As URLs das fotos, módulos do Elementor e slideshow foram localizadas. O botão
interno de composição agora navega na mesma aba. Foi removido o caractere invisível
do número nos dois links de WhatsApp; número e mensagem permanecem os mesmos.
Links de contato continuam dependendo de ação e dos serviços externos.

O e-mail foi corrigido para **`kitalimentacao@gmail.com`**, conforme autorização
de Diego em 25/10/2026. A captura original e o pacote anterior do Drive preservam
o endereço anterior. Nenhuma mensagem foi enviada nos testes.

## Conferência

Ver `verificacao/resultado.json` para os testes reais e seus limites. As evidências
incluem desktop (1440 px), viewport móvel (390 px), abertura por arquivo sem rede,
galeria com 11 fotos, avanço do carrossel, âncora de composição, reprodução e
quadros do vídeo de aproximadamente 16,4 segundos, contatos e reload. Viewport
móvel não equivale a teste em aparelho físico. A amostragem de vídeo não é uma
análise integral de seu conteúdo. Não foi feito envio de mensagem nem teste de
entrega de e-mail/WhatsApp.

Para conferir localmente: `python3 -m http.server 8766 --bind 127.0.0.1` nesta
pasta; abrir `http://127.0.0.1:8766/`. `index.html` também abre por duplo clique.

`scripts/preparar.py` documenta a derivação e usa a captura original indicada
acima; não recaptura nem altera a central compartilhada. `scripts/verificar.cjs`
reutiliza o Chrome e o Playwright instalados neste Mac, sem dependências por
projeto. A consulta arquivada original preserva o resultado da primeira captura,
inclusive os erros de módulos que motivaram a derivação hospedável.


## Repositório e hospedagem

Repositório de publicação: https://github.com/dicasvisuais/kitalimentacao — histórico preservado.
O original em https://github.com/Daiegon/kitalimentacao permanece preservado.
Todos os 68 arquivos versionados da revisão `11c5497393fa92ffa761f2b330a85f2f5c65a778`
estão em `_antigo_2016/`, com bytes preservados. A versão nova fica na raiz.

Vercel: conectar este repositório, branch de produção `master`, framework
`Other`. `vercel.json` prepara `public/` com `index.html` e `assets/`, que são
os únicos arquivos servidos. O acervo `_antigo_2016/`, os scripts de preparo e
as evidências permanecem no repositório. DNS continua gerenciado na Cloudflare.
Projeto: https://vercel.com/dicasvisuais/kitalimentacao. Domínio principal:
https://kitalimentacao.com.br/; `www` redireciona para o principal.
Validar a publicação antes de mudar o DNS e preservar os serviços de e-mail.
