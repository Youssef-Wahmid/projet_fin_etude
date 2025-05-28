<?php

namespace App\Http\Controllers\api;

use App\Models\Categorie;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreCategorieRequest;
use App\Http\Requests\V1\UpdateCategorieRequest;
use App\Http\Resources\categorie\CategorieCollection;
use App\Http\Resources\categorie\CategorieResource;


use App\Http\Requests\V1\StoreClientRequest;
use App\Http\Requests\V1\UpdateClientRequest;


class CategorieController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories= Categorie::all() ;
        return new CategorieCollection($categories);
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
    public function store(StoreCategorieRequest $request)
    {
        $Categorie = Categorie::create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Catégorie créée avec succès',
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show( $categorie)
    {
        return ($categorie) ;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Categorie $categorie)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategorieRequest $request,  $categorieId)
    {
        $categorie = Categorie::find($categorieId);
        return $categorie->update($request->all());

        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($categorieId)
    {
        $categorie = Categorie::find($categorieId);
        $categorie->delete();
        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée avec succès',
        ]);
    }
}
