import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAssets } from '../../queries/assets';
import { PaginationControl } from '../pagination/PaginationControl';

type Asset = {
  asset_group_id: number;
  asset_group_name: string;
  genome_digest: string;
  description: string;
  digest: string;
  name: string;
  recipe_id: number;
  size: number;
};

type AssetTableProps = {
  searchTerm: string;
  pageSize: number;
};

function AssetTable(props: AssetTableProps) {
  const { searchTerm, pageSize } = props;

  const navigate = useNavigate();
  const [offsetIndex, setOffsetIndex] = useState(0);

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
    pageSize, // limit
  );

  const maxPage = Math.ceil(assets?.pagination?.total / pageSize);
  const page = offsetIndex + 1;
  const minPage = 1;

  const sortedAssets = assets?.items
    ? [...assets.items].sort((a: Asset, b: Asset) =>
        (a.asset_group_name ?? '').localeCompare(b.asset_group_name ?? ''),
      )
    : [];

  return (
    <>
      {assets && assetsIsFetched ? (
        <>
          <div className='row row-cols-1 mt-4'>
            {sortedAssets.length > 0 ? (
              sortedAssets.map((asset: Asset) => {
                return (
                  <div className='col mb-3' key={asset.digest}>
                    <div
                      className='card asset-card cursor-pointer bg-body-tertiary shadow-sm'
                      onClick={() =>
                        navigate(
                          `/genomes/${asset.genome_digest}/${asset.digest}`,
                        )
                      }
                    >
                      <div className='card-body'>
                        <h6 className='fw-bold'>
                          {asset.asset_group_name} / {asset.name}
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
                                {asset.genome_digest}
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
          {maxPage > minPage && (
            <PaginationControl
              page={page}
              minPage={minPage}
              maxPage={maxPage}
              offsetIndex={offsetIndex}
              setOffsetIndex={setOffsetIndex}
            />
          )}
        </>
      ) : (
        <p className='mt-4'>Loading...</p>
      )}
    </>
  );
}

export default AssetTable;
