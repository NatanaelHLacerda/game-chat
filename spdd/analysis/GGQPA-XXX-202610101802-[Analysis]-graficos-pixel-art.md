# SPDD Analysis: República — refatoração dos gráficos do canvas para pixel art (pack Cryovex Free v1.01)

## Original Business Requirement

# República — semente: gráficos em pixel art

## Visão

Trocar **todo o gráfico desenhado no canvas do jogo** (quartos, paredes, piso, móveis, tapetes, avatares e marcações sobre eles) por **pixel art isométrica de verdade**, usando um pack gratuito. Hoje o jogo mistura polígonos vetoriais (`renderer.js`), um avatar procedural em blocos (`avatar.js`) e um teste com sprites 3D do Kenney (`?mobilia=kenney`). O resultado deve parecer um único jogo retrô no espírito do Habbo, sem estilos misturados.

## Pack escolhido

**Pixel Isometric Modern Interior — versão Free v1.01**, de Cryovex
<https://cryovex.itch.io/pixel-isometric-modern-interior>

- **Licença** (página do pack): pode ser usado em projetos comerciais e não comerciais e pode ser modificado. **Não pode ser revendido nem redistribuído**, nem mesmo depois de modificado. Crédito não é obrigatório, mas daremos.
- **Por que este**: tem o visual mais próximo do Habbo entre os packs gratuitos avaliados, com contorno escuro, sombreamento em 2 tons e móveis de madeira. Traz piso, paredes (inclusive **laranja** e **verde**, que combinam com a paleta *Her*), móveis e tapetes.
- **Conteúdo da versão grátis** (4 spritesheets PNG sem rótulos):
  - `floor_free.png` (128×48): 9 materiais de piso.
  - `wall_free.png` (256×240): cerca de 30 variações de parede, em segmentos de 16 px de largura e 72 px de altura.
  - `furniture_free.png` (512×768): cerca de 117 sprites, entre eles poltronas, cadeiras, mesas, estantes (com e sem livros), armários, camas e escrivaninhas.
  - `decoration_free.png` (512×496): caixas, TV, arcade, cabideiro, biombos e **tapetes** retangulares e redondos.
- **Escala**: o losango de piso nativo do pack mede **32×16**. Ampliado **2× (vizinho mais próximo)**, fica exatamente no `TILE_W = 64` / `TILE_H = 32` atual. Na mesma escala, a "unidade" de 2 px do avatar procedural equivale a **1 pixel do pack**.
- **Avaliados e descartados**:
  - *Isometric Furniture* (OpenGameArt, CC0): só tem cama, armário, mesa e cadeira.
  - *kabukidanshi*: não informa dimensões e não tem piso.
  - *Kenney Furniture Kit*: é render 3D, não é pixel art.

## Escopo

### 1. Quarto
- **Piso**: losangos do pack (2×) no lugar do xadrez vetorial. Cada layout escolhe **um material de piso** do pack.
- **Paredes**: segmentos de parede do pack, montados nas bordas do fundo (esquerda e direita) como hoje. Cada layout escolhe **uma variação de parede**, mantendo a identidade atual de cada quarto (Sala laranja, Jardim verde, Pôr do sol quente etc.).
- **Altura da parede**: passa a ser a do sprite (72 px nativos = 144 px). `WALL_H` e o enquadramento da câmera acompanham essa altura.
- **Porta**: o pack grátis não tem porta. Ela continua sendo uma abertura escura, mas desenhada em pixel art (bordas em degrau de 2 px, contorno escuro) para combinar com a parede.

### 2. Móveis
Cada tipo do catálogo (`config/republica.php → furniture_types`) passa a ter um sprite do pack:

| Tipo | Origem no pack |
|---|---|
| `poltrona` | poltrona estofada (`furniture_free`) |
| `sofa` | peça de sofá ou poltrona larga do pack. Se não houver peça de sofá modular, usar a poltrona do pack (3 lado a lado formam o sofá da Sala) |
| `mesa` | mesa de centro baixa (`furniture_free`) |
| `estante` | estante com livros (`furniture_free`) |
| `tapete` | tapete do pack (`decoration_free`), desenhado no chão e fora da ordenação por profundidade, como hoje |
| `planta` | **não existe na versão grátis**: desenhar proceduralmente em pixel art no mesmo estilo (vaso + folhas, contorno escuro, pixels de 2 px) |
| `luminaria` | **não existe na versão grátis**: mesmo tratamento da planta (haste, cúpula e brilho em pixels, sem gradiente suave) |

- **Orientação**: móvel encostado na parede do fundo-direita olha para SW e, na do fundo-esquerda, para SE (mesma regra de hoje). Se o pack tiver só uma orientação, a outra é obtida **espelhando o sprite na horizontal**.
- **Ancoragem**: cada sprite tem um ponto de âncora (vértice inferior do losango ocupado) definido num **manifesto de recortes** (`x, y, w, h, âncora` por tipo/orientação), porque as spritesheets não têm rótulos.
- **Assento**: a altura em que o avatar senta (`SEAT_HEIGHT`) é ajustada para cada sprite de sofá ou poltrona, e o avatar sentado não pode "flutuar" nem "afundar".

### 3. Avatar
- Continua **procedural**, porque a aparência é escolhida no cadastro (pele, cabelo, camisa, calça). Não usar sprites de personagem.
- É ajustado ao estilo do pack: **contorno escuro de 1 pixel do pack** (2 px na tela), sombreamento em 2 tons e posições sempre inteiras (nada de subpixel ao andar).
- As proporções continuam compatíveis com os móveis (o avatar sentado cabe na poltrona; em pé, fica mais baixo que a estante).

### 4. Marcações e interface do canvas
- **Cursor de tile** (hover): losango em pixel art (borda em degrau), não um polígono suavizado.
- **Anel de fala**, **fone de ouvido (em call)** e **etiqueta de nome**: redesenhados em pixel art, sem `roundRect`, gradientes ou antialias.
- Fundo vazio (`VOID`) mantido.

### 5. Regras de desenho
- **Escala inteira sempre** (2×), com `imageSmoothingEnabled = false` em todo desenho de sprite e coordenadas arredondadas.
- Sprites carregados **antes** do primeiro quadro. Enquanto carregam, mostra-se o fundo vazio, nunca a versão vetorial antiga.
- Se um sprite faltar (erro de rede), o tipo cai num **marcador procedural em pixel art**, sem quebrar o quarto.

### 6. Limpeza
- Remover o teste do Kenney: parâmetro `?mobilia=kenney`, `public/sprites/kenney/` e o código específico em `sprite-furniture.js`.
- Remover os desenhos vetoriais de móveis (`furnitureDrawers` com `drawBlock`) que forem substituídos.

### 7. Créditos
- Arquivo de créditos junto dos sprites e uma linha discreta de créditos na página do jogo: "Móveis e cenário: Pixel Isometric Modern Interior, por Cryovex".

## Fora do escopo
- Interface HTML (navegador de quartos, cartão do avatar, call, amigos, login). Ela continua como está e pode virar outra semente.
- Novos móveis, decoração editável, animações de móveis ou troca de layout dos quartos.
- Compra da versão paga do pack.

## Restrições
- Só pode usar arquivos da **versão grátis** do pack, sem modificar os PNGs originais. Recortes e espelhamentos são feitos em tempo de desenho.
- **Não redistribuir o pack**: os PNGs ficam só em `public/` para o jogo usar. O ZIP original não entra no repositório. Se o repositório virar público, rever esse ponto.
- Sem dependências novas de front-end (nada de motor de jogo). Tudo continua em Canvas 2D.
- A projeção isométrica (`iso.js`), o pathfinding e a lógica dos quartos não mudam. A única exceção é `WALL_H`.

## Critérios de aceite
1. Nos 5 layouts (Sala de estar, Sala, Jardim, Pôr do sol, Estúdio), piso, paredes, móveis e tapetes aparecem em pixel art do pack, sem nenhum polígono vetorial antigo.
2. Com zoom do navegador em 100% e em 200%, nenhum sprite aparece borrado. Cada pixel do pack vira um bloco 2×2 nítido.
3. Móveis encostados em paredes diferentes ficam virados para dentro do quarto.
4. Um avatar andando atrás de uma estante fica escondido por ela, e na frente fica visível (ordenação por profundidade preservada).
5. Um avatar sentado no sofá ou na poltrona aparece apoiado no assento.
6. Planta e luminária procedurais não destoam visualmente dos sprites do pack (mesmo contorno e mesmo tamanho de pixel).
7. Avatares, anel de fala, fone e etiqueta de nome seguem o mesmo estilo pixelado.
8. `?mobilia=kenney` e a pasta `public/sprites/kenney/` não existem mais.
9. Os créditos do pack aparecem na página e no arquivo de créditos.

## Riscos
- **Spritesheets sem rótulos**: o manifesto de recortes é trabalho manual. Errar a âncora faz o móvel "flutuar". Mitigação: medir as caixas de cada sprite (área não transparente) e conferir sobre o losango.
- **Paleta**: a madeira marrom dos móveis pode destoar dos tons pastel. Mitigação: escolher piso e paredes claros, e usar os tapetes e paredes laranja/verde para manter o clima *Her*.
- **Versão grátis "em desenvolvimento"**: o autor pode mudar o arquivo. Mitigação: fixar a v1.01 no repositório.

## Domain Concept Identification

### Existing Concepts (from codebase)
- **Layout de quarto** (`config/republica.php → layouts`): planta de tiles, porta, cores `floor` / `wall_left` / `wall_right` em hex e lista de móveis. O servidor o envia ao cliente sem transformação (`HotelController` → `bootstrap.layouts`). `HotelTest` só confere que a chave `sala-de-estar` existe. São 5 layouts: `sala-de-estar` (16×14), `sala`, `jardim`, `por-do-sol` e `estudio` (10×10).
- **Tipo de móvel** (`furniture_types`): `sofa`, `poltrona`, `tapete`, `mesa`, `planta`, `luminaria` e `estante`, com as regras `walkable` e `seat`. O pathfinding (`pathfinding.js`) usa só essas regras e não depende de nenhum desenho.
- **Projeção isométrica** (`iso.js`): `TILE_W = 64`, `TILE_H = 32` e `WALL_H = 110`. `fitCamera` usa `WALL_H` para enquadrar o quarto.
- **Renderer de cena** (`renderer.js`): desenha paredes, porta, piso em xadrez e tapetes com polígonos (`drawRoom`). Os móveis são caixas vetoriais (`furnitureDrawers` + `drawBlock`). A cena é ordenada por profundidade `x + y` (o avatar recebe +0,5). Também desenha o cursor de tile e a etiqueta de nome (com `roundRect`). Usa a constante global `SEAT_HEIGHT = 10`.
- **Avatar procedural** (`avatar.js`): retângulos numa grade de 2 px (`u = 2 × scale`), sem contorno, com sombra em elipse suavizada. Tem os estados `dir` (espelhamento), `back`, `walking`/`walkPhase` e `sitting`. O mesmo código desenha a **pré-visualização** do cadastro, do perfil e do cartão do avatar (`renderPreview`). `drawHeadset` usa arco e `drawSpeakingRing` usa elipse, ambos com antialias.
- **Teste Kenney** (`sprite-furniture.js` + `public/sprites/kenney/`): só aparece com `?mobilia=kenney`. Carrega sprites SE/SW de forma assíncrona (o primeiro quadro sai sem eles), escala por 64/151 com suavização ligada e escolhe a orientação pela regra `y <= x → SW`.
- **Loop do jogo** (`game.js`): o canvas usa DPR (`setTransform(dpr)`) e já define `imageSmoothingEnabled = false` no resize. Os sprites ficam em `this.sprites` e são repassados ao `drawScene`.
- **Assento**: `grid.seat(x, y)` define `avatar.sitting`. A direção do avatar sentado vem do último passo (`dir`/`back`), não da orientação do assento.

### New Concepts Required
- **Pack de sprites (atlas)**: as 4 spritesheets do Cryovex Free v1.01 servidas como arquivos estáticos. Substituem a pasta do Kenney.
- **Manifesto de recortes**: catálogo declarativo que liga cada uso visual (material de piso, variação de parede, tipo de móvel + orientação, tamanho de tapete) a um retângulo na spritesheet, com ponto de âncora e, para assentos, altura do assento. É a única ponte entre o domínio (tipos e layouts) e o pack.
- **Tema visual do layout**: escolha de material de piso e de variação de parede para cada lado em cada layout. Substitui o uso direto das cores hex no desenho e preserva a identidade atual (Sala laranja, Jardim verde etc.).
- **Primitivas de pixel art**: desenho em grade de "pixel do pack" (2 px na tela) para o que não vem do pack: planta, luminária, porta, cursor de tile, anel de fala, fone, etiqueta de nome, contorno do avatar e marcador de fallback.
- **Grupo de tapete**: tiles `tapete` vizinhos formam uma única peça visual. Os layouts usam blocos 2×1 e 2×2, e o pack tem tapetes com pegada de 1×2 tiles (48×24 nativos) e 2×2 tiles (64×32 nativos).
- **Créditos do pack**: arquivo junto dos sprites e uma linha na página do jogo.

### Key Business Rules
- **Escala inteira 2×**: 1 pixel do pack = 2 px CSS. Isso vale para todos os sprites, primitivas e o avatar. Nunca há reamostragem fracionária nem suavização. (Rege: atlas, primitivas, avatar.)
- **Âncora no losango**: a base visual de cada móvel coincide com o vértice inferior do tile que ele ocupa. Um móvel nunca "flutua" nem invade o tile vizinho de forma a confundir o clique. (Rege: manifesto, renderer.)
- **Orientação para dentro do quarto**: a regra atual (`y <= x` → SW, senão SE) continua valendo. Se faltar uma orientação no pack, ela é obtida por espelhamento horizontal. (Rege: manifesto, renderer.)
- **Profundidade preservada**: a ordenação `x + y` continua sendo a fonte da verdade, e o tapete continua fora dela, no chão. (Rege: renderer.)
- **Regras de jogo intactas**: `walkable`, `seat`, planta, porta e pathfinding não mudam. A mudança é só visual, com a única exceção da altura da parede. (Rege: layout, tipo de móvel.)
- **Sem estado visual intermediário misto**: enquanto o pack carrega, aparece só o fundo vazio. Se um recorte falhar, aparece um marcador pixelado, nunca a caixa vetorial antiga. (Rege: loop do jogo, renderer.)
- **Licença**: os arquivos originais não são modificados e o ZIP não entra no repositório. Os créditos são exibidos. (Rege: atlas, créditos.)
- **Implícita: a pré-visualização do avatar acompanha o estilo**. Ela usa `drawAvatar`, então o novo contorno aparece também no cadastro, no perfil e no cartão. Isso é desejável por consistência, mesmo com a interface HTML fora do escopo.
- **Implícita: o hit-test do avatar** (`HIT_W`/`HIT_H` em `game.js`) continua compatível com a altura do avatar, que não muda.

## Strategic Approach

### Solution Direction
- **Renderizador baseado em atlas, com camada de dados declarativa**. O fluxo é: o manifesto de recortes (JS, estático) e o tema do layout (config PHP → bootstrap) entram num carregador do pack, que faz o preload antes do primeiro quadro. Depois, `drawScene` pega cada item, consulta o manifesto e desenha o recorte em escala 2× na âncora. Se não houver recorte, usa a primitiva pixel art.
- O módulo `sprite-furniture.js` é **substituído** por um módulo de atlas genérico (piso, parede, móveis, tapetes). As primitivas pixel art ficam num módulo próprio, reutilizado pelo renderer e pelo avatar.
- O `renderer.js` mantém a estrutura atual (paredes → piso → tapetes → itens ordenados → etiqueta), trocando apenas *como* cada camada é pintada.
- O avatar continua em `avatar.js`, com o mesmo modelo de unidade. Ganha contorno escuro e sombra em pixels, e tem coordenadas arredondadas na origem.
- Os arquivos do pack ficam em `public/sprites/cryovex/` (servidos pelo Laravel como estáticos, sem Vite), junto com um `CREDITS.txt`.

### Key Design Decisions
- **Onde vive o tema visual (piso/parede) de cada layout**: (a) trocar as cores hex por nomes de variação, (b) acrescentar chaves de variação mantendo os hex, (c) mapear no JS por id de layout.
  → **(b)**. Acrescentar chaves de tema no `config/republica.php` mantém a config como "fonte única" (convenção já declarada no cabeçalho do arquivo), não quebra `HotelTest` e preserva os hex como paleta para as primitivas: porta, contorno da parede, fallback.
- **Onde vive o manifesto de recortes**: no PHP (config) ou no JS.
  → **JS**. São dados puramente de apresentação, ligados aos PNGs. O servidor não valida nem usa esses dados, e manter no front evita aumentar o bootstrap.
- **Como montar as paredes**: o pack não tem painéis lisos. Ele tem **blocos de parede com pegada de meio tile** (16×8 no topo e 72 px de altura nativa), em ~30 texturas.
  → Empilhar 2 blocos por aresta de tile ao longo das bordas do fundo, do fundo para a frente, por fora do piso. Trade-off: mais chamadas de desenho (~60 por quarto grande), o que é irrelevante em Canvas 2D. A alternativa de recortar a face e esticar violaria a regra da escala inteira.
- **Como representar o piso**: o `floor_free.png` tem amostras de material com **pegada de meio tile** (16×8 nativos, cerca de 18×10 com a espessura).
  → Cada tile de 32×16 nativos é preenchido com 2×2 amostras do material escolhido. O contorno da espessura só aparece na borda frontal do quarto. Se a junção das amostras tiver costura visível, o recurso é desenhar apenas o topo (sem a espessura) nas amostras internas. Isso fica para o Canvas validar.
- **Tapetes**: os layouts colocam `tapete` em tiles individuais adjacentes (blocos 2×1 e 2×2).
  → Agrupar tiles de tapete vizinhos em retângulos e escolher o tapete do pack com a mesma pegada (1×2 → 48×24 nativos, 2×2 → 64×32 nativos). Um tile isolado usa um recorte central ou o menor tapete. A regra de jogo (`walkable`) continua por tile.
- **Sofá**: a versão grátis tem poltronas e cadeiras com braço, mas não há certeza de um módulo de sofá.
  → O sofá usa um assento do pack **diferente da poltrona** (estofado largo, se houver; senão a poltrona com braços de madeira), para que 3 lado a lado leiam como "sofá". A escolha final fica no manifesto.
- **Altura da parede**: `WALL_H` passa a 144 (72 × 2). `fitCamera` já depende dele, então o enquadramento se ajusta sozinho. A Sala de estar (16×14) ocupa cerca de 960×624 px de cena, o que cabe em telas de computador.
- **Carregamento**: hoje o carregamento é assíncrono e não bloqueante.
  → O preload é feito em `start()` **antes** do primeiro `drawScene`. Enquanto carrega, só o fundo `VOID` aparece. A presença e a sessão do quarto podem conectar em paralelo.
- **Sombra e contorno do avatar**: a elipse suavizada vira um losango ou elipse em degraus na grade de 2 px. O contorno é feito com uma passada escura deslocada de 1 unidade antes do preenchimento, ou com retângulos de contorno. A escolha da técnica fica para o Canvas.

### Alternatives Considered
- **Manter a versão vetorial como fallback de carregamento**: rejeitada porque a semente proíbe estilos misturados.
- **Pré-processar o pack (fatiar e renomear PNGs)**: rejeitada porque a semente exige não modificar os PNGs, e o recorte em tempo de desenho é barato.
- **Adotar um motor (Phaser, PixiJS)**: rejeitada pela restrição "sem dependências novas, Canvas 2D".
- **Sprites de personagem prontos**: rejeitada porque a aparência é configurável por cor no cadastro e o pack não tem personagens.
- **Escalar 1× com tiles de 32×16 (mudar `TILE_W`)**: rejeitada porque mexe em `iso.js`, no pathfinding/hit-test e deixa a cena minúscula.

## Risk & Gap Analysis

### Requirement Ambiguities
- **Orientação de móveis no meio do quarto**: a regra `y <= x` foi pensada para itens encostados na parede. Alguns móveis ficam soltos: a poltrona (3,2) do Jardim ao lado da mesa (4,2), a (10,3)/(12,3) e a (6,9)/(9,9) da Sala de estar. Para esses, a regra pode virar o móvel "de costas" para a mesa. **Assumido**: mantém-se a regra atual, sem mudar layouts (fora do escopo). Fica registrado como limitação visual aceita.
- **Direção do avatar sentado**: hoje ele senta virado para o último passo, não para o assento. A semente pede "apoiado no assento", não "virado para a frente do assento". **Assumido**: só a altura é ajustada e a direção não muda.
- **"Paredes laranja/verde mantendo a identidade"**: o pack tem uma paleta fixa. **Assumido**: escolher, por layout, a variação do pack mais próxima de cada hex atual. O hex continua na config como referência.
- **Estilo da etiqueta de nome**: "pixel art" para texto pode significar fonte bitmap. **Assumido**: moldura em pixels (cantos em degrau, contorno de 2 px) com a fonte do sistema e `textBaseline` inteiro. Fonte bitmap nova fica fora, por ser dependência ou asset novo.

### Edge Cases
- **Tile de tapete isolado ou forma em L**: não acontece nos layouts atuais, mas o agrupamento precisa degradar para tapete por tile.
- **Porta numa parede com blocos de meio tile**: a abertura precisa interromper o empilhamento ou ser pintada por cima com recorte em degraus.
- **DPR fracionário (125%, 150%)**: com `setTransform(dpr)`, o 2× vira 2,5/3 px físicos e pode gerar pixels desiguais. O critério 2 só cobre 100% e 200%. Arredondar a origem dos sprites minimiza o problema.
- **Item com tipo desconhecido no layout**: hoje ele é ignorado (`!furnitureDrawers[type]`). Com o manifesto, deve ser ignorado ou receber o marcador de fallback, nunca quebrar o quadro.
- **Falha ao carregar uma das 4 spritesheets**: piso e parede também precisam de fallback pixelado (cor sólida em losango com degrau), não só os móveis.
- **Pré-visualização do avatar com `scale > 1`**: o contorno deve escalar junto (`u`).

### Technical Risks
- **Manifesto manual**: as spritesheets não têm rótulos, então há risco de âncoras erradas. Mitigação: medir as caixas não transparentes (já feito na análise: furniture tem 117 caixas, decoration 49, tapetes com pegadas 48×24, 64×32, 80×40 e 96×48) e validar visualmente cada quarto.
- **Costura do piso em meio tile**: as amostras incluem espessura e contorno inferior, e lado a lado podem deixar linhas escuras internas. Mitigação: usar só a região do topo do losango nas amostras internas.
- **Ordenação parede × avatar**: as paredes ficam fora do piso e atrás de tudo. Com 144 px de altura, a etiqueta de nome de avatares no fundo continua por cima, porque é desenhada por último.
- **Licença em repositório**: commitar os PNGs pode ser "redistribuição" se o repositório for público. O remoto não é conhecido. Mitigação: registrar no `CREDITS.txt` e na semente. Isso continua como pendência a confirmar com o dono do projeto.
- **Testes**: não há testes de renderização. A suíte JS (`node --test tests/js/`) cobre só lógica pura. É possível testar unidades puras novas (agrupamento de tapetes, seleção de recorte/orientação), mas a validação visual é manual.
- **Hit-test do avatar sentado em assento mais alto**: `avatarFoot` usa `SEAT_HEIGHT`. Com altura por tipo, a função precisa saber o tipo do assento sob o avatar.

### Acceptance Criteria Coverage
| AC# | Description | Addressable? | Gaps/Notes |
|-----|-------------|--------------|------------|
| 1 | 5 layouts com piso, paredes, móveis e tapetes do pack, sem polígonos antigos | Yes | Planta, luminária e porta são primitivas pixel art (permitido pela semente) |
| 2 | Sem borrado a 100% e 200% | Yes | DPR fracionário fora do critério (ver Edge Cases) |
| 3 | Móveis virados para dentro | Partial | Atende aos móveis encostados. Itens soltos seguem a regra `y <= x` (ver Ambiguidades) |
| 4 | Profundidade com estante | Yes | Ordenação `x + y` preservada. A âncora correta é essencial |
| 5 | Avatar apoiado no assento | Yes | Altura do assento por tipo e `avatarFoot` ciente do tipo |
| 6 | Planta e luminária coerentes | Yes | Primitivas na mesma grade de 2 px, com contorno escuro |
| 7 | Avatar e marcações pixelados | Yes | Também afeta a pré-visualização (desejável) |
| 8 | Kenney removido | Yes | Remover a pasta, o módulo e o parâmetro |
| 9 | Créditos na página e em arquivo | Yes | Linha em `hotel.blade.php` + `CREDITS.txt` em `public/sprites/cryovex/` |
