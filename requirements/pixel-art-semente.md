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
