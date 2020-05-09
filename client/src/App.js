import React, { useEffect, useState } from 'react';

import './App.css';

const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    callApi();
  }, []);

  const callApi = () => {
    fetch('/get-user')
      .then((response) => {
        if (!response.ok) {
          return Promise.reject('some reason');
        }
        return response.json();
      })
      .then((data) =>
        fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: 'Bearer ' + data.access,
          },
        })
      )
      .then((response) => {
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
        <img src={imageURL} height='200px' width='200px' alt='avatar' />
        <h2>{displayName}</h2>
      </header>
      <a href='http://localhost:8888/login'>Login</a>
    </div>
  );
};

export default App;
