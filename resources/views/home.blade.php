<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Notes</title>
    <!-- Только CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" 
    integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">

    <link rel="stylesheet" href="/css/style.css">

</head>

<body>

    <div class="container">
        <div class="row mt-5 justify-content-center ">
            <div class="col-3">
                <form id='form' method = "POST" action="/">
                   @csrf
                    <div class="d-flex justify-content-between">
                        <div class="me-1 w-100">
                        <input id='task' required='required' name='task' placeholder='Type task..' type='text' class="form-control">
                        </div>
                        <div class="ms-2">
                        <button id="button" class="btn btn-success">Add</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="row g-0 mt-2 justify-content-center">

            <div id="parent" class="col-3">
            @foreach ($tasks as $item)
                <p id={{$item->id}} data-id={{$item->id}} class ='task m-2 p-2 bg-info text-center rounded'>
                    {{$item->text}}
                </p>
                @endforeach
            </div>
                
        </div>
   
        {{-- <div id="modalBlock" >
            
            <p>Modal random text and more random text</p>
        </div>
        
        <button id="showModal">Show modal</button>
    
    
 --}}




    
    
    <!-- Пакет JavaScript с Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" 
    integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
    <script src="/js/script.js"></script>
   
   <script>
        // let from = document.getElementById('form');
        //     from.onsubmit = (event) => {
        //         event.preventDefault();
        //     }          
        // let from = document.getElementById('block');
        //     from.onsubmit = (event) => {       
        // function setNewEntry(entry) {
        //     $("#bloc").html(entry);
        // }
    </script>
  
    
    
    
</body>

</html>