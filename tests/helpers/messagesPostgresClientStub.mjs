function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function filterFromQuery(query = "") {
  const params = new URLSearchParams(query);
  for (const [key, value] of params.entries()) {
    if (key === "select") {
      continue;
    }
    if (!value.startsWith("eq.")) {
      throw new Error(`Unsupported Messages Postgres test filter for ${key}.`);
    }
    return {
      key,
      value: decodeURIComponent(value.slice(3)),
    };
  }
  return null;
}

export function createMessagesPostgresClientStub() {
  const tables = new Map();

  function table(name) {
    if (!tables.has(name)) {
      tables.set(name, []);
    }
    return tables.get(name);
  }

  return {
    async query(sql) {
      if (!String(sql || "").trim()) {
        return [];
      }
      return [];
    },

    async requestTable(tableName, { body = null, method = "GET", query = "select=*" } = {}) {
      const rows = table(tableName);
      const normalizedMethod = String(method || "GET").toUpperCase();
      const filter = filterFromQuery(query);

      if (normalizedMethod === "GET") {
        const selected = filter ? rows.filter((row) => String(row[filter.key]) === filter.value) : rows;
        return clone(selected);
      }

      if (normalizedMethod === "POST") {
        const incomingRows = Array.isArray(body) ? body : [body];
        const written = incomingRows.map((incoming) => {
          const row = clone(incoming || {});
          const index = rows.findIndex((existing) => existing.key === row.key);
          if (index === -1) {
            rows.push(row);
          } else {
            rows[index] = { ...rows[index], ...row };
          }
          return row;
        });
        return clone(written);
      }

      if (normalizedMethod === "PATCH") {
        if (!filter) {
          throw new Error(`PATCH ${tableName} requires an equality filter.`);
        }
        const patched = [];
        rows.forEach((row, index) => {
          if (String(row[filter.key]) !== filter.value) {
            return;
          }
          rows[index] = { ...row, ...clone(body || {}) };
          patched.push(rows[index]);
        });
        return clone(patched);
      }

      throw new Error(`Unsupported Messages Postgres test method: ${normalizedMethod}.`);
    },
  };
}
