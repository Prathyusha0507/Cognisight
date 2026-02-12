import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const nav = useNavigate();

  const signup = async () => {
    await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    nav("/login");
  };

  return (
    <div className="card">
      <h2>Sign Up</h2>
      <input placeholder="Username" onChange={e => setU(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setP(e.target.value)} />
      <button onClick={signup}>Create Account</button>
    </div>
  );
}
