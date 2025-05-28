<?php

namespace App\Http\Resources\client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
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
            'name' => $this->nom_clt,
            'phone' => $this->telephone_clt,
            'email' => $this->email_clt,
            'nombre_bonsorties' => $this->bonsorties->count(),
        ];
    }
}
