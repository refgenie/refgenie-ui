import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useGenomes } from '../../queries/genomes';
import { useApiClient } from '../../services/api';
import { useLocalBridgeStore, useLocalDigestIndex } from '../../services/localBridge';
import { PaginationControl } from '../pagination/PaginationControl';

type GenomeTableProps = {
  searchTerm: string;
  pageSize: number;
};

function GenomesTable(props: GenomeTableProps) {
  const { searchTerm, pageSize } = props;

  const navigate = useNavigate();
  const api = useApiClient();
  const bridgeStatus = useLocalBridgeStore((state) => state.status);
  const { data: localIndex } = useLocalDigestIndex();
  // Presence badges only make sense on the remote branch: digests are
  // content-derived, so remote-digest ∈ local-index is an exact match.
  const showLocalBadges = api.routeBase === '' && bridgeStatus === 'connected';
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
                      <th className='text-nowrap'>Source</th>
                      <th className='text-nowrap'>Accession</th>
                      <th className='text-nowrap'>Description</th>
                      <th className='text-nowrap'>Asset Count</th>
                      {showLocalBadges && <th className='text-nowrap'>Local</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {genomes?.items?.map((genome: any, index: number) => (
                      <tr
                        key={index}
                        className='cursor-pointer'
                        onClick={() =>
                          navigate(`${api.routeBase}/genomes/${genome.digest}`)
                        }
                      >
                        <td className='text-nowrap'>
                          {genome.aliases[0] || genome.digest}
                        </td>
                        <td className='text-nowrap'>{genome.species_name}</td>
                        <td className='text-nowrap'>{genome.assembly_source}</td>
                        <td className='text-nowrap'>
                          {genome.assembly_accession}
                        </td>
                        <td>{genome.description}</td>
                        <td className='text-end text-nowrap'>
                          {genome.asset_count}
                        </td>
                        {showLocalBadges && (
                          <td className='text-nowrap'>
                            {localIndex?.genomeDigests.has(genome.digest) && (
                              <span
                                className='badge text-bg-success'
                                title='You already have this genome on your local refgenie'
                              >
                                <i className='bi bi-hdd me-1'></i>Local
                              </span>
                            )}
                          </td>
                        )}
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
                      <th className='text-nowrap'>Source</th>
                      <th className='text-nowrap'>Accession</th>
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
