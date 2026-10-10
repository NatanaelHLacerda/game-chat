<?php

/*
|--------------------------------------------------------------------------
| Catálogo da República
|--------------------------------------------------------------------------
|
| Fonte única de paleta do avatar, idiomas e plantas dos quartos. O servidor
| valida contra este catálogo e a página do jogo o recebe em JSON. Plantas:
| "." é piso e "x" é vazio; cada linha é um y e cada caractere é um x.
| "theme" escolhe as texturas do pack de pixel art (nomes do manifesto em
| resources/js/republica/atlas.js); os hex ficam como paleta de apoio.
|
*/

return [

    'look_palette' => [
        'skin' => ['#ffe0c4', '#f3c79e', '#dba77a', '#b9805a', '#8a5a3c', '#5e3c28'],
        'hair' => ['#2e211b', '#6b4a3a', '#a8643f', '#e3b766', '#d9694a', '#f6ead8'],
        'shirt' => ['#e8735a', '#f4b393', '#9fbf9a', '#5f8f86', '#f2d16b', '#f6ead8'],
        'pants' => ['#6b4a3a', '#3e3431', '#5f8f86', '#c9a27e', '#8d5b4c', '#e8735a'],
    ],

    'default_look' => [
        'skin' => '#f3c79e',
        'hair' => '#6b4a3a',
        'shirt' => '#e8735a',
        'pants' => '#6b4a3a',
    ],

    'languages' => [
        'pt' => ['name' => 'Português', 'flag' => ['#009c3b', '#ffdf00']],
        'en' => ['name' => 'Inglês', 'flag' => ['#012169', '#ffffff', '#c8102e']],
        'es' => ['name' => 'Espanhol', 'flag' => ['#aa151b', '#f1bf00', '#aa151b']],
        'fr' => ['name' => 'Francês', 'flag' => ['#0055a4', '#ffffff', '#ef4135']],
        'de' => ['name' => 'Alemão', 'flag' => ['#000000', '#dd0000', '#ffce00']],
        'it' => ['name' => 'Italiano', 'flag' => ['#009246', '#ffffff', '#ce2b37']],
        'ja' => ['name' => 'Japonês', 'flag' => ['#ffffff', '#bc002d', '#ffffff']],
        'ko' => ['name' => 'Coreano', 'flag' => ['#ffffff', '#003478', '#c60c30']],
        'zh' => ['name' => 'Chinês', 'flag' => ['#de2910', '#ffde00', '#de2910']],
        'ru' => ['name' => 'Russo', 'flag' => ['#ffffff', '#0039a6', '#d52b1e']],
    ],

    'max_languages' => 3,

    'voice' => [
        'request_timeout' => 30,
        'retry_cooldown' => 60,
        'max_participants' => 5,
        'ice_servers' => array_values(array_filter([
            ['urls' => env('REPUBLICA_STUN_URL') ?: 'stun:stun.l.google.com:19302'],
            env('REPUBLICA_TURN_URL') ? [
                'urls' => env('REPUBLICA_TURN_URL'),
                'username' => env('REPUBLICA_TURN_USERNAME'),
                'credential' => env('REPUBLICA_TURN_CREDENTIAL'),
            ] : null,
        ])),
    ],

    'common_layout' => 'sala-de-estar',

    'private_layouts' => ['sala', 'jardim', 'por-do-sol', 'estudio'],

    'furniture_types' => [
        'sofa' => ['walkable' => true, 'seat' => true],
        'poltrona' => ['walkable' => true, 'seat' => true],
        'tapete' => ['walkable' => true, 'seat' => false],
        'mesa' => ['walkable' => false, 'seat' => false],
        'planta' => ['walkable' => false, 'seat' => false],
        'luminaria' => ['walkable' => false, 'seat' => false],
        'estante' => ['walkable' => false, 'seat' => false],
    ],

    'layouts' => [

        'sala' => [
            'name' => 'Sala',
            'tiles' => [
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '........xx',
                '........xx',
            ],
            'door' => [0, 4],
            'floor' => '#e9cfae',
            'wall_left' => '#f4b393',
            'wall_right' => '#e09a76',
            'theme' => ['floor' => 'bege', 'wall_left' => 'laranja', 'wall_right' => 'laranja'],
            'furniture' => [
                ['type' => 'sofa', 'x' => 3, 'y' => 0],
                ['type' => 'sofa', 'x' => 4, 'y' => 0],
                ['type' => 'sofa', 'x' => 5, 'y' => 0],
                ['type' => 'mesa', 'x' => 4, 'y' => 2],
                ['type' => 'tapete', 'x' => 4, 'y' => 4],
                ['type' => 'tapete', 'x' => 5, 'y' => 4],
                ['type' => 'planta', 'x' => 0, 'y' => 0],
                ['type' => 'luminaria', 'x' => 9, 'y' => 0],
                ['type' => 'estante', 'x' => 0, 'y' => 8],
            ],
        ],

        'jardim' => [
            'name' => 'Jardim',
            'tiles' => [
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '......xxxx',
                '......xxxx',
            ],
            'door' => [0, 3],
            'floor' => '#cfd9bf',
            'wall_left' => '#c6dcc0',
            'wall_right' => '#9fbf9a',
            'theme' => ['floor' => 'cinza', 'wall_left' => 'listrado', 'wall_right' => 'verde'],
            'furniture' => [
                ['type' => 'planta', 'x' => 0, 'y' => 0],
                ['type' => 'planta', 'x' => 1, 'y' => 0],
                ['type' => 'planta', 'x' => 9, 'y' => 0],
                ['type' => 'planta', 'x' => 0, 'y' => 9],
                ['type' => 'poltrona', 'x' => 3, 'y' => 2],
                ['type' => 'mesa', 'x' => 4, 'y' => 2],
                ['type' => 'poltrona', 'x' => 5, 'y' => 2],
                ['type' => 'tapete', 'x' => 4, 'y' => 5],
                ['type' => 'tapete', 'x' => 5, 'y' => 5],
                ['type' => 'luminaria', 'x' => 9, 'y' => 5],
            ],
        ],

        'por-do-sol' => [
            'name' => 'Pôr do sol',
            'tiles' => [
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '.........x',
                '.........x',
                '.........x',
                '.........x',
                '.........x',
            ],
            'door' => [0, 6],
            'floor' => '#f2d6c2',
            'wall_left' => '#f2a07b',
            'wall_right' => '#e8735a',
            'theme' => ['floor' => 'bege', 'wall_left' => 'laranja', 'wall_right' => 'terracota'],
            'furniture' => [
                ['type' => 'sofa', 'x' => 2, 'y' => 0],
                ['type' => 'sofa', 'x' => 3, 'y' => 0],
                ['type' => 'poltrona', 'x' => 1, 'y' => 2],
                ['type' => 'mesa', 'x' => 2, 'y' => 2],
                ['type' => 'luminaria', 'x' => 0, 'y' => 0],
                ['type' => 'planta', 'x' => 8, 'y' => 0],
                ['type' => 'tapete', 'x' => 5, 'y' => 4],
                ['type' => 'tapete', 'x' => 6, 'y' => 4],
                ['type' => 'estante', 'x' => 0, 'y' => 9],
            ],
        ],

        'estudio' => [
            'name' => 'Estúdio',
            'tiles' => [
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '..........',
                '.......xxx',
                '.......xxx',
                '.......xxx',
            ],
            'door' => [0, 5],
            'floor' => '#d8c1a0',
            'wall_left' => '#a9c9c0',
            'wall_right' => '#5f8f86',
            'theme' => ['floor' => 'madeira', 'wall_left' => 'painel', 'wall_right' => 'ardosia'],
            'furniture' => [
                ['type' => 'estante', 'x' => 1, 'y' => 0],
                ['type' => 'estante', 'x' => 2, 'y' => 0],
                ['type' => 'estante', 'x' => 3, 'y' => 0],
                ['type' => 'mesa', 'x' => 2, 'y' => 2],
                ['type' => 'poltrona', 'x' => 3, 'y' => 2],
                ['type' => 'luminaria', 'x' => 0, 'y' => 0],
                ['type' => 'planta', 'x' => 6, 'y' => 0],
                ['type' => 'tapete', 'x' => 5, 'y' => 5],
                ['type' => 'tapete', 'x' => 6, 'y' => 5],
                ['type' => 'poltrona', 'x' => 0, 'y' => 8],
            ],
        ],

        'sala-de-estar' => [
            'name' => 'Sala de estar',
            'tiles' => [
                '................',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................',
                '............xxxx',
                '............xxxx',
            ],
            'door' => [0, 6],
            'floor' => '#ead9bd',
            'wall_left' => '#f4b393',
            'wall_right' => '#9fbf9a',
            'theme' => ['floor' => 'bege', 'wall_left' => 'laranja', 'wall_right' => 'verde'],
            'furniture' => [
                ['type' => 'sofa', 'x' => 4, 'y' => 0],
                ['type' => 'sofa', 'x' => 5, 'y' => 0],
                ['type' => 'sofa', 'x' => 6, 'y' => 0],
                ['type' => 'mesa', 'x' => 5, 'y' => 2],
                ['type' => 'sofa', 'x' => 10, 'y' => 0],
                ['type' => 'sofa', 'x' => 11, 'y' => 0],
                ['type' => 'sofa', 'x' => 12, 'y' => 0],
                ['type' => 'mesa', 'x' => 11, 'y' => 2],
                ['type' => 'poltrona', 'x' => 10, 'y' => 3],
                ['type' => 'poltrona', 'x' => 12, 'y' => 3],
                ['type' => 'tapete', 'x' => 7, 'y' => 7],
                ['type' => 'tapete', 'x' => 8, 'y' => 7],
                ['type' => 'tapete', 'x' => 7, 'y' => 8],
                ['type' => 'tapete', 'x' => 8, 'y' => 8],
                ['type' => 'poltrona', 'x' => 6, 'y' => 9],
                ['type' => 'poltrona', 'x' => 9, 'y' => 9],
                ['type' => 'planta', 'x' => 0, 'y' => 0],
                ['type' => 'planta', 'x' => 15, 'y' => 0],
                ['type' => 'luminaria', 'x' => 8, 'y' => 0],
                ['type' => 'estante', 'x' => 0, 'y' => 10],
            ],
        ],

    ],

];
