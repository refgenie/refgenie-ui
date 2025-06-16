import { useGenomes } from '../../queries/genomes';

type Genome = {
  digest: string;
  description: string;
};

function Genomes() {

  const { data, isFetched } = useGenomes();
  
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          
          <h5 className='fw-bold'>Available Genomes</h5>

          {data && isFetched ? (
            <div className='row row-cols-3 mt-4'>
              {data.map((genome: Genome) => 
                <div className='col mb-3' key={genome.digest}>
                  <div className='card'>
                  <div className='card-header fw-medium'>
                    {genome.digest}
                  </div>
                  <div className='card-body text-xs'>
                    {genome.description}
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

export default Genomes;