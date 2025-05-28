<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\v1\AuthRequest;
use App\Http\Resources\utilisateur\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function login(Request $req)
    {
        $validatedData = $req->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || !Hash::check($validatedData['password'], $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe invalide'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 200);
    }


    public function logout(Request $req)
    {
        $user = User::where('id', $req->user()->id)->first();
        if ($user) {
            $user->tokens()->delete();
            return response()->json([
                'success' => 'Logout successfuly'
            ]);
        }
    }

    public function profile(Request $req)
    {
        $user = User::where('id', $req->user()->id)->first();
        if ($user) {
            return response()->json([
                'user' => new UserResource($user) ,
                'currentToken' => $req->bearerToken()
            ]);
        } else {
            return response()->json([
                'message' => 'unauthorized'
            ]);
        }
    }


   public function updateProfile(AuthRequest $req)
{
    $validate_data = $req->validated();

    $user = User::where('id', $req->user()->id)->first();
    
    if (!$user) {
        return response()->json([
            'message' => 'Non autorisé'
        ], 401);
    }

    if (!Hash::check($validate_data['old_password'], $user->password)) {
        return response()->json([
            'message' => 'Le mot de passe actuel est incorrect'
        ], 422);
    }

    if ($validate_data['new_password'] !== $validate_data['confirmation_password']) {
        return response()->json([
            'message' => 'La confirmation du mot de passe ne correspond pas'
        ], 422);
    }

    $user->password = Hash::make($validate_data['new_password']);
    $user->save();

    return response()->json([
        'message' => 'Le mot de passe a été modifié avec succès'
    ], 200);
}
    
}
