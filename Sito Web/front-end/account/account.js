const login = localStorage.getItem("account") != null

async function account_info() {
    if (login) {
        var ris = await fetch("/api/account_info", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": localStorage.getItem("account"),
            })
        }).then(function (res) { return res.json() })
        document.getElementById("p_username").innerHTML += ris.username
        document.getElementById("p_email").innerHTML += ris.email
    }
}

async function remove_account() {
    if (login) {
        await fetch("/api/remove_account", {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": localStorage.getItem("account"),
            })
        }).then(function () {
            localStorage.clear()
            window.location.href = '/'
        })
    }
}

async function visual_data() {
    if (login) {
        var ris = await fetch("/api/account_info", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": localStorage.getItem("account"),
            })
        }).then(function (res) { return res.json() })
        document.getElementById("username").value = ris.username
        document.getElementById("email").value = ris.email
    }
}

async function change_data() {
    if (login) {
        var user = document.getElementById("username").value
        var email = document.getElementById("email").value
        var psw = document.getElementById("password").value
        var psw_conf = document.getElementById("password_conf").value
        if (psw_conf == psw && psw != null) {
            await fetch("/api/change_profilo", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "id": localStorage.getItem("account"),
                    "email": email,
                    "username": user,
                    "password": psw
                })
            }).then(function (res) {
                if (res.ok) {
                    error = document.getElementsByClassName("error")[0]
                    error.innerHTML = '<p>Successo</p>'
                    error.style.background = 'green'
                    visual_data()
                } else {
                    error = document.getElementsByClassName("error")[0]
                    error.innerHTML = '<p>ERRORE, email o utente duplicato</p>'
                    error.style.background = 'red'
                }
            })
        } else {
            error = document.getElementsByClassName("error")[0]
            error.innerHTML = '<p>ERRORE, password non valida</p>'
            error.style.background = 'red'
        }
    }
}