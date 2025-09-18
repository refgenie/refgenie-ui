import { useState } from 'react';

import RecipeTable from '../recipes/RecipeTable';

function Recipes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='d-flex align-items-center justify-content-center gap-3'>
            <h6 className='fw-bold mb-0' style={{ width: '11rem' }}>
              Search Recipes:
            </h6>
            <div className={`input-group rounded`}>
              <input
                id='search-about'
                type='text'
                className='form-control'
                placeholder='fasta'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
              <span className='input-group-text bi bi-search'></span>
            </div>
            <select
              className='form-select w-25'
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>Limit 10</option>
              <option value={20}>Limit 20</option>
              <option value={50}>Limit 50</option>
              <option value={100}>Limit 100</option>
            </select>
          </div>

          <RecipeTable searchTerm={searchTerm} pageSize={pageSize} />
        </div>
      </div>
    </>
  );
}

export default Recipes;
