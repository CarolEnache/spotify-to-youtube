const bodyParser = require('body-parser');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var youtubeSearch = require('youtube-search');

var client_id = 'd4292190530d446c91340646b71c26dc'; // Your client id
var client_secret = '34d430c541b64bc79bdf903186078fd1'; // Your secret
var redirect_uri = 'http://localhost:8888/callback/'; // Your redirect uri
let access = '';

const app = express();
// const port = process.env.PORT || 5000;
const port = 8888;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var generateRandomString = function (length) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch',
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, (error, response, body) => {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('http://localhost:3000/logged-in/');
        access = access_token;
      } else {
        res.redirect(
          '/#' +
            querystring.stringify({
              error: 'invalid_token',
            })
        );
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

app.get('/get-token', (req, res) => {
  res.send({ access });
});

var opts = {
  maxResults: 1,
  key: 'AIzaSyAU-5aETV9Go-VDfYf9y90Ueauiy169s70',
};

// app.get('/youtube-search', (req, res) => {
//   youtubeSearch('The Sideshow (feat. Ernie Fresh)', opts, function (
//     err,
//     results
//   ) {
//     if (err) return console.log('form error :::::::::::::::::::::::', err);

//     res.send(results);
//   });
// });

// app.get('/api/hello', (req, res) => {
//   res.send({ express: 'Hello From Express' });
// });

// app.get('/youtube-search', (req, res) => {
//   let youtubeSearchQuery = req.body.post;
//   let youTubeResponse = {};
//   youtubeSearch('abba', opts, function (err, results) {
//     if (err) return console.log('form error :::::::::::::::::::::::', err);
//     console.log('form error :::::::::::::::::::::::', results);
//     return results;
//   });
//   youtubeSearch();

//   console.log('youTubeResponse ::::', youTubeResponse);
//   // res.send(youTubeResponse);
//   res.send({ ceva: 'ceva' });
// });

app.listen(port, () => console.log(`Listening on port ${port}`));
