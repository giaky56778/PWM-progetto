require('dotenv').config()
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET

var url = "https://accounts.spotify.com/api/token";

function spotify_fetch() {
    return fetch(url, {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
    })
        .then(function (res) { return res.json() })
}

async function check_token(url) {
    if (process.env.ACCESS_TOKEN == null){
        await spotify_fetch().then(function(accesso){  process.env.ACCESS_TOKEN = accesso.access_token})
    }
    console.log(process.env.ACCESS_TOKEN)

    return await fetch(url, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + process.env.ACCESS_TOKEN
        }
    })
        .then(function(res){
            if (res.ok)
                return res.json()
            else
                if(res.status==401){
                    spotify_fetch().then(function(accesso){  process.env.ACCESS_TOKEN = accesso.access_token})
                    return check_token(url)
                }else{
                    console.log(res.status)
                }
        }) 
     
}

module.exports={check_token,spotify_fetch}
