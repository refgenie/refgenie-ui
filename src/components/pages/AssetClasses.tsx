import { useAssetClasses } from "../../queries/assetClasses";

type AssetClass = {
  id: number;
  name: string;
  version: string;
  description: string;
};

function AssetClasses() {

  const { data, isFetched } = useAssetClasses();
  
  return (
    <>
      <div className='row'>
        <div className='col-12'>
          
          <h5 className='fw-bold'>Available Asset Classes</h5>

          {data && isFetched ? (
            <div className='row row-cols-3 mt-4'>
              {data.map((assetClass: AssetClass) => 
                <div className='col mb-3' key={assetClass.id}>
                  <div className='card'>
                  <div className='card-header fw-medium'>
                    {assetClass.name}
                  </div>
                  <div className='card-body text-xs'>
                    {assetClass.description}
                  </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}

        </div>
      </div>
    </>
  );
}

export default AssetClasses;