<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateLevelsCourseIdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $course = DB::table('courses')->where('name', 'Littérature Musicale')->first();
        if ($course) {
            DB::table('levels')->update(['course_id' => $course->id]);
        }
    }
}
