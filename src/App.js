import React, { useState } from 'react';

/* API Constants */
const CLIENT_ID = encodeURIComponent(process.env.OW4_CLIENT_ID);
const CLIENT_SECRET = encodeURIComponent(process.env.OW4_CLIENT_SECRET);
const API_BASE = 'https://online.ntnu.no/api/v1';

export const App = () => {
  /* Setup hooks that affect the entire application */
  const [token, setToken] = useState('');
  const [inventory, setInventory] = useState([]);
  const [user, setUser] = useState({});

  /* This function will update our "hook token" and return it,
     as we need to use it directly in case of a 401 */
  const updateToken = async () => {
    console.log('Retrieving new token...');
    const res = await fetch(
      `${API_BASE}/auth/?client_id=` +
      `${CLIENT_ID}&client_secret=${CLIENT_SECRET}` +
      '&grant_type=client_credentials',
      { method: 'post' }
    );

    const _token = (await res.json()).access_token;
    setToken(_token);
    console.log(`New token retrived (${_token}). Updating...`)

    return _token;
  }

  /* We want to defaul to the "hook token" to avoid having to pass it all the time, and only
     when we're in the situation that we need to run with a fresh token. */
  const fetchWithToken = (url, options, _token = token) => fetch(url, { ...options, headers: { ...options.headers, authorization: `bearer ${_token}` } });

  /* This function will try to fetch the specified resource with the token, and if the token
     doesn't work, it will fetch a new one and try again. If it fails on the second run, it
     will throw and error and stop trying to avoid flooding the API. */
  const secureFetchWithTokenJSON = async (url, options = {}) => {
    console.log('Running command with token...');

    let res = await fetchWithToken(url, options);

    if (res.status === 401) {
      /* We need to retrive the new token like this, as we won't have access to the new token
         through a hook before this function call is over. */
      const newToken = await updateToken();
      res = await fetchWithToken(url, options, newToken);
    
      if (res.status === 401) {
        throw new Error("Still 401 after new token retrieval.");
      }
    }

    return await res.json();
  }

  /* Retrieve the available items in nibble and call the hook with them. Does not require
     authorization. */
  const updateInventory = async () => {
    const res = await fetch(`${API_BASE}/inventory/`);
    setInventory(await res.json());
  }

  /* Log into your user with RFID (of your access card) and retrieve name and balance. It returns
     an array with all users matching the login criteria, but we'll presume there's only one, and
     that _the one_ is the correct one. */
  const login = async (rfid) => {
    console.log('Begin logging in...');
    const user = await secureFetchWithTokenJSON(`${API_BASE}/usersaldo/?rfid=${rfid}`)

    console.log('User returned:');
    console.log(user.results[0]);
    console.log('Updating...');

    setUser(user.results[0]);
  }

  /* Input hooks. Because of this wonderful addition we no longer have to implement callbacks modifying
     state to have a stateful representation of input values. */
  const [inputRFID, setInputRFID] = useState('');

  return (
    <>
      <pre>Token: "{token}"</pre>
      <button onClick={() => { setToken('') }}>Clear token.</button>

      <h3>Available items</h3>
      <pre>
        {inventory.map((inventoryItem) => (
          inventoryItem.name + "\n"
        ))}
      </pre>

      <h3>User information</h3>
      <pre>
        Primary Key : {user.pk}<br />
        Navn        : {user.first_name} {user.last_name}<br />
        Saldo       : {user.saldo}
      </pre>
      <button onClick={() => updateInventory()}>Retrieve Inventory</button>

      <h3>Sign in</h3>
      <input placeholder="RFID" type='text' value={inputRFID} onChange={(e) => setInputRFID(e.target.value)}></input>
      <button onClick={() => login(inputRFID)}>Login</button>
    </>
  );
};