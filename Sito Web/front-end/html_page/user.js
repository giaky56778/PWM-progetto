async function user(id) {
    var user = await interroga(id,"https://api.spotify.com/v1/users/")
    console.log(user)
    document.getElementById("ascolta_spotify").href=user.external_urls.spotify
    document.getElementById("album_info").innerHTML=`<h1>`+user.display_name+`</h1>
    <p><b>Followers: </b> `+user.followers.total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.")+`</p>`
    
    user = await interroga(id+"/playlists","https://api.spotify.com/v1/users/")
    console.log(user)
    if(user.items.length !=0){
        var string=`<h3 class="col-md-10">Playlist</h3>`
        if(user.items.length > 6)
            string+=`<a class="col-md-2"href='#'>Mostra tutti</a>`
        string+=`<div class="row" style="margin-bottom:4vh">`
        for(i=0;i<user.items.length && i<6;i++){
            string+=create_playlist(user.items[i],"../playlist/")
        }
    }else{
        string+="<p>Nessuna playlist presente</p>"
    }
    string+="</div>"
    document.getElementById("artist_album").innerHTML=string
}