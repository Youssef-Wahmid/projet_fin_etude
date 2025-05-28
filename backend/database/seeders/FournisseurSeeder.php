<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FournisseurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Empty the table first
        // DB::table('fournisseurs')->truncate();

     
        // Insert sample suppliers
        $fournisseurs = [];

        for ($i = 0; $i < 15; $i++) {
            $fournisseurs[] = [
                'nom_f' => fake()->company,
                'telephone_f' => fake()->phoneNumber,
                'email_f' => fake()->optional(0.8)->companyEmail, // 80% chance of having email
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        // Add some fixed suppliers
        $fixedFournisseurs = [
            [
                'nom_f' => 'TechnoImport',
                'telephone_f' => '0123456789',
                'email_f' => 'contact@technoimport.com',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_f' => 'MegaStock',
                'telephone_f' => '0987654321',
                'email_f' => 'info@megastock.com',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_f' => 'Fournitures Pro',
                'telephone_f' => '0567891234',
                'email_f' => null, // Explicitly no email
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('fournisseurs')->insert(array_merge($fournisseurs, $fixedFournisseurs));

    }
}
