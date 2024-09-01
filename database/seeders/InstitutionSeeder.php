<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstitutionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $institutions = [
            ['name' => 'Conservatoire de Musique de Montréal'],
            ['name' => 'Conservatoire de Musique de Gatineau'],
            ['name' => 'Conservatoire de Musique de Québec'],
            ['name' => 'Conservatoire de Musique de Trois-Rivières'],
            ['name' => 'Conservatoire de Musique de Saguenay'],
            ['name' => 'Conservatoire de Musique de Rimouski'],
            ['name' => 'Conservatoire de Musique de Val-d\'Or'],
        ];

        DB::table('institutions')->insert($institutions);
    }
}
