<?php

use App\Http\Controllers\Accounts\AccountStatementsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard',  [AccountStatementsController::class, 'index'])->name('dashboard');

    Route::get('/accounts/statements', [AccountStatementsController::class, 'index'])->name('accounts.statements');
});
