import Tree from '../Tree';
import { useAboutSearch, useSelectedSpecies } from '../../stores/search';
import { useTreeFullScreen } from '../../stores/fullScreen';


function About() {
  const { searchTerm, setSearchTerm } = useAboutSearch();
  const { selectedSpecies } = useSelectedSpecies();
  const { isFullScreen, setIsFullScreen } = useTreeFullScreen();

  return (
    <>
      <section className=''>
        <Tree />
      </section>
      <div className='row p-2 px-lg-3 py-lg-4 pt-xxl-5 mt-3 mt-lg-0'>
        <div className='col-12 col-lg-7 col-xl-6 ms-xxl-4'>

          <div className='me-lg-5'>
            <div className={`p-3 mx-lg-2 mt-lg-2 rounded-top-4 rounded-end-4 d-inline-block bg-blur ${isFullScreen ? 'd-none' : ''}`}>
              <h5 className='fw-bold'>What is Refgenie?</h5>
              <p className='mb-0'>
                Refgenie is a standardized genome asset management system. It provides a command-line interface and API for 
                indexing, storing, and retrieving reference genome assets. Refgenie manages reference genome resources 
                like indexes and annotations, simplifying the organization and use of these resources across projects.
                {/* <strong> Refgenius.</strong> */}
              </p>
            </div>
            
            <div className={`bg-blur about-search ${isFullScreen ? 'rounded-2 about-search-fixed' : 'px-3 pt-2 pb-3 mx-lg-2 rounded-bottom-4 rounded-start-0 rounded-end-0'}`}>
              <div className={`input-group ${isFullScreen ? 'rounded-3' : ''}`}>
                <input 
                  id='search-about' 
                  type='text' 
                  className='form-control' 
                  placeholder='Search genomes...'
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value !== '') {
                      setIsFullScreen(true);
                    } else {
                      setIsFullScreen(false);
                    }
                  }}
                />
                <span className='input-group-text bi bi-search'></span>
              </div>
            </div>
            
            <div className={`d-inline-block bg-blur ${isFullScreen ? 'p-2 rounded-4 species-details-fixed' : 'p-3 mx-lg-2 mb-lg-2 rounded-bottom-4'}`}>
              <div className={`${isFullScreen ? 'd-none' : ''}`}>
                <h6 className='fw-bold'>Key Features</h6>
                <ul className='mb-4'>
                  <li>Standardized genome asset management</li>
                  <li>Support for custom genome assemblies</li>
                  <li>Command-line interface for easy access</li>
                  <li>API for programmatic access</li>
                  <li>Centralized storage of genome assets</li>
                  <li>Version control for genome assets</li>
                  <li>Reproducible genome asset creation</li>
                </ul>
              </div>
              <div className={`${selectedSpecies === '' ? 'd-none' : ''}`}>
                <h6 className='fw-bold'>Species Details</h6>
                <ul className={`mb-0 ${isFullScreen ? 'text-xs' : ''}`}>
                  <li>Name: <strong>{selectedSpecies}</strong></li>
                  <li>Available genomes: <strong>1</strong></li>
                  <li>Available assets: <strong>1</strong></li>
                </ul>
              </div>
              
            </div>

          </div>

        </div>
      </div>

    </>
  );
}

export default About;
