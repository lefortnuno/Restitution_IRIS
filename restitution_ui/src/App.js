import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Restitution from "@/pages/Restitution";
import Visualisation from "@/pages/Visualisation";
import AddForm from "@/pages/AddForm"; 
import UpdateForm from "@/pages/UpdateForm"; 
import DuplicateForm from "@/pages/DuplicateForm"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Restitution />} />
        <Route
          path="/visualisation/:restitutionId"
          element={<Visualisation />}
        /> 
        <Route path="/parametrage" element={<AddForm />} />
        <Route
          path="/modification/:restitutionId"
          element={<UpdateForm />}
        /> 
        <Route
          path="/duplication/:restitutionId"
          element={<DuplicateForm />}
        /> 
      </Routes>
    </Router>
  );
}

export default App;
