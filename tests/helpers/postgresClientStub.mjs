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
      throw new Error(`Unsupported Postgres test filter for ${key}.`);
    }
    return {
      key,
      value: decodeURIComponent(value.slice(3)),
    };
  }
  return null;
}

export function createPostgresClientStub(seedTables = {}) {
  const tables = new Map(Object.entries(seedTables).map(([name, rows]) => [name, clone(rows)]));
  const calls = [];

  function table(name) {
    if (!tables.has(name)) {
      tables.set(name, []);
    }
    return tables.get(name);
  }

  return {
    calls,
    tables,

    async query(sql) {
      calls.push({ method: "QUERY", sql: String(sql || "") });
      return [];
    },

    async requestTable(tableName, { body = null, method = "GET", query = "select=*" } = {}) {
      const rows = table(tableName);
      const normalizedMethod = String(method || "GET").toUpperCase();
      const filter = filterFromQuery(query);
      calls.push({ body: clone(body), method: normalizedMethod, query, tableName });

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

      if (normalizedMethod === "DELETE") {
        if (!filter) {
          throw new Error(`DELETE ${tableName} requires an equality filter.`);
        }
        const deleted = [];
        for (let index = rows.length - 1; index >= 0; index -= 1) {
          if (String(rows[index][filter.key]) !== filter.value) {
            continue;
          }
          deleted.unshift(rows[index]);
          rows.splice(index, 1);
        }
        return clone(deleted);
      }

      throw new Error(`Unsupported Postgres test method: ${normalizedMethod}.`);
    },
  };
}
