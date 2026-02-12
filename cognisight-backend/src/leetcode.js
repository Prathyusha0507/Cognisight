function parseConstraints(text = "") {
  const bounds = {};

  const lines = text.split("\n");
  for (let line of lines) {
    line = line.replace(/\s+/g, "");

    let m = line.match(/(\d+)≤n≤(\d+)/);
    if (m) bounds.n = { min: +m[1], max: +m[2] };

    m = line.match(/(\d+)≤arr\[i\]≤(\d+)/);
    if (m) bounds.arr = { min: +m[1], max: +m[2] };

    m = line.match(/(\d+)≤len\(s\)≤(\d+)/);
    if (m) bounds.string = { min: +m[1], max: +m[2] };
  }

  return bounds;
}
function generateMatrix(n, min = 0, max = 9) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row.push(
        Math.floor(Math.random() * (max - min + 1)) + min
      );
    }
    rows.push(row.join(" "));
  }
  return rows.join("\n");
}

export function generateLeetCodeInput(format, constraintsText = "") {
  const bounds = parseConstraints(constraintsText);
  const out = [];

  const n =
    bounds.n
      ? Math.floor(Math.random() * (bounds.n.max - bounds.n.min + 1)) + bounds.n.min
      : Math.floor(Math.random() * 5) + 1;

  for (let line of format.split("\n")) {
    line = line.trim();

    if (line === "n") {
      out.push(String(n));
    }

    else if (line === "arr") {
      const min = bounds.arr?.min ?? 0;
      const max = bounds.arr?.max ?? 100;

      const arr = Array.from({ length: n }, () =>
        Math.floor(Math.random() * (max - min + 1)) + min
      );
      out.push(arr.join(" "));
    }

    else if (line === "string") {
      const len = bounds.str?.max ?? Math.max(3, n);
      out.push(Math.random().toString(36).slice(2, 2 + len));
    }

    else if (line === "matrix") {
      // first n rows, n columns
      for (let i = 0; i < n; i++) {
        const row = Array.from({ length: n }, () =>
          Math.floor(Math.random() * 10)
        );
        out.push(row.join(" "));
      }
    }
  }

  return out.join("\n");
}

//module.exports = { generateLeetCodeInput };
