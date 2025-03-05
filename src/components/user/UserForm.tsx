import React, { useState } from "react";
import { api } from "../../utils/api";

const UserForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users", { username, email });
      alert("User created!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Create User</button>
    </form>
  );
};

export default UserForm;
