import { useEffect, useState } from "react";
import axios from "axios";

export default function History() {
  const [items, setItems] = useState([]);

  async function load() {
    const res = await axios.get("http://localhost:5000/api/history");
    setItems(res.data);
  }

  async function del(id) {
    await axios.delete(`http://localhost:5000/api/history/${id}`);
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Execution History</h2>

      {items.map(h => (
        <div key={h.id} className="card">
          <b>{h.language}</b>
          <pre>{h.input}</pre>
          <pre>{h.output}</pre>
          <button onClick={() => del(h.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
