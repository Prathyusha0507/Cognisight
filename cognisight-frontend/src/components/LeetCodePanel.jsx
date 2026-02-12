import { SCHEMAS } from "../schema";

export default function LeetCodePanel({
  schemaKey,
  setSchemaKey,
  count,
  setCount,
}) {
  return (
    <>
      <label>Problem Input Schema</label>
      <select value={schemaKey} onChange={e => setSchemaKey(e.target.value)}>
        {Object.entries(SCHEMAS).map(([key, s]) => (
          <option key={key} value={key}>
            {s.name}
          </option>
        ))}
      </select>

      <label>Number of Testcases</label>
      <input
        type="number"
        min={1}
        value={count}
        onChange={e => setCount(Number(e.target.value))}
      />

      <div style={{ fontSize: 12, color: "#555" }}>
        <b>Generated Input Format:</b>
        <pre>{SCHEMAS[schemaKey].template}</pre>
      </div>
    </>
  );
}
