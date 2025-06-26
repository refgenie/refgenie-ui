import { useParams } from 'react-router-dom';

import { useAliases } from '../../queries/aliases';
import { useAssets } from '../../queries/assets';


// type Props = {
//   genome: Genome,
// }

function Genome() {
  const params = useParams();
  const digest = params.digest;


  const { data: alias } = useAliases(undefined, digest);
  const { data: assets } = useAssets(undefined, undefined, digest);
  
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>

          <h6 className='fw-bold'>Genomes / <span>{digest}</span></h6>
          {alias && <p className='mt-5 fw-bold'>{alias[0].name}</p>}
          
          {assets && 
            <table className='table table-striped table-hover shadow-sm border text-xs mt-4'>
              <thead>
                <tr>
                  <th>asset name</th>
                  <th>description</th>
                  <th>size</th>
                  <th>asset digest</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset: any, index: number) => (
                  <tr key={index} className='cursor-pointer'>
                    <td>{asset.name}</td>
                    <td>{asset.description}</td>
                    <td>{asset.size}</td>
                    <td>{asset.digest}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          }


        </div>
      </div>
    </>
  );
}

export default Genome;