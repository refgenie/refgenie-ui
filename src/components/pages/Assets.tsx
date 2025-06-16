import { useAssets } from "../../queries/assets";

type Asset = {
  digest: string;
  name: string;
  description: string;
  recipe_id: number;
  asset_group_id: number;
  size: number;
};

function Assets() {

  const { data, isFetched } = useAssets();
  
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          
          <h5 className='fw-bold'>Available Assets</h5>

          {data && isFetched ? (
            <div className='row row-cols-3 mt-4'>
              {data.map((asset: Asset) => 
                <div className='col mb-3' key={asset.digest}>
                  <div className='card'>
                  <div className='card-header fw-medium'>
                    {asset.digest}
                  </div>
                  <div className='card-body text-xs'>
                    <p className='fw-bold'>{asset.name}</p>
                    {asset.description}
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

export default Assets;