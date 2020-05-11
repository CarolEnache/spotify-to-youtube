import React, { useEffect, useState } from 'react';
import * as SpotifyWebApi from 'spotify-web-api-js';
import * as youtubeSearch from 'youtube-search';

let Spotify = new SpotifyWebApi();

const App = () => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [youtubeSearchResult, setYoutubeSearchResult] = useState();
  Spotify.setAccessToken(token);

  var opts = {
    maxResults: 1,
    key: 'AIzaSyD3XQ8nYYiMuRFnnrqMVpJ_6WYfufCtWZ4',
  };

  const [responseToPost, setResponseToPost] = useState();

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

  // const getHardcodedYoutubeSerch = () => {
  //   fetch('/youtube-search')
  //     .then((data) => data.json())
  //     .then((data) => console.log(data));
  // };

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

  const IndividualSpotifyPlaylist = () => {
    const setSearchQuery = (songName, singers) => {
      let query = `${songName} ${singers}`;
      console.log(query);
      youtubeSearch(query, opts, function (err, results) {
        if (err)
          return console.error('form error :::::::::::::::::::::::', err);
        console.log('form error :::::::::::::::::::::::', results);
        return setYoutubeSearchResult(results);
      });
    };
    console.log(youtubeSearchResult);
    return (
      !!playlist && (
        <ul>
          <h2>Spotify playlist</h2>
          {playlist.map(({ track }) => {
            const { artists } = track;
            let singers = artists
              .map((artistName) => artistName.name)
              .join(' ');
            return (
              <li
                key={track.id}
                onClick={() => setSearchQuery(track.name, singers)}
              >
                <span>
                  {singers} - {track.name}
                </span>
              </li>
            );
          })}
        </ul>
      )
    );
  };

  const formattedUser = formatUser();
  const { images = [], displayName } = formattedUser;
  const imageURL = images.map((image) => image.url);

  // youtubeSearch('abba', opts, function (err, results) {
  //   if (err) return console.log('form error :::::::::::::::::::::::', err);
  //   console.log('form error :::::::::::::::::::::::', results);
  //   return results;
  // });
  // youtubeSearch();

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={imageURL} height='200px' width='200px' alt='avatar' />
        <h2>{displayName}</h2>
      </header>
      <a href='http://localhost:8888/login'>Login</a>
      <div>
        <div>
          {playlists &&
            playlists.map(({ id, name }) => (
              <div>
                {name}{' '}
                <button onClick={() => getPlaylist(id)}>
                  open this playlist
                </button>
              </div>
            ))}
          {playlist && <IndividualSpotifyPlaylist />}
        </div>
      </div>
      <button onClick={getPlaylists}>Get playlists</button>
    </div>
  );
};

export default App;
