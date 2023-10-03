var timer
document.getElementById("container-song").style.overflow="hidden"
async function search(id) {
    console.log(id)
    clearTimeout(timer)
    timer = setTimeout(function () { mostra_cerca(id); }, 300)
}

function cambia(obj){
    document.getElementsByClassName("active")[0].classList.remove("active")
    document.getElementById(obj).classList.add("active")
    var array=["brano","artista","album","playlist"],i=0
    if(obj!="tutto"){
        array.forEach(element => {
            if(obj != element){
                document.getElementsByClassName("search")[i].style.display="none"
            }else{
                document.getElementsByClassName("search")[i].style.display="initial"
            }
            i++
        });
    }else
        for(i=0;i<array.length;i++){
            document.getElementsByClassName("search")[i].style.display="initial"
        }
}

async function mostra_cerca(id) {
    document.getElementById("container-song").style.overflow="auto"
    var cerca = await interroga(id + `&type=album%2Cartist%2Ctrack%2Cplaylist&limit=10`, "https://api.spotify.com/v1/search?q=")
    console.log(cerca)
    var playlist = "", album="",artist="",brano=""

    for (i = 0; i < 10; i++) {
        playlist+=create_playlist(cerca.playlists.items[i])
        album+=create_album(cerca.albums.items[i])
        artist+=create_artist(cerca.artists.items[i])
        brano+=create_track_search(cerca.tracks.items[i],i+1)
    }
        document.getElementById("cerca_album").innerHTML = album
        document.getElementById("album_category_title").innerHTML = "Album"
        document.getElementById("cerca_playlist").innerHTML =  playlist
        document.getElementById("playlist_category_title").innerHTML =  "Playlist"
        document.getElementById("cerca_artista").innerHTML = artist
        document.getElementById("artist_category_title").innerHTML = "Artista"
        document.getElementById("brano_category_title").innerHTML = "Brano"
        document.getElementById("cerca_brano").innerHTML = `<table>
                                                            <thead class="stick" id="tabella_head">
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Titolo</th>
                                                                <th>Album</th>
                                                                <th><i class="far fa-clock"></i></th>
                                                                <th></th>
                                                            </tr></thead><tbody class="table-hover" id="tabella_container">`+brano+"</tbody></table>"
    
}

function create_artist(artist,i){
    if(artist.images.length!=0)
        return `<a draggable="false" class=" g-3 card-song" href="../artist/` + artist.id + `">
                    <div class="card" style="height:16em !important">
                        <img draggable="false" style="" class="card-img-top" src=" `+ artist.images[1].url + ` ">
                        <div class="card-body">
                            <h6 id="card-title" class="card-title">`+ artist.name + `</h6>
                        </div>
                    </div>
                </a>`
    else
        return ""
}

function create_track_search(album,num) {
    console.log(album)
    var artisti = "&nbsp;<a draggable='false' class='overalbum' href='../artist/" + album.album.artists[0].id + "'>" + album.album.artists[0].name + "</a>",string=""
    var count = album.album.artists[0].name.length, j = 1
    while (j < album.album.artists.length && count < lunghezza) {
        count += album.album.artists[j].name.length
        if (count < lunghezza)
            artisti += "<span>, </span><a draggable='false' class='overalbum' href='../artist/" + album.album.artists[j].id + "'>" + album.album.artists[j].name + "</a>"
        else
            artisti += "<span>, </span><a draggable='false' class='overalbum' href='../artist/" + album.album.artists[j].id + "'>" + album.album.artists[j].name.substring(0, lunghezza - count) + "</a>"
        j++
    }

    string += `<tr>
                <td>`+ num + `</td>
                <td><img draggable='false' src='`+ album.album.images[2].url + `' width='40px' style='margin-right:15px'/>
                <div class='row' style="margin-left:50px;margin-top:-42px;height:45px"><p>`
    if (album.name.length > lunghezza + 15)
        string += album.name.substring(0, lunghezza + 10) + "...";
    else
        string += album.name;

    string += "<br>"
    if (album.explicit)
        string += '<i class="explicit fas fa-exclamation-circle"></i>'
    string += artisti;

    string += `</div></td>
                <td><a draggable='false' class='overalbum' href='../album/`+ album.album.id + `'>`
    if (album.album.name.length > lunghezza)
        string += album.album.name.substring(0, lunghezza) + "...";
    else
        string += album.album.name;
    string += `</a></td>
                <td>`+ convert_time_track(album.duration_ms) + `</td>`
    if(localStorage.getItem("account")!=null){
        string +=`<td>
            <div class="btn-group add_song">
            <button onclick="mostra_droplist(${num},'${album.name.replace(/[^a-zA-Z0-9\s]/g, '')}','${album.id}')" type="button" class="btn btn-dark" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-plus-square"></i></button>
            <ul class="dropdown-menu" id='droplist-${num}'></ul></div></td>`
    }
    string+=`</tr>`
    return string
}