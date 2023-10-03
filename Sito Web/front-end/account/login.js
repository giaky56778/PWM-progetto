if(localStorage.getItem("successo")!="true")
    localStorage.clear()

async function login_db() {
    var nome = document.getElementById("exampleInputEmail1").value
    var password = document.getElementById("inputPassword5").value
    console.log(nome, password)
    var json = await fetch("/api/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username": nome,
            "password": password
        })
    }).then(res => {
        if (res.ok)
            return res.json()
        else
            throw new Error();
    }).catch(function(){
        document.getElementsByClassName("error")[0].innerHTML = "ERRORE, Utente inesistente"
        document.getElementsByClassName("error")[0].style.backgroundColor="red"
    })
    if(json!=null){
        localStorage.setItem("account",json.user)
        localStorage.setItem("username",json.username)
        window.location.href = '/';
    }
}

if (localStorage.getItem("successo") == "true") {
    document.getElementsByClassName("error")[0].innerHTML = "Account creato con successo"
    document.getElementsByClassName("error")[0].style.backgroundColor = "green"
    localStorage.removeItem("successo")
}