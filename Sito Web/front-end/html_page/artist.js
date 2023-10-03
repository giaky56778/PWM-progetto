async function artist(id) {
    var artist = await interroga(id, "https://api.spotify.com/v1/artists/")
    document.getElementById("imgAlbum").src = artist.images[0].url
    document.getElementById("ascolta_spotify").href = artist.external_urls.spotify
    document.getElementById("album_info").innerHTML = `<h1>` + artist.name + `</h1>
            <p><b>Followers: </b> `+ artist.followers.total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + `</p>`
    if(localStorage.getItem('account')!=null){
        if(!(await check_artista(artist.id)))
            document.getElementById("album_info").innerHTML += `<br><button id="cuore_vuoto" class="btn btn-light" onclick="add_artist('${artist.id}')"><i class="bi bi-heart"></i> </button>`
        else
            document.getElementById("album_info").innerHTML += `<br><button id="cuore_fill" class="btn btn-light" onclick="remove_artist('${artist.id}')"><i class="bi bi-heart-fill"></i> </button>`
    }
    sfondo().then(color => document.getElementsByClassName("info-album")[0].style.backgroundImage = "radial-gradient(farthest-side at 0% 0%," + color.rgb + ", #121212)")

    
    artist = await interroga(id + "/albums?include_groups=album", "https://api.spotify.com/v1/artists/")
    var string=""
    console.log(artist)
    if(artist.items.length>0)
    {
        string = `<h3 class="col-md-10">Album</h3>
        </div><div class="row scrollmenu" style="margin-bottom:4vh">`
        for (i = 0; i < artist.items.length; i++) {
            string+=create_album(artist.items[i])
        }
    }
    artist = await interroga(id + "/albums?include_groups=single", "https://api.spotify.com/v1/artists/")
    if (artist.items.length != 0) {
        string += `</div><div class="row" style="margin-bottom:4vh"><h3 class="col-md-10">Singoli</h3>
        </div><div class="row scrollmenu" style="margin-bottom:4vh">`
        for (i = 0;i<artist.items.length; i++) { 
            var name
            if (artist.items[i].name.length > lunghezza - 8) {
                name = artist.items[i].name.substring(0, lunghezza - 8) + " ...";
            } else
                name = artist.items[i].name;
            string += `<a draggable="false" class=" g-3 card-song" href="../album/` + artist.items[i].id + `">
            <div class="card">
                <img draggable="false" class="card-img-top" src=" `+ artist.items[i].images[1].url + ` ">
                <div class="card-body">
                    <h6 id="card-title" class="card-title">`+ name + `</h6>
                    <p id="card-overview" class="card-text">`+ artist.items[i].release_date + `</p>
                </div>
            </div>
        </a>`
        }
    }
    string += "</div>"

    document.getElementById("artist_album").innerHTML = string
}

function create_album(artist) {
    var name
    if (artist.name.length > lunghezza - 8) {
        name = artist.name.substring(0, lunghezza - 8) + " ...";
    } else
        name = artist.name;
    return `<a draggable="false" class=" g-3 card-song" href="../album/` + artist.id + `">
                <div class="card">
                    <img draggable="false" class="card-img-top" src=" `+ artist.images[1].url + ` ">
                    <div class="card-body">
                        <h6 id="card-title" class="card-title">`+ name + `</h6>
                        <p id="card-overview" class="card-text">`+ artist.release_date + `</p>
                    </div>
                </div>
            </a>`
}

async function check_artista(id){
    var check=false, ris = await fetch("/api/view_favorite_artist",{
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username":localStorage.getItem("account"),
        })}).then(function(res){return res.json()})
        console.log(ris)
    for(i=0;i<ris.artists.length;i++){
        console.log(ris.artists[i].id==id)
        if(ris.artists[i].id==id){
            check=true
            break
        }
    }
    return check
}