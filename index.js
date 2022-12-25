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

  // listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
