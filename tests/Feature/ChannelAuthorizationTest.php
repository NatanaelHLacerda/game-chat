<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Tests\TestCase;

class ChannelAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Os testes usam o broadcaster "null"; aqui precisamos de um que assine a autorização.
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'test-key',
            'broadcasting.connections.reverb.secret' => 'test-secret',
            'broadcasting.connections.reverb.app_id' => 'test-app',
        ]);
        Broadcast::forgetDrivers();
        require base_path('routes/channels.php');
    }

    private function authorize(string $channel)
    {
        return $this->post('/broadcasting/auth', ['socket_id' => '1234.5678', 'channel_name' => $channel]);
    }

    public function test_resident_joins_room_channel_with_public_data_only(): void
    {
        $user = User::factory()->create();
        $room = Room::commonRoom();

        $response = $this->actingAs($user)->authorize("presence-quarto.{$room->id}");

        $response->assertOk();
        $data = json_decode($response->json('channel_data'), true);
        $this->assertSame((string) $user->id, (string) $data['user_id']);
        $this->assertSame(['id', 'name', 'look', 'speaks', 'practices'], array_keys($data['user_info']));
    }

    public function test_unknown_room_is_rejected(): void
    {
        $user = User::factory()->create();

        $status = $this->actingAs($user)->authorize('presence-quarto.999')->status();

        $this->assertContains($status, [403, 404]);
    }

    public function test_guest_cannot_join(): void
    {
        $this->authorize('presence-quarto.'.Room::commonRoom()->id)->assertForbidden();
    }

    public function test_resident_joins_republic_channel(): void
    {
        $this->actingAs(User::factory()->create())->authorize('presence-republica')->assertOk();
    }
}
