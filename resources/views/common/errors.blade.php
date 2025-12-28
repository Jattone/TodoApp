@if ($errors->any())
    <div class="alert alert-danger animate__animated animate__shakeX">
        <ul class="mb-0">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif