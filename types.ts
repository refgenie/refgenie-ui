// tree types
export type LevelColType = 'domain' | 'kingdom' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species';

export type LevelMapType = Record<
  LevelColType,
  'domain' | 'kingdom' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species' | null
>;

export interface TreeNode {
  name: string;
  taxonomicLevel?: LevelColType;
  genomeAlias?: any;
  children?: TreeNode[] | null;
}

export interface RawDataRow {
  [key: string]: any;
}


// genome types
export type Genome = {
  digest: string;
  description: string;
};
