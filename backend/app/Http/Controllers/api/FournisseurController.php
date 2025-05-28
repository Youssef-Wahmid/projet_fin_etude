<?php

namespace App\Http\Controllers\api;

use App\Models\Fournisseur;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreFournisseurRequest;
use App\Http\Requests\V1\UpdateFournisseurRequest;
use App\Http\Resources\fournisseur\FournisseurCollection;
use App\Http\Resources\Fournisseur\FournisseurResource;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fournisseurs= Fournisseur::all() ;
       return new FournisseurCollection($fournisseurs);
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
    public function store(StoreFournisseurRequest $request)
    {
        Fournisseur::create($request->all());
        return response()->json([
            'success' => true,
            'message' => 'Le fournisseur a été créé avec succès',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Fournisseur $fournisseur)
    {
        return $fournisseur ;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Fournisseur $fournisseur)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFournisseurRequest $request, Fournisseur $fournisseur)
    {
        return $fournisseur->update($request->all());
        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fournisseur $fournisseur)
    {
        $fournisseur->delete() ;
        return response()->json([
            'success' => true,
            'message' => 'Le Fournisseur supprimé avec succès !',
        ]);
    }
}
