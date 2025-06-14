import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// import './index.css'
import './style.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import { genomesLoader } from './components/GenomesList';


const queryClient = new QueryClient();

function Main() {

  return (
    <BrowserRouter basename=''>
      <div className='d-flex flex-column flex-lg-row h-100 w-100 page-padding'>
        <Navbar />
        <div className='flex-1 content'>
          <div className='row page-width'>
            <div className='col-12 main'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Main />
  </QueryClientProvider>
)