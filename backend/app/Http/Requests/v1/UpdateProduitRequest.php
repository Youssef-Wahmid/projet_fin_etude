<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProduitRequest extends FormRequest
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
    public function rules(): array
    {
        $produit = $this->route('produit');
    
        return [
            'categorie_id' => 'required|exists:categories,id',
            'ref' => [
                'required',
                'string',
                'max:50',
                Rule::unique('produits', 'ref')->ignore($produit?->id), // 
            ],
            'nom' => [
                'required',
                'string',
                'max:100',
                Rule::unique('produits', 'nom')->ignore($produit?->id),
            ],
            'description' => 'nullable|string',
            'prix_unitaire' => 'required|numeric|min:0|decimal:0,2',
            'date_ajoute' => 'sometimes|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ];
    }
    
    public function messages(): array
    {
        return [
            'categorie_id.required' => 'La catégorie est obligatoire',
            'categorie_id.exists' => 'La catégorie sélectionnée est invalide',
            'ref.required' => 'La référence est obligatoire',
            'ref.unique' => 'Cette référence est déjà utilisée',
            'ref.max' => 'La référence ne doit pas dépasser 50 caractères',
            'nom.required' => 'Le nom est obligatoire',
            'nom.unique' => 'Ce nom de produit est déjà utilisé', 
            'nom.max' => 'Le nom ne doit pas dépasser 100 caractères',
            'prix_unitaire.required' => 'Le prix est obligatoire',
            'prix_unitaire.numeric' => 'Le prix doit être un nombre',
            'prix_unitaire.min' => 'Le prix ne peut pas être négatif',
            'prix_unitaire.decimal' => 'Le prix doit avoir au maximum 2 décimales',
            'date_ajoute.date' => 'La date doit être valide',
            'image.image' => 'Le fichier doit être une image',
            'image.mimes' => 'L\'image doit être de type: jpeg, png, jpg, gif ou svg',
            'image.max' => 'L\'image ne doit pas dépasser 2 Mo',
        ];
    }
}
