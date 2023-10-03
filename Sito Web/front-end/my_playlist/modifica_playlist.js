var id
async function elimina_tag_def(tag){
    await fetch("/api/delete_tag", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "playlist":id,
            "tag":tag.replace(/<\/?[^>]+(>|$)/g,"")
        })
    })
    mostra_tag_def()
}

async function aggiungi_tag(){
    var val= document.getElementById("tag").value
    if (val.length != ""){
        await fetch("/api/add_tag", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "playlist":id,
                "tag":val.replace(/<\/?[^>]+(>|$)/g,"")
            })
        })
        document.getElementById("tag").value=""
        mostra_tag_def()
    }
}

async function mostra_tag_def() {
    var lista_tag=await fetch("/api/view_my_playlist", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "id":id
        })
    }).then(function(res){return res.json()})
    string = "<h3>Lista dei tag</h3>"
    console.log(lista_tag!=null)
    if(lista_tag!=null && lista_tag.tag.length>0){
        for (i = 0; i < lista_tag.tag.length; i++) {
            string += "<span class='artista_span'>" + lista_tag.tag[i] + ` <button class="btn btn-outline-danger" onclick="elimina_tag_def('${lista_tag.tag[i]}')"><i class="bi bi-trash3-fill"></i></button></span>`
        }
        document.getElementById("tag_lis").innerHTML = string
    }else{
        document.getElementById("tag_lis").innerHTML = ""
    }
}

async function view_my_change_playlist(id_int){
    id=id_int
    var ris=await fetch("/api/view_my_playlist", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "id":id_int,
            "creator":localStorage.getItem("account")
        })
    }).then(function(res){return res.json()})
    console.log(ris)
    if(ris!=null && localStorage.getItem("account")!=null && localStorage.getItem("account")==ris.creator){
        mostra_tag_def()
        document.getElementById('playlist_name').value=ris.nome
        document.getElementById('descrizione').value=ris.descr
    }else{
        document.getElementsByClassName("g-5 row justify-content-center")[0].remove()
        document.getElementById("container-song").innerHTML = "<div class='error text-center' style='background:red'><h5>NON PUOI ACCEDERE ALLE MODIFICHE DELLE PLAYLIST NON TUE</h5></div>"

    }
}

async function update_my_playlist(){
    var nome=document.getElementById("playlist_name").value
    var desc=document.getElementById("descrizione").value
    await fetch("/api/modifica_playlist", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "playlist":id,
            "desc":desc.replace(/<\/?[^>]+(>|$)/g,""),
            "nome":nome.replace(/<\/?[^>]+(>|$)/g,""),
            "creator":localStorage.getItem("account")
        })
    }).then(function(){
        view_album_laterale();        
        document.getElementsByClassName("error")[0].innerHTML = "Modificata con successo"
        document.getElementsByClassName("error")[0].style.background="green"
    })
}

async function cancella_playlist(){
    await fetch("/api/delete_playlist", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "playlist":id,
            "creator":localStorage.getItem("account")
        })
    })
    window.location.href = '/';
}