import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import toast from 'react-hot-toast';

import { useAboutSearch } from '../stores/search';

// import treeData from '../assets/tree.json'
import treeData from '../assets/sample_tree.json'

// Type definitions
interface TreeNode {
  name: string;
  taxonomicLevel?: 'domain' | 'kingdom' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species';
  genomeAlias?: string | null;
  children?: TreeNode[];
}

interface D3Node extends d3.HierarchyPointNode<TreeNode> {
  x: number;
  y: number;
}

interface ZoomEvent extends d3.D3ZoomEvent<SVGSVGElement, unknown> {
  transform: d3.ZoomTransform;
}

const Tree: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isActuallyLocked, setIsActuallyLocked] = useState(true);
  const { searchTerm } = useAboutSearch();

  const matchesSearch = (speciesName: string, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true; // If no search term, all match
    return speciesName.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Function to check if any descendant species matches the search
  const hasMatchingDescendant = (node: d3.HierarchyPointNode<TreeNode>, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;
    
    // Check if this node is a matching species
    if (node.data.taxonomicLevel === 'species' && matchesSearch(node.data.name, searchTerm)) {
      return true;
    }
    
    // Check descendants
    if (node.children) {
      return node.children.some(child => hasMatchingDescendant(child, searchTerm));
    }
    
    return false;
  };

  const drawTree = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Get current container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = window.innerHeight;
    const radius: number = Math.min(width, height) / 2 - 100;

    // Set up the SVG with zoom behavior
    svg.attr('width', width).attr('height', height);

    // Create main container group
    const container = svg.append('g');

    let isLocked = isActuallyLocked;
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: ZoomEvent) => {
        container.attr('transform', event.transform.toString());
      })
      .filter((event) => {
        // Allow programmatic calls, block mouse drag
        if (isLocked) {
          return event.type === null;
        }
        return true;
      });

    // Apply zoom to SVG
    svg.call(zoom);

    // Set initial zoom level with proper centering
    const initialScale = 0.725;

    let centerX, centerY;
    if (width < 992) {
      // Center on screen for mobile/tablet
      centerX = width / 2;
      centerY = height / 2;
    } else {
      // Your existing positioning for larger screens
      centerX = width / 2.24;
      centerY = height / 4.48;
    }

    svg.call(zoom.transform, 
      d3.zoomIdentity
        .scale(initialScale)
        .translate(centerX, centerY)
    );

    // Create radial gradient for background circle
    const defs = svg.append('defs');
    const gradient = defs.append('radialGradient')
      .attr('id', 'background-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ffeaa7') // Light yellow
      .attr('stop-opacity', 0.33);

    gradient.append('stop')
      .attr('offset', '67%')
      .attr('stop-color', '#ffeaa7')
      .attr('stop-opacity', 0.11);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ffeaa7')
      .attr('stop-opacity', 0);

    // Add background circle
    container.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', radius + 100)
      .style('fill', 'url(#background-gradient)')
      .style('pointer-events', 'none'); // Don't interfere with interactions

    // Set up the main group with initial translation
    const g = container
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create the tree layout
    const tree = d3.tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Create hierarchy
    const root = tree(d3.hierarchy(treeData as TreeNode));

    const selectedLevel = 'kingdom';

    const findTaxonomicLevel = (node: d3.HierarchyPointNode<TreeNode>): string | null => {
      // If this node is a class, return it
      if (node.data.taxonomicLevel === selectedLevel) {
        return node.data.name;
      }
      
      // Walk up the tree to find the class
      let current = node.parent;
      while (current) {
        if (current.data.taxonomicLevel === selectedLevel) {
          return current.data.name;
        }
        current = current.parent;
      }
      
      return null; // No class found
    };

    // Identify unique classes
    const levelNames = new Set<string>();
    const extractClasses = (node: TreeNode) => {
      if (node.taxonomicLevel === selectedLevel) {
        levelNames.add(node.name);
      }
      if (node.children) {
        node.children.forEach(extractClasses);
      }
    };
    extractClasses(treeData as TreeNode);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(Array.from(levelNames))
      .range(['#e41a1cbb', '#377eb8bb', '#4daf4abb', '#984ea3bb', '#ff7f00bb', '#ffff33bb', '#a65628bb', '#f781bfbb']);

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkRadial<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .angle(d => d.x)
        .radius(d => d.y))
      .style('fill', 'none')
      .style('stroke', (d: d3.HierarchyPointLink<TreeNode>) => {
        const taxonomicLevel = findTaxonomicLevel(d.target);
        return taxonomicLevel ? colorScale(taxonomicLevel) : '#999';
      })
      // .style('stroke-width', 1.25)
      .style('stroke-width', (d: d3.HierarchyPointLink<TreeNode>) => {
        if (searchTerm === '') {
          return 1.33;
        }
        const hasMatch = hasMatchingDescendant(d.target, searchTerm);
        return hasMatch ? 1.67 : 1.33;
      })
      .style('opacity', (d: d3.HierarchyPointLink<TreeNode>) => {
        // Check if the target node or any of its descendants match the search
        const hasMatch = hasMatchingDescendant(d.target, searchTerm);
        return hasMatch ? 1 : 0.2; // Full opacity for matching paths, reduced for non-matching
      });

    // Draw nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: D3Node) => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0)
      `);

    // node.append('circle')
    //   .attr('r', (d: D3Node) => d.children ? 0 : 0) // Only show circles for leaf nodes
    //   .style('fill', (d: D3Node) => {
    //     if (d.children) return 'transparent'; // Hide non-leaf nodes
        
    //     const taxonomicLevel = findTaxonomicLevel(d);
    //     return taxonomicLevel ? colorScale(taxonomicLevel) : '#999';
    //   })
    //   .style('stroke', '#fff')
    //   .style('stroke-width', 2);

    // Node labels
    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: D3Node) => d.x < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', (d: D3Node) => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', (d: D3Node) => d.x >= Math.PI ? 'rotate(180)' : null)
      .style('font-family', 'Nunito, arial, sans-serif')
      // .style('font-size', (d: D3Node) => d.data.taxonomicLevel === 'species' ? '11px' : '0')
      .style('font-size', (d: D3Node) => {
        if (d.data.taxonomicLevel === 'species' && searchTerm === '') {
          return '11px';
        }
        if (d.data.taxonomicLevel === 'species') {
          const isMatch = matchesSearch(d.data.name, searchTerm);
          return isMatch ? '12.5px' : '11px';
        }
        return '0';
      })
      // .style('font-weight', (d: D3Node) => d.data.taxonomicLevel === 'species' ? 'semibold' : 'normal')
      .style('font-weight', (d: D3Node) => {
        if (searchTerm === '') {
          return 'normal';
        }
        if (d.data.taxonomicLevel === 'species') {
          const isMatch = matchesSearch(d.data.name, searchTerm);
          return isMatch ? 'bold' : 'normal';
        }
        return 'normal';
      })
      // .style('fill', '#333')
      .style('fill', (d: D3Node) => {
        if (searchTerm === '') {
          return '#333';
        }
        if (d.data.taxonomicLevel === 'species') {
          const isMatch = matchesSearch(d.data.name, searchTerm);
          return isMatch ? '#000' : '#ddd'; // Darker text for matches
        }
        return '#333';
      })
      .text((d: D3Node) => {
        if (d.data.taxonomicLevel === 'species') {
          return `${d.data.name}`;
        }
        return d.data.name ?? null;
      })
      .style('transition', 'all 0.125s ease')
      // .text((d: D3Node) => {
      //   if (d.data.taxonomicLevel === 'species') {
      //     return `${d.data.name}`;
      //   }
      //   return d.data.name ?? null;
      // })
      // Add hover effects only for species labels when panning is locked
      .on('mouseenter', function(_, d: D3Node) {
        if (d.data.taxonomicLevel === 'species' && isLocked) {
          const isMatch = matchesSearch(d.data.name, searchTerm);
          d3.select(this)
            .style('fill', searchTerm === '' && isMatch ? '#888' : searchTerm !== '' && isMatch ? '#888' : searchTerm !== '' && !isMatch ? '#ddd' : '#333')
            .style('cursor', searchTerm === '' && isMatch ? 'pointer' : searchTerm !== '' && isMatch ? 'pointer' : searchTerm !== '' && !isMatch ? 'default' : 'default');
        }
      })
      .on('mouseleave', function(_, d: D3Node) {
        if (d.data.taxonomicLevel === 'species' && isLocked) {
          const isMatch = matchesSearch(d.data.name, searchTerm);
          d3.select(this)
            .style('fill', searchTerm === '' && isMatch ? '#333' : searchTerm !== '' && isMatch ? '#000' : searchTerm !== '' && !isMatch ? '#ddd' : '#333')
            .style('font-weight', searchTerm !== '' && isMatch ? 'bold' : 'normal')
            .style('cursor', 'inherit');
        }
      })
      // Add click handler for species labels
      .on('click', function(_, d: D3Node) {
        if (d.data.taxonomicLevel === 'species' && isLocked) {
          // event.stopPropagation(); // Prevent zoom behavior
          const isMatch = matchesSearch(d.data.name, searchTerm);
          if (isMatch) {

            toast.success(() => (
              <span>
                Clicked on <strong>{d.data.name}</strong>
                {/* <button onClick={() => toast.dismiss(t.id)}>
                  Dismiss
                </button> */}
              </span>
            ));

            // toast(`Clicked on species: ${d.data.name}`)

            // Create a URL-friendly version of the species name
            const speciesSlug = d.data.name.toLowerCase().replace(/\s+/g, '-');
            
            // You can customize this URL pattern based on your routing needs
            const url = `/genome/${speciesSlug}`;
            
            // Option 1: Navigate within the same app (React Router)
            // window.history.pushState({}, '', url);
            // dispatchEvent(new PopStateEvent('popstate'));
            
            // Option 2: Open in new tab
            // window.open(url, '_blank');
            
            // Option 3: Navigate to external URL (e.g., NCBI, Ensembl)
            // const ncbiUrl = `https://www.ncbi.nlm.nih.gov/search/all/?term=${encodeURIComponent(d.data.name)}`;
            // window.open(ncbiUrl, '_blank');
            
            // For demo purposes, just log the action
            console.log(`Clicked on species: ${d.data.name}`);
            console.log(`Would navigate to: ${url}`);

            // If you're using React Router, you might want to call a navigation function
            // passed as a prop to this component

          }
        }
      });

    // Create legend (fixed position, not affected by zoom)
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 135}, 20)`) // Right side positioning
      .style('opacity', 0)
      .style('transition', 'opacity 0.25s ease')
      .style('pointer-events', 'all')
      .on('mousedown', (event) => {
        event.stopPropagation(); // Prevent zoom behavior from capturing this
      });

    // Get the class names and colors for the legend
    const legendData = Array.from(levelNames).map(levelName => ({
      name: levelName,
      color: colorScale(levelName)
    }));

    // Legend background
    legend.append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', 135)
      .attr('height', legendData.length * 20)
      .attr('rx', 5)
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    // Legend items
    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => `translate(0, ${i * 20})`);

    // Legend circles
    legendItems.append('circle')
      .attr('r', 3.5)
      .style('fill', d => d.color)
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    // Legend text
    legendItems.append('text')
      .attr('x', 12.5)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.name);

    const legendHeight = legendData.length * 20;

    // Add zoom controls (fixed position)
    const controls = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${width - 40}, ${legendHeight + 15})`)
      .style('pointer-events', 'all')
      .on('mousedown', (event) => {
        event.stopPropagation(); // Prevent zoom behavior from capturing this
      })
      .style('opacity', 0)
      .style('transition', 'opacity 0.25s ease');

    // Zoom in button
    const zoomInButton = controls.append('g')
      .attr('class', 'zoom-button')
      .style('cursor', 'pointer');

    zoomInButton.append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 3)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    zoomInButton.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#495057')
      .text('+');

    zoomInButton.on('click', () => {
      if (!svgRef.current) return;
      d3.select(svgRef.current)
        .transition()
        .duration(250)
        .call(zoom.scaleBy, 1.5, [centerX / initialScale, centerY / initialScale]);
    });

    // Zoom out button
    const zoomOutButton = controls.append('g')
      .attr('class', 'zoom-button')
      .attr('transform', 'translate(-35, 0)')
      .style('cursor', 'pointer');

    zoomOutButton.append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 3)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    zoomOutButton.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#495057')
      .text('−');

    zoomOutButton.on('click', () => {
      if (!svgRef.current) return;
      d3.select(svgRef.current)
        .transition()
        .duration(250)
        .call(zoom.scaleBy, 0.67, [centerX / initialScale, centerY / initialScale]);
    });

    // Reset zoom button
    const resetButton = controls.append('g')
      .attr('class', 'zoom-button')
      .attr('transform', 'translate(-70, 0)')
      .style('cursor', 'pointer');

    resetButton.append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 3)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    resetButton.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#495057')
      .text('↻');

    resetButton.on('click', () => {
      if (!svgRef.current) return;
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoom.transform, 
          d3.zoomIdentity
            .scale(initialScale)
            .translate(centerX, centerY));
    });

    // Reset zoom button
    const panButton = controls.append('g')
      .attr('class', 'zoom-button')
      .attr('transform', 'translate(-105, 0)')
      .style('cursor', 'pointer');

    panButton.append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', 3)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    panButton.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#495057')
      .text(isLocked ? '⊗' : '○');
      // .text('●');
      // .text('○');

    panButton.on('click', () => {
      if (!svgRef.current) return;
      isLocked = !isLocked;
      setIsActuallyLocked(isLocked);

      d3.select(panButton.node())
        .select('text')
        .text(isLocked ? '⊗' : '○');
    });

    container.append('text')
      .attr('class', 'title-label')
      .attr('x', centerX / 0.587)
      .attr('y', centerY / 0.5 + radius + 130)
      .style('text-anchor', 'middle')
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-weight', 'bold')
      .style('font-size', '21px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text('Available Genomes');

    // Add hover behavior to the entire tree area
    // might be a problem if you hover the d3 while updating searchTerm because opacities reset
    svg
      .on('mouseenter', () => {
        controls.transition().duration(0).style('opacity', 1);
        legend.transition().duration(0).style('opacity', 1);
      })
      .on('mouseleave', () => {
        controls.transition().duration(0).style('opacity', 0);
        legend.transition().duration(0).style('opacity', 0);
      });
  }, [searchTerm]);

  useEffect(() => {
    // Initial draw
    drawTree();

    // Add resize event listener
    const handleResize = () => {
      // Debounce the resize event to avoid excessive re-renders
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(drawTree, 150);
    };

    window.addEventListener('resize', handleResize);
    
    // Optional: Listen for orientation changes on mobile devices
    window.addEventListener('orientationchange', () => {
      setTimeout(drawTree, 100); // Small delay for orientation change
    });

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', drawTree);
      if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
      }
    };
  }, [drawTree]);

  return (
    <div ref={containerRef} className={`w-100 h-full ${isActuallyLocked ? '' : 'cursor-grab'}`}>
      <div className='flex justify-center'>
        <svg ref={svgRef} className='w-100 rounded'></svg>
      </div>
    </div>
  );
};

// Extend the Window interface to include resizeTimeout
declare global {
  interface Window {
    resizeTimeout: number;
  }
}

export default Tree;
