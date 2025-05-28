<?php

namespace App\Http\Controllers\api;

use App\Models\Bonentree;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreBonentreeRequest;
use App\Http\Requests\V1\UpdateBonentreeRequest;
use App\Http\Resources\bonEntree\BonentreeCollection;
use App\Http\Resources\bonEntree\BonentreeResource;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BonentreeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bons = BonEntree::with(['user', 'fournisseur'])->get();
        return new BonentreeCollection($bons);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBonentreeRequest $request)
    {
        $validated = $request->validated();
    
        DB::beginTransaction();
        try {
            // Création du bon d'entrée
            $bonEntree = Bonentree::create([
                'user_id' => $validated['user_id'],
                'fournisseur_id' => $validated['fournisseur_id'],
                'date_entree' => $validated['date'] ?? now(), // Assurez-vous que 'date' est bien dans les validated
                'reference' => $validated['reference'],
                'status' => 'en_attente',
                'prix_total' => $validated['prix_total'],
            ]);
    
            // Traitement des produits
            foreach ($validated['produits'] as $produit) {
                $bonEntree->produits()->attach($produit['produit_id'], [
                    'quantite' => $produit['quantite'],
                    'prix_achat' => $produit['prix_achat'],
                    'notes' => $produit['notes'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
    
                // Mise à jour du stock - version plus sécurisée
                $stock = Stock::firstOrNew(['produit_id' => $produit['produit_id']]);
                $stock->quantite_disponible = ($stock->quantite_disponible ?? 0) + $produit['quantite'];
                $stock->date_maj = now();
                $stock->save();
            }
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'Achat enregistré avec succès',
                'data' => $bonEntree->load('produits') // Charge les produits directement
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
           
            return response()->json([
                'success' => false,
                'message' => 'Échec de l\'enregistrement',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Bonentree $bonentree)
    {
        $detailBon = $bonentree->load(['user', 'fournisseur', 'produits']) ;
        return new BonentreeResource($detailBon);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBonentreeRequest $request, Bonentree $bonentree)
{
    $validated = $request->validated();

    DB::beginTransaction();
    try {
        // Mise à jour du bon d'entrée
        $bonentree->update([
            'user_id' => $validated['user_id'],
            'fournisseur_id' => $validated['fournisseur_id'],
            'date_entree' => $validated['date'] ?? $bonentree->date_entree,
            'reference' => $validated['reference'],
            'status' => $validated['status'],

            'prix_total' => $validated['prix_total'],
        ]);

        // Récupération des anciens produits pour ajustement du stock
        $oldProduits = $bonentree->produits()->get();

        // Synchronisation des produits (suppression des anciennes relations et création des nouvelles)
        $produitsSyncData = [];
        foreach ($validated['produits'] as $produit) {
            $produitsSyncData[$produit['produit_id']] = [
                'quantite' => $produit['quantite'],
                'prix_achat' => $produit['prix_achat'],
                'notes' => $produit['notes'] ?? null,
                'updated_at' => now()
            ];
        }
        $bonentree->produits()->sync($produitsSyncData);

        // Ajustement du stock
        foreach ($oldProduits as $oldProduit) {
            // On retire les quantités des anciens produits
            $stock = Stock::where('produit_id', $oldProduit->id)->first();
            if ($stock) {
                $stock->quantite_disponible -= $oldProduit->pivot->quantite;
                $stock->save();
            }
        }

        foreach ($validated['produits'] as $produit) {
            // On ajoute les quantités des nouveaux produits
            $stock = Stock::firstOrNew(['produit_id' => $produit['produit_id']]);
            $stock->quantite_disponible = ($stock->quantite_disponible ?? 0) + $produit['quantite'];
            $stock->date_maj = now();
            $stock->save();
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Bon d\'entrée mis à jour avec succès',
            'data' => $bonentree->fresh()->load('produits') // Recharge les données fraîches avec les produits
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        
        return response()->json([
            'success' => false,
            'message' => 'Échec de la mise à jour du bon d\'entrée',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bonentree $bonentree)
    {
        $bonentree->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bon d\'entrée supprimé avec succès.',
            'data' => [
                'id' => $bonentree->id,
                'reference' => $bonentree->reference,
            ]
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $bon = BonEntree::findOrFail($id);
        $bon->status = $request->input('status');
        $bon->save();

        return response()->json(['message' => 'Status updated successfully.']);
    }

}
