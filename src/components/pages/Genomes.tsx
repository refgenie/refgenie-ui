import { useState } from 'react';
import GenomesTable from '../genomes/GenomeTable';

function Genomes() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='d-flex align-items-center justify-content-center gap-3'>
            <h6 className='fw-bold mb-0' style={{ width: '10rem' }}>
              Search Genomes:
            </h6>
            <div className={`input-group rounded`}>
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

          <GenomesTable searchTerm={searchTerm} />
        </div>
      </div>
    </>
  );
}

export default Genomes;
