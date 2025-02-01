<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            ['name' => '201', 'institution_id' => 1],
            ['name' => '202', 'institution_id' => 1],
            ['name' => '203', 'institution_id' => 1],
            ['name' => '204', 'institution_id' => 1],
        ];

        DB::table('levels')->insert($levels);
    }
}
