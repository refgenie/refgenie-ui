import { useState } from 'react';

import { useAboutSearch } from '../../stores/search';
// import { useArchives } from '../../queries/archives';

import GenomesTable from '../genomes/GenomeTable';
import AssetTable from '../assets/AssetTable';
import AssetClassTable from '../asset_classes/AssetClassTable';
import RecipeTable from '../recipes/RecipeTable';

function Search() {
  const { searchTerm, setSearchTerm } = useAboutSearch();
  const [selectedSearch, setSelectedSearch] = useState('genomes');

  // const { data, isFetched } = useArchives();

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='d-flex align-items-center justify-content-center gap-3'>
            <h6 className='fw-bold mb-0' style={{ width: '10rem' }}>
              Search Refgenie:
            </h6>
            <div className={`input-group`}>
              <input
                id='search-about'
                type='text'
                className='form-control'
                placeholder='hg38'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
              <span className='input-group-text bi bi-search'></span>
            </div>
          </div>

          <div className='row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-xl-4 g-lg-4 g-2 mt-0 mx-5'>
            <div className='col'>
              <div
                className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'genomes' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}
              >
                <div className='card-body text-center d-flex flex-column justify-content-center p-2'>
                  <p className={`card-title text-primary-emphasis mb-0`}>
                    <a
                      className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'genomes' ? 'fw-bold' : ''}`}
                      onClick={() => setSelectedSearch('genomes')}
                    >
                      Genomes
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className='col'>
              <div
                className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'assets' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}
              >
                <div className='card-body text-center d-flex flex-column justify-content-center p-2'>
                  <p
                    className={`card-title text-primary-emphasis mb-0 ${selectedSearch === 'assets' ? 'fw-bold' : 'fw-semibold'}`}
                  >
                    <a
                      className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'assets' ? 'fw-bold' : ''}`}
                      onClick={() => setSelectedSearch('assets')}
                    >
                      Assets
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className='col'>
              <div
                className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'asset_classes' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}
              >
                <div className='card-body text-center d-flex flex-column justify-content-center p-2'>
                  <p
                    className={`card-title text-primary-emphasis mb-0 ${selectedSearch === 'asset_classes' ? 'fw-bold' : 'fw-semibold'}`}
                  >
                    <a
                      className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'asset_classes' ? 'fw-bold' : ''}`}
                      onClick={() => setSelectedSearch('asset_classes')}
                    >
                      Asset Classes
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className='col'>
              <div
                className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'recipes' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}
              >
                <div className='card-body text-center d-flex flex-column justify-content-center p-2'>
                  <p
                    className={`card-title text-primary-emphasis mb-0 ${selectedSearch === 'recipes' ? 'fw-bold' : 'fw-semibold'}`}
                  >
                    <a
                      className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'recipes' ? 'fw-bold' : ''}`}
                      onClick={() => setSelectedSearch('recipes')}
                    >
                      Recipes
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-12'>
              {searchTerm === '' && (
                <p className='mt-5 text-center text-muted'>
                  Enter a query to view results.
                </p>
              )}
              {searchTerm !== '' && selectedSearch === 'genomes' && (
                <GenomesTable searchTerm={searchTerm} />
              )}
              {searchTerm !== '' && selectedSearch === 'assets' && (
                <AssetTable searchTerm={searchTerm} />
              )}
              {searchTerm !== '' && selectedSearch === 'asset_classes' && (
                <AssetClassTable searchTerm={searchTerm} />
              )}
              {searchTerm !== '' && selectedSearch === 'recipes' && (
                <RecipeTable searchTerm={searchTerm} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Search;
