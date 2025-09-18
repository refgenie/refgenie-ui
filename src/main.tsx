import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Navbar from './components/Navbar';
import About from './components/pages/About';
import Search from './components/pages/Search';
import Genomes from './components/pages/Genomes';
import Genome from './components/pages/Genome';
import Assets from './components/pages/Assets';
import Asset from './components/pages/Asset';
import AssetClasses from './components/pages/AssetClasses';
import AssetClass from './components/pages/AssetClass';
import Recipes from './components/pages/Recipes';
import Recipe from './components/pages/Recipe';
import Bookmarks from './components/pages/Bookmarks';
import Config from './components/pages/Config';

const queryClient = new QueryClient();

function Main() {
  return (
    <BrowserRouter basename=''>
      <div className='d-flex flex-column flex-lg-row min-vh-100'>
        <Navbar />
        <div className='flex-1 content px-2 px-lg-0'>
          <div className='container-fluid'>
            <div className='row'>
              <div className='col-12'>
                <Routes>
                  <Route path='/' element={<About />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/search' element={<Search />} />
                  <Route path='/genomes' element={<Genomes />} />
                  <Route path='/genomes/:genomeDigest' element={<Genome />} />
                  <Route
                    path='/genomes/:genomeDigest/:assetDigest'
                    element={<Asset />}
                  />
                  <Route path='/assets' element={<Assets />} />
                  <Route path='/assetclasses' element={<AssetClasses />} />
                  <Route
                    path='/assetclasses/:assetClassID'
                    element={<AssetClass />}
                  />
                  <Route path='/recipes' element={<Recipes />} />
                  <Route path='/recipes/:recipeID' element={<Recipe />} />
                  <Route path='/bookmarks' element={<Bookmarks />} />
                  <Route path='/config' element={<Config />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster position='bottom-right' />
    <Main />
  </QueryClientProvider>,
);
