<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
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
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'role' => 'required|string|in:admin,magasinier',
            'password' => 'required|string|min:6|confirmed',
        ];
        
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Le nom est obligatoire.',
            'name.string'       => 'Le nom doit être une chaîne de caractères.',
            'name.max'          => 'Le nom ne peut pas dépasser 255 caractères.',

            'email.required'    => 'L\'adresse e-mail est obligatoire.',
            'email.email'       => 'L\'adresse e-mail doit être valide.',
            'email.unique'      => 'Cette adresse e-mail est déjà utilisée.',
            
            'role.required' => 'Le rôle est obligatoire.',
            'role.in'       => 'Le rôle doit être soit "admin" soit "magasinier".',

            'password.required' => 'Le mot de passe est obligatoire.',
            'password.string'   => 'Le mot de passe doit être une chaîne de caractères.',
            'password.min'      => 'Le mot de passe doit contenir au moins 6 caractères.',
            'password.confirmed' => 'Le mot de passe de confirmation ne correspond pas.',
        ];
    }
}
