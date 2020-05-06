import React, { useEffect, useState } from 'react';

import './App.css';

const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    callApi();
  }, []);

  const getHashParams = () => {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  };

  const callApi = () => {
    var params = getHashParams();
    var access_token = params.access_token;
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then((response) => {
        console.log(response.body);
        if (!response.ok) {
          return Promise.reject('some reason');
        }

        return response.json();
      })

      .then((data) => setUser(data));
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

  const formattedUser = formatUser();
  const { images = [], displayName } = formattedUser;
  const imageURL = images.map((image) => image.url);

  return (
    <div className='App'>
      <header className='App-header'>
        <img href={imageURL} height='200px' width='200px' />
        <h2>{displayName}</h2>
      </header>
    </div>
  );
};

export default App;
