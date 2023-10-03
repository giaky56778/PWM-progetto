var timer
if(window.location.pathname.substring(0,15)=='/change_profile')
    vedi_artista_preferito()

async function search_artista(id) {
    clearTimeout(timer)
    if(id.length<=0)
        document.getElementById("artist_respond").innerHTML=""
    else
        timer = setTimeout(function () { artista(id); }, 300)
}

async function artista(artista){
    var cerca = await interroga(artista + `&type=artist&limit=10`, "https://api.spotify.com/v1/search?q=")
    console.log(cerca)
    var string=""
    for(i=0;i<cerca.artists.items.length;i++){
        string+=`<button class="dropdown-item" onclick="add_artist('${cerca.artists.items[i].id}')">${cerca.artists.items[i].name}</button>`
    }
    if(string==""){
        string='<p class="dropdown-item">Nessun genere</p>'
    }
    document.getElementsByClassName("artista_search")[0].innerHTML=string
}

async function add_artist(id){
    await fetch("/api/add_favorite_artist",{
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username":localStorage.getItem("account"),
            "artist":id
        })}).then( function(res) {
            if(res.ok)
                if(window.location.pathname.substring(0,7)!='/artist')
                    vedi_artista_preferito()
                else{
                    document.getElementById("cuore_vuoto").remove()
                    document.getElementById("album_info").innerHTML += `<button id="cuore_fill" class="btn btn-light" onclick="remove_artist('${id}')"><i class="bi bi-heart-fill"></i> </button>`
                }
        })
}

async function vedi_artista_preferito(){
    if(localStorage.getItem("account")!=null){
        var string="", ris = await fetch("/api/view_favorite_artist",{
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username":localStorage.getItem("account"),
            })}).then(function(res){return res.json()})
            console.log(ris)
        for(i=0;i<ris.artists.length;i++){
            string+="<span class='artista_span'>"+ris.artists[i].name+` <button class="btn btn-outline-danger" onclick="remove_artist('${ris.artists[i].id}')"><i class="bi bi-trash3-fill"></i></button></span>`
        }
        document.getElementById("artisti").innerHTML=string
    }
}

async function remove_artist(id){
    await fetch("/api/delete_favorite_artist",{
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username":localStorage.getItem("account"),
            "artist":id
        })}).then(function(){
            if(window.location.pathname.substring(0,7)!='/artist')
                vedi_artista_preferito()
            else{
                document.getElementById("cuore_fill").remove()
                document.getElementById("album_info").innerHTML += `<button id="cuore_vuoto" class="btn btn-light" onclick="add_artist('${id}')"><i class="bi bi-heart"></i> </button>`

            }
        })
}

console.log(window.location.pathname.substring(0,7))