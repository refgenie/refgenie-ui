import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useRecipes } from '../../queries/recipes';
import { PaginationControl } from '../pagination/PaginationControl';

type Recipe = {
  id: number;
  name: string;
  version: string;
  description: string;
  output_asset_class_id: number;
  command_templates: string[];
  input_params: any;
};

type RecipeTableProps = {
  searchTerm: string;
  pageSize: number;
};

function RecipeTable(props: RecipeTableProps) {
  const { searchTerm, pageSize } = props;

  const navigate = useNavigate();
  const [offsetIndex, setOffsetIndex] = useState(0);

  const { data: recipes, isFetched } = useRecipes(
    '', // outputAssetClass
    '', // name
    '', // version
    searchTerm, // query
    '', // searchFields
    'contains', // operator
    offsetIndex * pageSize, // offset
    pageSize, // limit
  );

  const maxPage = Math.ceil(recipes?.pagination?.total / pageSize);
  const page = offsetIndex + 1;
  const minPage = 1;

  return (
    <>
      {recipes && isFetched ? (
        <>
          <div className='row row-cols-1 mt-4'>
            {recipes?.items?.length > 0 ? (
              recipes?.items?.map((recipe: Recipe) => (
                <div className='col mb-3' key={recipe.id}>
                  <div
                    className='card asset-card cursor-pointer bg-body-tertiary shadow-sm'
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    <div className='card-body'>
                      <h6 className='fw-bold'>{recipe.name}</h6>
                      <div className='text-xs'>
                        <p className='mb-2 fst-italic text-muted'>
                          {recipe.description}
                        </p>
                        <div className='d-flex align-items-end'>
                          <span>
                            <strong>Version: </strong>
                            <span className='text-muted'>{recipe.version}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='mt-5 text-center text-muted'>No query results.</p>
            )}
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

export default RecipeTable;
