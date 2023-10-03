async function playlist(id) {
    album = await interroga(id, "https://api.spotify.com/v1/playlists/")
    var continua, tempoTotale = 0, num = 0, string = "", infoBar = `<h1>` + album.name + `</h1>
                                                    <p>`+ album.description + `</p>
                                                    <span id="creata"><b>Creata da:</b> ` + album.owner.display_name + `</span>
                                                    <p><b>Followers</b>: `+ album.followers.total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + `</p>`
    document.getElementById("imgAlbum").src = album.images[0].url
    sfondo().then(color => document.getElementsByClassName("info-album")[0].style.backgroundImage = "radial-gradient(farthest-side at 0% 0%," + color.rgb + ", #121212)")
    document.getElementById("tabella_head").innerHTML = `<tr>
                                                            <th>#</th>
                                                            <th style="width:450px">Titolo</th>
                                                            <th id="tabella_album">Album</th>
                                                            <th><i class="bi bi-clock-fill"></i></th>
                                                            <th></th>
                                                        </tr>`
    document.getElementById("ascolta_spotify").href = album.external_urls.spotify
    do {
        continua = album.tracks.next
        for (i = 0; i < album.tracks.items.length; i++) {
            
            if (album.tracks.items[i].track != null) {
                num++
                string += create_track(album.tracks.items[i], num, 0);
                tempoTotale += album.tracks.items[i].track.duration_ms
            }

        }
        if (album.tracks.next != null) {
            temp = await interroga(null, album.tracks.next)
            album = { tracks: temp }
        }
    } while (continua != null)
    document.getElementById("tabella_container").innerHTML = string
    infoBar += `<p>` + num + ` brani totali per un totale di ` + convert_time(tempoTotale) + "</p>"
    document.getElementById("album_info").innerHTML = infoBar

}

function create_track(album, num, option) {
    var string = ""
        var artisti = "&nbsp;<a draggable='false' class='overalbum' href='../artist/" + album.track.album.artists[0].id + "'>" + album.track.album.artists[0].name + "</a>"
        var count = album.track.album.artists[0].name.length, j = 1
        while (j < album.track.album.artists.length && count < lunghezza) {
            count += album.track.album.artists[j].name.length
            if (count < lunghezza)
                artisti += "<span>, </span><a draggable='false' class='overalbum' href='../artist/" + album.track.album.artists[j].id + "'>" + album.track.album.artists[j].name + "</a>"
            else
                artisti += "<span>, </span><a draggable='false' class='overalbum' href='../artist/" + album.track.album.artists[j].id + "'>" + album.track.album.artists[j].name.substring(0, lunghezza - count) + "</a>"
            j++
        }

        string += `<tr>
                <td>`+ num + `</td>
                <td><img draggable='false' src='`+ album.track.album.images[2].url + `' width='40px' style='margin-right:15px'/>
                <div class='row' style="margin-left:50px;margin-top:-42px;height:45px"><p>`
        if (album.track.name.length > lunghezza + 15)
            string += album.track.name.substring(0, lunghezza + 10) + "...";
        else
            string += album.track.name;

        string += "<br>"
        if (album.track.explicit)
            string += '<i class="explicit fas fa-exclamation-circle"></i>'
        string += artisti;

        string += `</div></td>
                <td><a draggable='false' class='overalbum' href='../album/`+ album.track.album.id + `'>`
        if (album.track.album.name.length > lunghezza)
            string += album.track.album.name.substring(0, lunghezza) + "...";
        else
            string += album.track.album.name;
        string += `</a></td>
                <td>`+ convert_time_track(album.track.duration_ms) + `</td>`
        if (localStorage.getItem("account") != null)
            if (option == 0) {
                string += `<td>
                        <div class="btn-group add_song">
                        <button onclick="mostra_droplist(${num},'${album.track.name.replace(/[^a-zA-Z0-9\s]/g, '')}','${album.track.id}')" type="button" class="btn btn-dark" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-plus-square"></i></button>
                        <ul class="dropdown-menu" id='droplist-${num}'></ul></div></td>
                    </tr>`
            } else {
                string += `<td><button onclick="remove_track('${album.track.name}','${album.track.id}')"class="btn btn-danger"><i class="bi bi-x-square"></i></button></td></tr>`
            }
    return string
}