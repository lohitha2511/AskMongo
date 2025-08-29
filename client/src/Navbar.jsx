export default function Navbar({ dbName, onBack }) {
  return (
    <nav className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <h1 className="text-xl font-bold">TalkToMongo</h1>
      <div className="flex items-center space-x-4">
        <span className="hidden md:inline">
          Database: <strong>{dbName}</strong>
        </span>
        <button
          onClick={onBack}
          className="bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-300 transition"
        >
          Back
        </button>
      </div>
    </nav>
  );
}
