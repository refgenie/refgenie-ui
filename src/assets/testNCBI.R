library(tidyverse)
library(data.table)

# Function to read DMP files with proper delimiters
read_dmp <- function(file_path, col_names) {
  read_delim(file_path, 
             delim = "\t|\t", 
             col_names = col_names,
             col_types = cols(.default = "c"),  # Read everything as character initially
             quote = "",
             escape_double = FALSE) %>%
    # Remove the trailing "\t|" from the last column
    mutate(across(last_col(), ~ str_remove(.x, "\\t\\|$")))
}

# Read the main taxonomy files
nodes <- read_dmp("/Users/sam/Downloads/taxdmp/nodes.dmp", 
                  col_names = c("tax_id", "parent_tax_id", "rank", "embl_code", 
                                "division_id", "inherited_div_flag", "genetic_code_id",
                                "inherited_gc_flag", "mitochondrial_genetic_code_id",
                                "inherited_mgc_flag", "genbank_hidden_flag", 
                                "hidden_subtree_root_flag", "comments"))

names <- read_dmp("/Users/sam/Downloads/taxdmp/names.dmp",
                  col_names = c("tax_id", "name_txt", "unique_name", "name_class"))

divisions <- read_dmp("/Users/sam/Downloads/taxdmp/division.dmp",
                      col_names = c("division_id", "division_code", "division_name", "comments"))



# Convert to data.table for faster operations
setDT(nodes)
setDT(names)

# Convert tax_id columns to numeric
nodes[, `:=`(tax_id = as.numeric(tax_id), parent_tax_id = as.numeric(parent_tax_id))]
names[, tax_id := as.numeric(tax_id)]

# Create a lookup table for scientific names only
sci_names <- names[name_class == "scientific name", .(tax_id, name_txt)]
setkey(sci_names, tax_id)

# Get species
species_nodes <- nodes[rank == "species"]
species_names <- sci_names[species_nodes, on = "tax_id", nomatch = 0][
  , .(tax_id, species_name = name_txt, division_id)
]

cat("Building complete taxonomy tree for", nrow(species_names), "species...\n")


build_taxonomy_vectorized_safe <- function(species_names_df, nodes_df, sci_names_df) {
  
  setkey(sci_names_df, tax_id)
  setkey(nodes_df, tax_id)
  
  n_species <- nrow(species_names_df)
  result <- data.table(
    tax_id = species_names_df$tax_id,
    species_name = species_names_df$species_name,
    division_id = species_names_df$division_id,
    superkingdom = NA_character_,
    kingdom = NA_character_,
    phylum = NA_character_,
    class = NA_character_,
    order = NA_character_,
    family = NA_character_,
    genus = NA_character_
  )
  
  circular_refs <- c()
  
  for(i in 1:n_species) {
    if(i %% 1000 == 0) cat("Processed", i, "of", n_species, "species\n")
    
    current_id <- species_names_df$tax_id[i]
    visited <- integer(0)  # Track visited nodes to detect cycles
    step_count <- 0
    
    while(!is.na(current_id) && current_id != 1 && current_id > 0) {
      step_count <- step_count + 1
      
      # Safety check for too many steps
      if(step_count > 50) {
        # cat("Warning: Too many steps for species", i, "(tax_id:", species_names_df$tax_id[i], ")\n")
        break
      }
      
      # Check for circular reference BEFORE adding to visited
      if(current_id %in% visited) {
        circular_refs <- c(circular_refs, species_names_df$tax_id[i])
        # if(length(circular_refs) <= 10) {  # Only print first 10
        #   cat("Circular reference detected for species", i, "(tax_id:", species_names_df$tax_id[i], ")\n")
        # }
        break
      }
      
      visited <- c(visited, current_id)
      
      node_info <- nodes_df[current_id]
      if(nrow(node_info) == 0) {
        break
      }
      
      rank <- node_info$rank
      if(!is.na(rank) && rank %in% c("superkingdom", "kingdom", "phylum", "class", "order", "family", "genus")) {
        name_info <- sci_names_df[current_id]
        if(nrow(name_info) > 0 && !is.na(name_info$name_txt)) {
          set(result, i, rank, name_info$name_txt)
        }
      }
      
      parent_id <- node_info$parent_tax_id
      if(is.na(parent_id) || parent_id <= 0) break
      
      current_id <- parent_id
    }
  }
  
  cat("Found", length(circular_refs), "species with circular references\n")
  # if(length(circular_refs) > 0) {
  #   cat("Sample circular reference tax_ids:", head(circular_refs, 10), "\n")
  # }
  
  return(result)
}

# Run the safe version
species_taxonomy <- build_taxonomy_vectorized_safe(species_names, nodes, sci_names)
cat("Complete! Built taxonomy for", nrow(species_taxonomy), "species\n")

filtered_species_taxonomy <- na.omit(species_taxonomy[, -c('superkingdom', 'kingdom', 'phylum')])


# Debug the problematic species
debug_species <- function(species_id, nodes_df, sci_names_df) {
  cat("Debugging species tax_id:", species_id, "\n")

  current_id <- species_id
  step <- 0
  path <- c()

  while(!is.na(current_id) && current_id != 1 && current_id > 0) {
    step <- step + 1
    path <- c(path, current_id)

    cat("Step", step, "- Current ID:", current_id, "\n")

    node_info <- nodes_df[current_id]
    if(nrow(node_info) == 0) {
      cat("  No node info found for", current_id, "\n")
      break
    }

    cat("  Rank:", node_info$rank, "Parent:", node_info$parent_tax_id, "\n")

    # Check for circular reference
    if(current_id %in% path[-length(path)]) {
      cat("  CIRCULAR REFERENCE DETECTED!\n")
      break
    }

    # Safety check for too many steps
    if(step > 100) {
      cat("  Too many steps, breaking\n")
      break
    }

    parent_id <- node_info$parent_tax_id
    if(is.na(parent_id) || parent_id <= 0) {
      cat("  Invalid parent ID:", parent_id, "\n")
      break
    }

    current_id <- parent_id
  }

  cat("Final path length:", length(path), "\n")
  return(path)
}

# Debug the problematic species (species 2706)
problem_tax_id <- species_names$tax_id[9606]
debug_path <- debug_species(problem_tax_id, nodes, sci_names)


human_lineage_nodes <- c(9606, 9605, 207598, 9604, 314295, 9526, 314293, 376913, 314146, 1437010, 9443, 376911, 314145, 9347, 32525, 40674, 32524, 32523, 1437183, 8287, 117571, 117570, 2759, 131567, 1)


for(node_id in human_lineage_nodes) {
  node_info <- nodes[tax_id == node_id]
  name_info <- sci_names[tax_id == node_id]
  cat("Tax ID:", node_id, "Rank:", node_info$rank, "Name:", name_info$name_txt, "Parent:", node_info$parent_tax_id, "\n")
}


for(node_id in debug_path) { 
  node_info <- nodes[tax_id == node_id]
  name_info <- sci_names[tax_id == node_id]
  cat("Tax ID:", node_id, "Rank:", node_info$rank, "Name:", name_info$name_txt, "Parent:", node_info$parent_tax_id, "\n")
}
