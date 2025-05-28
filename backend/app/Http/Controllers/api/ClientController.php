<?php

namespace App\Http\Controllers\api;

use App\Models\Client;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreClientRequest;
use App\Http\Requests\V1\UpdateClientRequest;
use App\Http\Resources\client\ClientCollection;
use App\Http\Resources\client\ClientResource;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
    $clients= Client::with(['bonsorties'])->get();
       return new ClientCollection($clients);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        $client = Client::create($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Le Client a été créé avec succès',
                // 'data' => new ClientResource($client)
            ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        return($client) ;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        return $client->update($request->all());

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete() ;
        return response()->json([
            'success' => true,
            'message' => 'Client supprimé avec succès !',
        ]);
    }
}
