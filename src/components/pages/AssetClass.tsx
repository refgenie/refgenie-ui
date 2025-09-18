import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useAssetClass } from '../../queries/assetClasses';

const API_BASE = 'https://api.refgenie.org/v4';

function AssetClass() {
  const navigate = useNavigate();

  const params = useParams();
  const assetClassID = params.assetClassID;

  const [copied, setCopied] = useState(false);

  const { data: assetClass } = useAssetClass(assetClassID);

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='d-flex align-items-center'>
            {assetClass && (
              <h6 className='mb-0'>
                <a
                  className='fw-bold text-decoration-none text-black cursor-pointer'
                  onClick={() => navigate(`/assetclasses`)}
                >
                  Asset Classes
                </a>
                {' / '}
                <span>{assetClass?.name}</span>
              </h6>
            )}
            <button
              className='btn btn-secondary btn-sm ms-auto'
              onClick={() => {
                navigator.clipboard.writeText(assetClassID ? assetClassID : '');
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
                  Asset Class ID
                </>
              )}
            </button>
            <a
              className='btn btn-outline-dark btn-sm ms-1'
              href={`${API_BASE}/asset_classes/${assetClassID}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <i className='bi bi-hdd-network me-2' />
              API
            </a>
          </div>

          {assetClass && (
            <>
              <p className='fw-bold mt-3 mb-1'>Details</p>
              <p className='text-ss mb-0'>
                <strong>Asset Class Name: </strong>
                {assetClass.name}
              </p>
              <p className='text-ss mb-0'>
                <strong>Asset Class Description: </strong>
                {assetClass.description}
              </p>
              <p className='text-ss mb-0'>
                <strong>Asset Class Version: </strong>
                {assetClass.version}
              </p>
              <p className='text-ss mb-2'>
                <strong>Asset Class ID: </strong>
                {assetClass.id}
              </p>

            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AssetClass;
