import Tree from '../Tree';
import { useAboutSearch } from '../../stores/search';


function About() {
  const { searchTerm, setSearchTerm } = useAboutSearch();
  console.log(searchTerm)

  return (
    <>
      <section className='tree'>
        <Tree />
      </section>
      <div className='row p-2 p-lg-4 p-xxl-5 mt-3 mt-lg-0'>
        <div className='col-12 col-lg-7 col-xl-6'>

          <div className='me-lg-5'>
            <div className='p-2 p-lg-4 rounded-end-5 d-inline-block bg-blur'>
              <h5 className='fw-bold'>What is Refgenie?</h5>
              <p className='mb-0'>
                Refgenie is a standardized genome asset management system. It provides a command-line interface and API for 
                indexing, storing, and retrieving reference genome assets. Refgenie manages reference genome resources 
                like indexes and annotations, simplifying the organization and use of these resources across projects.
                <strong> Refgenius.</strong>
              </p>
            </div>
            
            <div className='px-2 pb-1 px-lg-4 rounded-end-5 w-75 bg-blur'>
              <div className='input-group'>
                <input 
                  id='search-about' 
                  type='text' 
                  className='form-control' 
                  placeholder='Search genomes...'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                />
                <span className='input-group-text bi bi-search'></span>
              </div>
            </div>
            
            <div className='p-2 p-lg-4 rounded-end-5 d-inline-block bg-blur'>
              <h6 className='fw-bold'>Key Features</h6>
              <ul className='mb-0'>
                <li>Standardized genome asset management</li>
                <li>Support for custom genome assemblies</li>
                <li>Command-line interface for easy access</li>
                <li>API for programmatic access</li>
                <li>Centralized storage of genome assets</li>
                <li>Version control for genome assets</li>
                <li>Reproducible genome asset creation</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}

export default About;