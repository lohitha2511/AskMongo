import { useState } from "react";
import axios from "axios";

export default function DatabaseConnect({ onConnect }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (url) {
      try {
        const res = await axios.post("http://localhost:4990/connect", { url });
        if (res.data.success) {
          onConnect(res.data.connectionId);
        } else {
          setError("Failed to connect.");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Connection error.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please enter a MongoDB connection URI.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Connect to MongoDB
        </h1>
        <p className="text-gray-500 text-center mt-2">
          Enter your MongoDB connection URI
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            placeholder="mongodb+srv://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold transition ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-700"
            }`}
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}
