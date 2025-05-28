<?php

namespace App\Http\Resources\utilisateur;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    // public function toArray(Request $request): array
    // {
    //    return [
    //         'id' => $this->id,
    //         'name' => $this->name,
    //         'email' => $this->email, 
    //         'role' => $this->role, 
    //         'dateCreation' => $this->created_at,
    //     ];
    // }


    public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'role' => $this->role,
        'dateCreation' => $this->created_at,
        'bonentrees' => $this->bonentrees->map(function($bonentree) {
            return [
                'id' => $bonentree->id,
                'user_id' => $bonentree->user_id,
                'fournisseur_id' => $bonentree->fournisseur_id,
                'reference' => $bonentree->reference,
                'date_entree' => $bonentree->date_entree,
                'status' => $bonentree->status,
                'prix_total' => $bonentree->prix_total,
            ];
        }),
        'bonsorties' => $this->bonsorties->map(function($bonsortie) {
            return [
                'id' => $bonsortie->id,
                'user_id' => $bonsortie->user_id,
                'client_id' => $bonsortie->client_id,
                'reference' => $bonsortie->reference,
                'date_sortie' => $bonsortie->date_sortie,
                'status' => $bonsortie->status,
                'prix_total' => $bonsortie->prix_total,
                
            ];
        })
    ];
}
}
