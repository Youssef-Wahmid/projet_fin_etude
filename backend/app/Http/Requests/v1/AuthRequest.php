<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;

class AuthRequest extends FormRequest
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
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6|different:old_password',
            'confirmation_password' => 'required|string|min:6|same:new_password',
        ];
    }

    public function messages(): array
    {
        return [
            'old_password.required' => 'L\'ancien mot de passe est obligatoire',
            'old_password.string' => 'L\'ancien mot de passe doit être une chaîne de caractères',
            
            'new_password.required' => 'Le nouveau mot de passe est obligatoire',
            'new_password.string' => 'Le nouveau mot de passe doit être une chaîne de caractères',
            'new_password.min' => 'Le nouveau mot de passe doit contenir au moins :min caractères',
            'new_password.different' => 'Le nouveau mot de passe doit être différent de l\'ancien',
            
            'confirmation_password.required' => 'La confirmation du mot de passe est obligatoire',
            'confirmation_password.string' => 'La confirmation doit être une chaîne de caractères',
            'confirmation_password.min' => 'La confirmation doit contenir au moins :min caractères',
            'confirmation_password.same' => 'La confirmation doit correspondre au nouveau mot de passe',
        ];
    }
}
