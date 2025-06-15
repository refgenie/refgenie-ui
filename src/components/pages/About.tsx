import Tree from '../Tree';


function About() {
  return (
    <>
      <div className='row px-lg-4 px-xl-5 align-items-center pb-md-3 pb-xl-5'>
        <div className='col-12 col-lg-4 about d-flex align-items-center mb-4 mb-lg-0'>
          
          <section>
            <h5 className='fw-bold'>What is Refgenie?</h5>
            <p>
              Refgenie is a standardized genome asset management system. It provides a command-line interface and API for 
              indexing, storing, and retrieving reference genome assets. Refgenie manages reference genome resources 
              like indexes and annotations, simplifying the organization and use of these resources across projects.
              <strong> Refgenius.</strong>
            </p>

            <div className='input-group mt-4'>
              <input type='text' className='form-control' placeholder='Search refgenie..'/>
              <span className='input-group-text bi bi-search'></span>
            </div>

            <h5 className='fw-bold mt-5'>Key Features</h5>
            <ul className=''>
              <li>Standardized genome asset management</li>
              <li>Command-line interface for easy access</li>
              <li>API for programmatic access</li>
              <li>Centralized storage of genome assets</li>
              <li>Version control for genome assets</li>
              <li>Reproducible genome asset creation</li>
            </ul>
          </section>
        
        </div>
        <div className='col-12 col-lg-8 tree d-flex align-items-center'>

          <section className='ms-auto text-center pt-lg-2 ps-lg-5 w-100'>
            <Tree />
            <p className='text-xs fw-bold mt-3 mb-0'>Genomes on Refgenie</p>
          </section>
        </div>
      </div>
          <div>
            <div>
          
          <section>
            
          </section>
        </div>
      </div>
    </>
  );
}

export default About;