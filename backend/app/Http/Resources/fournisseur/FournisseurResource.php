<?php

namespace App\Http\Resources\Fournisseur;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FournisseurResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->nom_f,
            'phone' => $this->telephone_f,
            'email' => $this->email_f,
        ];
    }
}
  
