import React, { useState, useEffect, useMemo } from 'react';

import { Store } from './Store';

/* API Constants */
const CLIENT_ID = encodeURIComponent(process.env.REACT_APP_CLIENT_ID);
const CLIENT_SECRET = encodeURIComponent(process.env.REACT_APP_CLIENT_SECRET);
const API_BASE = process.env.REACT_APP_API_BASE;

export const App = () => {
  /* Setup hooks that affect the entire application */
  const [token, setToken] = useState(localStorage.getItem('API_TOKEN'));
  const [inventory, setInventory] = useState(JSON.parse(localStorage.getItem('API_INVENTORY')) || []);
  const [user, setUser] = useState({});
  const [basket, setBasket] = useState({});

  /* Increment the count of a certain item in the basket by 1.
     We'll have to convert this to the format the API takes later */
  const addToBasket = (pk) => setBasket({
    ...basket,
    [pk]: (basket[pk] || 0) + 1
  });

  /* The API wants the basket like this: [{object_id: 1, amount: 2}, ...]. */
  const APIBasket = useMemo(() => Object.keys(basket).map((v) => ({ object_id: v, amount: basket[v] })), [basket]);

  /* Sum up the price of the items in the basket, but don't generate a new
     unless basket changes. */
  const basketPrice = useMemo(() => (
    APIBasket.reduce((total, curr) => (
      total + inventory.find((e) => e.pk === Number(curr.object_id)).price * curr.amount
    ), 0)
  ), [basket]);

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

    const newToken = (await res.json()).access_token;
    setToken(newToken);
    localStorage.setItem('API_TOKEN', newToken);
    console.log(`New token retrived (${newToken}). Updating...`)

    return newToken;
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
        throw new Error('Still 401 after new token retrieval.');
      }
    }

    return await res.json();
  }

  /* Retrieve the available items in nibble and call the hook with them. Does not require
     authorization. */
  const updateInventory = async () => {
    const res = await fetch(`${API_BASE}/inventory/`);
    const newInventory = await res.json();
    setInventory(newInventory);
    localStorage.setItem('API_INVENTORY', JSON.stringify(newInventory));
  }

  /* Update the inventory (in mem and localstorage) if localstorage is empty. This is 
     because it should have been updated by the function anyway. This way we can trigger
     updates by clearing the localstorage.
     
     TODO: implement clear localstorage cache button */
  useEffect(() => !localStorage.getItem('API_INVENTORY') && updateInventory());

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

  /* Log out and clear the basket */
  const logout = () => {
    setUser({});
    setBasket({});
  }

  /* Input hooks. Because of this wonderful addition we no longer have to implement callbacks modifying
     state to have a stateful representation of input values. */
  const [inputRFID, setInputRFID] = useState('');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {user.pk ?
        <div style={{ width: '25%', height: '25vw' }}>
          <h3>{user.first_name} {user.last_name}</h3>
          <h6>Now: {user.saldo - basketPrice}</h6>
          <button onClick={() => logout()}>Log out</button>
        </div> :
        <div style={{ width: '25%', height: '25vw' }}>
          <h3>Sign in</h3>
          <input placeholder="RFID" type="text" value={inputRFID} onChange={(e) => setInputRFID(e.target.value)}></input>
          <input type="submit" onClick={() => login(inputRFID)} value="Login" />
        </div>
      }

      <Store inventory={inventory} isLoggedIn={!!user.pk} addToBasket={(pk) => addToBasket(pk)} />
    </div>
  );
};