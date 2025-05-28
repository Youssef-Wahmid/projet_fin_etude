<?php

namespace App\Http\Controllers\api;

use App\Models\Produit;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreProduitRequest;
use App\Http\Requests\V1\UpdateProduitRequest;
use App\Http\Resources\produit\ProduitCollection;
use App\Http\Resources\produit\ProduitResource;
use App\Models\Stock;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;


class ProduitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $produits = Produit::with(['categorie', 'stock'])->get();
        return new ProduitCollection($produits);
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
    public function store(StoreProduitRequest $request)
    {
        $validatedData = $request->validated();
        try {
            // Handle image upload if present
            if ($request->hasFile('image')) {
                $image = $request->file('image');

                // Generate unique filename with original extension
                $originalExtension = $image->getClientOriginalExtension();
                $randomName = Str::random(30) . '.' . $originalExtension;

                // Store the image with new name in 'public/images'
                $imagePath = $image->storeAs('images', $randomName, 'public');
                $validatedData['image'] = $imagePath; // Stores relative path (images/filename.ext)
            }

            // Create the product
            $produit = Produit::create($validatedData);

            //! create stock for the new product created 
            $stock_of_product = new Stock();
            $stock_of_product->produit_id  =$produit->id ;
            $stock_of_product->save();

            return response()->json([
                'success' => true,
                'message' => 'Produit créé avec succès',
                'data' => $produit,

            ], 201);
        } catch (\Exception $e) {
            if (isset($imagePath) && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Produit $produit)
    {
        return $produit->load(['categorie','stock','bonsorties','bonsorties']);
        return new ProduitResource($produit);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Produit $produit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProduitRequest $request, Produit $produit)
    {

        $validatedData = $request->validated();

        try {
            // Handle image upload if present
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($produit->image && Storage::disk('public')->exists($produit->image)) {
                    Storage::disk('public')->delete($produit->image);
                }

                $image = $request->file('image');

                // Generate unique filename with original extension
                $originalExtension = $image->getClientOriginalExtension();
                $randomName = Str::random(30) . '.' . $originalExtension;

                // Store the image with new name in 'public/images/produits'
                $imagePath = $image->storeAs('images/produits', $randomName, 'public');
                $validatedData['image'] = $imagePath;
            }

            // Update the product
            $produit->update($validatedData);

            // Refresh the model to get updated relationships
            $produit->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Produit mis à jour avec succès',
                'data' => new ProduitResource($produit),
                'image_url' => isset($imagePath) ? Storage::url($imagePath) : $produit->image_url
            ], 200);
        } catch (\Exception $e) {
            // Cleanup new image if error occurred during update
            if (isset($imagePath) && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du produit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produit $produit)
    {
        $produit->delete();
        return response()->json([
            'success' => true,
            'message' => 'Produits supprimé avec succès !',
        ]);
    }
}
