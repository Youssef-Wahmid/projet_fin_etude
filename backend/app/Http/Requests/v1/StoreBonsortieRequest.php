<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;

class StoreBonsortieRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
{
    return [
        'user_id' => 'required|integer|exists:users,id',
        'client_id' => 'required|integer|exists:clients,id',
        'reference' => 'required|string|max:50|unique:bonsorties,reference',
        'date_sortie' => 'required|date',
        'prix_total' => 'required|numeric|min:0',
        'produits' => 'required|array|min:1',
        'produits.*.produit_id' => 'required|integer|exists:produits,id',
        'produits.*.quantite' => 'required|integer|min:1',
        'produits.*.prix_vente' => 'required|numeric|min:0',
        'produits.*.notes' => 'nullable|string|max:255',
    ];
}

    public function messages(): array
    {
        return [
            'required' => 'Le champ :attribute est obligatoire.',
            'exists' => 'Le :attribute sélectionné(e) n\'existe pas.',
            'unique' => 'Cette :attribute est déjà utilisée.',
            'date' => 'La :attribute doit être une date valide.',
            'numeric' => 'Le :attribute doit être un nombre.',
            'integer' => 'La :attribute doit être un entier.',
            'min' => 'La :attribute ne peut pas être négative.',
            'array' => 'Les :attribute doivent être sous forme de liste.',
            
            'reference.unique' => 'Cette référence de bon de sortie existe déjà.',
            // Message sur le status retiré
            
            'produits.required' => 'Vous devez sélectionner au moins un produit.',
            'produits.min' => 'Vous devez sélectionner au moins un produit.',
            
            'produits.*.quantite.min' => 'La quantité doit être d\'au moins 1.',
            'produits.*.prix_vente.min' => 'Le prix de vente ne peut pas être négatif.',
            'produits.*.notes.max' => 'Les notes ne doivent pas dépasser 500 caractères.',
        ];
    }

    public function attributes(): array
    {
        return [
            'user_id' => 'utilisateur',
            'client_id' => 'client',
            'date_sortie' => 'date de sortie',
            'prix_total' => 'prix total',
            'produits.*.produit_id' => 'produit',
            'produits.*.quantite' => 'quantité',
            'produits.*.prix_vente' => 'prix de vente',
        ];
    }
}
