
function show(elem) {
    elem.style.transform = 'translateY(-100%)';
    elem.style.opacity = '0';
    setTimeout(() => {
        elem.style.transform = 'translateY(0)';
        elem.style.opacity = '1';
    }, 100);
}
function hide(elem) {
    elem.style.transform = 'translateY(100%)';
    elem.style.opacity = '0';
}


const deleteFunc = (click) => {
    let id = click.target.dataset.id;
    let url = "/";
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            id: id
        }) // body data type must match "Content-Type" header
    }).then(response => {
        response.json()
            .then(json => {
                if (json.ok) {
                    let task_elem = document.getElementById(id);
                    hide(task_elem);
                    setTimeout(() => {
                        task_elem.remove();
                    }, 300);
                }
            })
    })
}

let tasks = document.querySelectorAll('.task');
document.getElementById('task').focus();
let parent = document.getElementById('parent');
let form = document.getElementById('form');
form.onsubmit = (event) => {
    event.preventDefault();
    let text = event.target.task.value;
    event.target.task.value = '';
    let url = "/";
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            text: text
        }) // body data type must match "Content-Type" header
    }).then(response => {
        response.json()
            .then(json => {
                let elem = document.createElement('p');
                elem.setAttribute('data-id', json.id);
                elem.setAttribute('id', json.id);
                elem.setAttribute('class', 'task m-2 p-2 bg-info text-center rounded');
                elem.innerText = json.text;
                parent.appendChild(elem);
                elem.addEventListener('click', deleteFunc)

                show(elem)



            })
    })
};
tasks.forEach(task => {
    task.addEventListener('click', deleteFunc)
});