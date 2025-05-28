<?php

namespace App\Http\Requests\v1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
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
    public function rules(){
        $method = $this->method();
        $client = $this->route('client'); /* جلب العميل الحالي من الرابط */

        if ($method == 'PUT') {
            return [
                'name' => ['required', 'string', 'max:100',],
                'email' => ['required', 'email', 'max:100',Rule::unique('clients', 'email_clt')->ignore($client->id), /*  فريد لكن تجاهل العميل الحالي */ ],
                'phone' => [ 'required', 'string', 'max:20' ,  Rule::unique('clients', 'telephone_clt')->ignore($client->id),],

            ];
        }
    }

    protected function prepareForValidation() {
        $this->merge([
            'nom_clt' => trim($this->name),
            'telephone_clt' => preg_replace('/[^0-9]/', '', $this->phone),
            'email_clt' => strtolower(trim($this->email)),
        ]);
    }
}
