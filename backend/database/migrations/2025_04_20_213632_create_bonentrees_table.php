<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use League\CommonMark\Reference\Reference;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bonentrees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); 
            $table->foreignId('fournisseur_id')->constrained('fournisseurs')->onDelete('cascade'); 
            $table->string('reference'); 
            $table->date('date_entree')->default(now());
            $table->enum('status', ['en_attente', 'partiel', 'recu', 'rejete'])->default('en_attente');
            $table->decimal('prix_total', 10, 2);
            $table->timestamps();
        });
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bonentrees');
    }
};
