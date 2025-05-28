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
        Schema::create('bonentree_produit', function (Blueprint $table) { 
            $table->id();
            $table->foreignId('bonentree_id')->constrained('bonentrees')->onDelete('cascade');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade'); 
            $table->integer('quantite');
            $table->decimal('prix_achat', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bonentree_produit');
    }
};
