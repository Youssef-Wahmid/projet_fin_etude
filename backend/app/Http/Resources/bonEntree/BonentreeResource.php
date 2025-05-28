<?php

namespace App\Http\Resources\bonEntree;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BonentreeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    // public function toArray($request)
    // {
    //     return [
    //         'id' => $this->id,
    //         'user' => [
    //             'id' => $this->user->id,
    //             'name' => $this->user->name,
    //             'email' => $this->user->email,
    //         ],
    //         'fournisseur' => [
    //             'id' => $this->fournisseur->id,
    //             'nom' => $this->fournisseur->nom_f ,
    //             'tele' => $this->fournisseur->telephone_f ,
    //         ],
    //         'reference' => $this->reference,
    //         'dateEntree' => \Carbon\Carbon::parse($this->date_entree)->format('Y-m-d'),  
    //         'status' => $this->status,
    //         'prixTotal' => number_format($this->prix_total, 2, '.', ''),
    //     ];
    // }


    public function toArray($request)
{
    return [
        'id' => $this->id,
        'reference' => $this->reference,
        'dateEntree' => \Carbon\Carbon::parse($this->date_entree)->format('Y-m-d'),
        'status' => $this->status,
        'prixTotal' => number_format($this->prix_total, 2, '.', ''),
        
        'user' => [
            'id' => $this->user->id,
            'name' => $this->user->name,
            'email' => $this->user->email,
        ],
        
        'fournisseur' => [
            'id' => $this->fournisseur->id,
            'nom' => $this->fournisseur->nom_f,
            'telephone' => $this->fournisseur->telephone_f,
            'email' => $this->fournisseur->email_f ?? null, // Optionnel
        ],
        
        'produits' => $this->produits->map(function ($produit) {
            return [
                'id' => $produit->id,
                'reference' => $produit->ref,
                'nom' => $produit->nom,
                'description' => $produit->description,
                'quantite' => $produit->pivot->quantite,
                'prixAchat' => number_format($produit->pivot->prix_achat, 2, '.', ''),
                'sousTotal' => number_format($produit->pivot->quantite * $produit->pivot->prix_achat, 2, '.', ''),
                'notes' => $produit->pivot->notes,
            ];
        }),
    ];
}
}
