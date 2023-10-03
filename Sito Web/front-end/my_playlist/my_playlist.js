var owner, id, remove_spotify = true

async function view_my_playlist(id_playlist) {
    id = id_playlist
    if (remove_spotify) {
        document.getElementById("ascolta_spotify").remove()
        remove_spotify = false
    }
    var album = await fetch("/api/view_my_playlist", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "id": id,
            "creator": localStorage.getItem("account")
        })
    })
        .then(function (res) {
            return res.json()
        })
    if (album != null) {
        var user = await fetch("/api/account_info", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": album.creator
            })
        })
            .then(function (res) {
                return res.json()
            })
        var public = album.public, infoBar = '<h1>'
        if (public)
            infoBar += '<i id="img_public_playlist" class="bi bi-unlock-fill"></i>'
        else
            infoBar += '<i id="img_public_playlist" class="bi bi-lock-fill"></i>'
        var followers = await fetch("/api/count_follower", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "playlist": id
            })
        }).then(function (res) { return res.json() })
        var tempoTotale = 0, string = ""
        infoBar += album.nome + `</h1>
                                    <p>`+ album.descr + `</p>
                                    <span id="creata"><b>Creata da:</b> ` + user.username + `</a></span>
                                    <p><b>Followers</b>: <span id="visual_follow">`+ followers.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + `</span></p>
                                    <p id="total_tracks"></p>
                                    <br><p id="tag"><b>Tag: </b>`
        if (album.tag != null && album.tag.length != 0) {
            for (i = 0; i < album.tag.length; i++) {
                infoBar += `<span class='artista_span'>${album.tag[i]}</span>`
            }
        } else {
            infoBar += '<span> Non presenti</span>'
        }
        infoBar += "</p>"
        console.log(album.creator== localStorage.getItem("account"))
        if (album.creator== localStorage.getItem("account")) {
            console.log("ok")
            infoBar += `<a href='../change_my_playlist/${album._id}' class="btn btn-light"><i class="bi bi-pencil-fill"></i> Impostazioni</a>`
            if (album.public)
                infoBar += `<button id="privata" class='btn btn-success' onclick="cambia_privata(false)">Rendi privata</button>`
            else
                infoBar += `<button id="privata" class='btn btn-success' onclick="cambia_privata(true)">Rendi pubblica</button>`
        } else {
            if(localStorage.getItem("account")!=null){
                var follow = await fetch("/api/check_follow", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "user": localStorage.getItem("account"),
                        "playlist": id
                    })
                }).then(function(res){return res.json()})
                if(follow==0)
                    infoBar += `<br><button onclick="aggiungi_follow()" id="follow" class="btn btn-light"><i class="bi bi-star"></i></button>`
                else
                    infoBar += `<br><button onclick="rimuovi_follow()" id="follow" class="btn btn-light"><i class="bi bi-star-fill"></i></button>`
            }
        }

        var img = "/img/727616.png"
        if (album.tracks_id != null && album.tracks_id.length > 0) {
            var track = await interroga(album.tracks_id[0], "https://api.spotify.com/v1/tracks/")
            img = track.album.images[0].url
        }
        document.getElementById("imgAlbum").src = img
        sfondo().then(color => document.getElementsByClassName("info-album")[0].style.backgroundImage = "radial-gradient(farthest-side at 0% 0%," + color.rgb + ", #121212)")
        document.getElementById("tabella_head").innerHTML = `<tr>
                                                                <th>#</th>
                                                                <th style="width:450px">Titolo</th>
                                                                <th id="tabella_album">Album</th>
                                                                <th><i class="bi bi-clock-fill"></i></th>
                                                                <th></th>
                                                            </tr>`
        document.getElementById("album_info").innerHTML = infoBar
        if (album.tracks_id == null || album.tracks_id.length == 0) {
            document.getElementById("tabella_container").innerHTML = "<tr><td colspan='5' class='text-center'><b>Brani non presenti</b><tr>"
        } else {
            var url = "https://api.spotify.com/v1/tracks?ids=" + album.tracks_id[0]
            for (i = 1; i < album.tracks_id.length; i++) {
                url += "%2C" + album.tracks_id[i]
            }
            var tracks = await interroga(null, url), string = "", option = 0
            if (window.location.pathname.substring(0, 12) == '/my_playlist' && album.creator == localStorage.getItem("account"))
                option = 1
            for (i = 0; i < album.tracks_id.length; i++) {
                string += create_track({ track: tracks.tracks[i] }, i+1, option)
                tempoTotale += tracks.tracks[i].duration_ms
            }
            document.getElementById("tabella_container").innerHTML = string
            document.getElementById("total_tracks").innerHTML = tracks.tracks.length + ` brani totali per un totale di ` + convert_time(tempoTotale)
        }
    } else {
        document.getElementById("container-song").innerHTML = "<div class='error text-center' style='background:red'><h5>La playlist è privata o non esiste</h5></div>"
    }

}

async function cambia_privata(val) {
    await fetch("/api/modifica_privato", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "id": id,
            "creator": localStorage.getItem("account"),
            "public": val
        })
    })
    document.getElementById("privata").remove()
    var lucchetto = document.getElementById("img_public_playlist")
    if (lucchetto.classList[1] == 'bi-unlock-fill') {
        lucchetto.classList.remove('bi-unlock-fill')
        lucchetto.classList.add('bi-lock-fill')
        document.getElementById("visual_follow").innerHTML=0
    } else {
        lucchetto.classList.add('bi-unlock-fill')
        lucchetto.classList.remove('bi-lock-fill')
    }
    var infoBar = ""
    if (val) {
        infoBar += `<button id="privata" class='btn btn-success' onclick="cambia_privata(false)">Rendi privata</button>`
    } else {
        infoBar += `<button id="privata" class='btn btn-success' onclick="cambia_privata(true)">Rendi pubblica</button>`
    }
    document.getElementById("album_info").innerHTML += infoBar
}

async function remove_track(name, trackid) {
    await fetch("/api/remove_track", {
        method: "delete",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "playlist": id,
            "id": trackid,
            "name": name
        })
    }).then(function () { view_my_playlist(id);view_album_laterale() })
}

function aggiungi_follow() {
    fetch("/api/aggiungi_follow", {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "playlist": id,
            "account": localStorage.getItem("account")
        })
    }).then(function(){view_album_laterale()})
    var f=document.getElementById("visual_follow")
    f.innerHTML=parseInt(f.innerHTML)+1
    document.getElementById("follow").remove()
    document.getElementById("album_info").innerHTML += `<button onclick="rimuovi_follow()" id="follow" class="btn btn-light"><i class="bi bi-star-fill"></i></button>`
    
}

function rimuovi_follow() {
    fetch("/api/rimuovi_follow", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "playlist": id,
            "account": localStorage.getItem("account")
        })
    }).then(function(){view_album_laterale()})
    var f=document.getElementById("visual_follow")
    f.innerHTML=parseInt(f.innerHTML)-1
    document.getElementById("follow").remove()
    document.getElementById("album_info").innerHTML += `<button onclick="aggiungi_follow()" id="follow" class="btn btn-light"><i class="bi bi-star"></i></button>`

}
