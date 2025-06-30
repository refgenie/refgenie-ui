import { useState } from 'react';
import { useGenomes } from '../../queries/genomes';
import { useAliases } from '../../queries/aliases';

// import type { Genome } from '../../../types';

function Genomes() {
  const { data: genomes, isFetched: fetchedGenomes } = useGenomes();
  const { data: aliases, isFetched: fetchedAliases } = useAliases();
  const [searchTerm, setSearchTerm] = useState('');

  const aliasesRenamed = aliases?.map((alias: any) => ({ digest: alias.genome_digest, name: alias.name }))

  function combineArrays<T extends Record<string, any>>(arr1: T[], arr2: T[], keyField: keyof T) {
    const map = new Map<any, T>();
    
    // Add all objects from first array
    arr1.forEach(obj => map.set(obj[keyField], obj));
    
    // Merge with objects from second array
    arr2.forEach(obj => {
      if (map.has(obj[keyField])) {
        // Merge properties if key exists
        map.set(obj[keyField], { ...map.get(obj[keyField]), ...obj });
      } else {
        // Add new object if key doesn't exist
        map.set(obj[keyField], obj);
      }
    });
    
    return Array.from(map.values());
  }

  const combined = (genomes && aliasesRenamed) 
    ? combineArrays(genomes, aliasesRenamed, 'digest')
    : genomes || [];

  const filteredData = combined?.filter((row: any) => 
    row.digest.toLowerCase().includes(searchTerm.toLowerCase()) || 
    row.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>

          <div className="d-flex align-items-center justify-content-center gap-3">
            <h6 className='fw-bold mb-0' style={{width: '10rem'}}>Search Genomes:</h6>
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

          {filteredData && fetchedGenomes && fetchedAliases ? (
            <div className='rounded shadow-sm border text-xs mt-4'>
              <table className='table table-striped table-hover table-rounded'>
                <thead>
                  <tr>
                    <th>Genome Digest</th>
                    <th>Genome Alias</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((genome: any, index: number) => (
                    <tr key={index} className='cursor-pointer' onClick={() => window.location.href = `/genomes/${genome.digest}`}>
                      <td>{genome.digest}</td>
                      <td>{genome.name}</td>
                      <td>{genome.description}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          ) : (
            <p className='mt-4'>Loading...</p>
          )}

        </div>
      </div>
    </>
  );
}

export default Genomes;
