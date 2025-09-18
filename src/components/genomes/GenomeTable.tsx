import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useGenomes } from '../../queries/genomes';
import { PaginationControl } from '../pagination/PaginationControl';

type GenomeTableProps = {
  searchTerm: string;
  pageSize: number;
};

function GenomesTable(props: GenomeTableProps) {
  const { searchTerm, pageSize } = props;

  const navigate = useNavigate();
  const [offsetIndex, setOffsetIndex] = useState(0);

  const { data: genomes, isFetched: fetchedGenomes } = useGenomes(
    '', // genomeDigest
    '', // alias
    searchTerm, // query
    '', // searchFields
    'contains', // operator
    offsetIndex * pageSize, // offset
    pageSize, // limit
  );

  const maxPage = Math.ceil(genomes?.pagination?.total / pageSize);
  const page = offsetIndex + 1;
  const minPage = 1;

  return (
    <>
      {genomes && fetchedGenomes ? (
        <>
          <div className='rounded shadow-sm border text-xs mt-4'>
            <table className='table table-striped table-hover table-rounded'>
              {genomes?.items?.length > 0 ? (
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
                    {genomes?.items?.map((genome: any, index: number) => (
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

export default GenomesTable;
