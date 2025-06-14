// import './About.css';
import logo from '../assets/refgenie_logo.svg';

function About() {
  return (
    <div className="about">
      <div className="about-container">
        <div className="about-header">
          <img src={logo} alt="Refgenie Logo" className="logo" />
          <h1>About Refgenie</h1>
        </div>
        
        <div className="about-content">
          <section>
            <h2>What is Refgenie?</h2>
            <p>
              Refgenie is a standardized genome asset management system. It provides a command-line interface and API for 
              indexing, storing, and retrieving reference genome assets. Refgenie manages reference genome resources 
              like indexes and annotations, simplifying the organization and use of these resources across projects.
            </p>
          </section>
          
          <section>
            <h2>Key Features</h2>
            <ul>
              <li>Standardized genome asset management</li>
              <li>Command-line interface for easy access</li>
              <li>API for programmatic access</li>
              <li>Centralized storage of genome assets</li>
              <li>Version control for genome assets</li>
              <li>Reproducible genome asset creation</li>
            </ul>
          </section>
          
          <section>
            <h2>Resources</h2>
            <div className="resources-grid">
              <a href="https://refgenie.org" target="_blank" rel="noopener noreferrer" className="resource-card">
                <h3>Documentation</h3>
                <p>Comprehensive guides and API reference</p>
              </a>
              <a href="https://github.com/refgenie/refgenie" target="_blank" rel="noopener noreferrer" className="resource-card">
                <h3>GitHub</h3>
                <p>Source code and issue tracking</p>
              </a>
              <a href="http://refgenomes.databio.org" target="_blank" rel="noopener noreferrer" className="resource-card">
                <h3>Refgenomes API</h3>
                <p>Public API for genome assets</p>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About;