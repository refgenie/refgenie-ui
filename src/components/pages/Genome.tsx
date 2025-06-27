import { useParams } from 'react-router-dom';

import { useGenomes } from '../../queries/genomes';
import { useAliases } from '../../queries/aliases';
import { useArchives } from '../../queries/archives';
import { useAssets } from '../../queries/assets';


// type Props = {
//   genome: Genome,
// }

function Genome() {
  const params = useParams();
  const digest = params.digest;

  const { data: genome } = useGenomes(digest);
  const { data: alias } = useAliases(undefined, digest);
  const { data: archives } = useArchives(undefined, digest);
  const { data: assets } = useAssets(undefined, undefined, digest);

  const assetDigests = assets?.map((asset: any) => asset.digest)
  const archiveAssets = archives?.filter((archive: any) => assetDigests.includes(archive.asset_digest))

  const combinedAssets = archiveAssets?.map((archive: any)  => {
    const matchingAsset = assets?.find((asset: any) => asset.digest === archive.asset_digest);
    return {
      archive,
      asset: matchingAsset
    };
  });
  
  console.log(genome)
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>

          <h6>
            <a className='fw-bold text-decoration-none text-black cursor-pointer' onClick={() => window.location.href = `/genomes`}>Genomes</a> 
            {' / '}
            <span>{digest}</span>
          </h6>

          {alias && <p className='mt-5 mb-1 fw-bold'>{alias[0].name}</p>}

          {genome && <p>{genome[0].description}</p>}
          
          {combinedAssets && 
            <div className='rounded shadow-sm border text-xs mt-4'>
              <table className='table table-striped table-hover table-rounded'>
                <thead>
                  <tr>
                    <th>Archive Item</th>
                    <th>Asset Name</th>
                    <th>Asset Digest</th>
                    <th>Description</th>
                    <th>Asset Size</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedAssets.flatMap((group: any, index: number) => 
                    group.archive.directory_contents?.map((item: string, itemIndex: number) => (
                      <tr key={`${index}-${itemIndex}`} className='cursor-pointer'>
                        <td>{item}</td>
                        <td>{group.asset.name}</td>
                        <td>{group.asset.digest}</td>
                        <td>{group.asset.description}</td>
                        <td>{group.asset.size}</td>
                      </tr>
                    )) || []
                  )}
                </tbody>

              </table>
            </div>
          }


        </div>
      </div>
    </>
  );
}

export default Genome;
