<?php

namespace App\Http\Resources\produit;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ProduitResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    // public function toArray(Request $request): array
    // {


    //     return [
    //         'id' => $this->id,
    //         'categorie_id' => $this->categorie_id,
    //         'categorie' => $this->whenLoaded('categorie', function () {
    //             return $this->categorie->nom_cat;
    //         }),
    //         'ref' => $this->ref,
    //         'nom' => $this->nom,
    //         'description' => $this->description,
    //         'prix_unitaire' => number_format($this->prix_unitaire, 2),
    //         'date_ajoute' => Carbon::parse($this->date_ajoute)->format('Y-m-d'),
    //         'image_url' => $this->image ? asset('storage/'.$this->image) : null,
    //         'stock'=>$this->whenLoaded('stock', function () {
    //             return $this->stock->quantite_disponible;
    //         }),
            
    //     ];
    // }

    public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'categorie_id' => $this->categorie_id,
        'categorie' => $this->whenLoaded('categorie', function () {
            return $this->categorie->nom_cat;
        }),
        'ref' => $this->ref,
        'nom' => $this->nom,
        'description' => $this->description,
        'prix_unitaire' => number_format($this->prix_unitaire, 2),
        'date_ajoute' => Carbon::parse($this->date_ajoute)->format('Y-m-d'),
        'image_url' => $this->image ? asset('storage/' . $this->image) : null,
        'type_transaction' => $this->type_transaction,
        // Détails du stock (si chargé)
        'stock' => $this->whenLoaded('stock', function () {
            return [
                'quantite_disponible' => $this->stock->quantite_disponible,
                'niveau_critique' => $this->stock->niveau_critique,
                'date_maj' => Carbon::parse($this->stock->date_maj)->format('Y-m-d'),
            ];
        }),

        // Historique des entrées (bonentrees) - si chargé
        'bonentrees' => $this->whenLoaded('bonentrees', function () {
            return $this->bonentrees->map(function ($bonentree) {
                return [
                    'reference' => $bonentree->reference,
                    'fournisseur_id' => $bonentree->fournisseur_id,
                    'date_entree' => Carbon::parse($bonentree->date_entree)->format('Y-m-d'),
                    'quantite' => $bonentree->pivot->quantite,
                    'prix_achat' => number_format($bonentree->pivot->prix_achat, 2),
                    'prix_total' => number_format($bonentree->prix_total, 2),
                    'status' => $bonentree->status,
                ];
            });
        }),

        // Historique des sorties (bonsorties) - si chargé
        'bonsorties' => $this->whenLoaded('bonsorties', function () {
            return $this->bonsorties->map(function ($bonsortie) {
                return [
                    'reference' => $bonsortie->reference,
                    'client_id' => $bonsortie->client_id,
                    'date_sortie' => Carbon::parse($bonsortie->date_sortie)->format('Y-m-d'),
                    'quantite' => $bonsortie->pivot->quantite,
                    'prix_vente' => number_format($bonsortie->pivot->prix_vente, 2),
                    'prix_total' => number_format($bonsortie->prix_total, 2),
                    'status' => $bonsortie->status,
                ];
            });
        }),

        // Timestamps
        'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
}
}
