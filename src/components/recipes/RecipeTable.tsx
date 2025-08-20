import { useNavigate } from 'react-router-dom';

import { useRecipes } from '../../queries/recipes';

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
};

function RecipeTable(props: RecipeTableProps) {
  const { searchTerm } = props;

  const navigate = useNavigate();

  const { data: recipes, isFetched } = useRecipes();

  const filteredRecipes = recipes?.filter(
    (asset: Recipe) =>
      asset.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      {filteredRecipes && isFetched ? (
        <div className='row row-cols-1 mt-4'>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe: Recipe) => (
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
      ) : (
        <p className='mt-4'>Loading...</p>
      )}
    </>
  );
}

export default RecipeTable;
