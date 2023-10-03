async function home() {
    if (localStorage.getItem("account") == null) {
        home_default()
    } else {
        popolari = await fetch("/api/view_suggestion", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "id": localStorage.getItem("account")
            })
        }).then(function(res){
            if(res.ok)
                return res.json()
            else
                home_default()
            console.log(res.ok)
        })
        console.log(popolari)
        if(popolari!=null){
            var ris="<h6>Album Consigliati in base ai tuoi artisti e generi preferiti</h6>"
            for(i=0;i<popolari.tracks.length;i++){
                ris+=create_album(popolari.tracks[i].album)
            }
            document.getElementById("container-card").innerHTML=ris
        }
    }
}

async function home_default(){
    popolari = await interroga(null, "https://api.spotify.com/v1/users/spotify/playlists")
    var string = '<h6>Playlist Spotify</h6>'

    for (var i = 0; i < 20; i++) {
        string += create_playlist(popolari.items[i])
    }
    document.getElementById("container-card").innerHTML = string
}

function create_playlist(popolari,url) {
    if(url==null)
        url="/playlist/"
    console.log(popolari.images.length)
    var desc = popolari.description.replace(/<\/?[^>]+(>|$)/g, ""), name, img="#"
    if(popolari.images.length>0)
        img=popolari.images[0].url
    if (desc.length > lunghezza)
        desc = desc.substring(0, lunghezza) + " ...";

    if (popolari.name.length > lunghezza)
        name = popolari.name.substring(0, lunghezza) + " ...";
    else
        name = popolari.name;
    return `<a draggable="false" class=" g-3 card-song" margin-right="150px" href="`+url + popolari.id + `">
            <div class="card">
            <img draggable="false" class="card-img-top" src=" `+ img + ` ">
            <div class="card-body">
                <h6 id="card-title" class="card-title">`+ name + `</h6>
                <p id="card-overview" class="card-text">`+ desc + `</p>
            </div>
        </div>
    </a>`
}