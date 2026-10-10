# SPDD Analysis: República — jogar pelo celular (toque, zoom inteiro, interface compacta e voz móvel)

## Original Business Requirement

# República — semente: jogar pelo celular

## Visão

Hoje a República só roda no computador. Em celular (`pointer: coarse` e largura < 900 px), a página do hotel é coberta pelo aviso **"A República funciona no computador."** (`#desktop-only`).

A ideia é que os amigos possam **entrar, andar pelos quartos e conversar por voz pelo celular**, no navegador, com a mesma conta e o mesmo jogo do computador. Quem está no celular e quem está no computador se veem nos mesmos quartos e entram nas mesmas calls.

## Público e uso
- O mesmo grupo de amigos da semente original.
- O caso típico no celular é entrar rápido na Sala de estar, ver quem está lá e puxar uma call para praticar idioma. Sessões curtas, muitas vezes com fone de ouvido.
- Celulares-alvo: iPhone (Safari) e Android (Chrome), com telas a partir de **360×640**, em **retrato e paisagem**.

## Funcionalidades

### 1. Acesso
- Remover o bloqueio `#desktop-only`. O hotel abre em qualquer tela a partir de 360 px de largura.
- As telas de entrar, cadastro e perfil já se adaptam a telas estreitas (`.auth`, `@media (max-width: 520px)`). Elas devem ser conferidas e ajustadas onde algo ficar cortado ou pequeno demais para o dedo.

### 2. Ver o quarto numa tela pequena
- Os quartos não cabem inteiros no celular em 2×. A Sala de estar ocupa cerca de 960×624 px.
- **Zoom em escala inteira**, para manter a pixel art nítida (regra da semente de pixel art):
  - **1×** (pixel nativo do pack): o quarto inteiro cabe na tela. É o padrão no celular em retrato.
  - **2×** (o tamanho de hoje): é o padrão no computador e em celulares em paisagem onde o quarto caiba.
  - Nunca usar escala fracionária.
- **Arrastar com um dedo** move a câmera quando o quarto não cabe na tela. A câmera não pode sair do quarto: sempre sobra uma parte dele visível.
- **Pinça** alterna entre 1× e 2×, e há também um botão de zoom na barra.
- A câmera **segue o próprio avatar** quando ele anda para fora da área visível.
- Ao girar o celular ou abrir o teclado, o quarto se reenquadra sem cortar o próprio avatar.

### 3. Andar e interagir com toque
- **Toque curto** no piso: o avatar anda até lá (como o clique de hoje).
- **Toque curto** num avatar: abre o cartão do morador (como o clique de hoje).
- Toque e arrasto se distinguem por distância: o gesto vira arrasto acima de cerca de 10 px de movimento e não move o avatar.
- Sem mouse não existe *hover*. O que hoje aparece ao passar o mouse precisa de equivalente:
  - **Cursor de tile**: depois do toque, o losango de destino aparece por um instante.
  - **Etiqueta de nome**: os nomes de quem está no quarto continuam na janela do quarto, e tocar no avatar abre o cartão com o nome.
- Áreas tocáveis (botões, itens do navegador, avatares) com **pelo menos 44×44 px**. O avatar pode ter área de toque maior que a de clique.
- Gestos do navegador não atrapalham o jogo: o canvas não rola a página, não dá zoom do navegador e não seleciona texto.

### 4. Interface (janelas e barra)
- **Barra inferior**: os 6 itens de hoje (Sala de estar, Meu quarto, Navegador, Perfil, status e Sair) não cabem em 360 px. No celular, a barra mostra **só ícones** (com `aria-label`), e "Perfil" e "Sair" vão para um menu "⋯".
- **Janela do quarto** (`#room-info`, hoje fixa com 230 px no canto): no celular vira uma faixa compacta no topo, com o nome do quarto e o número de pessoas. Tocar nela expande a lista de pessoas.
- **Navegador, cartão do avatar, painel da call e pedidos de call**: no celular abrem como **painel inferior** (largura total, acima da barra), em vez de janelas soltas. Só um painel fica aberto por vez. Os pedidos de call têm prioridade.
- Respeitar as **áreas seguras** (notch e barra de gestos) e a altura real da tela no celular (`dvh` em vez de `100vh`).
- O estilo retrô atual (janelas creme, barra de título verde) continua o mesmo, só reorganizado.

### 5. Voz no celular
- A call funciona entre celular e computador nos dois sentidos.
- **Áudio de quem fala**: o iOS só toca áudio depois de um gesto do usuário. O áudio das calls precisa ser "destravado" no primeiro toque na página. Se o áudio continuar bloqueado, aparece um aviso "Toque para ouvir a conversa".
- **Microfone negado**: o aviso atual ganha instruções para Safari (iOS) e Chrome (Android).
- **Tela bloqueada ou app em segundo plano**: o celular pode congelar a página. Regra: ao voltar para a página, o jogo **reconecta e volta para o mesmo quarto**. Se a call caiu nesse meio-tempo, a pessoa vê um aviso e pode pedir para entrar de novo.
- Enquanto a pessoa está numa call, a tela **não apaga sozinha** (Wake Lock, quando o navegador suportar).

### 6. Desempenho
- 60 fps no quarto da Sala de estar num celular intermediário (cerca de 3 anos de uso). Mínimo aceitável: 30 fps estáveis, sem travar o toque.
- Com a aba em segundo plano, o loop de desenho para.
- Os sprites do pack continuam sendo baixados uma vez só, em cerca de 70 KB.

## Fora do escopo
- App nativo ou instalável (PWA, ícone na tela inicial, notificações push).
- Controles por joystick virtual ou teclado.
- Mudar regras do jogo, quartos ou voz além do necessário para o celular.
- Tablets: devem funcionar pelas mesmas regras, mas não serão otimizados à parte.
- Mensagens e amizades (ainda não implementadas). Quando existirem, já devem nascer seguindo os padrões de painel desta semente.

## Restrições
- Continua **só no navegador**, no mesmo endereço e com o mesmo código. Nada de versão separada para celular.
- A experiência no computador não pode piorar: escala 2×, clique, hover e janelas continuam como estão.
- **Pixel art sempre em escala inteira** (1× ou 2×), sem suavização (semente de pixel art).
- Sem dependências novas de front-end (sem bibliotecas de gestos). Usar Pointer Events, que já são usados no jogo.
- A voz exige HTTPS no celular. Em produção (Laravel Cloud) isso já existe. Para testar no celular em desenvolvimento, é preciso um túnel ou certificado local.

## Decisões (assumidas, revisar se discordar)
1. **Zoom padrão**: 1× no celular em retrato e 2× no computador. Na paisagem, usa 2× se o quarto couber e 1× se não couber.
2. **Arrasto de câmera** só existe quando o quarto não cabe na tela. Se ele cabe, o arrasto não faz nada.
3. **Um painel por vez** no celular. Abrir outro fecha o anterior, mas um pedido de call sempre aparece por cima.
4. **Voltar do segundo plano** reconecta ao mesmo quarto, mas não reentra sozinho na call.
5. **Orientação livre**: o jogo não força retrato nem paisagem.

## Critérios de aceite
1. Num celular de 360×640 em retrato, a pessoa entra, vê a Sala de estar inteira em 1× e não aparece o aviso "funciona no computador".
2. Tocar no piso move o avatar. Tocar num avatar abre o cartão. Arrastar move a câmera (em 2×) sem mover o avatar.
3. A pinça e o botão de zoom alternam entre 1× e 2×, e a pixel art fica nítida nas duas escalas.
4. Barra, navegador, cartão, painel da call e pedidos cabem em 360 px sem cortar texto nem botões, e todo alvo de toque tem pelo menos 44×44 px.
5. Uma call entre um iPhone (Safari) e um computador funciona: os dois se ouvem, e o aviso "Toque para ouvir a conversa" aparece quando o áudio estiver bloqueado.
6. Bloquear a tela e voltar devolve a pessoa ao mesmo quarto. Se a call caiu, ela é avisada.
7. Ao girar o celular, o quarto se reenquadra sem cortar o próprio avatar.
8. No computador, nada muda: escala 2×, clique, hover, etiqueta de nome e janelas como hoje.
9. A Sala de estar roda a pelo menos 30 fps num Android intermediário.

## Riscos
- **iOS Safari e WebRTC**: há restrições de autoplay, o áudio pode sair pelo alto-falante do ouvido em vez do viva-voz, e a página congela em segundo plano. Mitigação: testar cedo num iPhone de verdade e manter o fluxo de "destravar áudio".
- **Rede móvel e NAT**: em 4G/5G, a conexão direta entre pares falha com frequência sem servidor TURN. A config já aceita `REPUBLICA_TURN_URL`, e o padrão é só STUN. Sem TURN, calls pelo 4G podem não conectar. Mitigação: confirmar se a produção tem TURN e, se não tiver, contratar ou subir um antes de liberar o celular (decisão de custo do dono do projeto).
- **Conflito entre gestos**: toque, arrasto, pinça e o zoom do próprio navegador competem entre si. Mitigação: limiar de distância, `touch-action: none` no canvas e testes nos dois sistemas.
- **Bateria e calor**: o loop a 60 fps com voz aberta gasta bateria. Mitigação: pausar o loop em segundo plano e, se precisar, reduzir a taxa de quadros quando nada se move.
- **Interface a duas mãos**: os painéis inferiores precisam conviver com o teclado virtual (no cadastro e no perfil, e nas mensagens no futuro).

## Domain Concept Identification

### Existing Concepts (from codebase)
- **Bloqueio de celular** (`hotel.blade.php → #desktop-only` + `app.css`, regra `@media (pointer: coarse) and (max-width: 899px)`): overlay que cobre o hotel no celular. É a única coisa que hoje impede o acesso.
- **Câmera e projeção** (`iso.js`): `toScreen`/`toTile` trabalham em px de tela com uma câmera `{x, y}`. `fitCamera(layout, width, height, bottomBar)` centraliza o quarto e não tem conceito de escala nem de deslocamento. `TILE_W = 64`, `TILE_H = 32` e `WALL_H = 144` estão em "px de mundo", que hoje coincidem com px CSS (escala 2× do pack).
- **Loop e entrada** (`game.js`): o canvas usa `setTransform(dpr)` e redimensiona por `window.innerWidth/innerHeight`. A entrada é `pointermove` (hover), `pointerleave` e `click` (andar ou abrir cartão). O hit-test do avatar é fixo em 28×64 px. `BOTTOM_BAR = 52` é constante. O hover produz o cursor de tile e a etiqueta de nome.
- **Renderer** (`renderer.js`): desenha tudo em px de mundo a partir da câmera e pinta o fundo em `state.width × state.height`. A cada quadro redesenha paredes, piso (até 896 amostras na Sala de estar) e tapetes.
- **Interface HTML** (`hotel.blade.php`, `app.css`, `ui.js`, `navigator.js`, `avatar-card.js`, `voice/call-ui.js`): janelas retrô em posição fixa com larguras em px (`#room-info` 230, `#navigator` 300, `#avatar-card` 210, `#call-panel` 220) e uma barra inferior (`#toolbar`) com 6 itens de texto. O cartão é posicionado por JS perto do clique. O cartão fecha em `pointerdown` fora dele.
- **Telas de conta** (`auth/*.blade.php`, `.auth`, `@media (max-width: 520px)`): já são estreitas. Os inputs têm `font: 12px`, o que faz o iOS dar zoom automático ao focar.
- **Voz** (`voice/*`):
  - `media.js` tem mensagens de microfone pensadas para desktop ("Clique no cadeado…").
  - `peer-mesh.js` cria `<audio autoplay>` e chama `play().catch(() => {})`, então uma falha de autoplay (iOS) fica silenciosa.
  - `call-manager.js` sai da call em `pagehide`. `endLocalCall(message)` encerra localmente com um aviso. `handleDeparture` encerra para os outros quando alguém sai do canal do quarto.
- **Presença** (`room-session.js`, `republic-presence.js`, `echo.js`): canais de presença do Reverb via pusher-js. Ao reconectar, o pusher-js reassina os canais sozinho e o `here()` roda de novo, **sem limpar** o estado. A `RoomSession` mantém avatares antigos e recoloca o próprio avatar perto da porta. A `RepublicPresence` mantém `online`/`locations` antigos. A regra "a aba nova assume" (`takeover`) vale entre dispositivos, então abrir no celular derruba a sessão do computador.
- **Servidor Reverb** (`config/reverb.php`): `activity_timeout` 30 s e `ping_interval` 60 s. Uma página congelada em segundo plano perde a conexão em menos de 1 minuto.

### New Concepts Required
- **Modo celular**: o contexto "ponteiro grosso e tela < 900 px" (o mesmo critério do bloqueio de hoje). Decide o layout compacto da interface e o zoom padrão. Tablets (≥ 900 px) usam a interface do computador, com gestos de toque.
- **Vista (zoom + deslocamento)**: escala inteira do pack (`1×` ou `2×`) mais um deslocamento de câmera limitado ao quarto. Converte coordenadas de tela em coordenadas de mundo e decide o enquadramento, o limite do arrasto e o "seguir o avatar".
- **Gesto**: classifica a sequência de ponteiros em toque curto, arrasto ou pinça. O mouse continua com hover e clique.
- **Marcador de destino**: equivalente ao cursor de tile para toque, mostrado por um instante após o toque.
- **Painel inferior (bottom sheet)**: forma das janelas no modo celular, com a regra de "um painel por vez".
- **Destravamento de áudio**: estado "áudio bloqueado" e o aviso "Toque para ouvir a conversa".
- **Retomada após segundo plano**: detecção de queda da conexão e ressincronização do quarto e da presença, com aviso de call perdida.
- **Wake Lock da call**: impede a tela de apagar enquanto a pessoa está numa call.

### Key Business Rules
- **A pixel art só em escala inteira**: o zoom é 1× ou 2× do pack. Como o mundo é desenhado em "2×", o 1× é uma escala de vista 0,5 com câmera alinhada a pares de px de mundo. (Rege: vista, renderer.)
- **O computador não muda**: sem ponteiro grosso, o zoom é sempre 2×, sem arrasto, botão de zoom ou painel inferior. Hover, clique e etiqueta continuam iguais. (Rege: vista, gesto, interface.)
- **Zoom padrão**: no modo celular é 2× se o quarto couber na área visível e 1× se não couber. Na prática, retrato fica em 1× e paisagem em 2× se couber. (Rege: vista.)
- **Arrasto só quando o quarto não cabe**, e a câmera não sai do quarto. (Rege: vista.)
- **Toque ≠ arrasto**: o gesto vira arrasto acima de 10 px de movimento. Arrasto e pinça nunca movem o avatar nem abrem o cartão. (Rege: gesto.)
- **Alvos de toque ≥ 44×44 px CSS**, inclusive a área do avatar em 1×. (Rege: gesto, interface.)
- **Um painel por vez** no celular. Os pedidos de call sempre aparecem por cima. (Rege: interface.)
- **Ao voltar do segundo plano**, a pessoa reconecta ao mesmo quarto e não reentra na call sozinha. Se a call caiu, ela é avisada. (Rege: retomada, voz.)
- **Implícita: retomada sem estado velho**. Após a reconexão, avatares e ocupação são reconstruídos do zero, sem fantasmas nem teleporte inesperado.
- **Implícita: takeover entre dispositivos**. Abrir no celular derruba o computador (e vice-versa). É a regra atual e continua valendo.

## Strategic Approach

### Solution Direction
- **Vista como camada fina sobre o mundo atual**: o renderer, `iso.js` e o pathfinding continuam em px de mundo. Um novo módulo de vista calcula `scale` (1 = 2× do pack, 0,5 = 1× do pack) e a câmera em coordenadas de mundo. O `game.js` aplica `setTransform(dpr × scale)` e converte a entrada de tela para mundo dividindo por `scale`. Assim o `drawScene` e o `toTile` não mudam de contrato.
- **Gestos com Pointer Events** num módulo puro (uma máquina de estados alimentada por eventos), ligado ao canvas pelo `game.js`. O mouse mantém o caminho atual (hover + clique). Toque e caneta passam pelo classificador.
- **Interface responsiva por CSS** no breakpoint do modo celular, com poucos ganchos de JS: o cartão não se posiciona perto do toque, a regra de um painel por vez fica num coordenador pequeno e a barra ganha um menu "⋯". A estrutura HTML é a mesma para computador e celular.
- **Voz e retomada como extensões dos módulos atuais**: `media.js` (mensagens por plataforma), `peer-mesh.js` (expor falha de autoplay e destravar), `call-ui.js` (aviso de áudio bloqueado), `call-manager.js` (Wake Lock e "call perdida") e um vigia de conexão no `game.js` que, após uma queda, reconstrói a presença e o quarto.
- **Desempenho**: cache da camada estática (paredes, piso, tapetes) num canvas fora da tela por quarto e escala, porque é a maior carga por quadro. O loop já pausa em segundo plano, porque `requestAnimationFrame` não roda em aba oculta.

### Key Design Decisions
- **Como implementar o 1×**: (a) parametrizar `TILE_W`/`PX` por zoom, (b) escalar a vista (`ctx.scale(0.5)`).
  → **(b)**. Tudo o que o renderer desenha está em múltiplos de 2 px de mundo, então em 0,5 cada pixel do pack vira exatamente 1 px CSS. Mexe só na vista e na conversão de entrada. A alternativa (a) espalharia o zoom por `iso.js`, `pixel.js`, `atlas.js` e pathfinding. A etiqueta de nome em 0,5 fica pequena (texto de 11 px a 5,5 px), então é desenhada **fora** da transformação de escala, em px CSS.
- **Onde vive a regra de "modo celular"**: no CSS (`@media`) para o layout e em `matchMedia` no JS para o zoom padrão e o comportamento do cartão. O critério é o mesmo nos dois (`pointer: coarse` e `max-width: 899px`), e uma constante JS espelha a media query.
- **Menu "⋯"**: Perfil e Sair passam para um contêiner que no computador aparece inline (como hoje) e no celular vira um menu suspenso aberto por um botão que só existe no celular. É um HTML só, sem duplicar formulário.
- **Call no celular**: o painel da call fica numa faixa compacta fixa acima da barra (participantes, Silenciar e Sair) e não conta como "painel exclusivo". O navegador e o cartão abrem como painéis inferiores **acima** dela. Isso resolve "um painel por vez" sem esconder a call em andamento.
- **Retomada**: (a) confiar na reassinatura automática do pusher-js, (b) após uma queda (`connected` → outro estado → `connected`), forçar `leave` + `enter` do quarto e limpar o estado da presença.
  → **(b)**. A opção (a) deixa avatares fantasmas e teleporta o próprio avatar para a porta sem aviso. Antes de reentrar, se havia call, chamar `endLocalCall('…')`. A pessoa reentra na call só se pedir de novo.
- **Destravar áudio**: no primeiro `pointerdown` da página, tentar `play()` em todos os `<audio>` da malha. Se o `play()` de uma trilha nova falhar com `NotAllowedError`, mostrar o aviso clicável, que tenta de novo no toque.
- **Wake Lock**: pedir `navigator.wakeLock.request('screen')` ao entrar numa call e liberar ao sair. Como o navegador solta o lock quando a página fica oculta, pedir de novo no `visibilitychange` visível se ainda houver call. Sem suporte, não faz nada.
- **Mensagens de microfone por plataforma**: detectar iOS e Android pelo `userAgent` (com o iPad "Mac com toque") num helper puro e testável.
- **Inputs a 16 px no celular**: evita o zoom automático do iOS nas telas de conta.

### Alternatives Considered
- **Escala fracionária para caber a tela**: rejeitada porque viola a regra da pixel art.
- **Biblioteca de gestos (Hammer.js etc.)**: rejeitada pela restrição "sem dependências novas".
- **Página separada para celular**: rejeitada porque a semente exige o mesmo endereço e o mesmo código.
- **Esconder o painel da call ao abrir o navegador ou o cartão**: rejeitada porque a pessoa perderia o controle de Silenciar/Sair durante a conversa.
- **PWA/instalável**: fora do escopo.

## Risk & Gap Analysis

### Requirement Ambiguities
- **"Um painel por vez" × call em andamento**: a semente não diz se a call conta como painel. **Assumido**: a faixa da call é fixa e não conta (ver decisões).
- **Zoom padrão em tablet** (coarse, ≥ 900 px): **Assumido**: segue o computador (2×). Se não couber, o arrasto fica liberado, porque a regra de arrasto vale sempre que o quarto não cabe.
- **"Câmera segue o avatar"**: não diz se segue sempre ou só ao sair da tela. **Assumido**: quando o avatar sai de uma margem interna de 48 px CSS, a câmera se desloca o mínimo para trazê-lo de volta. Depois de um arrasto manual, o seguir só volta a agir quando o próprio avatar andar.
- **Nome do avatar no toque**: a semente aceita o cartão e a lista do quarto como substitutos. **Assumido**: não haverá etiqueta sobre o avatar no toque.
- **"Reconecta e volta para o mesmo quarto"**: se o quarto ficou indisponível (ex.: dono apagado), não há regra. **Assumido**: o quarto atual é sempre reentrado. Os quartos não são apagados no produto atual.

### Edge Cases
- **Pinça no meio de um arrasto**: o segundo dedo transforma o gesto em pinça. Soltar um dedo não gera toque.
- **Toque perto da borda com o teclado aberto**: o `resize` reenquadra. A câmera é limitada de novo após cada resize.
- **DPR 3 com escala 0,5**: um pixel do pack ocupa 3 px físicos, ainda inteiro. Com DPR fracionário (2,625), surgem pixels desiguais, o que é uma limitação conhecida da semente de pixel art.
- **Takeover**: abrir no celular com o computador aberto derruba o computador. O aviso existente ("Você entrou em outro lugar") vale nos dois sentidos.
- **Aba oculta sem queda de conexão** (troca rápida de app no Android): a call continua e nada é refeito.
- **Pedido de call chegando com um painel aberto**: o pedido aparece por cima e não fecha o painel.
- **Arrasto começando em cima de um avatar**: vira arrasto e não abre o cartão.

### Technical Risks
- **iOS Safari**: autoplay, saída de áudio pelo alto-falante do ouvido (sem controle via web) e congelamento em segundo plano. Mitigação: destravar no primeiro toque, deixar o aviso visível e testar num iPhone de verdade. A saída pelo alto-falante do ouvido fica documentada como limitação.
- **TURN**: sem TURN, calls pelo 4G/5G podem falhar. A config já aceita `REPUBLICA_TURN_URL`. É uma decisão operacional, fora do código.
- **Cache estático e DPR/zoom**: o cache precisa ser invalidado ao trocar de quarto, de escala ou de DPR. Um erro de invalidação mostra o quarto antigo. Mitigação: chave explícita (`layout`, `scale`, `dpr`, tamanho).
- **Gestos e scroll do navegador**: `touch-action: none` no canvas e `overscroll-behavior: none` no `body` do hotel evitam o "puxar para atualizar" e o zoom do navegador.
- **Testes**: não há testes de interface ou E2E no projeto. A vista, o classificador de gestos e o helper de plataforma são puros e testáveis em `node --test`. A interface responsiva e a voz no iOS exigem verificação manual (o harness headless cobre a vista em 360×640).

### Acceptance Criteria Coverage
| AC# | Description | Addressable? | Gaps/Notes |
|-----|-------------|--------------|------------|
| 1 | 360×640 retrato: entra e vê a Sala de estar inteira em 1×, sem bloqueio | Yes | Em 1×, a Sala de estar ocupa cerca de 480×312 px CSS: cabe em 360? **Não cabe na largura** (480 > 360). Em retrato o quarto entra em 1× com arrasto horizontal. **Gap**: "vê a Sala de estar inteira" é impossível em 360 px sem escala fracionária. Tratar como "vê a maior parte, com arrasto". |
| 2 | Toque anda, toque no avatar abre cartão, arrasto move a câmera | Yes | Classificador de gestos + vista |
| 3 | Pinça e botão alternam 1×/2× nítidos | Yes | Escala de vista 0,5/1 |
| 4 | Interface em 360 px com alvos ≥ 44 px | Yes | CSS do modo celular |
| 5 | Call iPhone ↔ computador com aviso de áudio bloqueado | Partial | Código: sim. Depende de teste manual em iPhone e de TURN para redes móveis |
| 6 | Bloquear e voltar: mesmo quarto + aviso de call caída | Yes | Vigia de conexão + `endLocalCall` |
| 7 | Girar reenquadra sem cortar o avatar | Yes | Resize → vista + seguir avatar |
| 8 | Computador sem mudanças | Yes | Sem modo celular: zoom 2×, mesma interface |
| 9 | ≥ 30 fps num Android intermediário | Partial | Cache estático reduz a carga. A medição é manual |
