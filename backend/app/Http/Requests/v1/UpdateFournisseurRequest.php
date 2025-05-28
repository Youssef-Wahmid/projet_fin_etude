<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFournisseurRequest extends FormRequest
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
        $method = $this->method();
        $fournisseur = $this->route('fournisseur'); 

        if ($method == 'PUT') {
            return [
                'name' => ['required', 'string', 'max:100',],
                'phone' => [ 'required', 'string', 'max:20' ,  Rule::unique('fournisseurs', 'telephone_f')->ignore($fournisseur->id),],
                'email' => ['required', 'email', 'max:100',Rule::unique('fournisseurs', 'email_f')->ignore($fournisseur->id),],

            ];
        }
    }
    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom_f' => trim($this->name),
            'telephone_f' => preg_replace('/[^0-9]/', '', $this->phone),
            'email_f' => strtolower(trim($this->email)),
        ]);
    }
}

