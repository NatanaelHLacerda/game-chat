# SPDD Analysis: República — avatar no estilo Habbo, animações e emotes (CC0)

## Original Business Requirement

# República — semente: avatar profissional, animações e emotes

## Visão

O cenário já tem pixel art de qualidade (pack Cryovex), mas o avatar ainda parece um protótipo: blocos retos, um tom por cor, sem rosto expressivo, andar de 2 quadros e sentado virado para o lado errado. A ideia é dar ao avatar a **sensação de jogo profissional do Habbo Hotel**, com mais vida dentro do quarto (dançar, acenar, mostrar emoções) e **sem mudar a regra de ouro da República: a conversa é por voz**.

Combo recomendado, tudo gratuito:
1. **Avatar redesenhado por código, no estilo do Habbo**: partes separadas e coloridas com as cores do cadastro, 3 tons por cor, contorno e rosto expressivo. Não existe pack gratuito que reúna cores personalizáveis, isometria, sentar e dançar, e os sprites do Habbo são protegidos. Desenhar por código mantém tudo isso e não custa nada.
2. **Animações por código**: parado (respirando e piscando), andar, sentar de frente para o assento, dançar, acenar e boca mexendo quando a pessoa fala na call.
3. **Emotes em balão** com o pack **Tiny Speech Indicators** (CC0), no lugar de balões de texto.

## Pack escolhido para os emotes

**Tiny Speech Indicators**, de Pigeon Ivy (@rehhouari)
<https://pigeonivy.itch.io/tiny-speech-indicators>

- **Licença**: CC0 (domínio público). Pode ficar no repositório público, sem obrigação de crédito, mas daremos crédito mesmo assim.
- **Conteúdo** (conferido no download):
  - `tiny_speech_indicators-11x11.png`: 8 balões de 11×11. Na ordem: reticências, feliz corado, sorriso, rindo, bravo, irritado, neutro e vazio.
  - `speech_bubble_animation-11x11.png`: animação de 8 quadros do balão aparecendo (de um traço até o balão completo).
  - `exclamation-7x8.png`: balão de exclamação animado (6 quadros de 7×8).
- **Escala**: em 2× (1 pixel do pack = 2 px), o balão fica com 22×22 px, proporcional ao avatar e ao cenário.

## Funcionalidades

### 1. Avatar com visual profissional
- **Proporção do Habbo**: cabeça grande, corpo curto e pernas curtas, com altura total parecida com a de hoje (o avatar sentado cabe na poltrona e, em pé, é mais baixo que a estante).
- **Partes separadas**, cada uma com a cor do cadastro: pele (cabeça, pescoço e mãos), cabelo, parte de cima (tronco e mangas) e calça, além de sapatos com cor fixa.
- **3 tons por cor** (luz, base e sombra), calculados a partir da cor escolhida. A luz vem do mesmo lado da luz do pack Cryovex.
- **Contorno escuro de 1 pixel do pack** na silhueta e em volta das partes (separando braço do tronco, por exemplo).
- **Rosto**: olhos com brilho, boca e sobrancelhas. Expressões: neutro, sorrindo, falando (boca abre e fecha) e piscando.
- **4 direções visíveis**, como no Habbo: frente-esquerda, frente-direita, costas-esquerda e costas-direita. Hoje só existem frente e costas espelhadas.
- **Estilos novos no cadastro e no perfil**:
  - **4 cabelos**: curto, médio, cacheado e longo.
  - **3 partes de cima**: camiseta, regata e moletom com capuz.
  - Quem já tem conta recebe o estilo padrão (cabelo curto e camiseta), sem precisar editar nada.
- A pré-visualização do cadastro, do perfil e do cartão usa o avatar novo.

### 2. Animações
- **Parado**: respiração sutil (o tronco sobe 1 pixel a cada ~1,5 s) e piscar a cada 3 a 6 s.
- **Andar**: ciclo de 4 quadros, com braços e pernas alternados e o corpo subindo 1 pixel nos passos.
- **Sentar**: o avatar senta **virado para a frente do assento** (a mesma direção do sprite do sofá ou da poltrona), com as pernas dobradas sobre o assento. Isso corrige a limitação atual de sentar virado para o último passo.
- **Dançar**: 3 danças à escolha (**balanço**, **braços para cima** e **passinho**), cada uma em loop de 4 quadros. A dança para quando a pessoa anda ou senta.
- **Acenar**: o braço acena 3 vezes (cerca de 1,5 s) e o avatar volta ao normal.
- **Falar**: quando o detector de fala da call indica que a pessoa está falando, a boca abre e fecha, como reforço do anel de fala que já existe.
- Todas as animações valem para **todos os avatares do quarto**: quem está no quarto vê a dança, o aceno e o emote dos outros.

### 3. Emotes (no lugar do chat de texto)
- **Não existem balões de texto**, como na semente original. Os emotes são a forma de "reagir" sem digitar.
- Emotes disponíveis:
  - 😊 **Feliz**, 🙂 **Sorriso**, 😆 **Rindo**, 😠 **Bravo**, 😒 **Irritado**, 😐 **Neutro** e 💭 **Pensando** (reticências): do pack.
  - ❗ **Atenção**: do pack, com animação.
  - 👋 **Oi**, ❤️ **Amei** e 🎵 **Música**: desenhados em pixel art dentro do balão vazio do pack.
- O emote aparece **sobre a cabeça** com a animação de entrada do pack, fica **4 segundos** e some.
- Limite: **1 emote a cada 2 segundos** por pessoa. Um emote novo substitui o anterior.
- O emote **👋 Oi** também dispara o aceno.

### 4. Controles
- Botão **😊** na barra: abre o seletor de emotes (grade de ícones, painel inferior no celular).
- Botão **💃** na barra: abre o seletor de danças (3 danças + "Parar"). No computador, também por clique no próprio avatar (o cartão do próprio morador ganha os botões de dança).
- No celular, os dois botões seguem as regras do modo celular: só ícones, alvos de 44 px e um painel por vez.
- **Atalhos de teclado** no computador: `1`–`9` para os emotes mais usados, `D` para dançar ou parar e `Esc` para fechar os seletores.

### 5. Sincronização
- Dança, aceno e emote são enviados aos outros do quarto pelo canal de presença do quarto (como o movimento), com o mesmo cuidado de limite de taxa já usado.
- Quem entra no quarto vê quem já está dançando. Os emotes de antes da entrada não aparecem.
- Ao trocar de quarto ou cair a conexão, a dança acaba.

## Fora do escopo
- Balões de chat com texto e mensagens digitadas no quarto (mantém a regra da voz).
- Loja, roupas pagas, acessórios (chapéus, óculos), mais de 4 cabelos e 3 partes de cima.
- Animações de móveis e interação com objetos além de sentar.
- Sons de emote ou de dança.

## Restrições
- Tudo **gratuito**: o avatar e as animações são desenhados por código, e os emotes vêm de um pack CC0.
- **Pixel art em escala inteira** e sem suavização (sementes de pixel art e de celular). O avatar usa a mesma grade de 2 px.
- Nenhum sprite do Habbo ou de outro jogo protegido.
- Sem dependências novas de front-end. Continua em Canvas 2D.
- O cadastro e a validação do servidor aceitam os estilos novos, e contas antigas continuam funcionando sem migração manual.
- Desempenho no celular: com 10 avatares animados na Sala de estar, o jogo segue nos 30 fps mínimos da semente do celular.

## Decisões (assumidas, revisar se discordar)
1. **Sem chat de texto**: os emotes substituem os balões, e a voz continua sendo o principal.
2. **O pack de emotes é CC0**: entra no repositório público sem o problema de licença do pack Cryovex.
3. **3 danças e 11 emotes** na primeira versão.
4. **Estilos padrão para contas antigas**: cabelo curto e camiseta.
5. **Dança não sincronizada no tempo**: cada pessoa vê a dança do outro a partir do quadro em que recebeu o aviso. Não é preciso alinhar o ritmo entre telas.

## Critérios de aceite
1. O avatar novo tem contorno, 3 tons por cor, rosto com olhos e boca, e 4 direções visíveis. Em qualquer combinação de cores do cadastro, as partes continuam distinguíveis.
2. Ao andar, o avatar faz um ciclo de 4 quadros. Parado, respira e pisca.
3. Ao sentar no sofá ou na poltrona, o avatar fica virado para a frente do assento, com as pernas dobradas sobre ele.
4. A pessoa escolhe uma das 3 danças, o avatar dança em loop e os outros do quarto veem. Ao andar, a dança para.
5. Um emote escolhido aparece sobre a cabeça com a animação do pack por 4 s, e todos do quarto o veem. Um segundo emote em menos de 2 s é ignorado.
6. Quem fala na call mexe a boca enquanto fala.
7. O cadastro e o perfil permitem escolher entre 4 cabelos e 3 partes de cima. Contas antigas aparecem com cabelo curto e camiseta.
8. No celular, os botões 😊 e 💃 e seus seletores seguem o modo celular (44 px, painel inferior, um por vez).
9. O crédito do pack de emotes está no arquivo de créditos e na linha de créditos da página.
10. Com 10 avatares animados na Sala de estar, o celular intermediário segue a pelo menos 30 fps.

## Riscos
- **Arte por código é trabalho de design**: chegar ao "profissional" exige iteração visual. Mitigação: um harness de pré-visualização com todos os estilos, cores, direções e animações lado a lado, revisado antes de ligar no jogo.
- **Combinações de cor ruins**: pele e camisa da mesma cor podem "fundir". Mitigação: contorno interno entre as partes e sombra calculada.
- **Tamanho da sincronização**: muitos emotes poderiam lotar o canal. Mitigação: limite de 1 emote a cada 2 s e dança enviada só ao mudar de estado.
- **Desempenho**: desenhar por código 10 avatares com contorno por quadro custa CPU no celular. Mitigação: guardar em cache os quadros de cada avatar (por cores, estilo, direção e quadro) num canvas fora da tela.
- **Compatibilidade de dados**: o `look` ganha os campos `hair_style` e `top_style`. Mitigação: valores padrão no servidor e no cliente, e testes com contas antigas.

## Domain Concept Identification

### Existing Concepts (from codebase)
- **Aparência (`look`)** (`users.look`, JSON; `config/republica.php → look_palette`, `default_look`):
  - Hoje tem só 4 cores (`skin`, `hair`, `shirt`, `pants`), escolhidas em paletas fixas.
  - Validada em `ValidatesResidentProfile` (cada parte da paleta é `required` e `in` a paleta). A regra `'look' => ['required', 'array']` não restringe chaves extras, que hoje seriam aceitas e gravadas.
  - Viaja para os outros clientes via `User::toPresence()` nos canais `republica` e `quarto.{id}`.
- **Seletor de aparência** (`partials/look-picker.blade.php`, `profile-form.js`): rádios de cor por parte e pré-visualização (`renderPreview`) quando as 4 cores estão escolhidas. É usado no cadastro (`RegisterController`) e no perfil (`ProfileController`).
- **Avatar procedural** (`avatar.js`):
  - `drawAvatar(ctx, footX, footY, look, { dir, back, walkPhase, walking, sitting, scale })`, em retângulos numa grade de unidade `u = 2·scale`, com contorno por silhueta (passada INK) e sombra em elipse pixelada.
  - Só 2 vistas (frente e costas) espelhadas por `dir`, andar com `sin(walkPhase)` (2 poses) e sentar com o tronco descendo.
  - Também é usado por `renderPreview` (cadastro, perfil, cartão) e pelos marcadores `drawHeadset`/`drawSpeakingRing`.
- **Estado do avatar no quarto** (`room-session.js`):
  - `{ pos, render, path, progress, dir, back, sitting, walkPhase }`.
  - `dir` e `back` vêm do último passo, e `sitting` vem de `grid.seat`.
  - A sincronização usa os whispers `state` (posição e direção, enviados ao entrar e a quem chega) e `move` (limitado a 4/s com `MOVE_INTERVAL`).
  - Whispers de outros módulos entram por `hooks.whispers`, com validação na borda (padrão do `CallManager.hooks().guard`).
- **Sprites de assento** (`atlas.js → FURNITURE`): `poltrona` e `sofa` têm `facing: 'SE'` nativo, e a direção final segue `facing(item)` (`y <= x` → SW, senão SE). A altura do assento é `seatHeight(type)`. Isso dá a direção "de frente para o assento" que o avatar precisa.
- **Renderer** (`renderer.js`): ordena móveis e avatares por profundidade e desenha anel de fala, avatar e fone (via `decorate(id)` do `CallManager`: `{ inCall, speaking }`). Tem um cache estático para o cenário. Os avatares são redesenhados a cada quadro.
- **Fala** (`CallManager.speaking`, `decorations(id)`): o conjunto de quem fala já existe, vindo do detector local e dos whispers `call-speaking`. Basta para a boca mexer.
- **Barra e modo celular** (`hotel.blade.php`, `app.css`, `game.js`): botões com `.label` escondida no celular, painéis inferiores e a regra "um painel por vez" coordenada no `game.js` (navegador × cartão). O cartão do próprio morador hoje não tem ação (`cardAction` retorna `null` para si).
- **Créditos** (`public/sprites/cryovex/CREDITS.txt`, `#credits` na página).

### New Concepts Required
- **Estilos de aparência**: `hair_style` (curto, médio, cacheado, longo) e `top_style` (camiseta, regata, moletom). Estendem o `look` com padrão para contas antigas.
- **Rig do avatar (partes + poses)**: o avatar passa a ser descrito por partes (cabeça, rosto, cabelo, tronco, braços, pernas, sapatos) e poses por animação, desenhado em 4 direções.
- **Paleta derivada**: 3 tons (luz, base, sombra) por cor escolhida, mais o contorno.
- **Animação**: estados `idle`, `walk`, `sit`, `dance(n)`, `wave` e o modificador `talking`, com quadro atual derivado do tempo. Piscar e respirar são temporizadores locais.
- **Ação do avatar** (dança e aceno): estado sincronizado pelo quarto. A dança persiste e é enviada a quem chega. O aceno é efêmero.
- **Emote**: reação efêmera (4 s) com tipo (11 opções), sincronizada e com limite de taxa. Usa os sprites do pack CC0 e ícones desenhados no balão vazio.
- **Cache de quadros do avatar**: canvas fora da tela por combinação (look, direção, pose, quadro).
- **Seletores de emote e de dança**: novos painéis da barra, seguindo o modo celular.

### Key Business Rules
- **Voz é a conversa; não há texto no quarto**: os emotes não carregam texto livre, só um tipo de uma lista fechada. (Rege: emote, sincronização.)
- **Escala inteira e grade de 2 px**: o avatar, os balões e os ícones seguem as regras das sementes anteriores. (Rege: rig, emote.)
- **Sentar de frente para o assento**: a direção do avatar sentado vem do móvel, não do último passo. (Rege: animação, estado do avatar.)
- **A dança para ao andar ou sentar**: tanto no próprio cliente quanto nos outros. (Rege: ação do avatar.)
- **Limite de taxa dos emotes**: 1 a cada 2 s por pessoa. Um emote fora do limite é ignorado na origem e no destino. (Rege: emote.)
- **Compatibilidade de dados**: contas antigas sem estilos aparecem com o padrão. Valores de estilo fora da lista são rejeitados no servidor. (Rege: aparência.)
- **Implícita: validar whispers na borda**: tipos de emote e de dança vindos de outros clientes são conferidos contra listas fechadas, como já é feito com a voz.
- **Implícita: a pré-visualização usa o mesmo desenho** do jogo (cadastro, perfil e cartão), agora com os estilos.

## Strategic Approach

### Solution Direction
- **Avatar como "rig" de dados + desenhista**: um módulo descreve partes e poses em coordenadas da grade (dados puros, testáveis) e outro desenha. Para cada combinação de aparência, direção, pose e quadro, o desenho é feito uma vez num canvas fora da tela e reutilizado (cache). O renderer só posiciona o quadro.
- **Animação por relógio**: o quadro é derivado do tempo e do estado do avatar (andando, sentado, dançando), sem timers por avatar. Piscar usa um "relógio" com fase própria por avatar, para não piscarem todos juntos.
- **Estado de ação na `RoomSession`**: dança e aceno passam a fazer parte do estado do avatar. A dança vai no whisper `state` (para quem chega). Ações e emotes ganham whispers próprios, validados na borda e com limite de taxa, no padrão do movimento.
- **Emotes como camada do renderer**: desenhados depois do avatar, acima da cabeça, com a animação de entrada do pack e expiração por tempo.
- **Aparência no servidor**: a config ganha a lista de estilos e o padrão. A validação aceita só chaves e valores conhecidos (fechando a brecha atual de chaves extras). O modelo devolve o `look` sempre completo (merge com o padrão), então presença, cartão e jogo recebem os estilos mesmo em contas antigas, sem migração.
- **Interface**: dois botões novos na barra (😊 e 💃) abrem painéis no padrão das janelas existentes. No celular são painéis inferiores, entram na regra "um painel por vez" e ganham atalhos de teclado no computador.
- **Harness de revisão visual** (fora do jogo, como os harnesses anteriores) com a grade de estilos, cores, direções e animações. É o critério de pronto do visual.

### Key Design Decisions
- **Avatar por código × spritesheet própria desenhada à mão**:
  → **Código**. Mantém as cores do cadastro sem trocar paletas de imagem, é gratuito e cabe no padrão atual. O custo é iteração visual, mitigada pelo harness.
- **Direções**: a semente pede 4 visíveis (frente-esquerda, frente-direita, costas-esquerda, costas-direita).
  → Desenhar **frente-direita** e **costas-direita** e obter as esquerdas por **espelhamento**, como o Habbo faz para metade das direções. O renderer atual já espelha com `dir`, e `back` vira uma vista própria.
- **Direção ao sentar**: usar o `facing` do sprite do assento sob o avatar (já existe em `atlas.js` e no `typeAt` do renderer). SW = frente-esquerda e SE = frente-direita.
- **Onde vive o estado da dança**: só local ou sincronizado.
  → Sincronizado via whisper próprio na mudança de estado e incluído no `state`, para quem chega ver quem já dança. A dança termina localmente ao andar ou sentar, nos dois lados, sem precisar de outro whisper (cada cliente aplica a regra ao receber `move`).
- **Cache de quadros**: a chave é a aparência (cores + estilos) + direção + pose + quadro. A memória cresce com o número de pessoas × quadros. Usar LRU com teto (ex.: 400 quadros) para não crescer sem limite.
- **Contas antigas**: merge com o padrão **na leitura** (modelo e cliente) em vez de migration de dados. É mais simples e não toca no banco. Ao salvar o perfil, os estilos são gravados.
- **Atalhos de teclado**: valem só quando o foco não está num campo de texto e só fora do modo celular.

### Alternatives Considered
- **Packs de personagem gratuitos** (8 Direction Walk Cycle CC0, Mini-Crusader etc.): rejeitados porque não têm sentar nem dançar, as cores são fixas e o estilo não combina.
- **Sprites do Habbo**: rejeitados por direitos autorais.
- **Balões de texto**: rejeitados pela regra de voz (Decisão 1 da semente).
- **Sincronizar o ritmo da dança entre telas**: rejeitado na Decisão 5, porque exige relógio comum e o ganho é pequeno.
- **Migration para preencher estilos**: rejeitada porque o merge com o padrão na leitura resolve sem tocar no banco.

## Risk & Gap Analysis

### Requirement Ambiguities
- **"Profissional como o Habbo" é subjetivo**: não há referência visual objetiva. **Assumido**: o critério é o harness com todas as combinações revisado por você antes de ligar no jogo. O AC1 cobre os requisitos técnicos (contorno, 3 tons, rosto, 4 direções).
- **Atalhos `1`–`9` para 11 emotes**: não diz quais 9. **Assumido**: os 9 primeiros na ordem da lista da semente (Feliz…Atenção). 👋, ❤️ e 🎵 ficam só no seletor.
- **Dança no cartão do próprio morador** ("clique no próprio avatar"): hoje o cartão de si mesmo não tem ação. **Assumido**: o cartão de si mostra as 3 danças + Parar. O botão 💃 da barra faz o mesmo.
- **Emote "👋 Oi" também acena**: se a pessoa está sentada ou dançando, o aceno interrompe? **Assumido**: o aceno é sobreposto (só o braço) e não cancela a dança nem tira do assento.
- **Altura e proporção**: "altura parecida com a de hoje" (cerca de 58 px). Com cabeça grande, a etiqueta de nome, o fone e o hit-test (64 px) precisam acompanhar.

### Edge Cases
- **Avatar sentado recebe pedido de dança**: a semente diz que a dança para ao sentar. **Assumido**: com o avatar sentado, o botão de dança fica desabilitado e o whisper é ignorado.
- **Emote durante a call com o avatar falando**: o balão e a boca convivem. O anel e o fone continuam.
- **Quem chega no meio de um aceno ou emote** não vê (são efêmeros), conforme a semente.
- **Conta antiga editando o perfil**: o seletor vem preenchido com os padrões, e salvar grava os estilos.
- **Cliente antigo** (aba aberta antes do deploy) recebendo whispers novos: ignora eventos desconhecidos, então não quebra.
- **Valores de estilo inválidos via whisper ou presença**: o cliente cai no padrão e o servidor rejeita no cadastro e no perfil.

### Technical Risks
- **Esforço de arte**: é o maior risco do projeto. Mitigação: o harness com revisão humana como portão, antes de integrar.
- **Desempenho no celular**: 10 avatares com contorno, 3 tons e animação. Mitigação: cache de quadros (o desenho por código vira um `drawImage` por avatar por quadro) e teto de memória.
- **Brecha de chaves extras no `look`** (já existe): ao estender o `look`, restringir as chaves aceitas evita guardar dados arbitrários que hoje viajam na presença para todos.
- **Tamanho do payload de presença**: ganha só 2 strings curtas. Irrelevante.
- **Testes**: a lógica de animação (quadro por tempo, transições de estado, limite de taxa, validação de emote e dança, merge de estilos) é pura e testável em `node --test`. A validação de estilos e os padrões no servidor ficam em testes PHP. O visual é revisado no harness.

### Acceptance Criteria Coverage
| AC# | Description | Addressable? | Gaps/Notes |
|-----|-------------|--------------|------------|
| 1 | Contorno, 3 tons, rosto e 4 direções, distinguível em qualquer cor | Yes | 4 direções = 2 desenhadas + espelho. "Distinguível" é verificado no harness com todas as combinações de paleta |
| 2 | Andar em 4 quadros. Parado respira e pisca | Yes | Quadro por relógio |
| 3 | Sentar de frente para o assento, com pernas dobradas | Yes | `facing` do assento já existe no manifesto |
| 4 | 3 danças em loop vistas por todos, que param ao andar | Yes | Whisper de ação + `state` |
| 5 | Emote por 4 s com animação, visto por todos, com limite de 2 s | Yes | Whisper de emote com limite na origem e no destino |
| 6 | Boca mexe ao falar | Yes | `decorations(id).speaking` já existe |
| 7 | 4 cabelos e 3 partes de cima, contas antigas no padrão | Yes | Config + validação + merge na leitura |
| 8 | 😊 e 💃 seguem o modo celular | Yes | Mesmo padrão de painéis e barra |
| 9 | Crédito do pack de emotes | Yes | `CREDITS.txt` do pack + linha na página |
| 10 | 30 fps com 10 avatares no celular | Partial | Cache de quadros reduz a carga. A medição é manual num aparelho |
