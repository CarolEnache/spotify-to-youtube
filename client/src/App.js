import React, { useEffect, useState } from 'react';
import * as SpotifyWebApi from 'spotify-web-api-js';

let Spotify = new SpotifyWebApi();

const App = () => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  Spotify.setAccessToken(token);

  useEffect(() => {
    getToken();
  }, []);

  const getToken = () => {
    fetch('/get-token')
      .then((response) => {
        if (!response.ok) {
          return Promise.reject('some reason');
        }
        return response.json();
      })
      .then((token) => {
        setToken(token.access);
        fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: 'Bearer ' + token.access,
          },
        })
          .then((response) => {
            if (!response.ok) {
              return Promise.reject('some reason');
            }

            return response.json();
          })
          .then((user) => setUser(user));
      });
  };

  const formatUser = () => {
    let camelCasedUser = {};
    for (const property in user) {
      let newProperty = property.replace(/(\_\w)/g, (m) => m[1].toUpperCase());
      if (camelCasedUser[newProperty] === newProperty) {
        return;
      } else {
        camelCasedUser[newProperty] = user[property];
      }
    }

    return camelCasedUser;
  };
  const getPlaylists = () => {
    !!token &&
      Spotify.getUserPlaylists().then(
        (data) => {
          return setPlaylists(data.items);
        },
        (err) => {
          console.error(err);
        }
      );
  };

  const getPlaylist = (id) => {
    Spotify.getPlaylistTracks(id, (error, playlist) => {
      if (error) console.log(error);

      return setPlaylist(playlist.items);
    });
  };

  const formattedUser = formatUser();
  const { images = [], displayName } = formattedUser;
  const imageURL = images.map((image) => image.url);
  console.log(playlist);

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={imageURL} height='200px' width='200px' alt='avatar' />
        <h2>{displayName}</h2>
      </header>
      <a href='http://localhost:8888/login'>Login</a>
      <div>
        <ul>
          {playlists &&
            playlists.map(({ id, name }) => (
              <li key={id} onClick={() => getPlaylist(id)}>
                {name}
                {!!playlist && (
                  <ul>
                    {playlist.map(({ track }) => {
                      return <li key={track.id}>{track.name}</li>;
                    })}
                  </ul>
                )}
              </li>
            ))}
        </ul>
      </div>
      <button onClick={getPlaylists}>Get playlists</button>
    </div>
  );
};

export default App;
