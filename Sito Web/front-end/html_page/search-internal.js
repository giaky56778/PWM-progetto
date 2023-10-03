var timer, ricerca = 0
document.getElementById("container-song").style.overflow = "hidden"
async function search(id) {
    clearTimeout(timer)
    timer = setTimeout(function () { mostra_cerca(id); }, 300)
}

async function mostra_cerca(id) {
    console.log(id)
    var ris = await fetch("/api/cerca_interna", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "cerca": id,
            "creator": localStorage.getItem("account"),
            "option": ricerca
        })
    }).then(function (res) { return res.json() })
    console.log(ris)
    if (ris != null) {
        var string="",track

        console.log(ris)

        for (var i = 0; i < 20 && i < ris.length; i++) {
            var desc = ris[i].descr.replace(/<\/?[^>]+(>|$)/g, ""), name, img = "/img/727616.png",url = "../my_playlist/"
            if (ris[i].tracks_id != null && ris[i].tracks_id.length > 0){
                track = await interroga(ris[i].tracks_id[0], "https://api.spotify.com/v1/tracks/")
                img = track.album.images[0].url
            }
            if (desc.length > lunghezza)
                desc = desc.substring(0, lunghezza) + " ...";

            if (ris[i].nome.length > lunghezza)
                name = ris[i].nome.substring(0, lunghezza) + " ...";
            else
                name = ris[i].nome;
            string += `<a draggable="false" class=" g-3 card-song" margin-right="150px" href="` + url + ris[i]._id + `">
                <div class="card">
                <img draggable="false" class="card-img-top" src=" `+ img + ` ">
                <div class="card-body">
                    <h6 id="card-title" class="card-title">`+ name + `</h6>
                    <p id="card-overview" class="card-text">`+ desc + `</p>
                </div>
            </div>
        </a>`
        }
        document.getElementById("my_playlist").innerHTML = string
    } else {
        document.getElementById("my_playlist").innerHTML = ""
    }
}

function cambia(obj) {
    document.getElementsByClassName("active")[0].classList.remove("active")
    document.getElementById(obj).classList.add("active")
    ricerca = obj
}