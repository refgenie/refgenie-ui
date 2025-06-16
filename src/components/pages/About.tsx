import Tree from '../Tree';


function About() {
  return (
    <>
      <section className='tree'>
        <Tree />
      </section>
      <div className='row p-lg-5 mt-3 mt-lg-0'>
        <div className='col-12 col-lg-7 col-xl-6'>

          <div 
            className='p-2 p-lg-4 rounded bg-blur about'>
            <h5 className='fw-bold'>What is Refgenie?</h5>
            <p className='mb-0'>
              Refgenie is a standardized genome asset management system. It provides a command-line interface and API for 
              indexing, storing, and retrieving reference genome assets. Refgenie manages reference genome resources 
              like indexes and annotations, simplifying the organization and use of these resources across projects.
              <strong> Refgenius.</strong>
            </p>

            <div className='input-group mt-3 w-75'>
              <input type='text' className='form-control' placeholder='Search refgenie..'/>
              <span className='input-group-text bi bi-search'></span>
            </div>
          
            <h5 className='fw-bold mt-4'>Key Features</h5>
            <ul className='mb-0'>
              <li>Standardized genome asset management</li>
              <li>Command-line interface for easy access</li>
              <li>API for programmatic access</li>
              <li>Centralized storage of genome assets</li>
              <li>Version control for genome assets</li>
              <li>Reproducible genome asset creation</li>
            </ul>
          </div>

        </div>
      </div>

    </>
  );
}

export default About;