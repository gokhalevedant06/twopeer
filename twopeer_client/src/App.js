import './App.css';
import React,{useState,useRef} from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Route,Routes } from 'react-router-dom';
import Receiver from './Receiver';
import Sender from './Sender';
function App() {
  return(

    <Routes>
  <Route path="/receiver" element={<Receiver/>} />
  <Route path="/test" element={<>Hello</>}/>
  <Route path="/" element={<Sender/>}/>
</Routes>
  )

}

export default App;
