import React, { Component, use, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'
import Home from './components/Home'
import Cart from './components/Cart'
import { toast, ToastContainer } from 'react-toastify';
import Item6 from './images/item6.jpg'
import ChatBot from 'react-chatbotify'
import { sendPrompt } from './components/websocketplayer';


const App = () => {

  const flow={
    start: {
        message: "Look at those beautiful shoes! Would you like to add any to your cart?",
        path: "end_loop"
    },
    end_loop: {
        message: (params:any) => sendPrompt(`Received: ${params.userInput}`),
        path: "end_loop"
    }
}

  

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
      
      <ChatBot
        flow={flow}
        settings={{ general: {showFooter: false, primaryColor: '#fe9e93', secondaryColor: '#ee6e73'} }}
      />
    </div>

  );
}

export default App;
