@extends('layouts.app', ['scripts' => ['resources/js/hotel.js']])

@section('title', 'República')
@section('body-class', 'hotel')

@section('content')
<canvas id="game"></canvas>
<p id="credits">Furniture and scenery: <a href="https://cryovex.itch.io/pixel-isometric-modern-interior" target="_blank" rel="noopener">Pixel Isometric Modern Interior</a> by Cryovex · Emotes: <a href="https://pigeonivy.itch.io/tiny-speech-indicators" target="_blank" rel="noopener">Tiny Speech Indicators</a> by Pigeon Ivy</p>

<section id="room-info" class="window">
    <div class="titlebar" id="room-title">…</div>
    <div class="content">
        <div id="room-people"></div>
    </div>
</section>

<section id="navigator" class="window hidden">
    <div class="titlebar">Navigator <button type="button" class="close" data-close="navigator" aria-label="Close">×</button></div>
    <div class="content"><ul id="room-list"></ul></div>
</section>

<section id="emote-picker" class="window hidden">
    <div class="titlebar">Emotes <button type="button" class="close" data-close="emote-picker" aria-label="Close">×</button></div>
    <div class="content picker-grid" id="emote-grid"></div>
</section>

<section id="dance-picker" class="window hidden">
    <div class="titlebar">Dance <button type="button" class="close" data-close="dance-picker" aria-label="Close">×</button></div>
    <div class="content picker-grid" id="dance-grid"></div>
    <p class="card-hint hidden" id="dance-hint">Stand up to dance</p>
</section>

<section id="avatar-card" class="window hidden">
    <div class="titlebar"><span id="card-name"></span> <button type="button" class="close" data-close="avatar-card" aria-label="Close">×</button></div>
    <div class="content card-body">
        <canvas id="card-avatar" width="70" height="90"></canvas>
        <dl>
            <dt>Speaks</dt><dd id="card-speaks"></dd>
            <dt>Practices</dt><dd id="card-practices"></dd>
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
        <button type="button" class="btn" id="btn-cancel-call">Cancel</button>
    </div>
</section>

<section id="call-panel" class="window hidden">
    <div class="titlebar">Call</div>
    <div class="content">
        <ul id="call-participants"></ul>
        <div class="actions">
            <button type="button" class="btn" id="btn-mute">Mute</button>
            <button type="button" class="btn btn-primary" id="btn-leave-call">Leave call</button>
        </div>
    </div>
</section>

<div id="mic-error" class="overlay hidden">
    <div class="window">
        <div class="titlebar">Microphone</div>
        <div class="content">
            <p id="mic-error-text"></p>
            <button type="button" class="btn btn-primary" id="btn-mic-ok">Got it</button>
        </div>
    </div>
</div>

<button type="button" id="audio-unlock" class="window hidden">🔈 Tap to hear the call</button>
<div id="call-toasts"></div>
<div id="voice-audio" hidden></div>

<div id="takeover" class="overlay hidden">
    <div class="window">
        <div class="titlebar">República</div>
        <div class="content">
            <p>You signed in somewhere else.</p>
            <button type="button" class="btn btn-primary" id="btn-use-here">Use here</button>
        </div>
    </div>
</div>

<nav id="toolbar">
    <button type="button" class="btn" id="btn-common" aria-label="Living room">🛋️ <span class="label">Living room</span></button>
    <button type="button" class="btn" id="btn-home" aria-label="My room">🏠 <span class="label">My room</span></button>
    <button type="button" class="btn" id="btn-nav" aria-label="Navigator">🧭 <span class="label">Navigator</span></button>
    <button type="button" class="btn" id="btn-emote" aria-label="Emotes">😊 <span class="label">Emotes</span></button>
    <button type="button" class="btn" id="btn-dance" aria-label="Dance">💃 <span class="label">Dance</span></button>
    <button type="button" class="btn mobile-only" id="btn-zoom" aria-label="Zoom">🔍</button>
    <span class="spacer"></span>
    <span id="status">connecting…</span>
    <button type="button" class="btn mobile-only" id="btn-more" aria-label="More options" aria-expanded="false">⋯</button>
    <div id="more-menu">
        <a class="btn" href="{{ route('profile.edit') }}" aria-label="Profile">👤 <span class="label">Profile</span></a>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button class="btn">Sign out</button>
        </form>
    </div>
</nav>

<script>
    window.REPUBLICA = @json($bootstrap);
</script>
@endsection
