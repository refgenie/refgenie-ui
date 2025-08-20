// import { useNavigate } from 'react-router-dom';

import { useAssetClasses } from '../../queries/assetClasses';

type AssetClass = {
  id: number;
  name: string;
  version: string;
  description: string;
};

type AssetClassTableProps = {
  searchTerm: string;
};

function AssetClassTable(props: AssetClassTableProps) {
  const { searchTerm } = props;
  // const navigate = useNavigate();

  const { data: assetClasses, isFetched } = useAssetClasses();

  const filteredAssetClasses = assetClasses?.filter(
    (asset: AssetClass) =>
      asset.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      {filteredAssetClasses && isFetched ? (
        <div className='row row-cols-1 mt-4'>
          {filteredAssetClasses.length > 0 ? (
            filteredAssetClasses.map((assetClass: AssetClass) => (
              <div className='col mb-3' key={assetClass.id}>
                {/* <div className='card asset-card cursor-pointer bg-body-tertiary shadow-sm' onClick={() => navigate(`/assetclasses/${assetClass.id}`)}> */}
                <div className='card bg-body-tertiary shadow-sm'>
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
      ) : (
        <p className='mt-4'>Loading...</p>
      )}
    </>
  );
}

export default AssetClassTable;
