<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;
    protected $fillable = [
        'nom_f',
        'telephone_f',
        'email_f',
    ];
      

    public function bonentrees()
    {
        return $this->hasMany(Bonentree::class, 'fournisseur_id');
    }
}
