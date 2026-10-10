<?php

namespace Database\Seeders;

use App\Actions\RegisterResident;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(RegisterResident $register): void
    {
        $register->handle([
            'name' => 'ana',
            'password' => 'password',
            'look' => config('republica.default_look'),
            'speaks' => ['pt'],
            'practices' => ['en', 'es'],
        ]);

        $register->handle([
            'name' => 'bruno',
            'password' => 'password',
            'look' => ['skin' => '#b9805a', 'hair' => '#2e211b', 'shirt' => '#9fbf9a', 'pants' => '#3e3431'],
            'speaks' => ['pt', 'en'],
            'practices' => ['fr'],
        ]);
    }
}
