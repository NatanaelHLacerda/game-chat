<?php

namespace Tests\Feature;

use App\Actions\RegisterResident;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelTest extends TestCase
{
    use RefreshDatabase;

    private function resident(string $name = 'ana'): User
    {
        return app(RegisterResident::class)->handle([
            'name' => $name,
            'password' => 'password',
            'look' => config('republica.default_look'),
            'speaks' => ['pt'],
            'practices' => ['en'],
        ]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/hotel')->assertRedirect('/entrar');
        $this->get('/')->assertRedirect('/hotel');
    }

    public function test_resident_receives_bootstrap_with_common_room_first(): void
    {
        $user = $this->resident();

        $response = $this->actingAs($user)->get('/hotel');

        $response->assertOk();
        $bootstrap = $response->viewData('bootstrap');
        $this->assertSame(Room::commonRoom()->id, $bootstrap['common_room_id']);
        $this->assertSame($user->room->id, $bootstrap['my_room_id']);
        $this->assertSame('common', $bootstrap['rooms'][0]['kind']);
        $this->assertArrayHasKey('sala-de-estar', $bootstrap['layouts']);
        $response->assertSee('window.REPUBLICA', false);
    }

    public function test_bootstrap_includes_voice_settings(): void
    {
        $voice = $this->actingAs($this->resident())->get('/hotel')->viewData('bootstrap')['voice'];

        $this->assertSame(30, $voice['request_timeout']);
        $this->assertSame(60, $voice['retry_cooldown']);
        $this->assertSame(5, $voice['max_participants']);
        $this->assertStringStartsWith('stun:', $voice['ice_servers'][0]['urls']);
    }

    public function test_bootstrap_includes_pixel_art_theme_of_every_layout(): void
    {
        $layouts = $this->actingAs($this->resident())->get('/hotel')->viewData('bootstrap')['layouts'];

        $this->assertSame(array_keys(config('republica.layouts')), array_keys($layouts));
        foreach ($layouts as $key => $layout) {
            foreach (['floor', 'wall_left', 'wall_right'] as $part) {
                $this->assertNotEmpty($layout['theme'][$part] ?? null, "{$key} sem theme.{$part}");
            }
        }
    }

    public function test_rooms_endpoint_lists_common_room_first(): void
    {
        $user = $this->resident();
        $this->resident('bruno');

        $this->actingAs($user)->getJson('/quartos')
            ->assertOk()
            ->assertJsonCount(3)
            ->assertJsonPath('0.kind', 'common')
            ->assertJsonPath('0.name', 'Sala de estar')
            ->assertJsonPath('1.name', 'Quarto de ana');
    }

    public function test_rooms_endpoint_requires_authentication(): void
    {
        $this->getJson('/quartos')->assertUnauthorized();
    }
}
