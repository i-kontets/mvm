<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204)->withHeaders($this->headers());
        }
        return $next($request)->withHeaders($this->headers());
    }

    private function headers(): array
    {
        return ['Access-Control-Allow-Origin' => 'http://localhost:5173', 'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers' => 'Content-Type, Accept'];
    }
}
