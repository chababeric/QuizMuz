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
            ['name' => '201'],
            ['name' => '202'],
            ['name' => '203'],
            ['name' => '204'],
        ];

        DB::table('levels')->insert($levels);
    }
}
