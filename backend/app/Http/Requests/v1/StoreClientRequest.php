<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
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
            'email' => [
                'required',
                'email',
                'max:100',
                'unique:clients,email_clt',
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'unique:clients,telephone_clt',

            ],
           
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom_clt' => trim($this->name),
            'telephone_clt' => preg_replace('/[^0-9]/', '', $this->phone),
            'email_clt' => strtolower(trim($this->email)),
        ]);
    }
}
