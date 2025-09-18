import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAssets } from '../../queries/assets';
import { useAssetAssetGroups } from '../../queries/assetGroups';
import { PaginationControl } from '../pagination/PaginationControl';

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

type AssetTableProps = {
  searchTerm: string;
};

function AssetTable(props: AssetTableProps) {
  const { searchTerm } = props;

  const navigate = useNavigate();
  const [offsetIndex, setOffsetIndex] = useState(0);
  const pageSize = 10;

  const { data: assets, isFetched: assetsIsFetched } = useAssets(
    '', // name
    '', // assetClass  
    '', // genomeDigest
    '', // recipeName  
    NaN, // assetGroupID  
    searchTerm, // query
    '', // searchFields
    'contains', // operator
    offsetIndex * pageSize, // offset
    pageSize  // limit
  );

  const maxPage = Math.ceil(assets?.pagination?.total / pageSize);
  const page = offsetIndex + 1;
  const minPage = 1;

  const selectedAssetGroupIDs = assets?.items.map((asset: Asset)  => asset.asset_group_id)
  const uniqueSelectedAssetGroupIDs = [...new Set(selectedAssetGroupIDs)]

  const assetGroups = useAssetAssetGroups(uniqueSelectedAssetGroupIDs as number[]);
  // const archivesIsLoading = archives.some(query => query.isFetching || query.isLoading);
  const assetGroupsData = assetGroups
    .map((query) => query.data)
    .filter(Boolean)
    .flat();

  // const { data: assetGroups, isFetched: assetGroupsIsFetched } = useAssetGroups();
  const sortedAssets = assetGroupsData
    ?.map((assetGroup: AssetGroup) =>
      assets?.items?.find(
        (asset: Asset) => asset.asset_group_id === assetGroup.id,
      ),
    )
    .filter(Boolean);

  const filteredAssetGroups = assetGroupsData?.filter((assetGroup: AssetGroup) =>
    sortedAssets?.some(
      (asset: Asset) => asset.asset_group_id === assetGroup.id,
    ),
  );

  return (
    <>
      {assets && assetsIsFetched && assetGroupsData ? (
        <>
          <div className='row row-cols-1 mt-4'>
            {sortedAssets.length > 0 ? (
              sortedAssets.map((asset: Asset, index: number) => {
                const assetGroup = filteredAssetGroups[index];

                return (
                  <div className='col mb-3' key={asset.digest}>
                    <div
                      className='card asset-card cursor-pointer bg-body-tertiary shadow-sm'
                      onClick={() =>
                        navigate(
                          `/genomes/${assetGroup.genome_digest}/${asset.digest}`,
                        )
                      }
                    >
                      <div className='card-body'>
                        <h6 className='fw-bold'>
                          {assetGroup.name} / {asset.name}
                        </h6>
                        <div className='text-xs'>
                          <p className='mb-2 fst-italic text-muted'>
                            {asset.description}
                          </p>
                          <div className='d-flex align-items-end'>
                            <span>
                              <strong>Asset Digest: </strong>
                              <span className='text-muted'>{asset.digest}</span>
                            </span>
                            <span className='ms-3'>
                              <strong>Genome Digest: </strong>
                              <span className='text-muted'>
                                {assetGroup.genome_digest}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className='mt-5 text-center text-muted'>No query results.</p>
            )}
          </div>
          {(maxPage > minPage) && <PaginationControl page={page} minPage={minPage} maxPage={maxPage} offsetIndex={offsetIndex} setOffsetIndex={setOffsetIndex} />}
        </>
      ) : (
        <p className='mt-4'>Loading...</p>
      )}
    </>
  );
}

export default AssetTable;
