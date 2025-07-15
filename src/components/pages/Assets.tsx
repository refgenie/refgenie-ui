import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAssets } from '../../queries/assets';
import { useAssetGroups } from '../../queries/assetGroups';


type Asset = {
  asset_group_id: number;
  description: string;
  digest: string;
  name: string;
  recipe_id: number;
  size: number;
};

type AssetGroup = {
  asset_class_id: number;
  default_asset: string;
  description: string;
  genome_digest: string;
  id: number;
  name: string;
};

function Assets() {
  const navigate = useNavigate();

  const { data: assets, isFetched: assetsIsFetched } = useAssets();
  const { data: assetGroups, isFetched: assetGroupsIsFetched } = useAssetGroups();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assets?.filter((asset: Asset) => 
    asset.digest.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAssets = assetGroups?.map((assetGroup: AssetGroup) => 
    filteredAssets?.find((asset: Asset) => asset.asset_group_id === assetGroup.id)
  ).filter(Boolean);

  const filteredAssetGroups = assetGroups?.filter((assetGroup: AssetGroup) => 
    sortedAssets?.some((asset: Asset) => asset.asset_group_id === assetGroup.id)
  );

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          
          <div className="d-flex align-items-center justify-content-center gap-3">
            <h6 className='fw-bold mb-0' style={{width: '10rem'}}>Search Assets:</h6>
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

          {assets && assetsIsFetched && assetGroups && assetGroupsIsFetched ? (
            <div className='row row-cols-1 mt-4'>
              {sortedAssets.map((asset: Asset, index: number) => {
                const assetGroup = filteredAssetGroups[index];
                
                return (
                  <div className='col mb-3' key={asset.digest}>
                    <div className='card asset-card cursor-pointer bg-body-tertiary shadow-sm' onClick={() => navigate(`/genomes/${assetGroup.genome_digest}/${asset.digest}`)}>
                      <div className='card-body'>
                        <h6 className='fw-bold'>{assetGroup.name} / {asset.name}</h6>
                        <div className='text-xs'>
                          <p className='mb-2 fst-italic text-muted'>{asset.description}</p>
                          <div className='d-flex align-items-end'>
                            <span><strong>Asset Digest: </strong><span className='text-muted'>{asset.digest}</span></span>
                            <span className='ms-3'><strong>Genome Digest: </strong><span className='text-muted'>{assetGroup.genome_digest}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='mt-4'>Loading...</p>
          )}

        </div>
      </div>
    </>
  );
}

export default Assets;