const spot = require("./api/spotify.js")
const api = require('./api/api_request.js')
const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./api/swagger-output.json');
const app = express()
const cors = require('cors')
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, './')))

app.post('/api/get_json', async function (req, res) {
  /*
   #swagger.tags = ["Principale"]
   #swagger.summary = "Richieste a Spotify"
 */
  res.json(await spot.check_token(req.body.url))
})

app.get('/', function (req, res) {
  /*
   #swagger.tags = ["Principale"]
   #swagger.summary = "Renderizza la home del sito web"
 */
  res.render('pages/index', { script: "<script>home()</script>", option: 0 })
})

app.use('/login', function (req, res) {
  /*
    #swagger.tags = ["Autentificazione"]
    #swagger.summary = "Renderizza la pagina di login"
  */
  res.render('pages/login')
})

app.use('/register', function (req, res) {
  /*
    #swagger.tags = ["Autentificazione"]
    #swagger.summary = "Renderizza la pagina della registrazione"
  */
  res.render('pages/register')
})

app.get("/playlist/:id", function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Carica e renderizza la pagina della playlist di Spotify"
  */
  res.render('pages/playlist', { script: "<script>playlist('" + req.params.id + "')</script>",option:0  })
})

app.get('/my_playlist/:id', function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Carica e renderizza la pagina della playlist interna di MongoDB"
  */
  res.render('pages/playlist', { script: "<script>view_my_playlist('" + req.params.id + "')</script>",option:1})
})

app.get('/album/:id', function (req, res) {
  /*
    #swagger.tags = ["Album"]
    #swagger.summary = "Carica e renderizza la pagina dell'albu di Spotify"
  */
  res.render('pages/album', { script: "<script>album('" + req.params.id + "')</script>"})
})

app.get("/artist/:id", function (req, res) {
  /*
    #swagger.tags = ["Artista"]
    #swagger.summary = "Carica e renderizza la pagina dell'artista di Spotify"
  */
  res.render('pages/artist', { script: "<script>artist('" + req.params.id + "')</script>"})
})

app.get('/search', function (req, res) {
  /*
    #swagger.tags = ["Cerca"]
    #swagger.summary = "Carica e renderizza la pagina dell'artista di Spotify"
  */
  res.render('pages/search', { script: ""})
})

app.get('/change_profile', function (req, res) {
  /*
    #swagger.tags = ["User"]
    #swagger.summary = "Renderizza la pagina per la modifica delle preferenze dell'utente"
  */
  res.render('pages/change_profile', { script: "<script>account_info()</script>"})
})

app.get("/change_data", function (req, res) {
  /*
    #swagger.tags = ["User"]
    #swagger.summary = "Renderizza la pagina per la modifica dei dati dell'utente"
  */
  res.render('pages/change_data', { script: "<script>visual_data()</script>"})
})

app.get('/crea_playlist', function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Renderizza la pagina per la creazione di playlist interne"
  */
  res.render('pages/crea_playlist', { script: ""})
})

app.get('/change_my_playlist/:id', function (req, res) {
  /*
   #swagger.tags = ["Playlist"]
   #swagger.summary = "Renderizza la pagina per la modifica delle mie playlist interne"
 */
  res.render('pages/change_my_playlist', { script: "<script>view_my_change_playlist('" + req.params.id + "')</script>"})
})

app.get('/search-internal', function (req, res) {
  /*
   #swagger.tags = ["Cerca"]
   #swagger.summary = "Renderizza la pagina per la ricerce interna delle playlist"
 */
  res.render('pages/search-internal', { script: ""})
})

app.use('/api', api)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log("Server partito porta 3100")
})

require("./api/swagger-autogen.js")