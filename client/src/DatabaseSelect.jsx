import { useState, useEffect } from "react";
import axios from "axios";

export default function DatabaseSelect({ connectionId, onSelect, onBack }) {
  const [dbs, setDbs] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDbs() {
      try {
        const res = await axios.post("http://localhost:4990/list-dbs", {
          connectionId,
        });
        if (res.data.success) {
          setDbs(res.data.databases);
        }
      } catch (err) {
        console.error("Error fetching DBs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDbs();
  }, [connectionId]);

  function handleSubmit(e) {
    e.preventDefault();
    if (selected) onSelect(selected);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Choose a Database
        </h1>
        <p className="text-gray-500 text-center mt-2">
          Select which database you want to explore
        </p>

        {loading ? (
          <p className="text-center mt-6 text-gray-500">Loading databases...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <select
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-700"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">-- Select a database --</option>
              {dbs.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Continue
            </button>
          </form>
        )}

        <button
          onClick={onBack}
          className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-xl hover:bg-gray-400 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
