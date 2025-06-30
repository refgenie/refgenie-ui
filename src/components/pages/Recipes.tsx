import { useRecipes } from "../../queries/recipes";

type Recipe = {
  id: number;
  name: string;
  version: string;
  description: string;
  output_asset_class_id: number;
  command_templates: string[];
  input_params: any;
};

function Recipes() {

  const { data, isFetched } = useRecipes();
  
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          
          <h5 className='fw-bold'>Available Recipes</h5>

          {data && isFetched ? (
            <div className='row row-cols-3 mt-4'>
              {data.map((recipe: Recipe) => 
                <div className='col mb-3' key={recipe.id}>
                  <div className='card'>
                  <div className='card-header fw-medium'>
                    {recipe.name}
                  </div>
                  <div className='card-body text-xs'>
                    {recipe.description}
                  </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Loading</p>
          )}

        </div>
      </div>
    </>
  );
}

export default Recipes;