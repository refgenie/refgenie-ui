import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const { data: recipes, isFetched } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = recipes?.filter((asset: Recipe) => 
    asset.version.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          
          <div className="d-flex align-items-center justify-content-center gap-3">
            <h6 className='fw-bold mb-0' style={{width: '10rem'}}>Search Recipes:</h6>
            <div className={`input-group rounded`}>
              <input 
                id='search-about' 
                type='text' 
                className='form-control' 
                placeholder='fasta'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
              <span className='input-group-text bi bi-search'></span>
            </div>
          </div>

          {filteredRecipes && isFetched ? (
            <div className='row row-cols-1 mt-4'>
              {filteredRecipes.map((recipe: Recipe) => 
                <div className='col mb-3' key={recipe.id}>
                  <div className='card asset-card cursor-pointer bg-body-tertiary shadow-sm' onClick={() => navigate(`/recipes/${recipe.id}`)}>
                    <div className='card-body'>
                      <h6 className='fw-bold'>{recipe.name}</h6>
                      <div className='text-xs'>
                        <p className='mb-2 fst-italic text-muted'>{recipe.description}</p>
                        <div className='d-flex align-items-end'>
                          <span><strong>Version: </strong><span className='text-muted'>{recipe.version}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className='mt-4'>Loading...</p>
          )}

        </div>
      </div>
    </>
  );
}

export default Recipes;
