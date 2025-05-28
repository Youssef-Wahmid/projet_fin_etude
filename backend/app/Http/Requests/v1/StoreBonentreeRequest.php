<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;

class StoreBonentreeRequest extends FormRequest
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
 // Dans StoreBonentreeRequest
public function rules()
{
    return [
        'user_id' => 'required|exists:users,id',
        'fournisseur_id' => 'required|exists:fournisseurs,id',
        'reference' => 'required|unique:bonentrees,reference',
        'date' => 'required|date',
        'prix_total' => 'required|numeric|min:0',
        'produits' => 'required|array|min:1',
        'produits.*.produit_id' => 'required|exists:produits,id',
        'produits.*.quantite' => 'required|integer|min:1',
        'produits.*.prix_achat' => 'required|numeric|min:0',
        'produits.*.notes' => 'nullable|string|max:255',
    ];
}

    
    public function messages(): array
    {
        return [
            // Champ user_id
            'user_id.required' => 'L\'utilisateur est obligatoire',
            'user_id.integer' => 'L\'utilisateur doit être un identifiant valide',
            'user_id.exists' => 'L\'utilisateur sélectionné n\'existe pas',
            
            // Champ fournisseur_id
            'fournisseur_id.required' => 'Le fournisseur est obligatoire',
            'fournisseur_id.integer' => 'Le fournisseur doit être un identifiant valide',
            'fournisseur_id.exists' => 'Le fournisseur sélectionné n\'existe pas',
            
            // Tableau produits
            'produits.required' => 'Au moins un produit est requis',
            'produits.array' => 'Le format des produits est invalide',
            'produits.min' => 'Au moins un produit est requis',
            
            // Produit ID
            'produits.*.produit_id.required' => 'Le produit est obligatoire',
            'produits.*.produit_id.integer' => 'Le produit doit être un identifiant valide',
            'produits.*.produit_id.exists' => 'Le produit sélectionné n\'existe pas',
            
            // Quantité
            'produits.*.quantite.required' => 'La quantité est obligatoire',
            'produits.*.quantite.integer' => 'La quantité doit être un nombre entier',
            'produits.*.quantite.min' => 'La quantité minimale est 1',
            'produits.*.quantite.max' => 'La quantité maximale est 10 000',
            
            // Prix
            'produits.*.prix_achat.required' => 'Le prix d\'achat est obligatoire',
            'produits.*.prix_achat.numeric' => 'Le prix doit être un nombre',
            'produits.*.prix_achat.min' => 'Le prix minimum est 0.01',
            'produits.*.prix_achat.max' => 'Le prix maximum est 999 999.99',
        ];
    }
}
