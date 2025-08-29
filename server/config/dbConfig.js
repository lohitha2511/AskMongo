const { MongoClient } = require("mongodb");
const { v4: uuid } = require("uuid");

const connections = new Map();

async function connect(uri) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  const id = uuid();
  connections.set(id, client);
  return id;
}

function getClient(id) {
  const client = connections.get(id);
  if (!client) throw new Error("Invalid connectionId");
  return client;
}

async function disconnect(id) {
  const client = getClient(id);
  await client.close();
  connections.delete(id);
}

module.exports = { connect, getClient, disconnect };
