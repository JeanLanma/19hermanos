<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AccountStatementsController extends Controller
{
    public function index()
    {
        return inertia('Accounts/Statements/AccountStatements');
    }
}
