import React, { Component, use, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'
import Home from './components/Home'
import Cart from './components/Cart'
import { toast, ToastContainer } from 'react-toastify';
import Item6 from './images/item6.jpg'


const App = () => {
  useEffect(() => {
    toast("Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.");
    toast((t) => (<img className="bottom-right-image" src={Item6} alt="Bottom Right" />))
  }, []);
  
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
