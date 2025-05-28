<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
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
        return [
            'name' => 'required|string|min:2|max:100',
'email'    => [
            'required',
            'string',
            'email',
            'max:100',
            Rule::unique('users', 'email')->ignore($this->user), // ignore l'ID actuel
        ],            'role' => 'required|string|in:admin,magasinier',
            'password' => 'sometimes|string|min:8|max:100',
        ];
    }

    public function messages(): array
{
    return [
        // Nom
        'name.required' => 'Le nom est obligatoire.',
        'name.string'   => 'Le nom doit être une chaîne de caractères.',
        'name.min'      => 'Le nom doit contenir au moins 2 caractères.',
        'name.max'      => 'Le nom ne peut pas dépasser 100 caractères.',

        // Email
        'email.required' => 'L\'adresse e-mail est obligatoire.',
        'email.string'   => 'L\'adresse e-mail doit être une chaîne de caractères.',
        'email.email'    => 'L\'adresse e-mail doit être valide.',
        'email.max'      => 'L\'adresse e-mail ne peut pas dépasser 100 caractères.',
        'email.unique'   => 'Cette adresse e-mail est déjà utilisée.',

        // Rôle
        'role.required' => 'Le rôle est obligatoire.',
        'role.string'   => 'Le rôle doit être une chaîne de caractères.',
        'role.in'       => 'Le rôle doit être "admin" ou "magasinier".',

        // Mot de passe
        // 'password.required' => 'Le mot de passe est obligatoire.',
        // 'password.string'   => 'Le mot de passe doit être une chaîne de caractères.',
        // 'password.min'      => 'Le mot de passe doit contenir au moins 8 caractères.',
        // 'password.max'      => 'Le mot de passe ne peut pas dépasser 100 caractères.',
    ];
}

}
