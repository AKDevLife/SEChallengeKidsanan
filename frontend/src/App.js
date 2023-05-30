import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Manage from "./ManageStore";

const App = () => {
  return (
    <Router>
      <div>
        {/* Other routes and components */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manage" element={<Manage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
