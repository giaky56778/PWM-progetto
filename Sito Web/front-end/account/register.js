var regex= /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

localStorage.clear()

async function register_db() {
    var username = document.getElementById("username").value
    var email = document.getElementById("email").value
    var password = document.getElementById("password").value
    var conf_password = document.getElementById("password_conf").value
    if (password != conf_password && password.length>8) {
        document.getElementsByClassName("error")[0].innerHTML = "ERRORE, le password non corrispondono"
        document.getElementsByClassName("error")[0].style.backgroundColor="red"
    }else if(username.length<4){
        document.getElementsByClassName("error")[0].innerHTML = "ERRORE, username non valido"
        document.getElementsByClassName("error")[0].style.backgroundColor="red"
    }else if(!regex.test(email)){
        document.getElementsByClassName("error")[0].innerHTML = "ERRORE, email non valida"
        document.getElementsByClassName("error")[0].style.backgroundColor="red"
    }else
    localStorage.setItem("successo",await fetch("/api/register", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": username,
                "email": email,
                "password": password
            })
        }).then(res => {
            if (res.ok)
                return true
            else
                throw new Error();
        }).catch(function(){
            document.getElementsByClassName("error")[0].innerHTML = "ERRORE, Utente già esistente"
            document.getElementsByClassName("error")[0].style.backgroundColor="red"
            return false
        }))
    if(localStorage.getItem("successo")=='true')
        window.location.href = '/login';
}