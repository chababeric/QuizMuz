<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminKeySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $key = Hash::make('VpSw@d8&83e3');

        $hashed_key = [
            'hashed_key' => $key
        ];

        DB::table('admin_keys')->insert($hashed_key);
    }
}
