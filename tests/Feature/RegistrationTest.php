<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Ana',
            'password' => 'segredo',
            'password_confirmation' => 'segredo',
            'look' => config('republica.default_look'),
            'speaks' => ['pt'],
            'practices' => ['en'],
        ], $overrides);
    }

    public function test_registration_creates_resident_with_private_room_and_logs_in(): void
    {
        $response = $this->post('/cadastro', $this->payload());

        $response->assertRedirect('/hotel');
        $user = User::where('name_key', 'ana')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('Ana', $user->name);
        $this->assertSame('private', $user->room->kind->value);
        $this->assertSame(config('republica.private_layouts')[0], $user->room->layout);
    }

    public function test_registration_saves_hair_and_top_styles(): void
    {
        $look = array_merge(config('republica.default_look'), ['hair_style' => 'cacheado', 'top_style' => 'moletom']);

        $this->post('/cadastro', $this->payload(['look' => $look]))->assertRedirect('/hotel');

        $saved = User::where('name_key', 'ana')->firstOrFail()->look;
        $this->assertSame('cacheado', $saved['hair_style']);
        $this->assertSame('moletom', $saved['top_style']);
    }

    public function test_invalid_style_and_unknown_look_keys_are_rejected(): void
    {
        $look = array_merge(config('republica.default_look'), ['hair_style' => 'moicano']);
        $this->post('/cadastro', $this->payload(['look' => $look]))->assertSessionHasErrors('look.hair_style');

        $look = array_merge(config('republica.default_look'), ['hat' => 'coroa']);
        $this->post('/cadastro', $this->payload(['look' => $look]))->assertSessionHasErrors('look');
        $this->assertGuest();
    }

    public function test_name_is_unique_ignoring_case_and_spaces(): void
    {
        $this->post('/cadastro', $this->payload());
        $this->post('/sair');

        $this->post('/cadastro', $this->payload(['name' => '  ana ']))
            ->assertSessionHasErrors(['name_key' => 'Esse nome já tem dono.']);
        $this->assertSame(1, User::count());
    }

    public function test_language_outside_catalog_is_rejected(): void
    {
        $this->post('/cadastro', $this->payload(['speaks' => ['xx']]))->assertSessionHasErrors('speaks.0');
    }

    public function test_more_than_three_languages_is_rejected(): void
    {
        $this->post('/cadastro', $this->payload(['practices' => ['en', 'es', 'fr', 'de']]))
            ->assertSessionHasErrors(['practices' => 'No máximo 3 idiomas.']);
    }

    public function test_same_language_cannot_be_spoken_and_practiced(): void
    {
        $this->post('/cadastro', $this->payload(['speaks' => ['pt', 'en'], 'practices' => ['en']]))
            ->assertSessionHasErrors(['practices' => 'Escolha idiomas que você ainda quer praticar.']);
    }

    public function test_color_outside_palette_is_rejected(): void
    {
        $look = array_merge(config('republica.default_look'), ['shirt' => '#000000']);

        $this->post('/cadastro', $this->payload(['look' => $look]))->assertSessionHasErrors('look.shirt');
    }

    public function test_consecutive_registrations_rotate_layouts(): void
    {
        $this->post('/cadastro', $this->payload(['name' => 'ana']));
        $this->post('/sair');
        $this->post('/cadastro', $this->payload(['name' => 'bruno']));

        $layouts = User::with('room')->orderBy('id')->get()->pluck('room.layout')->all();
        $this->assertSame(array_slice(config('republica.private_layouts'), 0, 2), $layouts);
    }
}
