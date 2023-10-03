const fac = new FastAverageColor();
const lunghezza = 30

function convert_time(milliseconds) {
    seconds = Math.floor((milliseconds / 1000) % 60);
    minutes = Math.floor((milliseconds / 1000 / 60) % 60);
    hours = Math.floor((milliseconds / 1000 / 60 / 60));
    if (hours == 0)
        return minutes + " min " + seconds.toString().padStart(2, '0') + " sec."
    else
        return hours + " ore " + minutes + " min "
}

function convert_time_track(milliseconds) {
    seconds = Math.floor((milliseconds / 1000) % 60);
    minutes = Math.floor((milliseconds / 1000 / 60));
    return minutes + ":" + seconds.toString().padStart(2, '0')
}

function interroga(id, url) {
    if (id != null)
        url += id
    return fetch("/api/get_json", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "url": url
        })

    })
        .then(res => res.json())
        .then(function (res) {
            if (res.token != window.localStorage.getItem('token'))
                window.localStorage.setItem('token', res.token)
            return res
        })
}

async function check_login() {
    if (localStorage.getItem('account') == null) {
        document.getElementById("container-album").innerHTML = `<h5>Crea la tua prima playlist</h5><a href="/crea_playlist" class="btn btn-light">Crea</a>`
        document.getElementsByClassName("col-md-3")[0].style.height = '88vh'
        document.getElementsByClassName("col-md-9")[0].style.height = '88vh'

        var footer = document.getElementsByClassName("footer")[0]
        footer.classList.add('login-no-check')
        footer.innerHTML = `<div class="col-md-10">
                            <h6>Anteprima</h6>
                            <p>Iscriviti per riprodurre le canzoni e creare album</p>
                        </div>
                        <div class="col-md-2">
                            <a class="login btn btn-light" href="/login">Accedi</a>
                            <a class="login btn btn-dark" href="/register">Iscriviti</a>
                        </div>`
    } else {
        document.getElementsByClassName("footer row rounded-2")[0].innerHTML = `
        <div class="row row_login">
            <div class="btn-group">
                <button type="button" class="btn btn-success dropdown-toggle" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i class="bi bi-person-circle"></i>
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/change_profile">Profilo</a></li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li><button class="btn btn-danger" onclick="logout()">Logout</button></li>
                </ul>
            </div>
        </div>`
        document.getElementsByClassName("btn btn-success dropdown-toggle")[0].innerHTML += localStorage.getItem("username")
        view_album_laterale()
    }
}
function sfondo() {
    return fac.getColorAsync(document.getElementById("imgAlbum"))
        .then(function (color) {
            return color;
        }
        )
        .catch(e => {
            console.log(e);
        });
}

function logout() {
    localStorage.clear()
    window.location.href = '/';
}

async function view_album_laterale() {
    var album_lat = await fetch("/api/my_playlists", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username": localStorage.getItem("account"),
        })
    }).then(function (res) { return res.json() })
    if (album_lat.length == 0) {
        document.getElementById("container-album").innerHTML = `<h5>La tua libreria</h5><h5>Crea la tua prima playlist</h5><a href="/crea_playlist" class="btn btn-light">Crea</a>`
    } else {
        var string = `<h5>La tua libreria</h5><a href="/crea_playlist" class="btn btn-light">Crea</a><div class='row'>`
        
        for (k = 0; k < album_lat.length; k++) {
            var nome = album_lat[k].nome
            if (nome.length > lunghezza)
                nome = nome.substring(0, lunghezza) + " ...";
            string += `<a class="album-card" href="../my_playlist/${album_lat[k]._id}"><div class="row" style="margin-top:20px">
                    <img style="width:75px" class="col-md-3" src='`
            if (album_lat[k].tracks_id != null && album_lat[k].tracks_id.length > 0) {
                var track = await interroga(album_lat[k].tracks_id[0], "https://api.spotify.com/v1/tracks/")
                string += track.album.images[0].url
            } else {
                string += "/img/727616.png"
            }
            string += `'>
                    <div class="col-md-9">
                        <p>`+ nome + `</p>
                    </div></div></a>`
        }
        string += '</div>'
        
        document.getElementById("container-album").innerHTML = string
    }
}

