import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAssetClasses } from '../../queries/assetClasses';
import { PaginationControl } from '../pagination/PaginationControl';

type AssetClass = {
  id: number;
  name: string;
  version: string;
  description: string;
};

type AssetClassTableProps = {
  searchTerm: string;
  pageSize: number;
};

function AssetClassTable(props: AssetClassTableProps) {
  const { searchTerm, pageSize } = props;

  const navigate = useNavigate();
  const [offsetIndex, setOffsetIndex] = useState(0);

  const { data: assetClasses, isFetched } = useAssetClasses(
    '', // name
    '', // version
    searchTerm, // query
    '', // searchFields
    'contains', // operator
    offsetIndex * pageSize, // offset
    pageSize, // limit
  );

  const maxPage = Math.ceil(assetClasses?.pagination?.total / pageSize);
  const page = offsetIndex + 1;
  const minPage = 1;

  return (
    <>
      {assetClasses && isFetched ? (
        <>
          <div className='row row-cols-1 mt-4'>
            {assetClasses?.items?.length > 0 ? (
              assetClasses?.items?.map((assetClass: AssetClass) => (
                <div className='col mb-3' key={assetClass.id}>
                  <div
                    className='card asset-card cursor-pointer bg-body-tertiary shadow-sm'
                    onClick={() => navigate(`/assetclasses/${assetClass.id}`)}
                  >
                    <div className='card-body'>
                      <h6 className='fw-bold'>{assetClass.name}</h6>
                      <div className='text-xs'>
                        <p className='mb-2 fst-italic text-muted'>
                          {assetClass.description}
                        </p>
                        <div className='d-flex align-items-end'>
                          <span>
                            <strong>Version: </strong>
                            <span className='text-muted'>
                              {assetClass.version}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
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

export default AssetClassTable;
