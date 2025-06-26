import { useState } from 'react';
import { useGenomes } from '../../queries/genomes';

import type { Genome } from '../../../types';

function Genomes() {
  const { data, isFetched } = useGenomes();
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>

          <div className="d-flex align-items-center justify-content-center gap-3">
            <h6 className='fw-bold mb-0' style={{width: '10rem'}}>Search Genomes:</h6>
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

          {data && isFetched ? (
            <table className='table table-striped table-hover shadow-sm border text-xs mt-4'>
              <thead>
                <tr>
                  <th>digest</th>
                  <th>description</th>
                </tr>
              </thead>
              <tbody>
                {data.map((genome: Genome, index: number) => (
                  <tr key={index} className='cursor-pointer' onClick={() => window.location.href = `/genomes/${genome.digest}`}>
                    <td>{genome.digest}</td>
                    <td>{genome.description}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          ) : (
            <p>Loading...</p>
          )}

        </div>
      </div>
    </>
  );
}

export default Genomes;