import type {
  LevelColType,
  LevelMapType,
  TreeNode,
  RawDataRow,
} from '../../types';

const levelMap: LevelMapType = {
  domain: 'kingdom',
  kingdom: 'phylum',
  phylum: 'class',
  class: 'order',
  order: 'family',
  family: 'genus',
  genus: 'species',
  species: null,
};

// recursive subtree builder
function buildSubtree(
  data: RawDataRow,
  levelCol: LevelColType,
): TreeNode[] | null {
  if (data.length == 0) return null;

  const dataLevel = data.map((row: RawDataRow) => row[levelCol]);
  const uniqueTaxa = [...new Set(dataLevel)].filter((item) => item != null);

  if (uniqueTaxa.length == 0) return null;

  const children = uniqueTaxa.map((taxon) => {
    const subsetData = data.filter(
      (row: RawDataRow) => row[levelCol] == taxon && row[levelCol] != null,
    );
    const nextLevel: LevelColType | null = levelMap[levelCol];

    let node: TreeNode = {
      name: String(taxon),
      taxonomicLevel: levelCol,
    };

    if (levelCol === 'species') {
      node.genomeAlias = null;
    }

    if (nextLevel !== null && levelCol !== 'species') {
      const childrenNodes = buildSubtree(subsetData, nextLevel);

      if (childrenNodes != null && childrenNodes.length > 0) {
        node.children = childrenNodes;
      }
    }

    return node;
  });

  const filteredChildren = children.filter((child) => child != null);
  return filteredChildren.length > 0 ? filteredChildren : null;
}

// build tree starting from domain level
export function buildTree(taxonomies: RawDataRow[]) {
  const rootChildren = buildSubtree(taxonomies, 'domain');

  return {
    name: 'Root',
    children: rootChildren,
  };
}
