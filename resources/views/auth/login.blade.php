<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | TodoApp</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen">

    <div class="max-w-md w-full mx-4">
        <div class="bg-white rounded-3x1 shadow-xl p-8 text-center animate__animated animate__fadeInUp">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-6">
                <i class="fa-solid fa-check-double text-3xl"></i>
            </div>

            <h1 class="text-3xl font-bold text-slate-800 mb-2">Hello!</h1>
            <p class="text-slate-500 mb-8 text-lg">Log in with your Telegram account to continue</p>

            @if(session('error'))
                <div class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                    {{ session('error') }}
                </div>
            @endif

            <div class="flex justify-center py-4">
                <script async src="https://telegram.org/js/telegram-widget.js?22" 
                    data-telegram-login="{{ config('services.telegram.bot_username') }}" 
                    data-size="large" 
                    data-radius="12"
                    data-auth-url="{{ url('/auth/telegram/callback') }}" 
                    data-request-access="write">
                </script>
            </div>

            <p class="mt-8 text-xs text-slate-400">
                Friends of TodoApp are welcome!
            </p>
        </div>
        
        <div class="mt-6 text-center">
            <p class="text-slate-400 text-sm italic">"Let`s make it happen!"</p>
        </div>
    </div>

</body>
</html>
