require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require("./config/dbConfig");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3500;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

app.post("/connect", async (req, res) => {
  const { url } = req.body;
  try {
    const id = await db.connect(url);
    res.json({ success: true, connectionId: id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/list-dbs", async (req, res) => {
  const { connectionId } = req.body;
  try {
    const client = db.getClient(connectionId);
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    res.json({ success: true, databases: dbs.databases.map((d) => d.name) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/list-collections", async (req, res) => {
  const { connectionId, dbName } = req.body;
  try {
    const client = db.getClient(connectionId);
    const collections = await client.db(dbName).listCollections().toArray();
    res.json({ success: true, collections: collections.map((c) => c.name) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/list-collections-with-fields", async (req, res) => {
  const { connectionId, dbName } = req.body;
  try {
    const client = db.getClient(connectionId);
    const collections = await client.db(dbName).listCollections().toArray();

    const collectionsWithFields = [];
    for (const c of collections) {
      const sampleDoc = await client.db(dbName).collection(c.name).findOne({});
      collectionsWithFields.push({
        name: c.name,
        fields: sampleDoc ? Object.keys(sampleDoc) : [],
      });
    }

    res.json({ success: true, collections: collectionsWithFields });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/generate-query", async (req, res) => {
  const { prompt, collections, dbName } = req.body;

  try {
    const api_key = process.env.GOOGLE_API_KEY;

    const genAI = new GoogleGenerativeAI(api_key);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const systemPrompt = `
      You are an assistant that generates valid MongoDB queries only.
      Database: ${dbName}
      Collections with fields: ${JSON.stringify(collections, null, 2)}
      Rules:
      - Only use the fields listed above if required.
      - Always return a complete query starting with db.<collection>.find(...) or findOne(...).
      - Never invent new field names.
      - Do not wrap in markdown or code fences.
      - Use operators like $in, $gt, $lt, $regex when appropriate.
      - The query must have only the conditions implied by the user request.
      - Use either a find query or a countDocuments query, nothing else.
      - If user asks to insert/update/delete, reply with "Unsafe Operation Requested".
    `;

    const result = await chatSession.sendMessage(
      `${systemPrompt}\nUser request: ${prompt}`
    );

    const generatedQuery = result.response.text().trim();

    res.json({ success: true, query: generatedQuery });
  } catch (err) {
    console.error("Google Generative AI query generation error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/execute-query", async (req, res) => {
  const {
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
  } = req.body;

  try {
    const client = db.getClient(connectionId);
    if (!client) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid connectionId" });
    }

    const database = client.db(dbName);
    const col = database.collection(collection);

    if (operation === "count") {
      const queryFilter = filter || {};
      const countOptions = options || {};

      const count = await col.countDocuments(queryFilter, countOptions);

      return res.json({ success: true, operation: "count", count });
    }

    const queryFilter = filter || {};
    const queryProjection = projection || {};
    const querySort = sort || {};
    const queryLimit = limit ? parseInt(limit) : 0;
    const querySkip = skip ? parseInt(skip) : 0;

    let cursor = col.find(queryFilter, { projection: queryProjection });

    if (Object.keys(querySort).length) cursor = cursor.sort(querySort);
    if (querySkip) cursor = cursor.skip(querySkip);
    if (queryLimit) cursor = cursor.limit(queryLimit);

    const results = await cursor.toArray();

    res.json({
      success: true,
      operation: "find",
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("MongoDB query execution error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/disconnect", async (req, res) => {
  const { connectionId } = req.body;
  try {
    await db.disconnect(connectionId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
