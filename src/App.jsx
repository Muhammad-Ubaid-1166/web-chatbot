import { Routes, Route, Link } from "react-router-dom";
import Chat from "./pages/chat"
import AdminPanel from "./pages/admin"

function App() {
  return (
    <>
      {/* Optional navigation */}
      <nav className="bg-gray-100 p-4 flex gap-4">
        <Link to="/" className="text-blue-500">Chat</Link>
        <Link to="/admin" className="text-blue-500">Admin</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </>
  );
}

export default App;
