<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        DB::table('clients')->insert([
            [
                'nom_clt' => 'Jean Dupont',
                'telephone_clt' => '0612345678',
                'email_clt' => 'jean.dupont@example.com'
            ],
            [
                'nom_clt' => 'Marie Martin',
                'telephone_clt' => '0623456789',
                'email_clt' => 'marie.martin@example.com'
            ],
            [
                'nom_clt' => 'Pierre Durand',
                'telephone_clt' => '0634567890',
                'email_clt' => 'pierre.durand@example.com'
            ],
            [
                'nom_clt' => 'Sophie Lambert',
                'telephone_clt' => '0645678901',
                'email_clt' => 'sophie.lambert@example.com'
            ],
            [
                'nom_clt' => 'Thomas Moreau',
                'telephone_clt' => '0656789012',
                'email_clt' => 'thomas.moreau@example.com'
            ]
        ]);

    }
}
