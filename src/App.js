import AuthForm from "./authForm/AuthForm";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Donor from "./donor/Donor";
import Hospital from "./hospital/Hospital";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/donor" element={<Donor />} />
        <Route path="/hospital" element={<Hospital />} />
      </Routes>
    </Router>
  );
}

export default App;
