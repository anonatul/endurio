import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Onboard from "./pages/Onboard";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute } from "./utils/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/onboard" element={<ProtectedRoute><Onboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );  
}

export default App;
