<?php

namespace App\Http\Resources\bonSortie;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BonsortieResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'dateSortie' => \Carbon\Carbon::parse($this->date_sortie)->format('Y-m-d'),
            'status' => $this->status,
            'prixTotal' => number_format($this->prix_total, 2, '.', ''),
            
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    // 'role' => $this->user->role ?? null,
                ];
            }),
            
            'client' => $this->whenLoaded('client', function () {
                return [
                    'id' => $this->client->id,
                    'nom' => $this->client->nom_clt,
                    'telephone' => $this->client->telephone_clt,
                    'email' => $this->client->email_clt ?? null,
                ];
            }),
            
            'produits' => $this->whenLoaded('produits', function () {
                return $this->produits->map(function ($produit) {
                    return [
                        'id' => $produit->id,
                        'reference' => $produit->ref,
                        'nom' => $produit->nom,
                        'description' => $produit->description,
                        'quantite' => (int)$produit->pivot->quantite,
                        'prixVente' => number_format($produit->pivot->prix_vente, 2, '.', ''),
                        'sousTotal' => number_format(
                            $produit->pivot->quantite * $produit->pivot->prix_vente, 
                            2, 
                            '.', 
                            ''
                        ),
                        'notes' => $produit->pivot->notes,
                        'stockActuel' => $produit->stock->quantite_disponible ?? null,
                    ];
                });
            }),
        ];
    }

}
