import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

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
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: ZoomEvent) => {
        container.attr('transform', event.transform.toString());
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
      .style('stroke-width', 2);

    // Draw nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: D3Node) => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0)
      `);

    node.append('circle')
      .attr('r', (d: D3Node) => d.children ? 0 : 0) // Only show circles for leaf nodes
      .style('fill', (d: D3Node) => {
        if (d.children) return 'transparent'; // Hide non-leaf nodes
        
        const taxonomicLevel = findTaxonomicLevel(d);
        return taxonomicLevel ? colorScale(taxonomicLevel) : '#999';
      })
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    // Node labels
    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: D3Node) => d.x < Math.PI === !d.children ? 6 : -6)
      .attr('text-anchor', (d: D3Node) => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', (d: D3Node) => d.x >= Math.PI ? 'rotate(180)' : null)
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-size', (d: D3Node) => d.data.taxonomicLevel === 'species' ? '11px' : '11px')
      .style('font-weight', (d: D3Node) => d.data.taxonomicLevel === 'species' ? 'semibold' : 'normal')
      .style('fill', '#333')
      .style('opacity', (d: D3Node) => d.data.taxonomicLevel === 'species' ? 1 : 0)
      .text((d: D3Node) => {
        if (d.data.taxonomicLevel === 'species') {
          return `${d.data.name}`;
        }
        return d.data.name ?? null;
      });

    // Create legend (fixed position, not affected by zoom)
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 20)`) // Right side positioning
      .style('opacity', 0)
      .style('transition', 'opacity 0.25s ease')
      .style('pointer-events', 'none'); // Prevent legend from interfering with zoom

    // Get the class names and colors for the legend
    const legendData = Array.from(levelNames).map(levelName => ({
      name: levelName,
      color: colorScale(levelName)
    }));

    // Legend background
    legend.append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', 150)
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
      .attr('r', 4)
      .style('fill', d => d.color)
      .style('stroke', '#fff')
      .style('stroke-width', 2);

    // Legend text
    legendItems.append('text')
      .attr('x', 15)
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
        .call(zoom.scaleBy, 1.5);
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
        .call(zoom.scaleBy, 0.67);
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

    container.append('text')
      .attr('class', 'title-label')
      .attr('x', centerX / 0.59)
      .attr('y', centerY / 0.51 + radius + 130)
      .style('text-anchor', 'middle')
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-weight', 'bold')
      .style('font-size', '21px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text('Available Genomes');

    // Add hover behavior to the entire tree area
    svg
      .on('mouseenter', () => {
        controls.transition().duration(0).style('opacity', 1);
        legend.transition().duration(0).style('opacity', 1);
      })
      .on('mouseleave', () => {
        controls.transition().duration(0).style('opacity', 0);
        legend.transition().duration(0).style('opacity', 0);
      });
  }, []);

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
    <div ref={containerRef} className='w-100 h-full cursor-grab'>
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
