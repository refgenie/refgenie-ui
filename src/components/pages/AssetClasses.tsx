import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

import { useAssetClasses } from "../../queries/assetClasses";


type AssetClass = {
  id: number;
  name: string;
  version: string;
  description: string;
};

function AssetClasses() {
  // const navigate = useNavigate();

  const { data: assetClasses, isFetched } = useAssetClasses();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssetClasses = assetClasses?.filter((asset: AssetClass) => 
    asset.version.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          
          <div className="d-flex align-items-center justify-content-center gap-3">
            <h6 className='fw-bold mb-0' style={{width: '15rem'}}>Search Asset Classes:</h6>
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
          </div>

          {filteredAssetClasses && isFetched ? (
            <div className='row row-cols-1 mt-4'>
              {filteredAssetClasses.map((assetClass: AssetClass) => 
                <div className='col mb-3' key={assetClass.id}>
                  {/* <div className='card asset-card cursor-pointer bg-body-tertiary shadow-sm' onClick={() => navigate(`/assetclasses/${assetClass.id}`)}> */}
                  <div className='card bg-body-tertiary shadow-sm'>

                    <div className='card-body'>
                      <h6 className='fw-bold'>{assetClass.name}</h6>
                      <div className='text-xs'>
                        <p className='mb-2 fst-italic text-muted'>{assetClass.description}</p>
                        <div className='d-flex align-items-end'>
                          <span><strong>Version: </strong><span className='text-muted'>{assetClass.version}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className='mt-4'>Loading...</p>
          )}

        </div>
      </div>
    </>
  );
}

export default AssetClasses;
