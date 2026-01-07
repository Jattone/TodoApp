<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class TelegramController extends Controller
{
    public function handleTelegramCallback()
    {
        $auth_data = request()->all();

        if (!$this->checkTelegramAuthorization($auth_data)) {
            return redirect('/login')->withErrors('Unauthorized Telegram user.');
        }

        $user = User::updateOrCreate(
            ['telegram_id' => $auth_data['id']],
            [
                'name' => $this->getFullName($auth_data),
                'username' => $auth_data['username'] ?? null,
                'photo_url' => $auth_data['photo_url'] ?? null,
            ]
        );

        Auth::login($user, true);

        return redirect()->intended('/home')->with('status', 'Logged in with Telegram successfully.');
    }

    protected function checkTelegramAuthorization($auth_data)
    {
        if (!isset($auth_data['hash'])) {
            return false;
        }

        $check_hash = $auth_data['hash'];
        unset($auth_data['hash']);

        $data_check_arr = [];
        foreach ($auth_data as $key => $value) {
            $data_check_arr[] = $key . '=' . $value;
        }
        
        sort($data_check_arr);
        $data_check_string = implode("\n", $data_check_arr);

        $secret_key = hash('sha256', config('services.telegram.bot_token'), true);
        $hash = hash_hmac('sha256', $data_check_string, $secret_key);

        if (strcmp($hash, $check_hash) !== 0) {
            return false;
        }

        if (time() - $auth_data['auth_date'] > 86400) {
            return false;
        }

        return true;
    }

    protected function getFullName($auth_data)
    {
        $name = $auth_data['first_name'] ?? '';

        if (isset($auth_data['last_name'])) {
            $name .= ' ' . $auth_data['last_name'];
        }

        return trim($name) ?: 'Telegram User';
    }
    
}