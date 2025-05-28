<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categorie_id')->constrained('categories')->onDelete('cascade')->onUpdate('cascade');
            $table->string('ref', 50)->unique();
            $table->string('nom', 100);
            $table->text('description')->nullable();
            $table->decimal('prix_unitaire', 10, 2);
            $table->date('date_ajoute')->default(now());
            $table->string('image')->nullable();
             $table->enum('type_transaction', ['vendu', 'achete', 'both'])->default('vendu');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
