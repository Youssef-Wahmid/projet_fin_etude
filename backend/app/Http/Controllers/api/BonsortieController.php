<?php

namespace App\Http\Controllers\api;

use App\Models\Bonsortie;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreBonsortieRequest;
use App\Http\Requests\V1\UpdateBonsortieRequest;
use App\Http\Resources\bonSortie\BonsortieCollection;
use App\Http\Resources\bonSortie\BonsortieResource;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BonsortieController extends Controller
{


    public function index()
    {
        $bons = BonSortie::with(['user', 'client','produits'])->get();
        return new BonsortieCollection($bons);
    }




    //! store
    // public function store(StoreBonSortieRequest $request)
    // {
    //     DB::beginTransaction();

    //     try {
    //         $validated = $request->validated();

    //         // 1. Vérification des stocks
    //         $produitsIndisponibles = [];
    //         $produitsAvecStock = [];

    //         foreach ($validated['produits'] as $produit) {
    //             $stock = Stock::with('produit')
    //                 ->where('produit_id', $produit['produit_id'])
    //                 ->firstOrFail();

    //             $quantiteDemandee = (int)$produit['quantite'];

    //             if ($stock->quantite_disponible < $quantiteDemandee) {
    //                 $produitsIndisponibles[] = [
    //                     'produit_id' => $produit['produit_id'],
    //                     'produit_nom' => $stock->produit->nom,
    //                     'reference' => $stock->produit->ref,
    //                     'stock_disponible' => $stock->quantite_disponible,
    //                     'quantite_demandee' => $quantiteDemandee,
    //                     'niveau_critique' => $stock->niveau_critique
    //                 ];
    //             } else {
    //                 $produitsAvecStock[$produit['produit_id']] = [
    //                     'stock_id' => $stock->id,
    //                     'quantite_disponible' => $stock->quantite_disponible,
    //                     'quantite_demandee' => $quantiteDemandee
    //                 ];
    //             }
    //         }

    //         if (!empty($produitsIndisponibles)) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Stock insuffisant pour certains produits',
    //                 'data' => $produitsIndisponibles
    //             ], 422);
    //         }

    //         // 2. Création du bon de sortie
    //         $bonSortie = BonSortie::create([
    //             'user_id' => $validated['user_id'],
    //             'client_id' => $validated['client_id'],
    //             'reference' => $validated['reference'],
    //             'date_sortie' => $validated['date_sortie'],
    //             'prix_total' => (float)$validated['prix_total'],
    //             'status' => 'en_attente',
    //         ]);

    //         // 3. Traitement des produits et mise à jour des stocks
    //         $produitsData = [];
    //         foreach ($validated['produits'] as $produit) {
    //             $produitId = $produit['produit_id'];
    //             $quantite = (int)$produit['quantite'];

    //             $produitsData[$produitId] = [
    //                 'quantite' => $quantite,
    //                 'prix_vente' => (float)$produit['prix_vente'],
    //                 'notes' => $produit['notes'] ?? null,
    //                 'created_at' => now(),
    //                 'updated_at' => now(),
    //             ];

    //             // Mise à jour atomique du stock
    //             Stock::where('id', $produitsAvecStock[$produitId]['stock_id'])
    //                 ->decrement('quantite_disponible', $quantite);
    //         }

    //         $bonSortie->produits()->attach($produitsData);

    //         DB::commit();

    //         // Chargement des relations avec les données pivot
    //         $bonSortie->load(['client', 'user', 'produits' => function ($query) {
    //             $query->with(['stock', 'categorie'])
    //                 ->withPivot('quantite', 'prix_vente', 'notes');
    //         }]);

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Bon de sortie créé avec succès',
    //             'data' => $bonSortie,
    //             'stocks_updated' => array_keys($produitsAvecStock)
    //         ], 201);
    //     } catch (\Exception $e) {
    //         DB::rollBack();


    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Erreur lors de la création du bon de sortie',
    //             'error' => env('APP_DEBUG') ? $e->getMessage() : 'Une erreur est survenue',
    //             'request_data' => env('APP_DEBUG') ? $request->all() : null
    //         ], 500);
    //     }
    // }

    public function store(StoreBonSortieRequest $request)
{
    DB::beginTransaction();

    try {
        $validated = $request->validated();

        // 1. Vérification des stocks (mais pas de modification)
        $produitsIndisponibles = [];
        $produitsAvecStock = [];

        foreach ($validated['produits'] as $produit) {
            $stock = Stock::with('produit')
                ->where('produit_id', $produit['produit_id'])
                ->firstOrFail();

            $quantiteDemandee = (int)$produit['quantite'];

            if ($stock->quantite_disponible < $quantiteDemandee) {
                $produitsIndisponibles[] = [
                    'produit_id' => $produit['produit_id'],
                    'produit_nom' => $stock->produit->nom,
                    'reference' => $stock->produit->ref,
                    'stock_disponible' => $stock->quantite_disponible,
                    'quantite_demandee' => $quantiteDemandee,
                    'niveau_critique' => $stock->niveau_critique
                ];
            } else {
                $produitsAvecStock[$produit['produit_id']] = [
                    'stock_id' => $stock->id,
                    'quantite_disponible' => $stock->quantite_disponible,
                    'quantite_demandee' => $quantiteDemandee
                ];
            }
        }

        if (!empty($produitsIndisponibles)) {
            return response()->json([
                'success' => false,
                'message' => 'Stock insuffisant pour certains produits',
                'data' => $produitsIndisponibles
            ], 422);
        }

        // 2. Création du bon de sortie
        $bonSortie = BonSortie::create([
            'user_id' => $validated['user_id'],
            'client_id' => $validated['client_id'],
            'reference' => $validated['reference'],
            'date_sortie' => $validated['date_sortie'],
            'prix_total' => (float)$validated['prix_total'],
            'status' => 'en_attente', // Statut initial
        ]);

        // 3. Enregistrement des produits sans modifier le stock
        $produitsData = [];
        foreach ($validated['produits'] as $produit) {
            $produitId = $produit['produit_id'];

            $produitsData[$produitId] = [
                'quantite' => (int)$produit['quantite'],
                'prix_vente' => (float)$produit['prix_vente'],
                'notes' => $produit['notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $bonSortie->produits()->attach($produitsData);

        DB::commit();

        $bonSortie->load(['client', 'user', 'produits' => function($query) {
            $query->with(['stock', 'categorie'])
                  ->withPivot('quantite', 'prix_vente', 'notes');
        }]);

        return response()->json([
            'success' => true,
            'message' => 'Bon de sortie créé avec succès (stock non déduit - en attente de livraison)',
            'data' => $bonSortie
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création du bon de sortie',
            'error' => env('APP_DEBUG') ? $e->getMessage() : 'Une erreur est survenue'
        ], 500);
    }
}




    //! Details
    public function show($id)
    {
        $bonentree = Bonsortie::with(['user', 'client', 'produits'])->find($id);

        if (!$bonentree) {
            return response()->json([
                'success' => false,
                'message' => 'Bon d\'entrée introuvable.'
            ], 404);
        }
        return new BonsortieResource($bonentree);
    }



    //! Modification
    public function update(UpdateBonsortieRequest $request, $id)
    {
        // Valider et mettre à jour sans transaction (puisqu'on ne modifie pas les stocks)
        $bonSortie = Bonsortie::findOrFail($id);
        
        // Vérifier que le bon peut être modifié
        if (in_array($bonSortie->status, ['livre', 'annule'])) {
            return response()->json([
                'message' => 'Impossible de modifier un bon déjà livré ou annulé'
            ], 422);
        }

        // Mettre à jour les informations de base
        $bonSortie->update([
            'client_id' => $request->client_id,
            'date_sortie' => $request->date_sortie,
            'prix_total' => $request->prix_total,
            'status' => $request->status,
            'user_id' => $request->user_id // Récupéré depuis le front-end
        ]);

        // Synchroniser les produits sans vérifier les stocks
        $produitsData = [];
        foreach ($request->produits as $produit) {
            $produitsData[$produit['produit_id']] = [
                'quantite' => $produit['quantite'],
                'prix_vente' => $produit['prix_vente'],
                'notes' => $produit['notes'] ?? null
            ];
        }

        $bonSortie->produits()->sync($produitsData);

        // Charger les relations pour la réponse
        $bonSortie->load(['client', 'user', 'produits']);

        return response()->json([
            'message' => 'Bon de sortie mis à jour avec succès',
            'data' => $bonSortie
        ]);
    }

    //! Supp
    public function destroy($id)
    {
        $bonsortie = BonSortie::find($id);
        if (!$bonsortie) {
            return response()->json([
                'success' => false,
                'message' => 'Bon de sortie introuvable.'
            ], 404);
        }
        $bonsortie->delete();
        return response()->json([
            'success' => true,
            'message' => 'Bon de sortie supprimé avec succès.',
            'data' => [
                'id' => $bonsortie->id,
                'reference' => $bonsortie->reference,
            ]
        ]);
    }



    // public function updateStatus(Request $request, $id)
    // {
    //     $bon = Bonsortie::findOrFail($id);
    //     $bon->status = $request->input('status');
    //     $bon->save();
    //     return response()->json(['message' => 'Status updated successfully.']);
    // }


    
public function updateStatus(Request $request, $id)
{
    DB::beginTransaction();

    try {
        $bon = BonSortie::with('produits')->findOrFail($id);
        $nouveauStatut = $request->input('status');
        
        // Si le statut passe à "livré", on déduit le stock
        if ($nouveauStatut === 'livre' && $bon->status !== 'livre') {
            foreach ($bon->produits as $produit) {
                Stock::where('produit_id', $produit->id)
                    ->decrement('quantite_disponible', $produit->pivot->quantite);
                
        
            }
        }
        // Si on annule un bon déjà livré, on restitue le stock
        elseif (($nouveauStatut === 'annule' || $nouveauStatut === 'retour') && $bon->status === 'livre') {
            foreach ($bon->produits as $produit) {
                Stock::where('produit_id', $produit->id)
                    ->increment('quantite_disponible', $produit->pivot->quantite);
            }
        }

        $bon->status = $nouveauStatut;
        $bon->save();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => new BonsortieResource($bon)
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
       

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour du statut',
            'error' => env('APP_DEBUG') ? $e->getMessage() : 'Une erreur est survenue'
        ], 500);
    }
}
}
