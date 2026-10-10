@extends('layouts.app', ['scripts' => ['resources/js/hotel.js']])

@section('title', 'República')
@section('body-class', 'hotel')

@section('content')
<canvas id="game"></canvas>
<p id="credits">Móveis e cenário: <a href="https://cryovex.itch.io/pixel-isometric-modern-interior" target="_blank" rel="noopener">Pixel Isometric Modern Interior</a>, por Cryovex</p>

<section id="room-info" class="window">
    <div class="titlebar" id="room-title">…</div>
    <div class="content">
        <div id="room-people"></div>
    </div>
</section>

<section id="navigator" class="window hidden">
    <div class="titlebar">Navegador <button type="button" class="close" data-close="navigator" aria-label="Fechar">×</button></div>
    <div class="content"><ul id="room-list"></ul></div>
</section>

<section id="avatar-card" class="window hidden">
    <div class="titlebar"><span id="card-name"></span> <button type="button" class="close" data-close="avatar-card" aria-label="Fechar">×</button></div>
    <div class="content card-body">
        <canvas id="card-avatar" width="70" height="90"></canvas>
        <dl>
            <dt>Fala</dt><dd id="card-speaks"></dd>
            <dt>Pratica</dt><dd id="card-practices"></dd>
        </dl>
    </div>
    <div class="card-actions">
        <button type="button" class="btn btn-primary hidden" id="card-action"></button>
        <p class="card-hint hidden" id="card-hint"></p>
    </div>
</section>

@if (session('status'))
    <div id="toast" class="window toast">{{ session('status') }}</div>
@endif

<div id="call-prompts"></div>

<section id="call-outgoing" class="window hidden">
    <div class="content">
        <p id="call-outgoing-text"></p>
        <button type="button" class="btn" id="btn-cancel-call">Cancelar</button>
    </div>
</section>

<section id="call-panel" class="window hidden">
    <div class="titlebar">Conversa</div>
    <div class="content">
        <ul id="call-participants"></ul>
        <div class="actions">
            <button type="button" class="btn" id="btn-mute">Silenciar</button>
            <button type="button" class="btn btn-primary" id="btn-leave-call">Sair da conversa</button>
        </div>
    </div>
</section>

<div id="mic-error" class="overlay hidden">
    <div class="window">
        <div class="titlebar">Microfone</div>
        <div class="content">
            <p id="mic-error-text"></p>
            <button type="button" class="btn btn-primary" id="btn-mic-ok">Entendi</button>
        </div>
    </div>
</div>

<div id="call-toasts"></div>
<div id="voice-audio" hidden></div>

<div id="takeover" class="overlay hidden">
    <div class="window">
        <div class="titlebar">República</div>
        <div class="content">
            <p>Você entrou em outro lugar.</p>
            <button type="button" class="btn btn-primary" id="btn-use-here">Usar aqui</button>
        </div>
    </div>
</div>

<div id="desktop-only" class="overlay">
    <div class="window">
        <div class="titlebar">República</div>
        <div class="content"><p>A República funciona no computador.</p></div>
    </div>
</div>

<nav id="toolbar">
    <button type="button" class="btn" id="btn-common">🛋️ Sala de estar</button>
    <button type="button" class="btn" id="btn-home">🏠 Meu quarto</button>
    <button type="button" class="btn" id="btn-nav">🧭 Navegador</button>
    <a class="btn" href="{{ route('profile.edit') }}">👤 Perfil</a>
    <span class="spacer"></span>
    <span id="status">conectando…</span>
    <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button class="btn">Sair</button>
    </form>
</nav>

<script>
    window.REPUBLICA = @json($bootstrap);
</script>
@endsection
