'use strict'

// I've done this project with Jessie Mason and Linda de Haan
// So we all have almost the same code
// I also had some help from smart students, Titus Wormer, Wouter Lem, Folket-jan van der Pol, and Albert my project teacher
// I am very grateful that they've helped me because I coudn't do it without them

// Require library express
// You have acces to that package, those packages contain modules
// They have their own methods
// You have to install Express, multer, ejs en body-parser
// Like this: npm install express multer body-parser
// You don't have to install path
var express = require('express')
var multer = require('multer')
// Right here you get access to the map uploads, all the files that will be
// posted in the form, will be stored in uploads
var upload = multer({
  dest: 'static/uploads/'
})
var path = require('path')
var ejs = require('ejs')
var mysql = require('mysql')
var session = require('express-session')

// Body-parser: plugin for express, where you can read the value easier
// that has been send through the form
// Urlencoded is what browsers use to send forms
var bodyParser = require('body-parser').urlencoded({
  extended: true
})

// hier link je je server.js aan mysql,
// Here I'm linking my server.js to mysql
// You put your name here, that is root. And all the other database
// So also your database name
// So to start your mysql, you need to type this: mysql -u root
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
// Static folder
app.use(express.static('static'))
app.use(session({
  // the key that will be used for the encryption of all the cookies
  secret: "hoihoi",
  // resave saves the cookies everytime. If it is true, it wil overwrite,
  // If that is false, than it won't overwrite all the time
  // Otherwise you've had a lot of data traffic, and now you don't
  resave: false,
  // saveUninitialized = makes sure that there are no unnecessary sessions
  // False = only when a user logs in you want a session
  // true = unnecessary sessions
  saveUninitialized: false
}))
// Point out that u use bodyParser
app.use(bodyParser)
// App.post is when you send something and get is when you get something from browser
// You need app.post to render data in forms and log in forms
// All the routes will be typed like this: localhost:3000/form
// So if you type that in your browser, you will use an app.get('/form', ...)
// When something like that happens, a function will be executed,
// the function after the route so: app.get('/form', hoi)
// This is for all the app.get's under here

app.get('/', listening)

app.get('/form', renderForm)
app.get('/login', loginForm)

app.post('/portal', handleLogin)
app.get('/profile/:id', profile)

app.get('/newprofile', nieuwProfile)
app.post('/new', upload.single('img'), register)

app.get('/kandidates', matches)
app.get('/profilematch/:id', profileMatch)

// This one is for handling a message on a profile
app.post('/chat', saveMessage)

app.get('/logout', logOut)
app.delete('/delete/:id', deleteAccount)
app.get('/updatepage', updatePage)
// Put your updated data in the database
app.post('/update/:id', update)
app.listen(3000)

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
  res.render('login.ejs')
}

// This function tries to make the chat work at the profilematch.ejs template
// So it selects al the values that have been inserted in the form,
// And it saves it in my MySQL table messages.
function profileMatch(req, res) {
  var id = req.params.id
  // So here you're just selecting the id from the profile your on.
  // That means that if you want to go to an account that you like, you will see
  // A detail page of that id (the id is the account that you like)
  connection.query("SELECT * FROM accounts WHERE id = ?", id, function(err, users) {
    if (err) throw err
    var user = users[0]
    // To make the chat work, and to save the data in the table messages,
    // We need to use SELECT, in there we need to specify what we want to know, so here we want to select me and other.
    // We want to see our message, but also the message that has been send back to us as well.
    // So the message the user sends, and the message that the profile sends to you.
    // That means that we need to specify them twice in order to make that work.
    // You also need to specify the values such as req.params.id twice
    // But because we want one where the logged in user sends them, you need to start with req.session.user.id and then req.params.id
    // And we also want one where the other person sends a message, so then you need to begin with req.params.id and after that req.session.user.id
    // The order of that is very important, so first the logged in user and the id of other user for our messages
    // And after that the id of the other user first and then the logged in user
    connection.query("SELECT * FROM messages WHERE me = ? AND other = ? OR me = ? AND other = ?", [req.session.user.id, req.params.id, req.params.id, req.session.user.id], function(err, messages) {
      if (err) throw err
      var locals = {
        data: user,
        // so here we need to specify the messages
        messages: messages,
        session: req.session
      }
      res.render("profilematch.ejs", locals)
    })
  })
}

function handleLogin(req, res) {
  var body = Object.assign({}, req.body)
  // Select the username  from the table accounts
  connection.query("SELECT * FROM accounts WHERE username = ?", body.username, function(err, users) {
    if (err) throw err
    var user = users[0]
    // If the filled in password matches the actual password in the table accounts
    if (user.password === body.password) {
      // This is the log in part
      req.session.loggedIn = true
      // Know which user is logged in
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

// In this function you render the template profile.ejs, with data
// This function belongs to app.get('profile/:id', profile)
// You want to go to your personal profile page
// That's why you need to have your id first
// That will be shown in the browser, just like shelter at some animal detail page
function profile(req, res) {
  var id = req.params.id
  // Here you're connecting with your databse, it selects * = all from the table accounts,
  // And you're asking for the id. After that there is a function being called
  connection.query("SELECT * FROM accounts WHERE id = ?", id, function(err, users) {
    // When something doesn't go as planned, you will get an error, the server stops
    if (err) throw err
    // Right here we use users, that comes from the callback up here: (err, users)
    // The MySQL query gives or an error, or all found users.
    // We've put the users in a variable so that we can use them
    var user = users[0]
    // Locals is named locals becauce it contains all the local variables that we give to a template
    // The req.session shows us who is logged in, and that someone is logged in
    var locals = {
      data: user,
      session: req.session
    }
    // If everything succeeds, the server renders profile.ejs, with the data from locals in it
    res.render("profile.ejs", locals)
  })
}

function nieuwProfile(req, res) {
  res.render('register.ejs')
}

// https://github.com/deannabosschert/freshstart/blob/master/index.js
// https://github.com/cmda-be/course-17-18/blob/master/examples/mysql-server/index.js
function register(req, res, next) {
  // We want to make a new account, we need INSERT for that to also make it in the database
  // You're selecting the table accounts, and then you give all sorts of values and properties
  // These properties need to be filled in by the user, so that there will be made an account for the user
  connection.query('INSERT INTO accounts SET ?', {
    // I got this from: https://github.com/cmda-be/course-17-18/blob/master/examples/mysql-server/index.js
    // By img is multer used.
    // So what happens here, is that you select the value that will be filled in by every property on the form by the user
    // That is why we type: req.body.name for example. A request for the data that has been filled in in the form, so name
    // That value will be inserted in the database
    img: req.file ? req.file.filename : null,
    id: req.body.id,
    name: req.body.name,
    place: req.body.place,
    description: req.body.description,
    sex: req.body.sex,
    job: req.body.job,
    favorites: req.body.favorites,
    age: req.body.age,
    username: req.body.username,
    password: req.body.password,
    genderlike: req.body.genderlike,
    // After that there will be called a function, named done
  }, done)

  // done will give an error for when something goes wrong, or renders the correct template for when it succeeds
  function done(err, data) {
    if (err) {
      return res.status(404).render('error.ejs', {
        // I'm giving my template some value, like an 404 and a description
        id: 404,
        description: err,
        map: "../"
      })
    } else {
      res.redirect("/login")
    }
  }
}

// Here I'm going to fix that if I go to the matches page, that I will see the accounts
// that are in my databse, so from my table accounts
// If it can't find any accounts, there will be an error, you can see that in the function onDone,
// that is the if part in the code
// If it does find accounts, else will be runned, and matches.ejs will be rendered
function matches(req, res, users) {
  var user = users[0]
  console.log('filter matches')
  // If someones gendelike is 'female'
  if (req.session.user.genderlike == 'Female') {
    // Then you need to display every account with the sex of 'female'
    // So you need to select them
    // And they will be shown on the page
    connection.query("SELECT * FROM accounts WHERE sex = 'Female'", onDone)
  } else {
    // Here you select every account with the sex of 'male'
    connection.query("SELECT * FROM accounts WHERE sex = 'Male'", onDone)
  }
  // onDone gives an error for when something goes wrong with the code above
  // If the code above succeeds, matches.ejs will be rendered, with the data from locals in it
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


// This function will try to save a message that you've send to another account
function saveMessage(req, res) {
  // req.body gets everything from what has been filled in
  // And that req.body will be put in Object.assign. So you make an object out
  // of the req.body
  var body = Object.assign({}, req.body)
  console.log(req)
  connection.query('INSERT INTO messages SET ?', {
    // So here I'm basically doing the same thing as in the function register
    chatting: req.body.chatting,
    me: req.body.me,
    other: req.body.other,
  }, done)

  function done(err, data) {
    if (err) {
      return res.status(404).render('error.ejs', {
        id: 404,
        description: err,
        map: "../"
      })
    } else {
      res.redirect('/profilematch/' + body.other)
    }
  }
}

// This function will try to log uit a account
function logOut(req, res) {
  // So when there is an req.session, so when someone has been logged in
  if (req.session) {
    // your destroying that session, that means that someone has not been logged in anymore
    req.session.destroy(function(err) {
      // If that fails, the error will be rendered
      if (err) {
        return res.status(404).render('error.ejs', {
          id: 404,
          description: err,
          map: "../"
        })
        // If it succeeds you will be redirected to the first page of my project
      } else {
        return res.redirect('/')
      }
    })
  }
}

function deleteAccount(req, res) {
  // from the request you get the parameters and from there the id
  var id = req.params.id
  // You need to delete an account, so you need to type DELETE
  // And select what you need to delete from the table accounts, so you need id
  // After that you will be redirected to the first page of my project
  connection.query("DELETE FROM accounts WHERE id = ?", id, function(err, users) {
    if (err) throw err
    res.redirect('/')
  })
}

function updatePage(req, res) {
  console.log("open update.ejs")
  var id = req.params.id
  connection.query("SELECT * FROM accounts", function(err, data) {
    var locals = {
      data: data,
      session: req.session
    }
    res.render("update.ejs", locals)
  })
}

// https://github.com/mysqljs/mysql#escaping-query-values
// This function tries to save and update data that has been changed by the user.
// It tries to save it in the table accounts.
function update(req, res) {
  var id = req.params.id
  var body = req.body
  // So for this one you need to use UPDATE, because only then you kan change data in your MySQL table.
  // You need to specify everything you need to have from the update form.
  // All of those things will be stored in the table accounts.
  // It stores it by the same user because you don't want a new user, just change a already existing user
  // After you specify all the things you want to know, you need to specify all the values that will be filled in
  // In the update form by the logged in user.
  // It has to be in the same order as before.
  // Your also giving the id of the logged in user, so that MySQL knows which one to change/update
  connection.query("UPDATE accounts SET name = ?, place = ?, description = ?, sex = ?, job = ?, favorites = ?, age = ?, username = ?, password = ?, genderlike = ? WHERE id = ?", [body.name, body.place, body.description, body.sex, body.job, body.favorites, body.age, body.username, body.password, body.genderlike, id], done)

  function done(err, data) {
    if (err) throw err
    console.log("Inserted!")
    var locals = {
      data: data,
      session: req.session
    }
    res.redirect("/profile/" + req.session.user.id)
  }
}
