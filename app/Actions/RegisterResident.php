<?php

namespace App\Actions;

use App\Enums\RoomKind;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RegisterResident
{
    /**
     * Cria o morador e o seu quarto na mesma transação.
     *
     * @param  array<string, mixed>  $data
     */
    public function handle(array $data): User
    {
        try {
            $user = DB::transaction(function () use ($data) {
                $user = User::create([
                    'name' => User::normalizeName($data['name']),
                    'name_key' => User::nameKey($data['name']),
                    'password' => $data['password'],
                    'look' => $data['look'],
                    'speaks' => array_values(array_unique($data['speaks'])),
                    'practices' => array_values(array_unique($data['practices'])),
                ]);

                $user->room()->create([
                    'kind' => RoomKind::Private,
                    'layout' => Room::nextPrivateLayout(),
                ]);

                return $user;
            });
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['name' => 'Esse nome já tem dono.']);
        }

        Log::info('resident.registered', ['user_id' => $user->id, 'layout' => $user->room->layout]);

        return $user;
    }
}
