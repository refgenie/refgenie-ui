import GenomesList from './GenomesList';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Refgenie Genome Management</h1>
        <p>A standardized genome asset management system</p>
      </div>
      <GenomesList />
    </div>
  );
}

export default Home;