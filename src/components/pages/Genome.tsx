import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useGenome } from '../../queries/genomes';
import { useAliases } from '../../queries/aliases';
import { useGenomeArchives } from '../../queries/archives';
import { useAssets } from '../../queries/assets';
import { hasCapability, useApiClient } from '../../services/api';
import FileDownloads from '../assets/FileDownloads';

// type Props = {
//   genome: Genome,
// }

function Genome() {
  const navigate = useNavigate();
  const api = useApiClient();
  const API_BASE = api.baseUrl;

  const params = useParams();
  const digest = params.genomeDigest;

  const [copied, setCopied] = useState(false);

  const { data: genome } = useGenome(digest);
  const { data: alias } = useAliases(undefined, digest);
  const { data: assets } = useAssets(undefined, undefined, digest);

  const { data: archives } = useGenomeArchives(digest);
  const archivesData = archives?.items ?? [];

  // Drive the list from assets (not archives) so file-mode assets — e.g.
  // fasta_index with serving_modes=["file"], which have no archive tarball —
  // still get a row. Left-join each asset to its archive (if any).
  const combinedAssets = (assets?.items ?? []).map((asset: any) => {
    const matchingArchive = archivesData.find(
      (archive: any) => archive.asset_digest === asset.digest,
    );

    return {
      asset,
      archive: matchingArchive,
    };
  });

  // Genome-level metadata. Core fields are dedicated columns on the detail
  // response; the long tail rides the read-only FHR sidecar blob (genome.fhr).
  const fhr: any = genome?.fhr ?? {};
  const vitalStats: any = fhr?.vitalStats ?? {};
  const metadataAuthors: any[] = fhr?.metadataAuthor ?? [];
  const assemblyAuthors: any[] = fhr?.assemblyAuthor ?? [];
  const relatedLinks: string[] = fhr?.relatedLink ?? [];

  const taxonUri =
    genome?.taxon_uri ||
    (genome?.taxon_id
      ? `https://identifiers.org/taxonomy:${genome.taxon_id}`
      : undefined);
  const accessionUrl =
    fhr?.accessionID?.url ||
    (genome?.assembly_accession && /^GC[AF]_/.test(genome.assembly_accession)
      ? `https://www.ncbi.nlm.nih.gov/datasets/genome/${genome.assembly_accession}/`
      : undefined);

  const hasOrganism =
    genome?.species_name || genome?.common_name || genome?.taxon_id;
  const hasAssembly =
    genome?.assembly_source ||
    genome?.assembly_accession ||
    genome?.assembly_level ||
    fhr?.version;
  const hasProvenance =
    fhr?.dateCreated ||
    fhr?.license ||
    fhr?.scholarlyArticle ||
    fhr?.funding ||
    metadataAuthors.length > 0 ||
    assemblyAuthors.length > 0 ||
    relatedLinks.length > 0;
  const hasStats = vitalStats && Object.keys(vitalStats).length > 0;

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='d-flex align-items-center'>
            {alias?.items && (
              <h6 className='mb-0'>
                <a
                  className='fw-bold text-decoration-none text-black cursor-pointer'
                  onClick={() => navigate(`${api.routeBase}/genomes`)}
                >
                  Genomes
                </a>
                {' / '}
                {alias?.items && <span>{alias?.items[0]?.name}</span>}
              </h6>
            )}
            <button
              className='btn btn-secondary btn-sm ms-auto'
              onClick={() => {
                navigator.clipboard.writeText(digest ? digest : '');
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            >
              {copied ? (
                <>
                  <i className='bi bi-check me-2' />
                  Copied
                </>
              ) : (
                <>
                  <i className='bi bi-clipboard-fill me-2' />
                  Genome Digest
                </>
              )}
            </button>
            <a
              className='btn btn-outline-dark btn-sm ms-1'
              href={`${API_BASE}/genomes/${digest}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <i className='bi bi-hdd-network me-2' />
              API
            </a>
          </div>

          {/* {genome && <p className='mt-3 fst-italic text-muted'>{genome.description}</p>} */}

          {genome && alias?.items && (
            <>
              <p className='fw-bold mt-3 mb-1'>Details</p>
              <p className='text-ss mb-0'>
                <strong>Genome Name: </strong>
                {alias?.items[0]?.name}
              </p>
              <p className='text-ss mb-0'>
                <strong>Genome Digest: </strong>
                {digest}
              </p>
              <p className='text-ss mb-0'>
                <strong>Genome Description: </strong>
                {genome.description}
              </p>
            </>
          )}

          {genome && hasOrganism && (
            <>
              <p className='fw-bold mt-4 mb-1'>Organism</p>
              {genome.species_name && (
                <p className='text-ss mb-0'>
                  <strong>Scientific Name: </strong>
                  <span className='fst-italic'>{genome.species_name}</span>
                </p>
              )}
              {genome.common_name && (
                <p className='text-ss mb-0'>
                  <strong>Common Name: </strong>
                  {genome.common_name}
                </p>
              )}
              {genome.taxon_id && (
                <p className='text-ss mb-0'>
                  <strong>NCBI Taxon: </strong>
                  {taxonUri ? (
                    <a href={taxonUri} target='_blank' rel='noopener noreferrer'>
                      {genome.taxon_id}
                    </a>
                  ) : (
                    genome.taxon_id
                  )}
                </p>
              )}
            </>
          )}

          {genome && hasAssembly && (
            <>
              <p className='fw-bold mt-4 mb-1'>Assembly</p>
              {genome.assembly_source && (
                <p className='text-ss mb-0'>
                  <strong>Source: </strong>
                  {genome.assembly_source}
                </p>
              )}
              {genome.assembly_accession && (
                <p className='text-ss mb-0'>
                  <strong>Accession: </strong>
                  {accessionUrl ? (
                    <a
                      href={accessionUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {genome.assembly_accession}
                    </a>
                  ) : (
                    genome.assembly_accession
                  )}
                </p>
              )}
              {genome.assembly_level && (
                <p className='text-ss mb-0'>
                  <strong>Level: </strong>
                  {genome.assembly_level}
                </p>
              )}
              {fhr?.version && (
                <p className='text-ss mb-0'>
                  <strong>Version: </strong>
                  {fhr.version}
                </p>
              )}
            </>
          )}

          {genome && hasProvenance && (
            <>
              <p className='fw-bold mt-4 mb-1'>Provenance &amp; Publication</p>
              {fhr?.dateCreated && (
                <p className='text-ss mb-0'>
                  <strong>Date Created: </strong>
                  {fhr.dateCreated}
                </p>
              )}
              {metadataAuthors.length > 0 && (
                <p className='text-ss mb-0'>
                  <strong>Metadata Authors: </strong>
                  {metadataAuthors
                    .map((a: any) => a?.name)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {assemblyAuthors.length > 0 && (
                <p className='text-ss mb-0'>
                  <strong>Assembly Authors: </strong>
                  {assemblyAuthors
                    .map((a: any) => a?.name)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {fhr?.license && (
                <p className='text-ss mb-0'>
                  <strong>License: </strong>
                  {fhr.license}
                </p>
              )}
              {fhr?.scholarlyArticle && (
                <p className='text-ss mb-0'>
                  <strong>Publication: </strong>
                  <a
                    href={fhr.scholarlyArticle}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {fhr.scholarlyArticle}
                  </a>
                </p>
              )}
              {fhr?.funding && (
                <p className='text-ss mb-0'>
                  <strong>Funding: </strong>
                  {fhr.funding}
                </p>
              )}
              {relatedLinks.length > 0 && (
                <p className='text-ss mb-0'>
                  <strong>Related Links: </strong>
                  {relatedLinks.map((link: string, i: number) => (
                    <span key={i}>
                      {i > 0 && ', '}
                      <a href={link} target='_blank' rel='noopener noreferrer'>
                        {link}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </>
          )}

          {genome && hasStats && (
            <>
              <p className='fw-bold mt-4 mb-1'>Assembly Stats</p>
              {vitalStats.N50 != null && (
                <p className='text-ss mb-0'>
                  <strong>N50: </strong>
                  {vitalStats.N50}
                </p>
              )}
              {vitalStats.L50 != null && (
                <p className='text-ss mb-0'>
                  <strong>L50: </strong>
                  {vitalStats.L50}
                </p>
              )}
              {vitalStats.L90 != null && (
                <p className='text-ss mb-0'>
                  <strong>L90: </strong>
                  {vitalStats.L90}
                </p>
              )}
              {vitalStats.totalBasePairs != null && (
                <p className='text-ss mb-0'>
                  <strong>Total Base Pairs: </strong>
                  {vitalStats.totalBasePairs}
                </p>
              )}
              {vitalStats.numberContigs != null && (
                <p className='text-ss mb-0'>
                  <strong>Contigs: </strong>
                  {vitalStats.numberContigs}
                </p>
              )}
              {vitalStats.numberScaffolds != null && (
                <p className='text-ss mb-0'>
                  <strong>Scaffolds: </strong>
                  {vitalStats.numberScaffolds}
                </p>
              )}
              {vitalStats.readTechnology && (
                <p className='text-ss mb-0'>
                  <strong>Read Technology: </strong>
                  {vitalStats.readTechnology}
                </p>
              )}
            </>
          )}

          {combinedAssets && (
            <div>
              <p className='mt-4 mb-2 fw-bold'>Assets</p>

              <div className='row row-cols-1'>
                {combinedAssets.flatMap((group: any, index: number) => (
                  <div className='col mb-3' key={index}>
                    <div
                      className='card asset-card cursor-pointer bg-body-tertiary shadow-sm'
                      onClick={() =>
                        navigate(
                          `${api.routeBase}/genomes/${digest}/${group.asset.digest}`,
                        )
                      }
                    >
                      <div className='card-body'>
                        <h6 className='fw-bold'>
                          {group.asset.asset_group_name} / {group.asset.name}
                        </h6>
                        <div className='text-xs'>
                          <p className='mb-2 fst-italic text-muted'>
                            {group.asset.description}
                          </p>
                          {group.archive && (
                            <>
                              <span>
                                <strong>File Contents: </strong>
                              </span>
                              {group.archive.directory_contents.map(
                                (item: any, itemIndex: number) => (
                                  <div className='text-muted' key={itemIndex}>
                                    {item}
                                  </div>
                                ),
                              )}
                            </>
                          )}

                          <div className='mt-1 d-flex align-items-end'>
                            <span>
                              <strong>Asset Digest: </strong>
                              <span className='text-muted'>
                                {group.asset.digest}
                              </span>
                            </span>
                            <span className='ms-auto d-flex align-items-center flex-wrap justify-content-end'>
                              {group.archive ? (
                                <>
                                  <strong className='me-2'>
                                    Download (
                                    {(
                                      group.archive.size /
                                      1024 /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{' '}
                                    gb):{' '}
                                  </strong>
                                  <a
                                    className='btn btn-secondary btn-xs px-2 py-1'
                                    href={`${API_BASE}/archives/${group.archive.digest}/download`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {`${group.asset.asset_group_name}__${group.asset.name}.tgz`}
                                  </a>
                                </>
                              ) : hasCapability(api, 'downloads') ? (
                                <>
                                  <strong className='me-2'>
                                    Download files:{' '}
                                  </strong>
                                  <FileDownloads assetDigest={group.asset.digest} />
                                </>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Genome;
