interface TaxonomyData {
  domain?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  [key: string]: string | undefined;
}

interface TreeNode {
  name: string;
  taxonomicLevel: string;
  genomeAlias?: string;
  children?: TreeNode[];
}

interface RootNode {
  name: string;
  children?: TreeNode[];
}

type TaxonomicLevel = 'domain' | 'kingdom' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species';

function buildTaxonomyTree(taxonomies: TaxonomyData[]): RootNode {
  
  function buildSubtree(data: TaxonomyData[], levelCol: TaxonomicLevel): TreeNode[] | null {
    if (data.length === 0) return null;
    
    // Get unique taxa for this level, filtering out undefined/null values
    const uniqueTaxa = [...new Set(
      data
        .map(row => row[levelCol])
        .filter((taxon): taxon is string => taxon != null && taxon !== '')
    )];
    
    if (uniqueTaxa.length === 0) return null;
    
    const children = uniqueTaxa.map(taxon => {
      // Filter data for this specific taxon
      const subsetData = data.filter(row => 
        row[levelCol] === taxon && row[levelCol] != null
      );
      
      // Determine next taxonomic level
      const getNextLevel = (level: TaxonomicLevel): TaxonomicLevel | null => {
        switch (level) {
          case 'domain': return 'kingdom';
          case 'kingdom': return 'phylum';
          case 'phylum': return 'class';
          case 'class': return 'order';
          case 'order': return 'family';
          case 'family': return 'genus';
          case 'genus': return 'species';
          case 'species': return null;
          default: return null;
        }
      };
      
      const nextLevel = getNextLevel(levelCol);
      
      // Create the node structure
      const node: TreeNode = {
        name: taxon,
        taxonomicLevel: levelCol
      };
      
      // Add genomeAlias for species level
      if (levelCol === 'species') {
        node.genomeAlias = undefined; // TypeScript equivalent of R's NA_character_
      }
      
      // Add children if not at species level AND there are actually children
      if (nextLevel && levelCol !== 'species') {
        const childrenNodes = buildSubtree(subsetData, nextLevel);
        if (childrenNodes && childrenNodes.length > 0) {
          node.children = childrenNodes;
        }
        // If no children found, don't add the children property at all
      }
      
      return node;
    });
    
    // Filter out any null nodes (though there shouldn't be any in this implementation)
    return children.filter(child => child != null);
  }
  
  // Build tree starting from domain
  const rootChildren = buildSubtree(taxonomies, 'domain');
  
  // Create root
  const tree: RootNode = {
    name: 'Root',
    children: rootChildren || undefined
  };
  
  return tree;
}

// Export the function and types
export { buildTaxonomyTree, type TaxonomyData, type TreeNode, type RootNode, type TaxonomicLevel };
