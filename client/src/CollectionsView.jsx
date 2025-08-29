import { useState, useEffect } from "react";
import axios from "axios";
import { parseMongoQuery, flattenObject } from "./utils";

export default function CollectionsView({ connectionId, dbName }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [query, setQuery] = useState("");
  const [autoExecute, setAutoExecute] = useState(false);
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [unsafeOp, setUnsafeOp] = useState(false);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await axios.post(
          "http://localhost:4990/list-collections-with-fields",
          {
            connectionId,
            dbName,
          }
        );
        if (res.data.success) setCollections(res.data.collections);
      } catch (err) {
        console.error("Error fetching collections:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, [connectionId, dbName]);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await axios.post("http://localhost:4990/generate-query", {
        prompt,
        collections,
        dbName,
      });
      if (res.data.success) {
        setQuery(res.data.query);
        if (res.data.query == "Unsafe Operation Requested") {
          setUnsafeOp(true);
        } else {
          setUnsafeOp(false);
        }
        if (autoExecute) {
          handleExecute(res.data.query);
        }
      }
    } catch (err) {
      console.error("Error generating query:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExecute(q) {
    setIsExecuting(true);
    try {
      const queryObj = parseMongoQuery(q, { connectionId, dbName });

      const res = await axios.post(
        "http://localhost:4990/execute-query",
        queryObj
      );

      if (res.data.success) {
        if (res.data.operation === "count") {
          setResult({ type: "count", value: res.data.count });
        } else {
          setResult({ type: "find", value: res.data.results });
        }
      } else {
        console.error("Query failed:", res.data.error);
      }
    } catch (err) {
      console.error("Query error:", err);
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-emerald-700">
          Collections in {dbName}
        </h1>
      </div>

      {loading ? (
        <p className="text-gray-500 italic">Fetching collections...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {collections.map((col, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-lg p-4 text-center border hover:shadow-lg transition"
            >
              <h2 className="text-lg font-medium text-emerald-700">
                {col.name}
              </h2>
              {col.fields?.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-semibold text-gray-700">Fields:</span>{" "}
                  {col.fields.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <h1 className="text-3xl font-semibold text-emerald-700 py-2">
        Query Generator
      </h1>
      <div className="bg-white shadow-md rounded-xl p-6 border">
        <textarea
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
          placeholder="Enter your query prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoExecute}
              onChange={() => setAutoExecute(!autoExecute)}
            />
            <label className="text-gray-600">Auto Execute</label>
          </div>
          <div className="space-x-2">
            <button
              onClick={handleGenerate}
              className={`bg-emerald-600 text-white px-4 py-2 rounded-lg ${isGenerating ? "opacity-50 cursor-not-allowed" : "{hover:bg-emerald-700"}`}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Query"}
            </button>
            {!autoExecute && query && (
              <button
                onClick={() => handleExecute(query)}
                disabled={isExecuting}
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg ${isExecuting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
              >
                {isExecuting ? "Executing..." : "Execute Query"}
              </button>
            )}
          </div>
        </div>

        {query && (
          <div className="mt-4 p-4 rounded-md font-mono text-green-400 bg-black overflow-x-auto">
            {unsafeOp ? (
              <p className="text-red-500 font-bold mt-2">
                Unsafe Operation Requested
              </p>
            ) : (
              <>
                <label className="text-green-400 font-semibold">
                  Generated Query:
                </label>
                <textarea
                  className="w-full mt-2 bg-black text-green-400 border-none resize-none focus:outline-none font-mono"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={Math.max(query.split("\n").length, 4)}
                />
              </>
            )}
          </div>
        )}

        {result?.type === "find" &&
          Array.isArray(result.value) &&
          result.value.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border border-gray-300 text-left rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-emerald-100">
                    {Object.keys(
                      result.value
                        .map((row) => flattenObject(row))
                        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
                    ).map((key) => (
                      <th key={key} className="px-4 py-2 border">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.value.map((row, rowIndex) => {
                    const flatRow = flattenObject(row);
                    const allKeys = Object.keys(
                      result.value
                        .map((row) => flattenObject(row))
                        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
                    );
                    return (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {allKeys.map((colKey) => (
                          <td
                            key={colKey}
                            className="px-4 py-2 border max-w-xs truncate"
                            title={
                              flatRow[colKey] !== undefined &&
                              flatRow[colKey] !== null
                                ? typeof flatRow[colKey] === "object"
                                  ? JSON.stringify(flatRow[colKey], null, 2)
                                  : String(flatRow[colKey])
                                : ""
                            }
                          >
                            {flatRow[colKey] !== undefined &&
                            flatRow[colKey] !== null
                              ? typeof flatRow[colKey] === "object"
                                ? JSON.stringify(flatRow[colKey]).length > 100
                                  ? JSON.stringify(flatRow[colKey]).slice(
                                      0,
                                      100
                                    ) + "..."
                                  : JSON.stringify(flatRow[colKey])
                                : String(flatRow[colKey]).length > 100
                                  ? String(flatRow[colKey]).slice(0, 100) +
                                    "..."
                                  : String(flatRow[colKey])
                              : ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        {result?.type === "count" && (
          <div className="mt-6 p-6 bg-emerald-100 border border-emerald-300 rounded-xl text-center">
            <h2 className="text-xl font-semibold text-emerald-700">
              Count Result
            </h2>
            <p className="text-3xl font-bold text-emerald-900 mt-2">
              {result.value.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
