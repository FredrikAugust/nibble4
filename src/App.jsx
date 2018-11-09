import React, { useState, useMemo, useEffect } from 'react';

import Marquee from 'react-smooth-marquee';

import { Store } from './Store';
import { Basket } from './Basket';
import { UserSection } from './UserSection';
import { Login } from './Login';

/* API Constants */
const CLIENT_ID = encodeURIComponent(process.env.REACT_APP_CLIENT_ID);
const CLIENT_SECRET = encodeURIComponent(process.env.REACT_APP_CLIENT_SECRET);
const API_BASE = process.env.REACT_APP_API_BASE;

export const App = () => {
  /* Setup hooks that affect the entire application */
  const [token, setToken] = useState(localStorage.getItem('API_TOKEN'));

  let initialInventory;
  try {
    initialInventory = JSON.parse(localStorage.getItem('API_INVENTORY'));
  } catch(e) {
    console.error("Could not read inventory from localStorage.");
  }

  const [inventory, setInventory] = useState(initialInventory || []);
  const [user, setUser] = useState({});
  const [basket, setBasket] = useState({});

  const [recentPurchase, setRecentPurchase] = useState(false);

  /* Increment the count of a certain item in the basket by 1.
     We'll have to convert this to the format the API takes later */
  const addToBasket = (pk) => setBasket({
    ...basket,
    [pk]: (basket[pk] || 0) + 1
  });

  /* Remove an item from the basket based on the pk. Remove key if none
     left. */
  const removeFromBasket = (pk) => {
    if (basket[pk] === 1) {
      let _basket = Object.assign({}, basket);
      delete _basket[pk];
      return setBasket(_basket);
    }

    setBasket({
      ...basket,
      [pk]: (basket[pk] - 1)
    });
  }

  /* The API wants the basket like this: [{object_id: 1, amount: 2}, ...]. */
  const orders = useMemo(() => Object.keys(basket).map((v) => ({ object_id: v, amount: basket[v] })), [basket]);

  /* Sum up the price of the items in the basket, but don't generate a new
     unless basket changes. */
  const basketPrice = useMemo(() => (
    orders.reduce((total, curr) => (
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
  const fetchWithToken = (url, options, _token = token) => fetch(url, { ...options, headers: { ...options.headers, authorization: `bearer ${_token}`, 'content-type': 'application/json' } });

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

  /* In case our inventory is empty, we want to refetch it. */
  useEffect(() => {
    if (inventory.length === 0) {
      updateInventory();
    }
  }, [inventory]);

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

  /* Generate the basket in a friendly format every time the basket is updated. */
  const prettyBasket = useMemo(() => (
    Object.keys(basket).map((basketItemPK) => ({ amount: basket[basketItemPK], ...inventory.find((e) => (e.pk === Number(basketItemPK))) }))
  ), [basket]);

  /* Purchase the items in basket. This requires a token. */
  const purchase = async () => {
    console.log('Begin purchase...');
    const res = await secureFetchWithTokenJSON(
      `${API_BASE}/orderline/`,
      {
        body: JSON.stringify({ orders, user: user.pk }),
        method: 'POST'
      }
    );
    console.log(res);
    console.log('Purchase complete. Logging out.');
    logout();

    setRecentPurchase(true);
    setTimeout(() => setRecentPurchase(false), 5000);
  }

  return (
    <>
      { recentPurchase ? <Marquee style={{width: "10px"}}>Kjøp vellykket.</Marquee> : null}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {user.pk ?
          <div>
            <UserSection
              logout={() => logout()}
              oldSaldo={user.saldo}
              newSaldo={user.saldo - basketPrice}
              name={`${user.first_name} ${user.last_name}`}
              updateInventory={() => updateInventory()}
            />
            <Basket
              basket={prettyBasket}
              purchase={() => purchase()}
              removeFromBasket={(pk) => removeFromBasket(pk)}
            />
          </div> :
          <Login login={(rfid) => login(rfid)} />
        }

        <Store inventory={inventory} isLoggedIn={!!user.pk} addToBasket={(pk) => addToBasket(pk)} />
      </div>
    </>
  );
};