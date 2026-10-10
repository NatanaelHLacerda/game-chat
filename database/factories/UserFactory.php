<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::limit(fake()->unique()->userName(), 16, '');

        return [
            'name' => $name,
            'name_key' => User::nameKey($name),
            'password' => static::$password ??= Hash::make('password'),
            'look' => config('republica.default_look'),
            'speaks' => ['pt'],
            'practices' => ['en'],
            'remember_token' => Str::random(10),
        ];
    }
}
