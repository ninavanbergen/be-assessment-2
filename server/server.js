'use strict'

// Require library express
// Je hebt toegang tot die package, die bevatten modules
// Die hebben hun eigen methodes
// Express, multer, ejs en body-parser moet je installeren
// Dat moet zo: npm install express multer body-parser
// Path hoef je niet te installeren
var express = require('express')
var multer = require('multer')
// upload zet als je een foto upload zet hij m in die map
var upload = multer({ dest: 'static/uploads/'})
var path = require('path')
var ejs = require('ejs')
var mysql = require('mysql')
var session = require('express-session')

// Body-parser: plugin voor express, waarmee je de waarde die
// Door het formulier wordt opgestuurd, makkelijker kan lezen
// Urlencoded is what browsers use to send forms
var bodyParser = require('body-parser').urlencoded({
  extended: true
})

// set storage engine
// var storage = multer.diskStorage({
//   destination: './public/uploads/',
//   filename: function(req, file, cb){
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//   }
// })

// init upload
// var upload = multer({
//   dest: 'public/uploads/'
// });

// hier link je je server.js aan mysql,
// je ziet hier je naam, dus root, en je verdere gegevens,
// dus ook je database naam
// om dus je mysql te starten, doe je dus: mysql -u root

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'datingsite'
});
connection.connect()

// init app
var app = express()
// ejs
app.set('view engine', 'ejs')
app.set('views', 'view')
// Public foler
app.use(express.static('public'))
// Static folder
app.use(express.static('static'))
app.use(session({
  // de sleutel die gebruikt wordt bij de encryptie van alle cookies
  secret: "hoihoi",
  // resave slaat elke keer de cookies op, true is dat ie overschrijft, en false dan gaat ie niet steeds overschrijven
  // dit scheelt een heleboel dataverkeer
  resave: false,
  // saveUninitialized = zorgt ervoor dat onnodige sessions niet plaatsvinden, false = alleen wanneer gebruiker inlogt wil je een session,
  // true = overbodige sessions
  saveUninitialized: false
}))
// Aangeven dat je bodyParser gebruikt
app.use(bodyParser)
// App.post is dat je wat van de broswer terugkrijgt
// app.post('/profile', renderProfiel)
// Alle routes, dus als je localhost:3000/form intypt,
// Dan wordt de functie renderForm aangeroepen
// Dit geldt voor alle app.get's hieronder
app.get('/', listening)
app.get('/form', renderForm)
app.get('/login', loginForm)
app.post('/portal', handleLogin)
app.get('/profile/:id', profiel)
// app.get('/account', eigenProfiel)
app.get('/newprofile', nieuwProfiel)
app.post('/new', upload.single('img'), aanmelden)
app.get('/kandidates', matches)
app.get('/profilematch/:id', profielMatch)
app.post('/chat', saveMessage)
app.get('/loguit', uitloggen)
app.get('/chats/:id', chatProfiel)
app.delete('/delete/:id', deleteAccount)
app.get('/updatepage', updatePage)
app.post('/update/:id', update) // zet veranderde gegevens in database
app.listen(3000)
// app.post('/form', upload.single('file-to-upload'), (req, res) => {
//   res.redirect('/form');
// })

function listening(req, res) {
  console.log('Listening')
  console.log(req.session)
  res.render('index.ejs')
}

function renderForm(req, res, users) {
  var user = users[0]
  var locals = {
    data: user,
    session: req.session
  }
  res.render('form.ejs', locals)
}

function loginForm(req, res) {
  res.render('inloggen.ejs')
}

function chatProfiel(req, res) {
  var id = req.params.id
  connection.query("SELECT * FROM accounts WHERE id = ?", id, function(err, users) {
    if (err) throw err
    var user = users[0]
    // locals heet zo omdat het alle lokale variabelen bevat die we meegeven aan de template
    // de req.session laat zien wie er ingelogd is
    var locals = {
      data: user,
      session: req.session
    }
    res.render("chats.ejs", locals)
  })
}

function profielMatch(req, res) {
  var id = req.params.id
  connection.query("SELECT * FROM accounts WHERE id = ?", id, function(err, users) {
    if (err) throw err
    var user = users[0]
    connection.query("SELECT * FROM messages WHERE jezelf = ? AND ander = ? OR jezelf = ? AND ander = ?", [req.session.user.id, req.params.id, req.params.id, req.session.user.id], function(err, messages) {
      if (err) throw err
      var locals = {
        data: user,
        messages: messages,
        session: req.session
      }
      res.render("profielmatch.ejs", locals)
    })
  })
}

function handleLogin(req, res) {
  var body = Object.assign({}, req.body)
  connection.query("SELECT * FROM accounts WHERE username = ?", body.username, function(err, users) {
    if (err) throw err
    var user = users[0]
    if (user.password === body.password) {
      // dit is het inlog gedeelte
      req.session.loggedIn = true
      // weet welke gebruiker ingelogd is
      req.session.user = user
      res.redirect("/profile/" + user.id)
    } else {
      return res.status(401).render('error.ejs', {
        id: 401,
        description: "Username exists, but the password is incorrect",
        map: "../"
      })
    }
  })
}

// In deze functie geef je profiel.ejs mee, en een titel en je geeft data mee
// In data geef je req.params.id weer aan mee
// Deze functie hoort bovein bij: app.get('/profile/:id', profiel)
// Je wilt dat je op je persoonlijke profiel pagina komt
// Daarom moet je eerst een id hebben
// Die moet in de browser getoond worden net als bij shelter
function profiel(req, res) {
  var id = req.params.id
  connection.query("SELECT * FROM accounts WHERE id = ?", id, function(err, users) {
    if (err) throw err
    var user = users[0]
    // locals heet zo omdat het alle lokale variabelen bevat die we meegeven aan de template
    // de req.session laat zien wie er ingelogd is
    var locals = {
      data: user,
      session: req.session
    }
    res.render("profiel.ejs", locals)
  })
  /*// hier connect je met je database, je selecteert alles (*), FROM de table accounts,
    // en vraag je de id, je checkt of het een id heeft, en dat roept de functie onDone op
    connection.query("SELECT * FROM accounts WHERE id = ?", id, onDone)
    // function ondone gaat kijken of er een id is, zo niet dan een Error
    function onDone(err, data) {
      console.log(data[0]);
      // dus als er een error is of de data.length 0 is, dus als de table leeg is,
      // dan geeft hij een error en een error.ejs mee
      if (err || data.length === 0) {
        // account niet kon vinden
        // 404 account not found
        console.log("Error: ", err)
        return res.status(404).render('error.ejs', {
          id: 404,
          description: "page not found",
          map: "../"
        })
        // als hij wel een id kan vinden, dan geeft hij profiel.ejs mee met de data van table,
        // dat maakt mogelijk dat je kan kiezen van accounts, dus /profile/1 of /profile/0 enz
        // de table begint bij 1 en dus niet bij 0, dat heeft alleen een array
      } else {
        res.render('profiel.ejs', {
          title: "Profiel",
          data: data[0]
        })
      }

    }*/

}

// hier wil je je eigen profiel zien, dus selecteer je in data de variable datas,
// en dan de eerste [0], dus die krijg je dan te zien op je profiel.ejs
// function eigenProfiel(req, res) {
//   res.render('profiel.ejs', {
//     data: datas[0]
//   })
// }

function nieuwProfiel(req, res) {
  res.render('aanmelden.ejs')
}

function aanmelden(req, res) {
  var body = req.body
  connection.query('INSERT INTO accounts SET ?', body)
  res.redirect("/login")
}

// hier ga ik fixen dat als ik naar de kandidaten pagina ga, dat ik de personen zie die
// in mijn database staan, dus mysql en de table accounts
// is er geen account gevonden, dan komt er een error, dat is de if
// is er wel een account gevonden, dan wordt else gedaan, en dus kandidaten.ejs getoond

function matches(req, res, users) {
  var user = users[0]
  console.log('filter matches')
  if ( req.session.user.genderlike == 'Female' ) {
  // selecteer iedereen met gender male
    connection.query("SELECT * FROM accounts WHERE sex = 'Female'", onDone)
  }
  else {
  // selecteer iedereen met gender female
    connection.query("SELECT * FROM accounts WHERE sex = 'Male'", onDone)
  }

  function onDone(err, data) {
    if (err) {
      console.log('Error: ', err)
      return res.status(404).render('error.ejs')
    } else {
      console.log(data)
      var locals = {
        data: data,
        session: req.session
      }
      res.render('matches.ejs', locals)
    }
  }
}

function saveMessage(req, res) {
  var body = Object.assign({}, req.body)
  console.log(req)
  connection.query('INSERT INTO messages SET ?', {
    chatting: req.body.chatting,
    jezelf: req.body.jezelf,
    ander: req.body.ander,
  }, done)

  function done(err, data) {
    if (err) {
      return res.status(404).render('error.ejs', {
        id: 404,
        description: err,
        map: "../"
      })
    } else {
      res.redirect('/profilematch/' + body.ander)
    }
  }
}

function uitloggen(req, res) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return res.status(404).render('error.ejs', {
          id: 404,
          description: err,
          map: "../"
        })
      } else {
        return res.redirect('/')
      }
    })
  }
}

function deleteAccount(req, res) {
  // Je zet de id van een gebruiker in deze var id,
  // wat je achter de / zet in de browser haalt ie op en dat zet je dan
  // in var id
  var id = req.params.id
  connection.query("DELETE FROM accounts WHERE id = ?", id, function(err, users) {
    if (err) throw err
    res.redirect('/')
  })
}

function updatePage (req, res){
  console.log("open wijzigen.ejs")
  var id = req.params.id
  connection.query("SELECT * FROM accounts",  function (err, data) {
    var locals = {
      data: data,
      session: req.session
    }
    res.render("wijzigen.ejs", locals)
  })
}

function update (req, res){
var id = req.params.id
var body = req.body
connection.query("UPDATE accounts SET name = ?, place = ?, description = ?, sex = ?, job = ?, favorites = ?, age = ?, username = ?, password = ?, genderlike = ? WHERE id = ?", [body.name, body.place, body.description, body.sex, body.job, body.favorites, body.age, body.username, body.password, body.genderlike, id], done)
function done (err, data){
  if (err) throw err
  console.log("Inserted!")
  var locals = {
    data: data,
    session: req.session
  }
    res.redirect("/profile/" + req.session.user.id )
}
}

// function changeProfile(req, res){
//   var id = req.session.id
//   var body = req.body
//   connection.query('UPDATE * INTO accounts SET name = ? WHERE id = ?', ['Hoi','1'], function(err, users) {
//     if (err) throw err
//     // dit is het inlog gedeelte
//     req.session.loggedIn = true
//     // weet welke gebruiker ingelogd is
//     req.session.user = user
//     res.render("/login")
// })}
//
//
//
// function updateProfile(req, res){
//   var id = req.params.id
//   connection.query("SELECT * FROM accounts WHERE id = ?", id, function(err, users) {
//     if (err) throw err
//     var user = users[0]
//     // locals heet zo omdat het alle lokale variabelen bevat die we meegeven aan de template
//     // de req.session laat zien wie er ingelogd is
//     var locals = {
//       data: user,
//       session: req.session
//     }
//     res.render("wijzigen.ejs", locals)
//   })}

// Hier probeer je naar je persoonlijke profile te linken, dus met een id
// Dat id haal je uit de array, en je haalt er daar 1 vanaf
// Je stuurt met data.push, de gegevens (req.body) uit DatabaseEntry
// Dan render je profiel.ejs en geef je daarbij ook een id mee
// Dit werkt nog niet precies
// Je zou in de browser: localhost:3000/profile/0 ofzo moeten zien
// Deze functie hoort bovenin bij: app.post('/profile', renderProfiel)
// Dit is dus alleen als er ook iets van de browser is teruggestuurd, want 'post'
// Alleen daarvan kun je een id aanmaken
// function renderProfiel(req, res) {
//   console.log(req.body)
//   res.render('profiel.ejs', {
//     data: data[data.length - 1]
//   })
// }

// array met alle data van de personen/kandidaten
// Deze wordt gebruikt in kandidaten.ejs
// var datas = [{
//     "name": "Nina",
//     "place": "London",
//     "description": null,
//     "sex": "male",
//     "age": 27,
//     "job": "",
//     "favorites": "luxe products, high quality food"
//   }
// ]
