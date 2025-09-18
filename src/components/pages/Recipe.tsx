import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useRecipe } from '../../queries/recipes';

const API_BASE = 'https://api.refgenie.org/v4';

function Recipe() {
  const navigate = useNavigate();

  const params = useParams();
  const recipeID = params.recipeID;

  const [copied, setCopied] = useState(false);

  const { data: recipe } = useRecipe(recipeID);

  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='d-flex align-items-center'>
            {recipe && (
              <h6 className='mb-0'>
                <a
                  className='fw-bold text-decoration-none text-black cursor-pointer'
                  onClick={() => navigate(`/recipes`)}
                >
                  Recipes
                </a>
                {' / '}
                <span>{recipe?.name}</span>
              </h6>
            )}
            <button
              className='btn btn-secondary btn-sm ms-auto'
              onClick={() => {
                navigator.clipboard.writeText(recipeID ? recipeID : '');
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
                  Recipe ID
                </>
              )}
            </button>
            <a
              className='btn btn-outline-dark btn-sm ms-1'
              href={`${API_BASE}/recipes/${recipeID}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <i className='bi bi-hdd-network me-2' />
              API
            </a>
          </div>

          {recipe && (
            <>
              <p className='fw-bold mt-3 mb-1'>Details</p>
              <p className='text-ss mb-0'>
                <strong>Recipe Name: </strong>
                {recipe.name}
              </p>
              <p className='text-ss mb-0'>
                <strong>Recipe Description: </strong>
                {recipe.description}
              </p>
              <p className='text-ss mb-0'>
                <strong>Recipe Version: </strong>
                {recipe.version}
              </p>
              <p className='text-ss mb-2'>
                <strong>Recipe ID: </strong>
                {recipe.id}
              </p>

              <p className='text-ss mb-0'>
                <strong>Output Asset Class: </strong>
                {recipe.name}
              </p>
              <p className='text-ss mb-2'>
                <strong>Output Asset Class ID: </strong>
                {recipe.output_asset_class_id}
              </p>

              <p className='text-ss mb-0'>
                <strong>Recipe Docker Image: </strong>
                {recipe.docker_image}
              </p>
              <p className='text-ss mb-0'>
                <strong>Recipe Default Asset: </strong>
                {recipe.default_asset}
              </p>

              {Object.entries(recipe.custom_properties).length > 0 && (
                <>
                  <p className='fw-bold mt-4 mb-1'>Custom Properties</p>
                  {Object.entries(recipe.custom_properties).map(
                    ([key, content], index: number) => (
                      <p className='text-ss mb-0' key={index}>
                        <strong>{key}: </strong>
                        {String(content)}
                      </p>
                    ),
                  )}
                </>
              )}

              {Object.entries(recipe.input_files).length > 0 && (
                <>
                  <p className='fw-bold mt-4 mb-1'>Input Files</p>
                  {Object.entries(recipe.input_files).map(
                    ([key, content], index: number) => (
                      <div key={index}>
                        <p className='text-ss mb-0'>
                          <strong>{key}: </strong>
                        </p>
                        {Object.entries(content as Record<string, unknown>).map(
                          ([contentKey, contentContent], inputIndex) => (
                            <p className='text-ss ms-3 mb-0' key={inputIndex}>
                              <span className='fw-semibold'>
                                {contentKey}:{' '}
                              </span>
                              {String(contentContent)}{' '}
                            </p>
                          ),
                        )}
                      </div>
                    ),
                  )}
                </>
              )}

              <p className='fw-bold mt-4 mb-0'>Command Templates</p>
              {recipe.command_templates.map(
                (command: string, index: number) => (
                  <div className='mb-2' key={index}>
                    <code className='text-xs'>{command}</code>
                  </div>
                ),
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Recipe;
