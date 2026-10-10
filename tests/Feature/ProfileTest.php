<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_resident_updates_look_and_languages(): void
    {
        $user = User::factory()->create(['name' => 'Ana', 'name_key' => 'ana']);
        $look = ['skin' => '#5e3c28', 'hair' => '#e3b766', 'shirt' => '#5f8f86', 'pants' => '#c9a27e'];

        $this->actingAs($user)->put('/perfil', [
            'name' => 'Outro',
            'look' => $look,
            'speaks' => ['pt', 'es'],
            'practices' => ['ja'],
        ])->assertRedirect('/hotel');

        $user->refresh();
        $this->assertSame($look, $user->look);
        $this->assertSame(['pt', 'es'], $user->speaks);
        $this->assertSame(['ja'], $user->practices);
        $this->assertSame('Ana', $user->name);
    }

    public function test_invalid_profile_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->put('/perfil', [
            'look' => config('republica.default_look'),
            'speaks' => [],
            'practices' => ['en'],
        ])->assertSessionHasErrors('speaks');

        $this->assertSame(['pt'], $user->fresh()->speaks);
    }
}
