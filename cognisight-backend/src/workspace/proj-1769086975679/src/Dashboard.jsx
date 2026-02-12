import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const nav = useNavigate();

  const load = async () => {
    const res = await fetch("http://localhost:3000/items");
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editIndex !== null) {
      await fetch(`http://localhost:3000/items/${editIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: text })
      });
      setEditIndex(null);
    } else {
      await fetch("http://localhost:3000/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: text })
      });
    }
    setText("");
    load();
  };

  const logout = () => {
    localStorage.removeItem("loggedIn");
    nav("/login");
  };

  return (
    <div className="card">
      <h2>Dashboard</h2>

      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={save}>{editIndex !== null ? "Update" : "Add"}</button>

      <ul>
        {items.map((i, idx) => (
          <li key={idx}>
            {i}
            <span>
              <button onClick={() => { setText(i); setEditIndex(idx); }}>✏</button>
              <button onClick={async () => {
                await fetch(`http://localhost:3000/items/${idx}`, { method: "DELETE" });
                load();
              }}>❌</button>
            </span>
          </li>
        ))}
      </ul>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
