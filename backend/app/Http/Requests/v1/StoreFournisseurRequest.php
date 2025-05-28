<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFournisseurRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:100', 
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'unique:fournisseurs,telephone_f',

            ],
            'email' => [
                'required',
                'email',
                'max:100',
                'unique:fournisseurs,email_f',
            ],
            
           
        ];
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

// nom_f telephone_f email_f
