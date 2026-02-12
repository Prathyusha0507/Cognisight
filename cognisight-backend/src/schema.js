function generateQuickInput(template = "{int}") {
  const out = [];

  for (let line of template.split("\n")) {
    line = line.trim();

    if (line === "{int}") out.push(String(Math.floor(Math.random() * 100)));
    else if (line === "{string}") out.push(Math.random().toString(36).slice(2, 7));
    else if (line === "{double}") out.push((Math.random() * 100).toFixed(2));
    else out.push("");
  }

  return out.join("\n");
}

module.exports = { generateQuickInput };
