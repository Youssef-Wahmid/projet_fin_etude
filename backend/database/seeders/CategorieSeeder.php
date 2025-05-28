<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Empty the table first
        // DB::table('categories')->truncate();
        

        // Insert sample categories
        $categories = [
            [
                'nom_cat' => 'Électronique',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Vêtements',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Meubles',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Alimentation',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Fournitures de bureau',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Jardinage',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Sports',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Loisirs',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Automobile',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nom_cat' => 'Bricolage',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('categories')->insert($categories);

        $this->command->info('Categories table seeded!');
    }
}
