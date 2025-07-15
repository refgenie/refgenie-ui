import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// import { useGenome } from '../../queries/genomes';
import { useAliases } from '../../queries/aliases';
import { useArchives } from '../../queries/archives';
import { useAsset } from '../../queries/assets';
import { useAssetGroups } from '../../queries/assetGroups';

const API_BASE = import.meta.env.VITE_API_BASE || '';


function Asset() {
  const navigate = useNavigate();

  const params = useParams();
  const genomeDigest = params.genomeDigest;
  const assetDigest = params.assetDigest;

  const [copied, setCopied] = useState(false);

  // const { data: genome } = useGenome(genomeDigest);
  const { data: alias } = useAliases(undefined, genomeDigest);
  const { data: asset } = useAsset(assetDigest);
  const { data: archive } = useArchives(undefined, assetDigest);
  const { data: assetGroup } = useAssetGroups(undefined, undefined, undefined, asset?.asset_group_id)

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>

          <div className='d-flex align-items-center'>
            {alias && 
              <h6 className='mb-0'>
                <a className='fw-bold text-decoration-none text-black cursor-pointer' onClick={() => navigate(`/genomes`)}>Genomes</a> 
                {' / '}
                <a className='fw-bold text-decoration-none text-black cursor-pointer' onClick={() => navigate(`/genomes/${genomeDigest}`)}>{alias[0]?.name}</a>
                {' / '}
                <span>{asset?.name}</span>
              </h6>
            }
            <button 
              className='btn btn-secondary btn-sm ms-auto'
              onClick={() => {
                navigator.clipboard.writeText(assetDigest ? assetDigest : '');
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            >
              {copied ? (
                <><i className='bi bi-check me-1' />Copied</>
              ) : (
                <><i className='bi bi-clipboard-fill me-1' />Asset Digest</>
              )}
            </button>
            {archive && 
              <a 
                className='btn btn-secondary btn-sm ms-1'
                href={`${API_BASE}/archives/${archive[0].digest}/download`}
                onClick={(e) => e.stopPropagation()}
              >
                <i className='bi bi-cloud-arrow-down-fill me-1' />Download
              </a>
            }
            <a 
              className='btn btn-outline-dark btn-sm ms-1'
              href={`${API_BASE}/assets/${assetDigest}`}
              target='_blank' 
              rel='noopener noreferrer'
            >
              <i className='bi bi-hdd-network me-1' />API
            </a>
          </div>

          {asset && archive && assetGroup &&
            <>
              <p className='fw-bold mt-3 mb-1'>Details</p>
              <p className='text-ss mb-0'><strong>Asset Name: </strong>{asset.name}</p>
              <p className='text-ss mb-0'><strong>Asset Digest: </strong>{asset.digest}</p>
              <p className='text-ss mb-2'><strong>Asset Description: </strong>{asset.description}</p>
              
              {/* <p className='text-ss mb-2'><strong>Asset Size: </strong>{(asset.size / 1024 / 1024 / 1024).toFixed(2)} gb</p> */}

              <p className='text-ss mb-0'><strong>Asset Class: </strong>{assetGroup[0].name}</p>
              <p className='text-ss mb-2'><strong>Asset Class ID: </strong>{assetGroup[0].asset_class_id}</p>

              <p className='text-ss mb-0 cursor-pointer' style={{width: 'fit-content'}} onClick={() => navigate(`/recipes/${asset.recipe_id}`)}><strong>Recipe: </strong>{assetGroup[0].name}</p>
              <p className='text-ss mb-2 cursor-pointer' style={{width: 'fit-content'}} onClick={() => navigate(`/recipes/${asset.recipe_id}`)}><strong>Recipe ID: </strong>{asset.recipe_id}</p>

              <p className='text-ss mb-0'><strong>Archive Digest: </strong>{archive[0].digest}</p>
              <p className='text-ss mb-0'><strong>Archive Size: </strong>{(archive[0].size / 1024 / 1024 / 1024).toFixed(2)} gb</p>
            </>
          }

          {archive && 
            <>
              <p className='fw-bold mt-4 mb-1'>Archive File Contents</p>
              {archive[0].directory_contents.map((content: string, index: number) => 
                <p className='text-ss mb-0' key={index}>{content}</p>
              )}
              <p className='fw-bold mt-4 mb-0'>Build Commands</p>
              {archive[0].build_commands.map((command: string, index: number) => 
                <div className='mb-2' key={index}>
                  <code className='text-xs'>{command}</code>
                </div>
              )}
            </>
          }

        </div>
      </div>
    </>
  );
}

export default Asset;
