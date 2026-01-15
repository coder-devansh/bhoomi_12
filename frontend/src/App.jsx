import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Admin from "./components/Admin";
import LawyerDashboard from "./components/LawyerDashboard";
import AIChatbot from "./components/AIChatbot";
import AIVoiceAssistant from "./components/AIVoiceAssistant";
import BlockchainDocuments from "./components/BlockchainDocuments";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        <Route path="/documents" element={<BlockchainDocuments />} />
      </Routes>
      {/* Global AI Chatbot - Available on all pages */}
      <AIChatbot />
      {/* Global AI Voice Assistant - Available on all pages */}
      
    </Router>
  );
}

export default App;
