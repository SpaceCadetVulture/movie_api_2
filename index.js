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

let users = [
    {
        "id": "1",
        "name": "vito",
        "favoriteMovies": []
    },

    {
        "id": "2",
        "name": "carl",
        "password": "5555",
        "email": "carlzzzjuinor@gmail.com",
        "birthday": "05/57/2000",
        "favoriteMovies": ["Shrek"]
    },
    {
      "id": "3",
      "name": "james",
      "password": "1234",
      "email": "james90@gmail.com",
      "birthday": "05-06-1999",
      "favoriteMovies": ["Hitman"]
  },
  {
    "id": "4",
    "name": "rosa",
    "password": "1235",
    "email": "rosaparks@gmail.com",
    "birthday": "05-06-1963",
    "favoriteMovies": ["300"]
}

];

let movies = [
    {
        "Title":"Shrek",
        "Description": " a drama about soul searching along with a donkey",
        "Genre": {
            "Name": "drama",
            "Description": "Big green monster with donkey looking for love",
        },
        "Director": {
            "Name": "James",
            "Bio": " he is a director",
            "Birth":"06/2000", 
        },

    },
    {
      "Title":"Hitman",
      "Description": "Fast bullets, many dead",
      "Genre": {
          "Name": "action",
          "Description": "bald dude trying to find who betrayed him",
      },
      "Director": {
          "Name": "Grant",
          "Bio": " Lovable fat white guy",
          "Birth":"06/2000", 
      },

  },
  {
    "Title":"300",
    "Description": " Fight for honor",
    "Genre": {
        "Name": "action",
        "Description": "Sparta defeding the city-state",
    },
    "Director": {
        "Name": "Dontknow",
        "Bio": " pycho person",
        "Birth":"06/2912", 
    },

},
];

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
app.post('/users', (req, res) => {
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
app.put('/users/:id', (req, res) => {
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
app.put('/users/:Username', (req, res) => {
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
app.post('/users/:id/:movieTitle', (req, res) => {
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
  app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:id/:movieTitle', (req, res) => {
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
app.delete('/users/:id', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);
    
    if (movie){
        res.status(200).json(movie);
    } else{
        res.status(400).send('movie not found');
    }
})

//READ
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
    
    if (genre){
        res.status(200).json(genre);
    } else{
        res.status(400).send('genre not found');
    }
})

//READ
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
    
    if (director){
       return res.status(200).json(director);
    } else{
        res.status(400).send('director not found');
    } 
})

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

