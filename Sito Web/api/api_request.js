const express = require('express')
const spot = require("./spotify.js")
require('dotenv').config()
const crypto = require('crypto')
const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const app = express.Router();

const uri = process.env.URI

app.put('/register', async function (req, res) {
   /*
    #swagger.tags = ["Autentificazione"]
    #swagger.summary = "Registra l'utente dentro"
  */
  req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex')
  var pwmClient = await new mongoClient(uri).connect()
  if (await (pwmClient.db('spotify').collection('users').countDocuments({ $or: [{ "username": req.body.username }, { "email": req.body.email }] })) == 0) {
    res.json(await pwmClient.db("spotify").collection('users').insertOne(req.body))
  } else {
    res.status(500).send("Utente già registrato")
  }
})

app.post('/login', async function (req, res) {
  /*
    #swagger.tags = ["Autentificazione"]
    #swagger.summary = "Fase di controllo per il login"
  */
  req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex')
  var pwmClient = await new mongoClient(uri).connect()
  var user = await pwmClient.db('spotify').collection('users').find({
    $and: [
      {
        $or: [
          { "username": req.body.username }, { "email": req.body.username }
        ]
      }, { "password": req.body.password }
    ]
  }).toArray();
  if (user.length == 0)
    res.status(404).send("Utente non presente")
  else
    res.json({ "user": user[0]._id.toString(), "username": user[0].username })
})

app.put("/add_favorite_artist", async function (req, res) {
  /*
    #swagger.tags = ["Artista"]
    #swagger.summary = "Aggiunge l'artista ai preferiti per quell'account [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  if (await pwmClient.db('spotify').collection('users').countDocuments(
    {
      $and:
        [
          { "_id": new ObjectId(req.body.username) }
        ], "favorite_artist": {
          $elemMatch: {
            $eq: req.body.artist
          }
        }
    }
  ) == 0) {
    await pwmClient.db('spotify').collection('users').updateOne({ "_id": new ObjectId(req.body.username) }, { $push: { "favorite_artist": `${req.body.artist}` } })
    res.status(201).send(true)
  }
})

app.post("/view_favorite_artist", async function (req, res) {
  /*
    #swagger.tags = ["Artista"]
    #swagger.summary = "Guarda gli artisti preferiti per quell'account [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect(),string="",json
  var artisti = await pwmClient.db('spotify').collection('users').findOne({ "_id": new ObjectId(req.body.username) })
  if (artisti.favorite_artist != null)
    for (i = 0; i < artisti.favorite_artist.length; i++) {
      if(i==0)
        string+=artisti.favorite_artist[i]
      else
        string+="%2C"+artisti.favorite_artist[i]
    }
  res.json(await spot.check_token("https://api.spotify.com/v1/artists?ids=" + string))
})

app.delete("/delete_favorite_artist", async function (req, res) {
  /*
    #swagger.tags = ["Artista"]
    #swagger.summary = "Rimuove l'artista ai preferiti per quell'account [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('users').updateOne(
    { "_id": new ObjectId(req.body.username) },
    {
      $pull: {
        "favorite_artist": {
          $eq: req.body.artist
        }
      }
    }
  )
  res.status(201).send(true)
})

app.post("/search_genre", async function (req, res) {
  /*
    #swagger.tags = ["Cerca"]
    #swagger.summary = "Cerca in base ai generi di spotify con quello dato"
  */
  var genre = await spot.check_token("https://api.spotify.com/v1/recommendations/available-genre-seeds"), json = { genre: [] }
  var risultato = genre.genres.filter(function (element) {
    return element.includes(req.body.genres);
  });
  res.json(risultato)
})

app.put("/add_genre", async function (req, res) {
  /*
    #swagger.tags = ["Genere"]
    #swagger.summary = "Aggiunge generi ai preferiti [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  if (await pwmClient.db('spotify').collection('users').countDocuments(
    {
      $and:
        [
          { "_id": new ObjectId(req.body.username) }
        ], "genre": {
          $elemMatch: {
            $eq: req.body.genre
          }
        }
    }
  ) == 0) {
    await pwmClient.db('spotify').collection('users').updateOne({ "_id": new ObjectId(req.body.username) }, { $push: { "genre": `${req.body.genre}` } })
    res.status(201).send(true)
  }
})

app.post("/view_favorite_genre", async function (req, res) {
  /*
    #swagger.tags = ["Genere"]
    #swagger.summary = "Visualizza i genere preferiti [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect(), ris = { artists: [] }
  res.json((await pwmClient.db('spotify').collection('users').findOne({ "_id": new ObjectId(req.body.username) })).genre)
})

app.delete("/delete_favorite_genre", async function (req, res) {
  /*
    #swagger.tags = ["Genere"]
    #swagger.summary = "Cancella il genere preferito [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('users').updateOne(
    { "_id": new ObjectId(req.body.username) },
    {
      $pull: {
        "genre": {
          $eq: req.body.genre
        }
      }
    }
  )
  res.status(201).send(true)
})

app.post("/account_info", async function (req, res) {
  /*
    #swagger.tags = ["Account"]
    #swagger.summary = "Restituisce le informazioni dell'account [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  var ris = await pwmClient.db('spotify').collection('users').findOne({ "_id": new ObjectId(req.body.username) })
  res.send({ "username": ris.username, "email": ris.email })
})

app.delete("/remove_account", async function (req, res) {
  /*
    #swagger.tags = ["Account"]
    #swagger.summary = "Rimuove l'account [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  var elenco=await pwmClient.db('spotify').collection('privateList').find({ "creator": req.body.username }).toArray()
  for(i=0;i<elenco.length;i++){
    await pwmClient.db('spotify').collection('users').updateMany({},{ $pull:{"follow":{$eq: elenco[i]._id.toString() }}})
  }
  await pwmClient.db('spotify').collection('privateList').deleteMany({ "creator": req.body.username })
  await pwmClient.db('spotify').collection('users').deleteOne({ "_id": new ObjectId(req.body.username) })
  res.status(201).send(true)
})

app.post("/change_profilo", async function (req, res) {
  /*
    #swagger.tags = ["Account"]
    #swagger.summary = "Cambia i dati inerenti all'account [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex')
  if (await pwmClient.db('spotify').collection('users').countDocuments({ $or: [{ email: req.body.email }, { username: req.body.username }] }) == 0) {
    await pwmClient.db('spotify').collection('users').updateOne({ "_id": new ObjectId(req.body.id) }, { $set: { email: req.body.email, username: req.body.username, password: req.body.password } })
    res.status(201).send(true)
  } else if (await pwmClient.db('spotify').collection('users').countDocuments({ $and: [{ email: req.body.email }, { username: req.body.username }, { "_id": new ObjectId(req.body.id) }] }) == 1) {
    await pwmClient.db('spotify').collection('users').updateOne({ "_id": new ObjectId(req.body.id) }, { $set: { password: req.body.password } })
    res.status(201).send(true)
  } else
    res.status(409).send(false)
})

app.post("/view_suggestion", async function (req, res) {
  /*
    #swagger.tags = ["Home"]
    #swagger.summary = "Restituisce i brani correlati ai genere e artisti preferiti [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  var ris = await pwmClient.db('spotify').collection('users').findOne({ "_id": new ObjectId(req.body.id) })
  var url = "https://api.spotify.com/v1/recommendations?"
  if ((ris.favorite_artist != null && ris.favorite_artist.length != 0) || (ris.genre != null && ris.genre.length != 0)) {
    if (ris.favorite_artist != null && ris.favorite_artist.length != 0)
      for (i = 0; i < ris.favorite_artist.length; i++) {
        if (i == 0)
          url += "seed_artists=" + ris.favorite_artist[i]
        else
          url += "%2C" + ris.favorite_artist[i]
      }
    if (ris.genre != null && ris.genre.length != 0)
      for (i = 0; i < ris.genre.length; i++) {
        if (i == 0)
          url += "&seed_genres=" + ris.genre[i]
        else
          url += "%2C" + ris.genre[i]
      }
    res.status(201).send(await spot.check_token(url))
  } else
    res.status(403).send(false)
})

app.put("/create_my_playlist", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Crea una nuova playlist [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('privateList').insertOne(req.body)
  res.json((await pwmClient.db('spotify').collection('privateList').findOne(req.body)))
})

app.post("/view_my_playlist", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Restituisce le informazioni delle playlist che segue / ha creato l'account [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  res.json(await pwmClient.db('spotify').collection('privateList').findOne({ "_id": new ObjectId(req.body.id), $or: [{ public: true }, { creator: req.body.creator }] }))
})

app.delete("/delete_tag", async function (req, res) {
  /*
    #swagger.tags = ["Tag"]
    #swagger.summary = "Rimuove i tag dalla playlist interna [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('privateList').updateOne(
    { "_id": new ObjectId(req.body.playlist) },
    {
      $pull: {
        "tag": {
          $eq: req.body.tag
        }
      }
    }
  )
  res.status(201).send(true)
})

app.put("/add_tag", async function (req, res) {
  /*
    #swagger.tags = ["Tag"]
    #swagger.summary = "Aggiunge i tag alla playlist interna [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  if (await pwmClient.db('spotify').collection('privateList').countDocuments(
    {
      $and:
        [
          { "_id": new ObjectId(req.body.playlist) }
        ], "tag": {
          $elemMatch: {
            $eq: req.body.tag
          }
        }
    }
  ) == 0) {
    await pwmClient.db('spotify').collection('privateList').updateOne({ "_id": new ObjectId(req.body.playlist) }, { $push: { "tag": req.body.tag } })
    res.status(201).send(true)
  }
})

app.post("/modifica_playlist", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Modifico la playlist interna [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('privateList').updateOne({ "_id": new ObjectId(req.body.playlist), creator: req.body.creator }, { $set: { "nome": req.body.nome, "descr": req.body.desc } })
  res.status(201).send(true)
})

app.delete("/delete_playlist", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Rimuovo la playlist interna [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('privateList').deleteOne({ "_id": new ObjectId(req.body.playlist), creator: req.body.creator })
  await pwmClient.db('spotify').collection('users').updateMany({},{ $pull:{follow:{$eq:req.body.playlist}} })
  res.status(201).send(true)
})

app.post("/modifica_privato", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Modifico la playlist interna e la rendo o privata o pubblica [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('privateList').updateOne({ "_id": new ObjectId(req.body.id), creator: req.body.creator }, { $set: { "public": req.body.public } })
  if(!req.body.password)
    await pwmClient.db('spotify').collection('users').updateMany({},{ $pull: {"follow": req.body.id} })
  res.status(201).send(true)
})

app.put("/add_track", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Aggiungo i brani alla playlist interna [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  if (await pwmClient.db('spotify').collection('privateList').countDocuments(
    {
      $and:
        [
          { "_id": new ObjectId(req.body.playlist) },
          { "tracks_id": { $elemMatch: { $eq: req.body.trackId } } },
          { "tracks_name": { $elemMatch: { $eq: req.body.trackName } } },
          {"creator":req.body.username}
        ]
    }
  ) == 0) {
    await pwmClient.db('spotify').collection('privateList').updateOne({ "_id": new ObjectId(req.body.playlist) }, { $push: { "tracks_id": req.body.trackId, "tracks_name": req.body.trackName } })
    res.status(201).send(true)
  }
})

app.delete("/remove_track", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Rimuove il brano dalla playlist interna [Autentificzione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('privateList').updateOne(
    { "_id": new ObjectId(req.body.playlist) },
    {
      $pull: {
        "tracks_id": {
          $eq: req.body.id
        }, "tracks_name": {
          $eq: req.body.name
        }
      }
    }
  )
  res.status(201).send(true)
})

app.post("/cerca_interna", async function (req, res) {
  /*
    #swagger.tags = ["Cerca"]
    #swagger.summary = "Effettua una ricerca attraverso: Tag, Nome playlist, Brani oppure su tutto sulle playlist interne"
  */
  var ris, pwmClient = await new mongoClient(uri).connect()
  switch (req.body.option) {
    case "tag":
      ris = await pwmClient.db('spotify').collection('privateList').find({
        $and: [
          { $or: [{ public: true }, { creator: req.body.creator }] },
          { tag: { $regex: new RegExp(req.body.cerca, 'i') } }
        ]
      }
      ).toArray()
      break
    case "brano":
      ris = await pwmClient.db('spotify').collection('privateList').find({
        $and: [
          { $or: [{ public: true }, { creator: req.body.creator }] },
          { tracks_name: { $regex: new RegExp(req.body.cerca, 'i') } }
        ]
      }
      ).toArray()
      break
    case "playlist":
      ris = await pwmClient.db('spotify').collection('privateList').find({
        $and: [
          { $or: [{ public: true }, { creator: req.body.creator }] },
          { nome: { $regex: new RegExp(req.body.cerca, 'i') } }
        ]
      }
      ).toArray()
      break
    default:
      ris = await pwmClient.db('spotify').collection('privateList').find({
        $and: [
          { $or: [{ public: true }, { creator: req.body.creator }] },
          { $or: [{ tag: { $regex: new RegExp(req.body.cerca, 'i') } }, { tracks_name: { $regex: new RegExp(req.body.cerca, 'i') } }, { nome: { $regex: new RegExp(req.body.cerca, 'i') } }] }
        ]
      }
      ).toArray()
  }
  res.json(ris)
})

app.post("/visualizza_playlist_follow", async function (req, res) {
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Visualizza le playlist che seguo"
  */
  var pwmClient = await new mongoClient(uri).connect()
  res.json(await pwmClient.db('spotify').collection('users').findOne({ "_id": new ObjectId(req.body.account),follow:{ $elemMatch: {$eq: req.body.playlist}} }))
})

app.put("/aggiungi_follow",async function(req,res){
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Aggiungo un nuovo followers alla playlist interna [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  if(await pwmClient.db('spotify').collection('users').countDocuments({_id:new ObjectId(req.body.account),follow:{ $elemMatch: {$eq: req.body.playlist}} })==0){
    await pwmClient.db('spotify').collection('users').updateOne({_id:new ObjectId(req.body.account)},{$push:{follow:req.body.playlist}})
  }
  res.status(201).send(true)
})

app.delete("/rimuovi_follow",async function(req,res){
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Rimuovo il follow dalla playlist interna [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  await pwmClient.db('spotify').collection('users').updateOne({_id:new ObjectId(req.body.account)},{$pull:{follow:req.body.playlist}})
  res.status(201).send(true)
})

app.post("/count_follower",async function(req,res){
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Visualizza il numero di followers di una playlist pubblica interna"
  */
  var pwmClient = await new mongoClient(uri).connect()
  res.json( await pwmClient.db('spotify').collection('users').countDocuments({follow:{$elemMatch:{$eq:req.body.playlist}}}))
})

app.post("/check_follow",async function(req,res){
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Visualizza il numero di playlist che seguo [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  res.json( await pwmClient.db('spotify').collection('users').countDocuments({_id:new ObjectId(req.body.user),follow:{$elemMatch:{$eq:req.body.playlist}}}))
})

app.post("/my_playlists",async function(req,res){
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Visualizza i dati delle playlist pubblica interna che seguo [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect(),json={},lista
  json=await pwmClient.db('spotify').collection('privateList').find({"creator":req.body.username}).toArray()
  lista=await pwmClient.db('spotify').collection('users').findOne({_id:new ObjectId(req.body.username)})
  if(lista.follow!=null){
    for(i=0;i<lista.follow.length;i++){
      json.push(await pwmClient.db('spotify').collection('privateList').findOne({_id:new ObjectId(lista.follow[i])}))
    }
  }
  res.json(json)
})

app.post("/my_playlists_add_track",async function(req,res){
  /*
    #swagger.tags = ["Playlist"]
    #swagger.summary = "Restituisce le playlist che ho creato [Autentificazione richiesta]"
  */
  var pwmClient = await new mongoClient(uri).connect()
  res.json(await pwmClient.db('spotify').collection('privateList').find({"creator":req.body.username}).toArray())
})

module.exports = app
