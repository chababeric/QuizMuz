<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'institution_id' => 1,
                'name' => 'Formation Musicale et Auditive'
            ],
            [
                'institution_id' => 1,
                'name' => 'Histoire de la Musique'
            ],
            [
                'institution_id' => 1,
                'name' => 'Littérature Musicale'
            ],
        ];

        DB::table('courses')->insert($courses);
    }
}
