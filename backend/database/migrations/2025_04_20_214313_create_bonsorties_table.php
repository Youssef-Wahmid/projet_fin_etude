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
        Schema::create('bonsorties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients');
            $table->string('reference'); 
            $table->date('date_sortie')->default(now());
            $table->enum('status', [
                'en_attente',   // En attente de validation ou de traitement
                'valide',       // Confirmé par un responsable
                'livre',        // Produits sortis du stock
                'annule',       // Bon annule
            ])->default('en_attente');
            $table->decimal('prix_total', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bonsorties');
    }
};
