import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useGenome } from '../../queries/genomes';
import { useAliases } from '../../queries/aliases';
import { useAssetArchives } from '../../queries/archives';
import { useAssets } from '../../queries/assets';
import { useAssetGroups } from '../../queries/assetGroups';

const API_BASE = 'https://api.refgenie.org/v4';

// type Props = {
//   genome: Genome,
// }

function Genome() {
  const navigate = useNavigate();

  const params = useParams();
  const digest = params.genomeDigest;

  const [copied, setCopied] = useState(false);

  const { data: genome } = useGenome(digest);
  const { data: alias } = useAliases(undefined, digest);
  const { data: assets } = useAssets(undefined, undefined, digest);
  const { data: assetGroups } = useAssetGroups(digest);

  const assetDigests = assets?.items?.map((asset: any) => asset.digest);

  const archives = useAssetArchives(assetDigests);
  // const archivesIsLoading = archives.some(query => query.isFetching || query.isLoading);
  const archivesData = archives
    .map((query) => query.data?.items)
    .filter(Boolean)
    .flat();

  const combinedAssets = archivesData?.map((archive: any) => {
    const matchingAsset = assets?.items?.find(
      (asset: any) => asset.digest === archive.asset_digest,
    );
    const matchingAssetGroup = assetGroups?.items?.find(
      (assetGroup: any) => assetGroup.id === matchingAsset?.asset_group_id,
    );

    return {
      archive,
      asset: matchingAsset,
      assetGroup: matchingAssetGroup,
    };
  });

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='d-flex align-items-center'>
            {alias?.items && (
              <h6 className='mb-0'>
                <a
                  className='fw-bold text-decoration-none text-black cursor-pointer'
                  onClick={() => navigate(`/genomes`)}
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

          {combinedAssets && (
            <div>
              <p className='mt-4 mb-2 fw-bold'>Assets</p>

              <div className='row row-cols-1'>
                {combinedAssets.flatMap((group: any, index: number) => (
                  <div className='col mb-3' key={index}>
                    <div
                      className='card asset-card cursor-pointer bg-body-tertiary shadow-sm'
                      onClick={() =>
                        navigate(`/genomes/${digest}/${group.asset.digest}`)
                      }
                    >
                      <div className='card-body'>
                        <h6 className='fw-bold'>
                          {group.assetGroup.name} / {group.asset.name}
                        </h6>
                        <div className='text-xs'>
                          <p className='mb-2 fst-italic text-muted'>
                            {group.asset.description}
                          </p>
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

                          <div className='mt-1 d-flex align-items-end'>
                            <span>
                              <strong>Asset Digest: </strong>
                              <span className='text-muted'>
                                {group.asset.digest}
                              </span>
                            </span>
                            <span className='ms-auto d-flex align-items-center'>
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
                                {`${group.assetGroup.name}__${group.asset.name}.tgz`}
                              </a>
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
