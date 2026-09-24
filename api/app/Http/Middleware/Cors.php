<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    // 開発中のReact画面から、このAPIへアクセスできるようにする。
    public function handle(Request $request, Closure $next)
    {
        // ブラウザが送る「このAPIを使っていい？」という事前確認に答える。
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204)->withHeaders($this->headers());
        }
        return $next($request)->withHeaders($this->headers());
    }

    // Reactから使ってよい操作の種類をまとめて返す。
    private function headers(): array
    {
        return ['Access-Control-Allow-Origin' => 'http://localhost:5173', 'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers' => 'Content-Type, Accept'];
    }
}
