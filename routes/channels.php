<?php

use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Todos os moradores online: alimenta a ocupação do navegador.
Broadcast::channel('republica', fn (User $user) => $user->toPresence());

// Quem está dentro de um quarto; posições e passos trafegam como whispers.
Broadcast::channel('quarto.{room}', fn (User $user, Room $room) => $user->toPresence());
