import { useLoaderData } from 'react-router-dom';
import './GenomesList.css';

// Data loader function for React Router
export async function genomesLoader() {
  try {
    const response = await fetch('http://refgenomes.databio.org/genomes/alias_dict', {
      // Add CORS mode to handle cross-origin requests
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading genomes:', error);
    // Return a mock data structure for demonstration purposes
    return {
      error: error.message,
      mockData: true,
      hg38: ['GRCh38', 'hg38.p12'],
      mm10: ['GRCm38', 'mm10'],
      rn6: ['Rnor_6.0', 'rn6'],
      dm6: ['BDGP6', 'dm6'],
      sacCer3: ['R64-1-1', 'sacCer3'],
      danRer11: ['GRCz11', 'danRer11']
    };
  }
}

function GenomesList() {
  const data = useLoaderData();
  
  // Check if there was an error and we're using mock data
  if (data.error && data.mockData) {
    return (
      <div className="genomes-container">
        <div className="genomes-error-banner">
          <h3>Network Error: {data.error}</h3>
          <p>Unable to connect to the Refgenie API. Showing sample data for demonstration purposes.</p>
        </div>
        <h2>Sample Genomes (Demo Data)</h2>
        <div className="genomes-grid">
          {Object.entries(data)
            .filter(([key]) => !['error', 'mockData'].includes(key))
            .map(([genome, aliases]) => (
              <div key={genome} className="genome-card">
                <h3>{genome}</h3>
                <div className="aliases">
                  <h4>Aliases:</h4>
                  <ul>
                    {aliases.map((alias, index) => (
                      <li key={index}>{alias}</li>
                    ))}
                  </ul>
                </div>
                <div className="demo-badge">Demo Data</div>
              </div>
            ))}
        </div>
      </div>
    );
  }
  
  // Check if there was an error without mock data
  if (data.error) {
    return (
      <div className="genomes-error">
        <h2>Error Loading Genomes</h2>
        <p>{data.error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }
  
  // Check if data is empty
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="genomes-empty">
        <h2>No Genomes Found</h2>
        <p>No genome data is currently available.</p>
      </div>
    );
  }
  
  return (
    <div className="genomes-container">
      <h2>Available Genomes</h2>
      <div className="genomes-grid">
        {Object.entries(data).map(([genome, aliases]) => (
          <div key={genome} className="genome-card">
            <h3>{genome}</h3>
            <div className="aliases">
              <h4>Aliases:</h4>
              <ul>
                {aliases.map((alias, index) => (
                  <li key={index}>{alias}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GenomesList;