var lista_tag = []
function aggiungi_tag_temp() {
    var valore = document.getElementById("tag").value, flag = true;
    document.getElementById("tag").value = ""
    if (valore.length != "") {
        for (i = 0; i < lista_tag.length; i++)
            if (lista_tag[i] == valore) {
                flag = false
                break
            }
        if (flag) {
            lista_tag.push(valore.replace(/<\/?[^>]+(>|$)/g,""))
            mostra_tag_temp()
        }
    }
}
function elimina_tag_temp(indice) {
    lista_tag.splice(indice, 1)
    mostra_tag_temp()
}

function mostra_tag_temp() {
    string = "<h3>Lista dei tag aggiunti </h3>"
    console.log(lista_tag)
    for (i = 0; i < lista_tag.length; i++) {
        string += "<span class='artista_span'>" + lista_tag[i] + ` <button class="btn btn-outline-danger" onclick="elimina_tag_temp('${i}')"><i class="bi bi-trash3-fill"></i></button></span>`
    }
    document.getElementById("tag_lis").innerHTML = string
}

async function create_my_playlist() {
    var nome = document.getElementById("playlist_name").value
    var desc = document.getElementById("descrizione").value
    if (nome.length > 0) {
        fetch("/api/create_my_playlist", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "creator": localStorage.getItem("account"),
                "nome": nome.replace(/<\/?[^>]+(>|$)/g,""),
                "descr": desc.replace(/<\/?[^>]+(>|$)/g,""),
                "tag": lista_tag,
                "public": true,
                "data": new Date()
            })
        })
            .then(res => res.json())
            .then(function (res) {
                console.log(res)
                window.location.href = '/my_playlist/' + res._id;
            })
    }else{
        console.log( document.getElementsByClassName("g-5 row justify-content-center")[0])
        document.getElementsByClassName("error")[0].innerHTML="ERRORE! Devi inserire un nome alla playlist"
        document.getElementsByClassName("error")[0].style.background="red"
    }
}

if(localStorage.getItem("account")==null){
    window.location.href = '../login/';
}