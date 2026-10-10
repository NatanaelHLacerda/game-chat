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
