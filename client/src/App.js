import React, { Component } from 'react';

import logo from './logo.svg';

import './App.css';

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
  };

  componentDidMount() {
    console.log('did mount');
    this.callApi();
    // .then((res) => this.setState({ response: res.express }))
    // .catch((err) => console.log(err));
  }

  getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  callApi = () => {
    var params = this.getHashParams();
    var access_token = params.access_token;
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(function (response) {
        console.log(response.body);
        if (!response.ok) {
          return Promise.reject('some reason');
        }

        return response.json();
      })

      .then((data) => console.log(data));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
  };

  render() {
    return (
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className='App-link'
            href='https://reactjs.org'
            target='_blank'
            rel='noopener noreferrer'
          >
            Learn React
          </a>
        </header>
        <p>{this.state.response}</p>
        <form onSubmit={this.handleSubmit}>
          <p>
            <strong>Post to Server:</strong>
          </p>
          <input
            type='text'
            value={this.state.post}
            onChange={(e) => this.setState({ post: e.target.value })}
          />
          <button type='submit'>Submit</button>
        </form>
        <p>{this.state.responseToPost}</p>
      </div>
    );
  }
}

export default App;
