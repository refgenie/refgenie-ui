suppressMessages(library(tidyverse))
suppressMessages(library(data.table))
suppressMessages(library(httr))
suppressMessages(library(jsonlite))
suppressMessages(library(xml2))


get_ncbi_lineage <- function(species_name) {
  search_url <- paste0('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=', 
                       URLencode(species_name), '&retmode=json')
  
  search_req <- GET(search_url)
  search_res <- content(search_req, as = 'parsed')
  
  if(length(search_res$esearchresult$idlist) > 0) {
    taxid <- search_res$esearchresult$idlist[[1]]
    
    fetch_url <- paste0('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=', 
                        taxid, '&retmode=xml')
    
    fetch_req <- GET(fetch_url)
    fetch_res <- content(fetch_req, as = 'text', encoding = 'UTF-8') %>% read_xml()
    
    lineage_nodes <- xml_find_all(fetch_res, '//LineageEx/Taxon')
    
    lineage_df <- data.frame(list(
      rank = xml_text(xml_find_first(lineage_nodes, './/Rank')),
      taxonomy = xml_text(xml_find_first(lineage_nodes, './/ScientificName'))
    ))
    
    major_ranks <- c('domain', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus')
    major_lineage <- lineage_df %>%
      filter(rank %in% major_ranks) %>% 
      pivot_wider(names_from = rank, values_from = taxonomy)

    return(major_lineage)
  }
}

build_taxonomy_tree <- function(taxonomies) {
  
  build_subtree <- function(data, level_col) {
    if(nrow(data) == 0) return(NULL)
    
    unique_taxa <- unique(data[[level_col]])
    unique_taxa <- unique_taxa[!is.na(unique_taxa)]
    
    if(length(unique_taxa) == 0) return(NULL)
    
    children <- map(unique_taxa, function(taxon) {
      subset_data <- data[data[[level_col]] == taxon & !is.na(data[[level_col]]), ]
      
      next_level <- case_when(
        level_col == 'domain' ~ 'kingdom',
        level_col == 'kingdom' ~ 'phylum',
        level_col == 'phylum' ~ 'class',
        level_col == 'class' ~ 'order',
        level_col == 'order' ~ 'family', 
        level_col == 'family' ~ 'genus',
        level_col == 'genus' ~ 'species',
        TRUE ~ NA_character_
      )
      
      # Create the node structure
      node <- list(
        name = taxon,
        taxonomicLevel = level_col
      )
      
      # Add genomeAlias for species (use NA instead of NULL)
      if(level_col == 'species') {
        node$genomeAlias <- NA_character_
      }
      
      # Add children if not at species level AND there are actually children
      if(!is.na(next_level) && level_col != 'species') {
        children_nodes <- build_subtree(subset_data, next_level)
        if(!is.null(children_nodes) && length(children_nodes) > 0) {
          node$children <- children_nodes
        }
        # If no children found, don't add the children property at all
      }
      
      return(node)
    })
    
    children <- children[!sapply(children, is.null)]
    return(children)
  }
  
  # Build tree starting from domain
  root_children <- build_subtree(taxonomies, 'domain')
  
  # Create root
  tree <- list(
    name = 'Root',
    children = root_children
  )
  
  return(tree)
}


refgenie_url <- 'https://api.refgenie.org/v4/genomes'
refgenie_req <- GET(refgenie_url)
refgenie_res <- content(refgenie_req, as = 'parsed') %>% data.frame()

genomes <- gsub('\\..*', '', refgenie_res$description)

taxonomies <- data.frame(matrix(nrow = 0, ncol = 8)) %>% 
  setnames(c('domain', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'))

for (genome in genomes) {
  new_row <- get_ncbi_lineage(genome)
  new_row$species <- genome
  taxonomies <- rbind(taxonomies, new_row)
  Sys.sleep(1)
}


taxonomy_tree <- build_taxonomy_tree(taxonomies)
json_output <- toJSON(taxonomy_tree, pretty = TRUE, auto_unbox = TRUE)

write(json_output, '/Users/sam/Documents/Work/refgenie-ui/src/assets/tree.json')

