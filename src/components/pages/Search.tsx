import { useState } from 'react';

import { useAboutSearch } from '../../stores/search';
// import { useArchives } from '../../queries/archives';


function Search() {
  const { searchTerm, setSearchTerm } = useAboutSearch();
  const [selectedSearch, setSelectedSearch] = useState('all')

  // const { data, isFetched } = useArchives();
  
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>

          <div className="d-flex align-items-center justify-content-center gap-3">
            <h6 className='fw-bold mb-0' style={{width: '10rem'}}>Search Refgenie:</h6>
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
            
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-lg-4 g-2 mt-3 mx-5">

            <div className="col">
              <div className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'all' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}>
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <p className={`card-title text-primary-emphasis ${selectedSearch === 'all' ? 'fw-bold' : 'fw-semibold'}`}>
                    <a className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'all' ? 'fw-bold' : ''}`} onClick={() => setSelectedSearch('all')}>
                      Archives
                    </a>
                  </p>
                  <p className={`card-text mb-2 text-xs ${selectedSearch === 'all' ? 'fw-medium' : 'fw-normal'}`}>
                    Search all of Refgenie, including genomes, assets, asset classes, and recipes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'genomes' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}>
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <p className={`card-title text-primary-emphasis`}>
                    <a className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'genomes' ? 'fw-bold' : ''}`} onClick={() => setSelectedSearch('genomes')}>
                      Genomes
                    </a>
                  </p>
                  <p className={`card-text mb-2 text-xs ${selectedSearch === 'genomes' ? 'fw-medium' : 'fw-normal'}`}>
                    Browse reference genome assemblies and sequences from various organisms.
                  </p>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'assets' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}>
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <p className={`card-title text-primary-emphasis ${selectedSearch === 'assets' ? 'fw-bold' : 'fw-semibold'}`}>
                    <a className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'assets' ? 'fw-bold' : ''}`} onClick={() => setSelectedSearch('assets')}>
                      Assets
                    </a>
                  </p>
                  <p className={`card-text mb-2 text-xs ${selectedSearch === 'assets' ? 'fw-medium' : 'fw-normal'}`}>
                    Browse genome assets like aligner indexes, annotation files, and other genome-derived data.
                  </p>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'asset_classes' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}>
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <p className={`card-title text-primary-emphasis ${selectedSearch === 'asset_classes' ? 'fw-bold' : 'fw-semibold'}`}>
                    <a className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'asset_classes' ? 'fw-bold' : ''}`} onClick={() => setSelectedSearch('asset_classes')}>
                      Asset Classes
                    </a>
                  </p>
                  <p className={`card-text mb-2 text-xs ${selectedSearch === 'asset_classes' ? 'fw-medium' : 'fw-normal'}`}>
                    Browse types of assets, such as alignment tools, annotations, and sequence databases.
                  </p>
                </div>
              </div>
            </div>

            <div className="col">
              <div className={`card shadow-sm position-relative cursor-pointer ${selectedSearch === 'recipes' ? 'bg-primary-subtle' : 'bg-body-tertiary'}`}>
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <p className={`card-title text-primary-emphasis ${selectedSearch === 'recipes' ? 'fw-bold' : 'fw-semibold'}`}>
                    <a className={`text-decoration-none text-reset stretched-link ${selectedSearch === 'recipes' ? 'fw-bold' : ''}`} onClick={() => setSelectedSearch('recipes')}>
                      Recipes
                    </a>
                  </p>
                  <p className={`card-text mb-2 text-xs ${selectedSearch === 'recipes' ? 'fw-medium' : 'fw-normal'}`}>
                    Browse build templates for generating standardized assets for a genome.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* {data && isFetched ? (
            <div className='row mt-4'>
              <div className='col-12'>
                <table className='table table-striped shadow-sm border text-xs'>
                  <thead>
                    <tr>
                      <th>asset digest</th>
                      <th>digest</th>
                      <th>contents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((archive: any, index: number) => (
                      <tr key={index}>
                        <td>{archive.asset_digest}</td>
                        <td>{archive.digest}</td>
                        <td>{archive.directory_contents.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )} */}
          
        </div>
      </div>
    </>
  );
}

export default Search;