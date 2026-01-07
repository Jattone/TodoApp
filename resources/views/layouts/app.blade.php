<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Todo App</title>

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 17 2 2 4-4'%3E%3C/path%3E%3Cpath d='m3 7 2 2 4-4'%3E%3C/path%3E%3Cpath d='M13 6h8'%3E%3C/path%3E%3Cpath d='M13 12h8'%3E%3C/path%3E%3Cpath d='M13 18h8'%3E%3C/path%3E%3C/svg%3E">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    @vite(['resources/js/app.js', 'resources/css/app.css'])
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
        <div class="container">
            <a class="navbar-brand" href="#"><i class="fa-solid fa-list-check me-2"></i> My ToDo List</a>
            
            @auth
            <div class="dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center text-white" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="me-2 d-none d-sm-inline">{{ Auth::user()->name }}</span>
                    @if(Auth::user()->photo_url)
                        <img src="{{ Auth::user()->photo_url }}" alt="Avatar" class="user-avatar">
                    @else
                        <div class="user-avatar bg-primary d-flex align-items-center justify-content-center text-white" style="font-size: 0.8rem;">
                            {{ substr(Auth::user()->name, 0, 1) }}
                        </div>
                    @endif
                </a>

                <ul class="dropdown-menu dropdown-menu-end animate__animated animate__fadeIn animate__faster" aria-labelledby="userDropdown">
                    <li class="px-3 py-2 border-bottom">
                        <div class="text-xs text-muted">ID</div>
                        <div class="fw-bold" style="font-size: 0.8rem;">{{ Auth::user()->telegram_id }}</div>
                    </li>
                    <li>
                        <a class="dropdown-item mt-2" href="#">
                            <i class="fa-solid fa-user-gear me-2 text-muted"></i> Settings
                        </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <form action="{{ route('logout') }}" method="POST" id="logout-form">
                            @csrf
                            <button type="submit" class="dropdown-item text-danger">
                                <i class="fa-solid fa-right-from-bracket me-2"></i> LogOut
                            </button>
                        </form>
                    </li>
                </ul>
            </div>
            @endauth
        </div>
    </nav>

    <div class="container">
        @yield('content')
    </div>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    @stack('scripts')
</body>
</html>