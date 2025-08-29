import { useState } from "react";
import DatabaseConnect from "./DatabaseConnect";
import DatabaseSelect from "./DatabaseSelect";
import CollectionsView from "./CollectionsView";
import Navbar from "./Navbar";

function App() {
  const [connectionId, setConnectionId] = useState(null);
  const [dbName, setDbName] = useState(null);

  if (!connectionId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <h1 className="text-5xl font-bold text-emerald-800 mb-4">
          Welcome to AskMongo
        </h1>
        <p className="text-lg text-emerald-700 mb-16 max-w-xl text-center">
          Connect to your MongoDB database, explore collections, and generate
          AI-assisted queries effortlessly.
        </p>
        <DatabaseConnect onConnect={setConnectionId} />
      </div>
    );
  }

  if (!dbName) {
    return (
      <DatabaseSelect
        connectionId={connectionId}
        onSelect={setDbName}
        onBack={() => setConnectionId(null)}
      />
    );
  }

  return (
    <>
      <Navbar dbName={dbName} onBack={() => setDbName(null)} />
      <CollectionsView connectionId={connectionId} dbName={dbName} />
    </>
  );
}

export default App;
