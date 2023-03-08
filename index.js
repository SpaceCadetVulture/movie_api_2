const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require("body-parser");
const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const fs = require('fs');
const path = require('path');

const uuid = require("uuid");
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));
app.use(morgan("common"));
app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.send("Welcome to the best movie directory in the contemporary world");
});

//CREATE
//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', passport.authenticate('jwt', { session: false }),
(req, res) => {
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//UPDATE
app.put('/users/:id', passport.authenticate('jwt', { session: false }),
(req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if(user) {
        user.name = updatedUser.name;
        res.status(201).json(user);
    }else{
        res.status(400).send('user does not exist')
    }
})

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
(req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });


//POST
app.post('/users/:id/:movieTitle', passport.authenticate('jwt', { session: false }),(req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if(user) {
        user.favoriteMovies.push(movieTitle);
        res.status(201).send(`${movieTitle} has been added to user ${id}'s array`);
    }else{
        res.status(400).send('user does not exist')
    }
})

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), 
(req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  // remove movie from a user's list of favorites
  app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $pull: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

//DELETE
app.delete('/users/:id/:movieTitle', passport.authenticate('jwt', { session: false }),
(req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if(user) {
      user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle )
      res.status(201).send(`${movieTitle} has been removed from user ${id}'s array`);
  }else{
      res.status(400).send('user does not exist')
  }
})

//DELETE
app.delete('/users/:id', passport.authenticate('jwt', { session: false }),
(req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if(user) {
      users = users.filter( user => user.id != id )
      res.status(201).send(` user ${id} has been deleted `);
  }else{
      res.status(400).send('user does not exist')
  }
})

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get all movies

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Get all users
app.get('/users', (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  // Get a user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//READ
app.get("/movies/:title", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.title }) // Find the movie by title
    .then((movies) => {
      if (movies) {
        // If movie was found, return json, else throw error
        res.status(200).json(movies);
      } else {
        res.status(400).send("Movie not found");
      }
    })
    .catch((err) => {
      res.status(500).send("Error: " + err);
    });
});

//READ
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.name }) // Find one movie with the genre by genre name
  .then((movies) => {
    if (movies) {
      // If a movie with the genre was found, return json of genre info, else throw error
      res.status(200).json(movies.Genre);
    } else {
      res.status(400).send("Genre not found");
    }
  })
  .catch((err) => {
    res.status(500).send("Error: " + err);
  });
});

//READ
app.get("/movies/director/:name", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Director.Name": req.params.name }) // Find one movie with the director by name
    .then((movies) => {
      if (movies) {
        // If a movie with the director was found, return json of director info, else throw error
        res.status(200).json(movies.Director);
      } else {
        res.status(400).send("Director not found");
      }
    })
    .catch((err) => {
      res.status(500).send("Error: " + err);
    });
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});