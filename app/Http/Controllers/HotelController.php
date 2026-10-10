<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\View\View;

class HotelController extends Controller
{
    public function show(Request $request): View
    {
        $user = $request->user();
        $rooms = RoomController::navigatorRooms();

        return view('hotel', [
            'bootstrap' => [
                'me' => $user->toPresence(),
                'common_room_id' => Room::commonRoom()->id,
                'my_room_id' => $user->room->id,
                'rooms' => $rooms,
                'layouts' => config('republica.layouts'),
                'furniture_types' => config('republica.furniture_types'),
                'languages' => config('republica.languages'),
                'voice' => config('republica.voice'),
            ],
        ]);
    }
}
