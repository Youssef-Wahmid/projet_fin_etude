<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_clt',
        'telephone_clt',
        'email_clt',
    ];


    public function bonsorties()
    {
        return $this->hasMany(Bonsortie::class, 'client_id');
    }

    


    
}

