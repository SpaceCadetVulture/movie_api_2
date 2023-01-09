const express = require('express');
const app = express();

let topMovies = [
    {
      title: 'Shawshank Redemption',
    },
    {
      title: 'The Godfather',
    },
    {
      title: 'The Dark Knight',
    },
    {
        title: 'The Godfather 2',
      },
      {
        title: '12 Monkeys',
      },
      {
        title: 'Shrek',
      },
      {
        title: 'Lord of the Rings',
      },
      {
        title: 'Pulp Fiction',
      },
       {
      title: 'Fight Club',
    },
    {
        title: 'Zombie',
      },
  ];

  // GET requests
app.get('/', (req, res) => {
    res.send('Top Ten Movies');
  });
  app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });

  app.get('/movies', (req, res) => {
    res.json(topMovies);
  });

  app.get('/movies/title', (req, res) => {
    res.send('Successful get one Movie');
  });

  app.get('/movies/genre/:name', (req, res) => {
    res.send('successfully get genre');
  });

  app.get('/movies/director/:name', (req, res) => {
    res.send('successfully get director');
  });

  app.post('/users', (req, res) => {
    res.send('successful register user');
  });

  app.put('/users/:username', (req, res) => {
    res.send('successful edit user');
  });

  app.post('/users/:username/movies/:movie-id', (req, res) => {
    res.send('successfully add movie to favorites');
  });

  app.delete('/users/:username/movies/:movie-id', (req, res) => {
    res.send('successfully delete movie from favorites');
  });

  app.delete('/users/:username', (req, res) => {
    res.send('successfully delete user');
  });


  // listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

  