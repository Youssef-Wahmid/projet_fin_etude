<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategorieRequest extends FormRequest
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
            'nom_categorie' => [
                'required',
                'string',
                'max:100',
                'unique:categories,nom_cat'
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom_cat' => $this->nom_categorie,
        ]);
    }
}
