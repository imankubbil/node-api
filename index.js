const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const app = express();

const {startDatabase} = require('./src/database/mongo');
const {insertAd, getAds, deleteAd, updateAd} = require('./src/database/ads');

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

app.get('/', async (req, res) => {
  res.send(await getAds());
});

const checkJwt = jwt({
  secret : jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://<DOMAIN YANG ADA DI AUTH0>/.well-known/jwks.json'
  }),

  audience : 'https://<DOMAIN YANG ADA DI AUTH0>/api/v2/',
  issuer : 'https://<DOMAIN YANG ADA DI AUTH0>/',
  algorithms : ['RS256']
});

app.use(checkJwt);

app.post('/createAds', async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);

  res.send({ status: 200, message : 'New ad inserted' });
});

app.delete('/:id', async (req, res) => {
  await deleteAd(req.params.id);

  res.send({ message: 'Ad removed.' });
});

app.put('/:id', async (req, res) => {
  const updatedAd = req.body;
  await updateAd(req.params.id, updatedAd);

  res.send({message : 'Ad updated.'});
});

startDatabase().then(async () => {
  await insertAd({title : 'Hello, now from the in-memory database!'});

  app.listen(3001, () => {
    console.log('Berjalan di port 3001');
  });
})