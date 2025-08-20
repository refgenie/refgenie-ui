import { useNavigate } from 'react-router-dom';
import { useGenomes } from '../../queries/genomes';

type GenomeTableProps = {
  searchTerm: string;
};

function GenomesTable(props: GenomeTableProps) {
  const { searchTerm } = props;

  const navigate = useNavigate();

  const { data: genomes, isFetched: fetchedGenomes } = useGenomes();
  const filteredData = genomes?.filter(
    (row: any) =>
      row.digest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.species_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.aliases.some((alias: string) =>
        alias.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <>
      {filteredData && fetchedGenomes ? (
        <div className='rounded shadow-sm border text-xs mt-4'>
          <table className='table table-striped table-hover table-rounded'>
            {filteredData.length > 0 ? (
              <>
                <thead>
                  <tr>
                    <th className='text-nowrap'>Genome Alias</th>
                    <th className='text-nowrap'>Species</th>
                    <th className='text-nowrap'>Description</th>
                    <th className='text-nowrap'>Asset Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((genome: any, index: number) => (
                    <tr
                      key={index}
                      className='cursor-pointer'
                      onClick={() => navigate(`/genomes/${genome.digest}`)}
                    >
                      <td className='text-nowrap'>
                        {genome.aliases[0] || genome.digest}
                      </td>
                      <td className='text-nowrap'>{genome.species_name}</td>
                      <td>{genome.description}</td>
                      <td className='text-end text-nowrap'>
                        {genome.asset_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th className='text-nowrap'>Genome Alias</th>
                    <th className='text-nowrap'>Species</th>
                    <th className='text-nowrap'>Description</th>
                    <th className='text-nowrap'>Asset Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='text-nowrap'>No query results.</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </>
            )}
          </table>
        </div>
      ) : (
        <p className='mt-4'>Loading...</p>
      )}
    </>
  );
}

export default GenomesTable;
