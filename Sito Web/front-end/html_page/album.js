var lista = get_lista_playlista()

async function get_lista_playlista() {
    return await fetch("/api/my_playlists_add_track", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username": localStorage.getItem("account"),
        })
    }).then(function (res) { return res.json() })
}
async function album(id) {
    var album = await interroga(id, "https://api.spotify.com/v1/albums/")
    document.getElementById("ascolta_spotify").href = album.external_urls.spotify
    document.getElementById("imgAlbum").src = album.images[0].url
    sfondo().then(color => document.getElementsByClassName("info-album")[0].style.backgroundImage = "radial-gradient(farthest-side at 0% 0%," + color.rgb + ", #121212)")

    var num = 0, string = `<h1>` + album.name + `</h1>
                    <p>Rilasciato il `+ album.release_date + `</p>
                    <p>`
    for (i = 0; i < album.copyrights.length; i++) {
        testo = album.copyrights[i].text
        if (testo[0] == '℗' || testo[0] == '©' || testo[0] == '®')
            string += "<br>" + testo
        else {
            if (testo.substring(0, 3) == '(P)' || testo.substring(0, 3) == '(C)' || testo.substring(0, 3) == '(R)')
                testo = testo.substring(3, testo.length)
            if (album.copyrights[i].type == 'C')
                string += '<br>&copy;'
            else if (album.copyrights[i].type == 'P')
                string += '<br>&copysr;'
            else
                string += '<br>&reg;'
            string += testo
        }
    }
    document.getElementById("album_info").innerHTML = string + "</p>"
    document.getElementById('tabella_head').innerHTML = `
                        <tr>
                            <th style="width:25px">#</th>
                            <th style="width:450px">Titolo</th>
                            <th><i class="bi bi-clock-fill"></i></th>
                            <th></th>
                        </tr>`

    var continua, tempoTotale = 0
    string = ""
    do {
        continua = album.tracks.next
        for (i = 0; i < album.tracks.items.length; i++) {

            tempoTotale += album.tracks.items[i].duration_ms
            num++
            var artisti = "&nbsp;<a draggable='false' class='overalbum' href='../artist/" + album.tracks.items[i].artists[0].id + "'>" + album.tracks.items[i].artists[0].name + "</a>"
            var count = album.tracks.items[i].artists[0].name.length, j = 1
            while (j < album.tracks.items[i].artists.length && count < lunghezza) {
                count += album.tracks.items[i].artists[j].name.length
                if (count < lunghezza)
                    artisti += "<span>, </span><a draggable='false' class='overalbum' href='../artist/" + album.tracks.items[i].artists[j].id + "'>" + album.tracks.items[i].artists[j].name + "</a>"
                else
                    artisti += "<span>, </span><a draggable='false' class='overalbum' href='../artist/" + album.tracks.items[i].artists[j].id + "'>" + album.tracks.items[i].artists[j].name.substring(0, lunghezza - count) + "</a>"
                j++
            }

            string += `<tr>
                        <td>`+ num + `</td>
                        <td>`
            if (album.tracks.items[i].name.length > lunghezza + 15)
                string += album.tracks.items[i].name.substring(0, lunghezza + 10) + "...";
            else
                string += album.tracks.items[i].name;

            string += "<br>"
            if (album.tracks.items[i].explicit)
                string += '<i class="explicit fas fa-exclamation-circle"></i>'

            string += artisti + `</td>
                        <td>`+ convert_time_track(album.tracks.items[i].duration_ms) + `</td>`
            if (localStorage.getItem('account') != null) {

                string += `<td>
                <div class="btn-group add_song">
                <button onclick="mostra_droplist(${i},'${album.tracks.items[i].name.replace(/[^a-zA-Z0-9\s]/g, '')}','${album.tracks.items[i].id}')" type="button" class="btn btn-dark" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-plus-square"></i></button>
                <ul class="dropdown-menu" id='droplist-${i}'></ul></div></td>`
            }
            string += '</tr>'
        }
        if (album.tracks.next != null) {
            temp = await interroga(null, album.tracks.next)
            album = { tracks: temp }
        }
    } while (continua != null)
    var container = document.getElementById("tabella_container").innerHTML += string

    container.innerHTML = string
    document.getElementById("album_info").innerHTML += `<p>` + album.tracks.total + ` brani totali per un totale di ` + convert_time(tempoTotale) + "</p>"
}

function mostra_droplist(indice,nomeTrack,idTrack) {
    lista.then(function (lista) {
        var string = ""
        for (j = 0; j < lista.length; j++) {
            string += `<li><button class="dropdown-item" onclick="aggiungi_brano_playlist('${lista[j]._id}','${nomeTrack}','${idTrack}')">${lista[j].nome}</button></li>`
        }
        if(string=="")
            document.getElementById("droplist-" + indice).innerHTML = "<p class='dropdown-item'>Non presenti</p>"
        else
            document.getElementById("droplist-" + indice).innerHTML = string
    })
}

async function aggiungi_brano_playlist(playlist,nomeTrack,idTrack){
    await fetch("/api/add_track", {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "playlist": playlist,
            "trackId": idTrack,
            "trackName": nomeTrack,
            "username": localStorage.getItem("account")
        })
    }).then(function(){ view_album_laterale() })
}