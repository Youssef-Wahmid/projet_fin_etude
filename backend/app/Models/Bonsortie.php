<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bonsortie extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'client_id', 'reference', 'date_sortie', 'status', 'prix_total'];


    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }



    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'bonsortie_produit', 'bonsortie_id', 'produit_id')
                    ->withPivot('quantite', 'prix_vente', 'notes')
                    ->withTimestamps();
    }
}
