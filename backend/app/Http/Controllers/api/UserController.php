<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\v1\UserRequest;
use App\Http\Requests\v1\UserUpdateRequest;
use App\Http\Resources\utilisateur\UserCollection;
use App\Http\Resources\utilisateur\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    
    
    public function index()
    {
        $users = User::all();
        return new UserCollection( $users);
    }

    

    public function store(UserRequest $request)
    {
        $hash_pw = Hash::make($request->password);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => $hash_pw,
        ]);
        return response()->json([
            'success' => true,
            'message' => 'L\'utilisateur a été créé avec succès',
            'data' => new UserResource($user)
        ], 201);
    }

    
    

    public function show( $id)
    {
        $user = User::where('id', $id)->with(['bonentrees', 'bonsorties'])->first();
        return new UserResource($user);
    }

    

    public function update(UserUpdateRequest $request, string $id)
{
    $user = User::findOrFail($id);
    $user->name = $request->name;
    $user->email = $request->email;
    $user->role = $request->role;

    // Si un mot de passe est fourni, on le hash
    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'L\'utilisateur a été mis à jour avec succès',
        'data' => new UserResource($user)
    ]);
}



    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json([
            'message' => 'l\'utilisateur a été supprimé avec succès',
        ], 200);
    }
}
