<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('1234'),
            'role' => 'admin'
        ]);

        // Magasinier user
        User::create([
            'name' => 'Magasinier User',
            'email' => 'magasinier@example.com',
            'password' => Hash::make('1234'),
            'role' => 'magasinier'
        ]);

    }
}
