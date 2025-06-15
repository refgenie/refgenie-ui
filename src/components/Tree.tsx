import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerRect = svgRef.current.getBoundingClientRect();
    const width = containerRect.width || 800;  // fallback
    const height = Math.min(width, window.innerHeight * 0.8);
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

    const selectedLevel = 'kingdom'

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

    // // Color scale for different taxonomic levels
    // const colorScale = d3.scaleOrdinal<string>()
    //   .domain(['class', 'order', 'family', 'genus', 'species'])
    //   .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

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
      // .style('stroke', '#ccc')
      .style('stroke-width', 1.5);

    // Draw nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: D3Node) => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0)
      `);

    // Node circles
    // node.append('circle')
    //   .attr('r', (d: D3Node) => d.data.taxonomicLevel === 'species' ? 4 : 0)
    //   .style('fill', (d: D3Node) => d.data.taxonomicLevel ? colorScale(d.data.taxonomicLevel) : '#999')
    //   .style('stroke', '#fff')
    //   .style('stroke-width', 2);

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
      .style('font-size', (d: D3Node) => d.data.taxonomicLevel === 'species' ? '10px' : '10px')
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
      .attr('transform', `translate(${width - 151}, 20)`) // Right side positioning
      .style('opacity', 0)
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
      // .attr('height', legendData.length * 20 + 25)
      .attr('height', legendData.length * 20)
      .attr('rx', 5)
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    // Legend title
    // legend.append('text')
    //   .attr('x', 0)
    //   .attr('y', 5)
    //   .style('font-size', '14px')
    //   .style('font-weight', 'bold')
    //   .style('fill', '#333')
    //   .text('Taxonomic Classes');

    // Legend items
    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter().append('g')
      .attr('class', 'legend-item')
      // .attr('transform', (d, i) => `translate(0, ${i * 20 + 25})`);
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
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.name);

    // Add zoom controls (fixed position)
    const controls = svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', 'translate(10, 10)')
      .style('pointer-events', 'all')
      .style('opacity', 0)
      .style('transition', 'opacity 0.25s ease');

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
      .attr('transform', 'translate(0, 35)')
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
    
    // After creating the zoom behavior and applying it to SVG
    svg.call(zoom);

    // Set initial zoom level with proper centering
    const initialScale = 0.88;
    const centerX = width / 2;
    const centerY = height / 2;

    // Reset zoom button
    const resetButton = controls.append('g')
      .attr('class', 'zoom-button')
      .attr('transform', 'translate(0, 70)')
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
            .translate(centerX, centerY)
            .scale(initialScale)
            .translate(-centerX, -centerY));
        });

    svg.call(zoom.transform, 
      d3.zoomIdentity
        .translate(centerX, centerY)
        .scale(initialScale)
        .translate(-centerX, -centerY)
    );

  }, []);

  return (
    <div className='w-100 h-full bg-white cursor-grab'>
      <div className='flex justify-center'>
        {/* <svg ref={svgRef} className='w-100 border rounded shadow-sm'></svg> */}
        <svg ref={svgRef} className='w-100 rounded'></svg>
      </div>
    </div>
  );
};

export default Tree;
