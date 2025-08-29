function parseMongoQuery(query, { connectionId, dbName }) {
  let collection = null;
  let operation = "find";
  let filter = {};
  let projection = {};
  let sort = {};
  let limit = 0;
  let skip = 0;
  let options = {};

  try {
    const collectionMatch = query.match(/db\.(\w+)\./);
    if (collectionMatch) {
      collection = collectionMatch[1];
    }

    if (/countDocuments\s*\(/.test(query)) {
      operation = "count";
      const countMatch = query.match(/countDocuments\s*\((.*)\)/);

      if (countMatch && countMatch[1].trim()) {
        const args = splitArgs(countMatch[1]);

        if (args[0]) {
          try {
            filter = eval("(" + args[0] + ")");
          } catch (e) {
            console.error("Error parsing countDocuments filter:", e);
          }
        }

        if (args[1]) {
          try {
            options = eval("(" + args[1] + ")");
          } catch (e) {
            console.error("Error parsing countDocuments options:", e);
          }
        }
      }
    } else if (/find\s*\(/.test(query)) {
      operation = "find";
      const findMatch = query.match(/find\s*\((.*)\)/);

      if (findMatch) {
        const args = splitArgs(findMatch[1]);
        filter = args[0] ? safeEval(args[0]) : {};
        projection = args[1] ? safeEval(args[1]) : {};
      }

      const sortMatch = queryString.match(/\.sort\s*\(([\s\S]*?)\)/);
      sort = sortMatch ? safeEval(sortMatch[1]) : {};

      const skipMatch = queryString.match(/\.skip\s*\((\d+)\)/);
      skip = skipMatch ? parseInt(skipMatch[1], 10) : 0;

      const limitMatch = queryString.match(/\.limit\s*\((\d+)\)/);
      limit = limitMatch ? parseInt(limitMatch[1], 10) : 100;
    }
  } catch (err) {
    console.error("parseMongoQuery error:", err);
  }

  return {
    connectionId,
    dbName,
    collection,
    operation,
    filter,
    projection,
    sort,
    limit,
    skip,
    options,
  };
}

function splitArgs(str) {
  const parts = [];
  let depth = 0,
    start = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{" || str[i] === "[") depth++;
    if (str[i] === "}" || str[i] === "]") depth--;
    if (str[i] === "," && depth === 0) {
      parts.push(str.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (start < str.length) parts.push(str.slice(start).trim());
  return parts;
}

function safeEval(str) {
  try {
    return Function('"use strict";return (' + str + ")")();
  } catch {
    return {};
  }
}

function flattenObject(obj, parentKey = "", res = {}) {
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key], newKey, res);
    } else {
      res[newKey] = obj[key];
    }
  }
  return res;
}

export { parseMongoQuery, flattenObject };
