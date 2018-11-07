import React, { useState } from 'react';

const CLIENT_ID = encodeURIComponent('');
const CLIENT_SECRET = encodeURIComponent('');

const API_BASE = 'https://online.ntnu.no/api/v1';

export const App = () => {
  const [token, setToken] = useState('not required');
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState({});

  const updateToken = async () => {
    console.log('Retrieving new token...');
    const res = await fetch(
      `${API_BASE}/auth/?client_id=` +
      `${CLIENT_ID}&client_secret=${CLIENT_SECRET}` +
      '&grant_type=client_credentials',
      { method: 'post' }
    );

    const resToken = (await res.json()).access_token
    console.log(`New token retrived: ${resToken}. Updating...`)
    setToken(resToken);

    return resToken;
  }

  const runWithToken = async (fn, cb) => {
    console.log('Running command with token...');
    try {
      throw await fn();
    } catch (e) {
      console.log(`Response acquired, status ${e.status}.`)
      switch (e.status) {
        case 401:
          const resToken = await updateToken();
          console.log(`Running command after token update (new token: ${resToken})...`);
          const res = await fn(resToken);
          return cb(await res.json());
        case 200:
          console.log('Running command without token update...');
          return cb(await e.json());
        default:
          throw new Error('Unknown error encountered.');
      }
    }
  }

  const updateInventory = async () => {
    const res = await fetch(`${API_BASE}/inventory/`);
    setInventory(await res.json());
  }

  const login = (rfid) => {
    console.log('Begin logging in...');
    runWithToken(async (_token = token) => (
      await fetch(
        `${API_BASE}/usersaldo/?rfid=${rfid}`,
        { headers: { authorization: `bearer ${_token}` } },
      )
    ), (u) => {
      console.log('User returned:');
      console.log(u.results[0]);
      console.log('Updating...');

      setUser(u.results[0]);
    });
  }

  const inputRef = React.createRef();

  return (
    <>
      <h1>Token: {token}</h1>
      <ul>
        {inventory.map((e) => (
          <li key={e.pk}>{e.name}</li>
        ))}
      </ul>
      <pre>
        Primary Key : {user.pk}<br />
        Navn        : {user.first_name} {user.last_name}<br />
        Saldo       : {user.saldo}
      </pre>


      <button onClick={() => updateInventory()}>Retrieve Inventory</button>
      <br />
      <br />

      <input type='text' ref={inputRef}></input>
      <button onClick={() => login(inputRef.current.value)}>Login</button>
    </>
  );
};