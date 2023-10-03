var timer

vedi_genre_preferito()

async function search_genre(id) {
    if (login) {
        clearTimeout(timer)
        if (id.length <= 0)
            document.getElementById("artist_respond").innerHTML = ""
        else
            timer = setTimeout(function () { genre(id); }, 300)
    }
}

async function genre(id) {
    if (login) {
        var ris = await fetch("/api/search_genre", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": localStorage.getItem("account"),
                "genres": id
            })
        }).then(function (res) { return res.json() })
        var string = ``
        for (i = 0; i < ris.length; i++) {
            string += `<button class="dropdown-item" onclick="add_genre('${ris[i]}')">${ris[i]}</button>`
        }

        if (string == "") {
            string = '<p class="dropdown-item">Nessun artista</p>'
        }
        document.getElementsByClassName("artista_search")[1].innerHTML = string
    }
}

async function add_genre(genre) {
    if (login) {
        var ris = await fetch("/api/add_genre", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": localStorage.getItem("account"),
                "genre": genre
            })
        }).then(res => { if (res.ok) vedi_genre_preferito() })
    }
}

async function vedi_genre_preferito() {
    if (login) {
        var string = "", ris = await fetch("/api/view_favorite_genre", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": localStorage.getItem("account"),
            })
        }).then(function (res) { return res.json() })
        console.log(ris)
        for (i = 0; i < ris.length; i++) {
            string += "<span class='artista_span'>" + ris[i] + ` <button class="btn btn-outline-danger" onclick="remove_genre('${ris[i]}')"><i class="bi bi-trash3-fill"></i></button></span>`
        }
        document.getElementById("genre").innerHTML = string
    }
}

async function remove_genre(id) {
    if (login) {
        await fetch("/api/delete_favorite_genre", {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": localStorage.getItem("account"),
                "genre": id
            })
        }).then(res => vedi_genre_preferito())
    }
}
