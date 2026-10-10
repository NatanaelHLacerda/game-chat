# SPDD Analysis: República — jogo de quartos isométricos com conversa por voz para prática de idiomas

## Original Business Requirement

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

---

## Domain Concept Identification

> Contexto do código: projeto Laravel 13 (PHP ^8.3) recém-criado, sem código de domínio. Já existem o esqueleto padrão de usuários (tabela `users` baseada em e-mail, modelo `User`), sessões/cache/filas em banco, e a infraestrutura de tempo real instalada mas não usada: Laravel Reverb no servidor, `laravel-echo` + `pusher-js` no cliente (`resources/js/echo.js`) e um único canal privado `App.Models.User.{id}` em `routes/channels.php`. Reverb já aceita eventos de cliente (whispers) de membros de canais. Banco local é SQLite. Front-end é Blade + Vite (Tailwind no pipeline), sem framework SPA. Toda a área de domínio é greenfield.

#### Existing Concepts (from codebase)
- **User (usuário)**: conta autenticável do Laravel — hoje identificada por e-mail único, sem nenhum dado de jogo. Será a base do *Morador*, mas o modelo atual não atende ao requisito (login é por nome, não por e-mail).
- **Sessão autenticada**: sessões em banco (`SESSION_DRIVER=database`) — base para manter o morador logado e para autorizar canais de tempo real.
- **Canal privado do usuário** (`App.Models.User.{id}`): canal pessoal já autorizado — candidato natural para entregar notificações individuais (pedido de amizade, mensagem recebida).
- **Infraestrutura de broadcasting (Reverb + Echo)**: instalada e configurada para aceitar eventos de cliente; nenhuma regra de domínio ainda.

#### New Concepts Required
- **Morador**: a pessoa que mora na república. Evolução do *User* — identificado por **nome único** + senha, com uma **aparência de avatar**. Dono de exatamente um Quarto.
- **Aparência do avatar**: escolha visual feita no cadastro (cores/partes de um avatar retrô). Pertence ao Morador; é exibida a todos que o veem em um quarto.
- **Quarto**: espaço isométrico pertencente a um Morador, criado automaticamente no cadastro, nunca editado. Pode ser visitado por qualquer morador.
- **Planta do quarto (layout)**: modelo fixo e pré-definido de quarto (formato do piso, móveis, cores pastel). Um catálogo pequeno e imutável; cada Quarto aponta para uma planta. Não é editável por usuários.
- **Navegador**: visão de todos os quartos da república, permitindo escolher em qual entrar. Implica saber quem está em cada quarto naquele momento.
- **Presença no quarto**: o fato efêmero de um morador estar dentro de um quarto agora, com sua posição e movimento. Existe apenas enquanto a pessoa está conectada — não é histórico.
- **Conversa de voz (call)**: grupo efêmero de áudio formado dentro de um quarto, começando com 2 pessoas e podendo crescer. Existe enquanto houver ao menos 2 participantes.
- **Pedido de conversa**: solicitação de uma pessoa a outra (no mesmo quarto) para iniciar uma call; aceita ou recusada pela destinatária.
- **Pedido de participação**: solicitação de uma pessoa para entrar numa call já existente; aprovada por qualquer participante (vale a primeira resposta).
- **Amizade**: vínculo persistente entre dois moradores, pré-requisito para trocar mensagens.
- **Mensagem**: texto enviado de um morador a um amigo; persistente (para ser lido depois).
- **Idiomas do morador**: idiomas que a pessoa fala e os que quer praticar; escolhidos no cadastro, editáveis, exibidos no cartão do avatar, no navegador e na lista de amigos.
- **Sala de estar**: área comum da república, sem dono, ponto de entrada de todos após o login; sempre no topo do navegador.
- **Cartão do avatar**: visão de um morador ao clicar nele (nome, idiomas) e ponto de partida das ações sociais: conversar, pedir para participar, adicionar amigo.
- **Pedido de amizade**: solicitação pendente de um morador a outro, aceita ou recusada; ao aceitar vira Amizade.
- **Mensagens não lidas**: estado de leitura das mensagens recebidas, que alimenta o contador de não lidas.

#### Key Business Rules
- **Nome único**: dois moradores não podem ter o mesmo nome (deve valer sem distinção de maiúsculas/minúsculas para evitar "Ana" e "ana"). — Morador
- **Um quarto por morador, criado junto com a conta**: cadastro e criação do quarto são uma única operação; nunca deve existir morador sem quarto nem quarto sem dono. — Morador, Quarto
- **Quartos imutáveis**: nenhuma ação de usuário altera planta, móveis ou aparência do quarto. — Quarto, Planta
- **Quartos abertos**: qualquer morador pode entrar em qualquer quarto, inclusive com o dono ausente *(implícito)*. — Quarto, Presença
- **Entrada pela Sala de estar**: todo login começa na Sala de estar; "Meu quarto" leva ao próprio quarto. — Sala de estar, Presença
- **Ordem do navegador**: Sala de estar no topo; depois quartos ocupados primeiro, com contagem de pessoas. — Navegador
- **Um lugar por vez**: um morador está em no máximo um quarto por vez; ao abrir o jogo em outra aba, a nova assume e a antiga é desconectada com aviso. — Presença
- **Sem parar no mesmo ponto**: um avatar não pode terminar o movimento num ponto do piso ocupado; atravessar é permitido. — Presença
- **Sem chat de texto nos quartos**: a comunicação dentro do quarto é exclusivamente por voz. — Quarto, Conversa de voz
- **Call só no mesmo quarto**: pedido de conversa e pedido de participação só são possíveis entre pessoas presentes no mesmo quarto. — Pedido de conversa, Pedido de participação, Presença
- **Consentimento para áudio**: ninguém entra em call sem aprovação explícita — da destinatária no pedido inicial; de **qualquer participante** (primeira resposta vale) no pedido de participação. — Conversa de voz
- **Limites dos pedidos**: pedido expira em 30 s sem resposta; após recusa, novo pedido da mesma pessoa só depois de 1 min; máximo de 5 pessoas por call. — Pedido de conversa, Pedido de participação
- **Pedidos cruzados viram uma call**; pedido a quem já está em call vira pedido de participação. — Conversa de voz
- **Call visível**: quem está em call é sinalizado a todos do quarto (fone de ouvido + indicador de fala). — Conversa de voz, Presença
- **Uma call por vez**: um morador participa de no máximo uma conversa de voz simultaneamente. — Conversa de voz
- **Sair do quarto encerra a participação**: ao sair do quarto ou desconectar, a pessoa sai da call; uma call com menos de 2 pessoas deixa de existir. — Conversa de voz, Presença
- **Mensagens só entre amigos**: só é possível enviar mensagem a quem é amigo. — Amizade, Mensagem
- **Amizade é mútua e exige aceite**: nasce de um pedido aceito; se A é amigo de B, B é amigo de A. — Amizade, Pedido de amizade
- **Mensagens persistem**: mensagens são guardadas e entregues ao amigo quando ele entrar, com contador de não lidas. — Mensagem
- **Amigos localizáveis**: a lista de amigos mostra quem está online e em qual quarto, com "Ir até". — Amizade, Presença
- **Escopo fechado**: sem loja, moedas, decoração, minigames ou qualquer item fora da lista. — todos

---

## Strategic Approach

#### Solution Direction
- **Monólito Laravel** com duas camadas bem separadas:
  - **Estado persistente** (moradores, quartos, amizades, mensagens) em banco via Eloquent, seguindo as convenções padrão do Laravel (modelos, migrations, controllers, validação por Form Request ou `validate`).
  - **Estado efêmero em tempo real** (quem está em cada quarto, posição/movimento, calls e seus pedidos) **sem banco**, vivendo nos canais de presença do Reverb e nos clientes conectados.
- **Fluxo de dados**:
  - Cadastro/login: formulário Blade → controller → cria Morador + Quarto atomicamente → sessão.
  - Jogo: página Blade única entrega o estado inicial (eu, lista de quartos) → cliente JS (Canvas, empacotado por Vite) desenha o quarto isométrico → entra no **canal de presença do quarto** (autorizado em `routes/channels.php`) → movimento e sinalização de voz trafegam como **eventos de cliente (whispers)** entre os presentes.
  - Voz: **WebRTC ponto a ponto** entre navegadores; o Reverb serve apenas para a sinalização (pedido, aceite, troca de oferta/resposta/candidatos).
  - Amigos e mensagens: ações via HTTP → persistência → **evento transmitido no canal privado do destinatário** (`App.Models.User.{id}`, já existente) para entrega instantânea quando online.
- **Entrega em incrementos** (cada um vira uma especificação REASONS própria):
  1. Moradores, quartos, navegador e andar pelo quarto (base visual + presença).
  2. Conversa de voz (pedidos, aceite, participação, áudio).
  3. Amigos e mensagens (e idiomas, se confirmado).

#### Key Design Decisions
- **Identidade por nome em vez de e-mail**: adaptar o esqueleto de usuários (que hoje exige e-mail) vs. manter e-mail opcional. Sem dados em produção, ajustar o esquema base é barato; manter e-mail adiciona campo inútil e fluxos de verificação. → **Recomendado: morador identificado por nome único + senha, sem e-mail**; consequência aceita: sem recuperação de senha por e-mail (amigos resolvem entre si/admin).
- **Autoridade do movimento**: servidor calcula e valida cada passo (game loop) vs. cliente decide e anuncia aos demais. PHP/Laravel não é adequado para laço de jogo contínuo; o público é um grupo de amigos (baixa necessidade anti-trapaça). → **Recomendado: movimento decidido no cliente e propagado por whispers no canal de presença do quarto**; o servidor só autoriza quem pode entrar no canal.
- **Plantas dos quartos**: armazenar plantas no banco vs. catálogo fixo no código. Como são imutáveis e poucas, banco só adiciona administração. → **Recomendado: catálogo fixo versionado no código; o Quarto guarda apenas qual planta usa**, atribuída de forma rotativa para dar variedade à república.
- **Topologia de áudio**: malha P2P (cada um conecta a cada um) vs. servidor de mídia (SFU, ex.: LiveKit). Malha é gratuita e simples para 2–5 pessoas; degrada acima disso. → **Recomendado: malha P2P WebRTC**, com limite prático de participantes por call.
- **Canal de sinalização da voz**: whispers no canal de presença do quarto vs. requisições HTTP com o servidor retransmitindo para canais privados. Whispers não tocam o PHP e já respeitam "mesmo quarto"; a desvantagem é que mensagens de sinalização chegam a todos do quarto (filtradas no cliente). → **Recomendado: whispers no canal do quarto**, aceitável para grupo de amigos.
- **Ocupação no navegador**: registrar no banco quem está em qual quarto vs. derivar da presença em tempo real. Banco fica inconsistente quando alguém fecha o navegador. → **Recomendado: presença em tempo real** (canal de presença global da república), sem persistência.
- **Avatares**: sprites desenhados (assets) vs. desenho procedural em Canvas a partir das cores escolhidas. → **Recomendado: procedural**, sem pipeline de arte, coerente com o visual retrô e a paleta pastel.
- **Front-end do jogo**: JavaScript puro + Canvas via Vite vs. Livewire/Inertia/SPA. O jogo é uma única tela de canvas; frameworks de componentes não ajudam no desenho isométrico. → **Recomendado: JS modular puro empacotado pelo Vite**; Blade para cadastro/login.

#### Alternatives Considered
- **Servidor Node.js/Socket.io para o tempo real**: rejeitado — viola a restrição "projeto em PHP com Laravel" e exigiria segundo serviço no deploy; o Reverb cumpre o papel dentro do ecossistema Laravel Cloud.
- **Livewire para o jogo**: rejeitado — idas e voltas ao servidor a cada interação não servem para animação de movimento a 60 fps.
- **Laço de jogo autoritativo no servidor**: rejeitado — complexidade e custo desproporcionais para um grupo de amigos.
- **SFU/servidor de mídia (LiveKit, Janus)**: rejeitado por ora — infraestrutura e custo adicionais; reavaliar se calls passarem de ~5 pessoas.
- **Balões de chat de texto nos quartos**: rejeitado pelo próprio requisito (comunicação no quarto é só voz).

---

## Risk & Gap Analysis

#### Requirement Ambiguities
As seis perguntas em aberto da semente foram respondidas (seção "Decisões" da semente). Restam:
- **Personalização do avatar**: quais partes/cores podem ser escolhidas e se dá para mudar depois do cadastro.
- **Lista de idiomas**: quais idiomas são oferecidos (lista fechada curta vs. lista ampla) e quantos a pessoa pode marcar.
- **Planta e capacidade da Sala de estar**: tamanho maior que os quartos, pois concentra todos ao entrar.
- **Comportamento em celular**: bloquear com aviso ou deixar entrar sem garantia.

#### Edge Cases
- **Pedidos cruzados** (decidido: viram uma única call): a detecção precisa funcionar mesmo com as mensagens chegando em ordens diferentes em cada navegador.
- **Destinatário já em call** (decidido: vira pedido de participação).
- **Dois participantes aprovam o mesmo pedido quase ao mesmo tempo**: a entrada deve ocorrer uma única vez.
- **Pedido de participação com a call já cheia (5)**: deve ser recusado automaticamente.
- **Destinatário sai do quarto com pedido pendente**: o pedido deve expirar/cancelar.
- **Desconexão no meio da call** (fechar aba, cair a rede, recarregar página): os demais devem perceber e a call deve se ajustar (encerrar se restar 1).
- **Mesma conta em duas abas/dispositivos** (decidido: a nova assume): exige detectar a sessão anterior e desconectá-la.
- **Microfone negado ou ausente**: a pessoa aceita uma call mas o navegador bloqueia o áudio.
- **Dois avatares no mesmo ponto do piso**: permitir sobreposição ou bloquear destino ocupado.
- **Novo morador cadastrado com outros online**: o navegador de quem já está no jogo deve passar a mostrar o novo quarto.
- **Nome com variação de caixa/espaços**: "Ana", "ana ", "ANA" devem colidir.
- **Pedido de amizade duplicado ou cruzado**: A pede a B enquanto B pede a A — deve virar amizade direta.
- **Sala de estar lotada**: muitos avatares no ponto de entrada; o ponto de chegada precisa variar para respeitar "não parar no mesmo ponto".
- **Mensagem para quem deixou de ser amigo** (se desfazer amizade existir).

#### Technical Risks
- **WebRTC atrás de NAT restritivo**: só com STUN público, parte das conexões (redes corporativas/4G) falha. → Começar com STUN; prever configuração de um servidor TURN (serviço gerenciado) se amigos relatarem falhas.
- **HTTPS obrigatório para microfone**: `getUserMedia` só funciona em contexto seguro. Localmente `localhost` é aceito; no Laravel Cloud há HTTPS. → Garantir que testes em rede local usem `localhost` ou túnel HTTPS.
- **Configuração do Reverb no Laravel Cloud**: exige o serviço de WebSockets gerenciado e variáveis de ambiente corretas; o `.env.example` atual vem com `BROADCAST_CONNECTION=log`. → Documentar as variáveis necessárias no deploy.
- **Limites de eventos de cliente**: whispers têm tamanho máximo (10 KB por padrão no Reverb) e geram muitas mensagens (movimento + candidatos ICE). Ofertas SDP cabem, mas o volume precisa ser contido (enviar destino do movimento, não cada passo).
- **Escala da malha P2P**: cada participante envia áudio para todos os outros; acima de ~5 pessoas o upload e a CPU degradam. → Limitar participantes por call.
- **Políticas de autoplay**: navegadores bloqueiam áudio sem gesto do usuário. → O áudio deve iniciar a partir de um clique (aceitar/entrar), não automaticamente.
- **Banco diferente entre local (SQLite) e produção (Laravel Cloud)**: usar apenas recursos portáveis do Eloquent/migrations; atenção à unicidade sem distinção de caixa, que varia por banco.
- **Mudança no esquema base de usuários**: trocar e-mail por nome afeta factory, seeder e testes padrão — precisam ser ajustados juntos.
- **Orientação do projeto (CLAUDE.md/AGENTS.md)**: o esqueleto recomenda instalar Laravel Boost antes de alterar a aplicação; ainda não está instalado. → Decidir se instala antes da geração de código.

#### Acceptance Criteria Coverage
A semente não traz critérios de aceite formais; os itens abaixo foram derivados diretamente das funcionalidades descritas.

| AC# | Description | Addressable? | Gaps/Notes |
|-----|-------------|--------------|------------|
| 1 | Cadastro com nome e senha | Yes | Requer adaptar o esquema de usuários (hoje por e-mail); sem recuperação de senha |
| 2 | Escolher aparência do avatar no cadastro | Yes | Opções de personalização a definir na especificação |
| 3 | Quarto criado automaticamente no cadastro | Yes | Operação atômica com a criação da conta |
| 4 | Exatamente 1 quarto por morador | Yes | Garantir unicidade no banco |
| 5 | Quartos não editáveis | Yes | Catálogo fixo de plantas; nenhuma ação de edição exposta |
| 6 | Visual isométrico estilo Habbo, paleta pastel laranja/verde (*Her*) | Yes | Desenho procedural em Canvas |
| 7 | Navegador: Sala de estar no topo, quartos ocupados primeiro com contagem | Yes | Ocupação via presença em tempo real |
| 8 | Login entra na Sala de estar; botão "Meu quarto" | Yes | Sala de estar é uma área sem dono |
| 9 | Andar pelo quarto e ver outros avatares; não parar em ponto ocupado | Yes | Movimento decidido no cliente; presença via Reverb |
| 10 | Mesma conta em outra aba: a nova assume | Yes | Detecção via presença do próprio usuário |
| 11 | Sem balões de chat de texto nos quartos | Yes | — |
| 12 | Pedir call a alguém no mesmo quarto; ao aceitar forma-se conversa de 2; pedidos cruzados viram uma call | Yes | Expiração 30 s, nova tentativa após 1 min |
| 13 | 3ª pessoa pede para participar; qualquer participante aprova; máximo 5 | Yes | Aprovação dupla simultânea deve ser idempotente |
| 14 | Quem está em call é visível (fone + indicador de fala) | Yes | Indicador de fala depende da análise do áudio no cliente |
| 15 | Sair do quarto/desconectar sai da call; call com 1 pessoa acaba | Yes | — |
| 16 | Microfone negado: aviso com instrução | Yes | — |
| 17 | Idiomas falados e praticados no perfil, visíveis no cartão, navegador e amigos | Yes | Lista de idiomas a definir |
| 18 | Amizade por pedido + aceite, via cartão do avatar | Yes | Pedidos cruzados viram amizade |
| 19 | Lista de amigos com online, quarto atual e "Ir até" | Yes | Localização vem da presença global |
| 20 | Mensagens a amigos, guardadas para offline, com contador de não lidas | Yes | Histórico simples, sem busca/anexos |
| 21 | Somente navegador de computador | Yes | Definir comportamento em celular |
| 22 | PHP/Laravel hospedado no Laravel Cloud | Yes | Requer Reverb gerenciado e HTTPS; TURN pode ser necessário |
| 23 | Sem complexidades extras | Yes | Escopo fechado nas decisões acima |
