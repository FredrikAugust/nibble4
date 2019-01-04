import React, { useState } from "react";

export const RegistrationModal = ({ register }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div id="registration-modal" style={{ display: "none" }}>
      <form
        onSubmit={e => {
          e.preventDefault();
          register(username, password);
        }}
      >
        <label htmlFor="username">username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label htmlFor="password">password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <input type="submit" value="register" />
      </form>
    </div>
  );
};
