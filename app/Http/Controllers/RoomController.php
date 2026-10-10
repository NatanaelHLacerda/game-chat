<?php

namespace App\Http\Controllers;

use App\Enums\RoomKind;
use App\Models\Room;
use Illuminate\Http\JsonResponse;

class RoomController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(self::navigatorRooms());
    }

    /**
     * Todos os quartos para o navegador: Sala de estar primeiro, depois por id.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function navigatorRooms(): array
    {
        return Room::with('owner')
            ->orderByRaw('case when kind = ? then 0 else 1 end', [RoomKind::Common->value])
            ->orderBy('id')
            ->get()
            ->map->toNavigator()
            ->all();
    }
}
