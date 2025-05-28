<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bonentree extends Model
{
    use HasFactory;
    protected $fillable = ['user_id','fournisseur_id','reference','date_entree','status','prix_total'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class, 'fournisseur_id');
    }



    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'bonentree_produit', 'bonentree_id', 'produit_id')
                    ->withPivot('quantite','prix_achat','notes')
                    ->withTimestamps();
    } 
}
