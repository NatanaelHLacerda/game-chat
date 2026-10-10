@extends('layouts.app', ['scripts' => ['resources/js/profile-form.js']])

@section('title', 'Profile · República')
@section('body-class', 'lobby')

@section('content')
<main class="window auth wide">
    <div class="titlebar">{{ $user->name }}'s profile</div>
    <form method="POST" action="{{ route('profile.update') }}" class="content profile-form">
        @csrf
        @method('PUT')
        <canvas id="preview" width="140" height="170"></canvas>
        <div class="form">
            @include('partials.look-picker', ['look' => $user->fullLook()])
            @include('partials.language-picker', ['selected' => ['speaks' => $user->speaks, 'practices' => $user->practices]])

            @if ($errors->any()) <p class="error">{{ $errors->first() }}</p> @endif
            <div class="actions">
                <a class="btn" href="{{ route('hotel') }}">Back</a>
                <button class="btn btn-primary">Save</button>
            </div>
        </div>
    </form>
</main>
@endsection
