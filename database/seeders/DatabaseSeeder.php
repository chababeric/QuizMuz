<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Insert the Levels in the database
        $this->call([
//            LevelSeeder::class,
//            PiecesSeeder::class,
//            InstitutionSeeder::class,
//            AdminKeySeeder::class,
            CourseSeeder::class
        ]);
    }
}
