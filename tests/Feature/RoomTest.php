<?php

namespace Tests\Feature;

use App\Enums\RoomKind;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomTest extends TestCase
{
    use RefreshDatabase;

    public function test_migration_creates_single_common_room_without_owner(): void
    {
        $common = Room::where('kind', RoomKind::Common)->get();

        $this->assertCount(1, $common);
        $this->assertNull($common->first()->user_id);
        $this->assertSame(config('republica.common_layout'), $common->first()->layout);
        $this->assertSame('Sala de estar', $common->first()->displayName());
    }

    public function test_private_room_display_name_uses_owner(): void
    {
        $room = Room::factory()->for(User::factory()->state(['name' => 'Bruno', 'name_key' => 'bruno']), 'owner')->create();

        $this->assertSame('Quarto de Bruno', $room->displayName());
    }
}
