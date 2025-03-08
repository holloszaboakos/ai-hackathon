import React, { Component, use, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'
import Home from './components/Home'
import Cart from './components/Cart'
import { toast, ToastContainer } from 'react-toastify';
import Item6 from './images/item6.jpg'


const App = () => {
  
  return (
    <div>
      
      <Router>
        <div className="App">

          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </div>

  );
}

export default App;
