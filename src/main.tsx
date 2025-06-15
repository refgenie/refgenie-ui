import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './style.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Navbar from './components/Navbar';
import About from './components/pages/About';
import Search from './components/pages/Search';
import Genomes from './components/pages/Genomes';
import Assets from './components/pages/Assets';
import AssetClasses from './components/pages/AssetClasses';
import Recipes from './components/pages/Recipes';
import Downloads from './components/pages/Downloads';
import Config from './components/pages/Config';


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
                <Route path='/' element={<About />} />
                <Route path='/about' element={<About />} />
                <Route path='/search' element={<Search />} />
                <Route path='/genomes' element={<Genomes />} />
                <Route path='/assets' element={<Assets />} />
                <Route path='/assetclasses' element={<AssetClasses />} />
                <Route path='/recipes' element={<Recipes />} />
                <Route path='/downloads' element={<Downloads />} />
                <Route path='/config' element={<Config />} />
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