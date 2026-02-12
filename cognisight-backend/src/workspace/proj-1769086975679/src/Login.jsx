import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const nav = useNavigate();

  const login = async () => {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      localStorage.setItem("loggedIn", "true");
      nav("/dashboard");
    } else {
      alert("Invalid login");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <input placeholder="Username" onChange={e => setU(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setP(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}
