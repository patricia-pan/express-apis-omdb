require('dotenv').config()
const API_key = process.env.API_key
const axios = require('axios')
const express = require('express')
const ejsLayouts = require('express-ejs-layouts')
const app = express()
const db = require('./models') // Import our sequelize models (interface for our psql tables)
const methodOverride = require('method-override')

// Sets EJS as the view engine
app.set('view engine', 'ejs')
// Specifies the location of the static assets folder
app.use(express.static('static'))
// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }))
// Enables EJS Layouts middleware
app.use(ejsLayouts)
app.use(methodOverride('_method'))

// Adds some logging to each request
app.use(require('morgan')('dev'))

// Routes
app.get('/', function(req, res) {
  // res.send('Hello, backend!')
  res.render('index')
});

app.get('/results', (req, res) => {
  axios.get(`http://www.omdbapi.com/?apikey=${API_key}&s=${req.query.q}`) // Axios immediately grabs a JSON.
  .then( axiosResults => {
    // console.log(axiosResults.data.Search) // With Axios, we want the key specifically called 'data'. Search is an object that has an array of objects, where each array object is one movie.
    // Note: Object keys are case sensitive, 'Search' works where 'search' doesn't. 
    res.render('results', {movies: axiosResults.data.Search})
  })
  .catch( error => console.log("Gretchen, stop trying to make fetch happen."))

})

app.get('/movies/:movie_id', (req, res) => {
  axios.get(`http://www.omdbapi.com/?apikey=${API_key}&i=${req.params.movie_id}`) 
  .then( axiosResults => {
    // console.log(axiosResults.data) 
    res.render('detail', {movie: axiosResults.data})
  })
  .catch( error => console.log("Gretchen, stop trying to make fetch happen."))
})

app.get('/faves', (req, res) => {
  db.fave.findAll().then(faves => {
    res.render('faves.ejs', {faves: faves})
  }) 
})

app.post('/movies/:movie_id', (req, res) => {
  db.fave.findOrCreate({
    where: {
      title: req.body.title,
      imdbid: req.body.imdbid
    },
    defaults: {
      title: req.body.title,
      imdbid: req.body.imdbid
    }
  }).then( ([fave, wasCreated]) => {
    res.redirect(`/movies/${req.params.movie_id}`)
  })
  
//   db.fave.create({
//     title: req.body.title,
//     imdbid: req.body.imdbid
//   }).then(createdFave => {
//     res.redirect(`/movies/${req.params.movie_id}`)
//     // process.exit()
//   })
})

app.delete('/faves/:imdbid', (req, res) => {
  db.fave.destroy({
    where: {
      imdbid: `${req.params.imdbid}`
    }
  }).then(rowsDeleted => {
    res.redirect('/faves')
  })
})
  
  
// The app.listen function returns a server handle
var server = app.listen(process.env.PORT || 3000)

// We can export this server to other servers like this
module.exports = server