<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;
    protected $fillable = ['categorie_id', 'ref', 'nom', 'description', 'prix_unitaire', 'date_ajoute', 'image', 'type_transaction'];

    public function stock(){
        return $this->hasOne(Stock::class, 'produit_id');
    }

    public function categorie()  {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }


    
    public function bonentrees()
    {
        return $this->belongsToMany(Bonentree::class, 'bonentree_produit', 'produit_id', 'bonentree_id')
                    ->withPivot('quantite', 'prix_achat','notes')
                    ->withTimestamps();
    }
    

    public function bonsorties()
    {
        return $this->belongsToMany(Bonsortie::class, 'bonsortie_produit', 'produit_id', 'bonsortie_id')
                    ->withPivot('quantite', 'prix_vente', 'notes')
                    ->withTimestamps();
    }
}


 
