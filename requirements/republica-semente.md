# República — semente do jogo

## Visão

Um jogo online no navegador, no espírito do Habbo Hotel da época do Flash, onde um grupo de amigos se encontra para **praticar idiomas conversando por voz**.

O jogo é uma grande **república de jovens**: cada morador tem o seu quarto, todos podem visitar os quartos uns dos outros, andar por eles e puxar conversa.

## Público

- Um grupo de amigos (uso privado, poucas pessoas ao mesmo tempo).
- Objetivo único por enquanto: praticar idiomas.

## Funcionalidades

### 1. Moradores (contas)
- A pessoa se cadastra com **nome e senha**.
- Escolhe a aparência do seu avatar.
- Ao se cadastrar, **um quarto novo é criado automaticamente** para ela.

### 2. Quartos
- Cada morador tem exatamente 1 quarto.
- Os quartos **não são editáveis**: ninguém decora, move ou compra móveis.
- Visual isométrico, no estilo do Habbo.

### 3. Navegação
- Um **menu de navegação** lista os quartos da república.
- Pelo menu, a pessoa escolhe em qual quarto quer entrar.
- Dentro do quarto, a pessoa **anda pelo quarto** como no Habbo e vê os outros avatares presentes.

### 4. Conversa por voz (no lugar dos balões de chat)
- Não existem balões de chat de texto nos quartos.
- Uma pessoa pode **pedir autorização para entrar em call** com outra que está **no mesmo quarto**.
- Se a outra aceitar, forma-se um **grupo de conversa de 2 pessoas** (entrada e saída de áudio).
- Uma terceira pessoa (ou mais) pode **pedir para participar** da conversa já existente.

### 5. Amigos e mensagens
- Os moradores podem **se adicionar como amigos**.
- Amigos podem **enviar mensagens de texto** uns aos outros.

## Visual

- Parecido com o Habbo, levemente retrô.
- Paleta **pastel**, com tons de **laranja e verde**, inspirada no filme *Her*.

## Restrições

- Roda **apenas no navegador** (computador).
- Projeto em **PHP com Laravel**, hospedado no **Laravel Cloud**.
- **Sem complexidades**: nada além do descrito acima (sem loja, moedas, decoração de quartos, minigames etc.).

## Decisões (antes "Em aberto")

1. **Entrada de uma 3ª pessoa numa call**: o pedido aparece para todos os participantes e **qualquer um pode aprovar** (vale a primeira resposta); os demais são avisados. O pedido expira em **30 segundos** sem resposta. Após uma recusa, a mesma pessoa só pode pedir de novo depois de **1 minuto**. Máximo de **5 pessoas por call**.
2. **Mensagens offline**: sim. A mensagem fica guardada e é entregue quando o amigo entrar, com **contador de não lidas**. Histórico simples por amigo, sem busca nem anexos.
3. **Idiomas no perfil**: sim. No cadastro a pessoa escolhe os idiomas que **fala** e os que **quer praticar** (editáveis depois). Aparecem como bandeirinhas no cartão do avatar, no navegador (ao lado dos quartos ocupados) e na lista de amigos.
4. **Área comum**: sim. Existe uma **Sala de estar** da república, onde todos **aparecem ao fazer login**. Um botão **"Meu quarto"** leva ao próprio quarto. No navegador, a Sala de estar fica sempre no topo e os quartos **com gente aparecem primeiro**, com o número de pessoas.
5. **Amizade**: **pedido + aceite**, feito pelo cartão do avatar ("Adicionar amigo"). A lista de amigos mostra quem está **online** e **em qual quarto**, com botão **"Ir até"**.
6. **Quem está em call é visível**: ícone de **fone de ouvido** sobre os avatares em call, **indicador de fala** (avatar "pulsa" quando a pessoa fala). Ao clicar em alguém em call, o botão do cartão vira **"Pedir para participar"**.

### Casos especiais
- A e B pedem call um ao outro ao mesmo tempo → vira **uma única call**.
- A pede call a B, mas B já está em call → vira automaticamente **pedido de participação**.
- Alguém sai do quarto ou cai a conexão → **sai da call**; se sobrar só 1 pessoa, a call acaba.
- Mesma conta aberta em duas abas → a **aba nova assume**; a antiga mostra "Você entrou em outro lugar".
- Microfone negado pelo navegador → **aviso com instrução** de como liberar; a call não começa.
- Dois avatares no mesmo ponto do piso → **não é permitido parar** onde já há alguém; passar por cima é permitido.
