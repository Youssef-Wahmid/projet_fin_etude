<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\api\BonentreeController;
use App\Http\Controllers\api\BonsortieController;
use App\Http\Controllers\api\CategorieController;
use App\Http\Controllers\api\ClientController;
use App\Http\Controllers\api\FournisseurController;
use App\Http\Controllers\api\ProduitController;
use App\Http\Controllers\api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


//  api/v1/-------
Route::group(['prefix' => 'v1', ], function () {
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('categories', CategorieController::class);
    Route::apiResource('fournisseurs', FournisseurController::class);
    Route::apiResource('produits', ProduitController::class);
    //! Modify Status of Bon Entrre
    Route::apiResource('bonentrees', BonentreeController::class);
    Route::patch('bonentrees/{bonentree}/status', [BonentreeController::class, 'updateStatus']);
    //! Modify Status of Bon Sortie
    Route::apiResource('bonsorties', BonsortieController::class);
    Route::patch('bonsorties/{bonsortie}/status', [BonsortieController::class, 'updateStatus']);

    Route::post('login', [AuthController::class, 'login']);

    Route::apiResource('users', UserController::class);
    // Route::get('profile', [AuthController::class, 'profile']);


});



Route::group(['prefix' => 'v1', 'middleware' => ['auth:sanctum']], function () {
    Route::get('profile', [AuthController::class, 'profile']);
    Route::patch('profile/updatepw', [AuthController::class, 'updateProfile']);
    Route::post('logout', [AuthController::class, 'logout']);
});