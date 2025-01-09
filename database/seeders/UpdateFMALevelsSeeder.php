<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateFMALevelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            [
                'name' => '201',
                'is_enabled' => true,
                'course_id' => 1,
                'institution_id' => 1
            ],
            [
                'name' => '202',
                'is_enabled' => true,
                'course_id' => 1,
                'institution_id' => 1
            ],
            [
                'name' => '203',
                'is_enabled' => true,
                'course_id' => 1,
                'institution_id' => 1
            ],
            [
                'name' => '204',
                'is_enabled' => true,
                'course_id' => 1,
                'institution_id' => 1
            ],
            [
                'name' => '301',
                'is_enabled' => true,
                'course_id' => 1,
                'institution_id' => 1
            ],
            [
                'name' => '302',
                'is_enabled' => true,
                'course_id' => 1,
                'institution_id' => 1
            ],
        ];

        DB::table('levels')->insert($levels);
    }
}
