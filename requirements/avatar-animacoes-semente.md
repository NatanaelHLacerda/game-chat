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
