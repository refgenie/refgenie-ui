import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
// import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import type { TreeNode } from '../../types';

import { buildTree } from '../utils/buildTree';
import { useAboutSearch, useSelectedSpecies } from '../stores/search';
import { useTreeFullScreen } from '../stores/fullScreen';

import taxa from '../assets/taxa.json';

const treeData = buildTree(taxa);

interface D3Node extends d3.HierarchyPointNode<TreeNode> {
  x: number;
  y: number;
}

interface ZoomEvent extends d3.D3ZoomEvent<SVGSVGElement, unknown> {
  transform: d3.ZoomTransform;
}

type TreeProps = {
  availableGenomes: number;
};

function Tree(props: TreeProps) {
  const { availableGenomes } = props;

  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const controlsSvgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultSelectedLevel = 'class';

  const [isActuallyLocked, setIsActuallyLocked] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(defaultSelectedLevel);
  const [selectedLevelInstance, setSelectedLevelInstance] = useState(['', '']);
  // const [isFullScreen, setIsFullScreen] = useState(false);

  const { isFullScreen } = useTreeFullScreen();
  const { searchTerm, setSearchTerm } = useAboutSearch();
  const { setSelectedSpecies } = useSelectedSpecies();

  const matchesSearch = (speciesName: string, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true; // If no search term, all match
    return speciesName.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Function to check if any descendant species matches the search
  const hasMatchingDescendant = (
    node: d3.HierarchyPointNode<TreeNode>,
    searchTerm: string,
  ): boolean => {
    if (!searchTerm.trim()) return true;

    // Check if this node is a matching species
    if (
      node.data.taxonomicLevel === 'species' &&
      matchesSearch(node.data.name, searchTerm)
    ) {
      return true;
    }

    // Check descendants
    if (node.children) {
      return node.children.some((child) =>
        hasMatchingDescendant(child, searchTerm),
      );
    }

    return false;
  };

  // Checks if a node or any of its descendants contains the target taxonomic level and name
  function hasDescendantWithTarget(
    node: TreeNode,
    targetLevel: string,
    targetName: string,
  ): boolean {
    // Check if this node matches
    if (node.taxonomicLevel === targetLevel && node.name === targetName) {
      return true;
    }

    // Check children recursively
    if (node.children) {
      return node.children.some((child) =>
        hasDescendantWithTarget(child, targetLevel, targetName),
      );
    }

    return false;
  }

  // Filters tree data to only include paths that contain the specified taxonomic level and name
  function pruneTreeToTarget(
    treeData: TreeNode,
    targetLevel: string,
    targetName: string,
  ): TreeNode | null {
    // If targetName is empty, don't filter - return the entire tree
    if (!targetName || targetName.trim() === '') {
      return { ...treeData, children: treeData.children ?? undefined };
    }

    // If this node matches the target, return the full path from root to here plus all descendants
    if (
      treeData.taxonomicLevel === targetLevel &&
      treeData.name === targetName
    ) {
      return { ...treeData, children: treeData.children ?? undefined }; // Return a copy with all descendants
    }

    // If this node has children, check which ones should be kept
    if (treeData.children) {
      const filteredChildren = treeData.children
        .filter((child) =>
          hasDescendantWithTarget(child, targetLevel, targetName),
        )
        .map((child) => pruneTreeToTarget(child, targetLevel, targetName))
        .filter((child) => child !== null) as TreeNode[];

      // If we have filtered children, return this node with only those children
      if (filteredChildren.length > 0) {
        return {
          ...treeData,
          children: filteredChildren,
        };
      }
    }

    // This node and its subtree don't contain the target
    return null;
  }

  // Identify instance of selected taxonomic level for given node
  const findTaxonomicLevel = (
    node: d3.HierarchyPointNode<TreeNode>,
  ): string | null => {
    // If this node is a class, return it
    if (node.data.taxonomicLevel === selectedLevel) {
      return node.data.name;
    }

    // Walk up the tree to find the instance of selected level
    let current = node.parent;
    while (current) {
      if (current.data.taxonomicLevel === selectedLevel) {
        return current.data.name;
      }
      current = current.parent;
    }

    return null;
  };

  const prunedTreeData = pruneTreeToTarget(
    treeData,
    selectedLevelInstance[0],
    selectedLevelInstance[1],
  );
  const levelOptions = [
    'Domain',
    'Kingdom',
    'Phylum',
    'Class',
    'Order',
    'Family',
    'Genus',
    'Species',
  ];
  const prunedLevelOptions =
    Array.isArray(selectedLevelInstance) &&
    selectedLevelInstance[0] === '' &&
    selectedLevelInstance[1] === ''
      ? levelOptions
      : levelOptions.slice(
          levelOptions
            .map((level) => level.toLowerCase())
            .indexOf(selectedLevelInstance[0]),
        );

  const drawTree = useCallback(() => {
    if (!svgRef.current || !controlsSvgRef.current || !containerRef.current)
      return;

    let isLocked = isActuallyLocked;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const controlsSvg = d3.select(controlsSvgRef.current);
    controlsSvg.selectAll('*').remove();

    // Get current container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = window.innerHeight;
    const radius: number = Math.min(width, height) / 2 - 100;
    const borderRadius = 4;

    // Set up the SVG with zoom behavior
    svg.attr('width', width).attr('height', height);
    controlsSvg.attr('width', width).attr('height', height);

    // Create main container group
    const container = svg.append('g');

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: ZoomEvent) => {
        container.attr('transform', event.transform.toString());
      })
      .filter((event) => {
        if (isLocked) {
          return event.type === null;
        }
        return true;
      });

    // needed for panning
    svg.call(zoom);

    // Set initial zoom level with proper centering
    const initialScale = isFullScreen ? 0.9 : 1.045;

    let centerX, centerY;
    if (width < 992) {
      centerX = width / 2;
      centerY = height / 2;
    } else if (isFullScreen) {
      centerX = width / 15;
      centerY = height / 20;
    } else {
      centerX = width / 4.8;
      centerY = height / 8;
    }

    svg.call(
      zoom.transform,
      d3.zoomIdentity.scale(initialScale).translate(centerX, centerY),
    );

    // Create radial gradient for background circle
    const defs = svg.append('defs');
    const gradient = defs
      .append('radialGradient')
      .attr('id', 'background-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ffeaa7') // Light yellow
      .attr('stop-opacity', 0.33);

    gradient
      .append('stop')
      .attr('offset', '67%')
      .attr('stop-color', '#ffeaa7')
      .attr('stop-opacity', 0.11);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ffeaa7')
      .attr('stop-opacity', 0);

    // Add background circle
    container
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', radius + 100)
      .style('fill', 'url(#background-gradient)')
      .style('pointer-events', 'none');

    container
      .append('text')
      .attr('class', 'title-label')
      .attr('x', isFullScreen ? width / 6 : centerX / 1.5)
      .attr(
        'y',
        isFullScreen
          ? centerY / 0.15 + radius + 130
          : centerY / 0.6 + radius + 130,
      )
      .style('text-anchor', 'middle')
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-weight', 'bold')
      .style('font-size', '14px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(availableGenomes + ' Available Genomes');

    // Set up the main group with initial translation
    const g = container
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create the tree layout
    const tree = d3
      .tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Create hierarchy
    const root = tree(d3.hierarchy(prunedTreeData as TreeNode));

    // Identify unique levels
    const levelNames = new Set<string>();
    const extractSelectedLevels = (node: TreeNode) => {
      if (node.taxonomicLevel === selectedLevel) {
        levelNames.add(node.name);
      }
      if (node.children) {
        node.children.forEach(extractSelectedLevels);
      }
    };
    extractSelectedLevels(prunedTreeData as TreeNode);

    // Generate evenly spaced hues
    const generateColors = (count: number) => {
      return Array.from({ length: count }, (_, i) => {
        const hue = ((i * 360) / count) % 360;
        return d3.hsl(hue, 0.725, 0.475).formatHex() + 'bb';
      });
    };

    const colorScale = d3
      .scaleOrdinal()
      .domain(Array.from(levelNames))
      .range(generateColors(levelNames.size));

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkRadial<
            d3.HierarchyPointLink<TreeNode>,
            d3.HierarchyPointNode<TreeNode>
          >()
          .angle((d) => d.x)
          .radius((d) => d.y),
      )
      .style('fill', 'none')
      .style('stroke', (d: d3.HierarchyPointLink<TreeNode>) => {
        const taxonomicLevel = findTaxonomicLevel(d.target);
        const color = taxonomicLevel
          ? String(colorScale(taxonomicLevel))
          : '#999999bb';
        return color;
      })
      .style('stroke-width', (d: d3.HierarchyPointLink<TreeNode>) => {
        if (searchTerm === '') {
          return 0.6;
        }
        const hasMatch = hasMatchingDescendant(d.target, searchTerm);
        return hasMatch ? 1.2 : 0.6;
      })
      .style('stroke-linecap', 'round')
      .style('opacity', (d: d3.HierarchyPointLink<TreeNode>) => {
        // Check if the target node or any of its descendants match the search
        const hasMatch = hasMatchingDescendant(d.target, searchTerm);
        return hasMatch ? 1 : 0.2; // Full opacity for matching paths, reduced for non-matching
      });

    // g.selectAll('.link-clickable')
    //   .data(root.links())
    //   .enter().append('path')
    //   .attr('class', 'link-clickable')
    //   .attr('d', d3.linkRadial<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
    //     .angle(d => d.x)
    //     .radius(d => d.y))
    //   .style('fill', 'none')
    //   .style('stroke', 'transparent')
    //   .style('stroke-width', 5)
    //   .on('mouseenter', function() {
    //     if (isActuallyLocked) {
    //       d3.select(this).style('cursor', 'pointer');
    //     } else {
    //       d3.select(this).style('cursor', 'inherit');
    //     }
    //   })
    //   .on('mouseleave', function() {
    //     d3.select(this).style('cursor', 'inherit');
    //   })
    //   .on('click', function(_, d: d3.HierarchyPointLink<TreeNode>) {
    //     if (isLocked) {
    //       setSelectedLevel(d.target.data.taxonomicLevel ?? '')
    //       setSelectedLevelInstance(d.target.data.name ? [d.target.data.taxonomicLevel ?? '', d.target.data.name ?? ''] : ['', ''])
    //     }
    //   })
    //   .append('title')
    //   .text(function(d: d3.HierarchyPointLink<TreeNode>) {
    //     return d.target.data.name ?? '';
    //   });

    // Draw nodes
    g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr(
        'transform',
        (d: D3Node) => `
        rotate(${(d.x * 180) / Math.PI - 90}) 
        translate(${d.y},0)
      `,
      );

    const getPathToRoot = (
      node: d3.HierarchyPointNode<TreeNode>,
    ): d3.HierarchyPointNode<TreeNode>[] => {
      const path: d3.HierarchyPointNode<TreeNode>[] = [];
      let current: d3.HierarchyPointNode<TreeNode> | null = node;

      while (current) {
        path.push(current);
        current = current.parent;
      }

      return path;
    };

    // RENDER MATCHING TEXT SECOND (on top)
    g.selectAll('.matching-label')
      .data(
        root
          .descendants()
          .filter(
            (d) =>
              d.data.taxonomicLevel === 'species' &&
              (searchTerm === '' || matchesSearch(d.data.name, searchTerm)),
          ),
      )
      .enter()
      .append('text')
      .attr('class', 'matching-label')
      .attr('dy', '0.31em')
      .attr('x', (d: D3Node) => (d.x < Math.PI === !d.children ? 12 : -12))
      .attr('text-anchor', (d: D3Node) =>
        d.x < Math.PI === !d.children ? 'start' : 'end',
      )
      .attr(
        'transform',
        (d: D3Node) => `
        rotate(${(d.x * 180) / Math.PI - 90}) 
        translate(${d.y},0)
        ${d.x >= Math.PI ? 'rotate(180)' : ''}
      `,
      )
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-size', '9px')
      .style('font-weight', 'bold')
      .style('fill', '#444')
      // .style('cursor', 'pointer')
      .style('transition', 'all 0.125s ease')
      .style('opacity', searchTerm === '' ? 0 : 1)
      .text((d) => d.data.name)
      .on('mouseenter', function (_, d: D3Node) {
        if (isLocked) {
          d3.select(this).style('opacity', 1).style('cursor', 'pointer');
          d3.selectAll('.matching-group-label').style('opacity', 0);
          setSelectedSpecies(d.data.name);

          const pathNodes = getPathToRoot(d);

          // Get all links that are part of the path
          const pathLinks = root
            .links()
            .filter((link) =>
              pathNodes.some((pathNode) => pathNode === link.target),
            );

          // Highlight the path links
          g.selectAll('.link')
            .style('transition', 'all 0.125s ease')
            .style('stroke-width', function (this: any, linkData: any) {
              const isInPath = pathLinks.some(
                (pathLink) =>
                  pathLink.source === linkData.source &&
                  pathLink.target === linkData.target,
              );
              return isInPath
                ? 1.2
                : searchTerm === ''
                  ? 0.6
                  : hasMatchingDescendant(linkData.target, searchTerm)
                    ? 1.2
                    : 0.6;
            })
            .style('opacity', function (this: any, linkData: any) {
              const isInPath = pathLinks.some(
                (pathLink) =>
                  pathLink.source === linkData.source &&
                  pathLink.target === linkData.target,
              );
              return isInPath
                ? 1
                : hasMatchingDescendant(linkData.target, searchTerm)
                  ? 0.2
                  : 0.2;
            });
        }
      })
      .on('mouseleave', function () {
        if (isLocked) {
          d3.select(this).style('opacity', searchTerm === '' ? 0 : 1);
          d3.selectAll('.matching-group-label').style('opacity', 1);

          g.selectAll('.link')
            .style('transition', 'all 0.125s ease')
            .style('stroke-width', function (this: any, d: any) {
              if (searchTerm === '') {
                return 0.6;
              }
              const hasMatch = hasMatchingDescendant(d.target, searchTerm);
              return hasMatch ? 1.2 : 0.6;
            })
            .style('opacity', function (this: any, d: any) {
              const hasMatch = hasMatchingDescendant(d.target, searchTerm);
              return hasMatch ? 1 : 0.2;
            });
        }
      })
      // .on('mouseenter', function (_, d: D3Node) {
      //   if (isLocked) {
      //     d3.select(this).style('opacity', 1).style('cursor', 'pointer');

      //     d3.selectAll('.matching-group-label').style('opacity', 0);

      //     setSelectedSpecies(d.data.name);
      //   }
      // })
      // .on('mouseleave', function () {
      //   if (isLocked) {
      //     d3.select(this).style('opacity', searchTerm === '' ? 0 : 1);

      //     d3.selectAll('.matching-group-label').style('opacity', 1);
      //   }
      // })
      .on('click', function (_, d: D3Node) {
        if (isLocked) {
          // toast.success(() => (
          //   <span>
          //     Clicked on <strong>{d.data.name}</strong>
          //   </span>
          // ));

          setSearchTerm(d.data.name);
          navigate(`/search`);
        }
      });

    // First, let's create a helper function to find the representative node for each group
    const minGroupLength = 10;
    const getGroupRepresentatives = (root: d3.HierarchyNode<TreeNode>) => {
      const groups = new Map<string, d3.HierarchyPointNode<TreeNode>[]>();

      // Collect all terminal nodes (species) and group them by the selected taxonomic level
      root.descendants().forEach((node) => {
        if (node.data.taxonomicLevel === 'species') {
          const groupName = findTaxonomicLevel(
            node as d3.HierarchyPointNode<TreeNode>,
          );
          if (groupName) {
            if (!groups.has(groupName)) {
              groups.set(groupName, []);
            }
            groups
              .get(groupName)!
              .push(node as d3.HierarchyPointNode<TreeNode>);
          }
        }
      });

      // For each group, find the node that should represent the group label
      const representatives = new Map<
        string,
        d3.HierarchyPointNode<TreeNode>
      >();

      groups.forEach((nodes, groupName) => {
        // Filter nodes that match the search term
        // const matchingNodes = nodes.filter(node =>
        //   searchTerm === '' || matchesSearch(node.data.name, searchTerm)
        // );

        const matchingNodes = nodes;

        if (matchingNodes.length > minGroupLength) {
          // Find the node at the average angle to position the label
          const avgAngle =
            matchingNodes.reduce((sum, node) => sum + node.x, 0) /
            matchingNodes.length;
          const representative = matchingNodes.reduce((closest, node) =>
            Math.abs(node.x - avgAngle) < Math.abs(closest.x - avgAngle)
              ? node
              : closest,
          );
          representatives.set(groupName, representative);
        }
      });

      return representatives;
    };

    const groupRepresentatives = getGroupRepresentatives(root);

    // Create a single circular path for all labels to follow
    const labelRadius =
      Math.max(...root.descendants().map((node) => node.y)) + 13; // Position labels beyond terminal nodes

    // Add the circular path definition that all text will follow
    const textDefs = g.append('defs');
    textDefs
      .append('path')
      .attr('id', 'label-circle')
      .attr(
        'd',
        `M 0 ${-labelRadius} A ${labelRadius} ${labelRadius} 0 1 1 0 ${labelRadius} A ${labelRadius} ${labelRadius} 0 1 1 0 ${-labelRadius}`,
      )
      .style('fill', 'none')
      .style('stroke', 'none');

    // Helper function to calculate the position along the circle for each group
    const getGroupPositions = (
      groupRepresentatives: Map<string, d3.HierarchyPointNode<TreeNode>>,
    ) => {
      const positions: Array<{
        groupName: string;
        node: d3.HierarchyPointNode<TreeNode>;
        hasMatches: boolean;
        pathOffset: number; // Percentage along the circular path
      }> = [];

      groupRepresentatives.forEach((node, groupName) => {
        // Check if this group has matching species
        const groupNodes = root
          .descendants()
          .filter(
            (n) =>
              n.data.taxonomicLevel === 'species' &&
              findTaxonomicLevel(n as d3.HierarchyPointNode<TreeNode>) ===
                groupName,
          );
        const hasMatches =
          searchTerm === '' ||
          groupNodes.some((n) => matchesSearch(n.data.name, searchTerm));

        // Convert the node's angle to a percentage along the circular path
        // The circle path starts at the top (12 o'clock) and goes clockwise
        // Node angles start at 3 o'clock and go counter-clockwise
        // We need to convert and normalize
        let normalizedAngle = node.x; // Rotate to start at top
        if (normalizedAngle > 2 * Math.PI) normalizedAngle -= 2 * Math.PI;
        if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

        const pathOffset = (normalizedAngle / (2 * Math.PI)) * 100; // Convert to percentage

        positions.push({
          groupName,
          node,
          hasMatches,
          pathOffset,
        });
      });

      return positions;
    };

    const groupPositions = getGroupPositions(groupRepresentatives);

    // RENDER NON-MATCHING GROUP LABELS (behind) - following the tree circle
    g.selectAll('.non-matching-group-label')
      .data(groupPositions.filter((d) => searchTerm !== '' && !d.hasMatches))
      .enter()
      .append('text')
      .attr('class', 'non-matching-group-label')
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-size', '9px')
      .style('font-weight', 'normal')
      .style('fill', '#eee')
      .style('cursor', 'default')
      .append('textPath')
      .attr('href', '#label-circle')
      .attr('startOffset', (d) => `${d.pathOffset}%`)
      .style('text-anchor', 'middle')
      .text((d) => d.groupName);

    // RENDER MATCHING GROUP LABELS (on top) - following the tree circle
    g.selectAll('.matching-group-label')
      .data(groupPositions.filter((d) => d.hasMatches))
      .enter()
      .append('text')
      .attr('class', 'matching-group-label')
      .style('font-family', 'Nunito, arial, sans-serif')
      .style('font-size', '9px')
      .style('font-weight', 'bold')
      .style('fill', (d) => colorScale(d.groupName) as string)
      .style('cursor', 'default')
      .style('transition', 'all 0.125s ease')
      .append('textPath')
      .attr('href', '#label-circle')
      .attr('startOffset', (d) => `${d.pathOffset}%`)
      .style('text-anchor', 'middle')
      .text((d) => d.groupName);

    // Helper function to get group arc data
    const getGroupArcs = (root: d3.HierarchyNode<TreeNode>) => {
      const groups = new Map<string, d3.HierarchyPointNode<TreeNode>[]>();

      // Collect all terminal nodes (species) and group them by the selected taxonomic level
      root.descendants().forEach((node) => {
        if (node.data.taxonomicLevel === 'species') {
          const groupName = findTaxonomicLevel(
            node as d3.HierarchyPointNode<TreeNode>,
          );
          if (groupName) {
            if (!groups.has(groupName)) {
              groups.set(groupName, []);
            }
            groups
              .get(groupName)!
              .push(node as d3.HierarchyPointNode<TreeNode>);
          }
        }
      });

      const arcs: Array<{
        groupName: string;
        startAngle: number;
        endAngle: number;
        radius: number;
        color: string;
        nodeCount: number;
        hasMatches: boolean;
      }> = [];

      groups.forEach((nodes, groupName) => {
        // Filter nodes that match the search term
        const allNodes = nodes;
        const matchingNodes = nodes.filter(
          (node) =>
            searchTerm === '' || matchesSearch(node.data.name, searchTerm),
        );

        if (allNodes.length > minGroupLength) {
          // Only create arcs for groups with multiple nodes
          const angles = allNodes.map((node) => node.x).sort((a, b) => a - b);
          let startAngle = angles[0];
          let endAngle = angles[angles.length - 1];

          // Get the maximum radius (furthest terminal node)
          const maxRadius = Math.max(...allNodes.map((node) => node.y));

          arcs.push({
            groupName,
            startAngle,
            endAngle,
            radius: maxRadius + 7, // Add some padding beyond the terminal nodes
            color: colorScale(groupName) as string,
            nodeCount: allNodes.length,
            hasMatches: matchingNodes.length > 0,
          });
        }
      });

      return arcs;
    };

    const groupArcs = getGroupArcs(root);

    // Draw group arcs
    g.selectAll('.group-arc')
      .data(groupArcs)
      .enter()
      .append('path')
      .attr('class', 'group-arc')
      .attr('d', (d) => {
        // Create an arc path
        const arc = d3
          .arc()
          .innerRadius(d.radius)
          .outerRadius(d.radius)
          .startAngle(d.startAngle)
          .endAngle(d.endAngle);
        return arc(d as any) || '';
      })
      .style('fill', 'none')
      .style('stroke', (d) => d.color)
      .style('stroke-width', 2)
      .style('stroke-linecap', 'round')
      .style('opacity', (d) => {
        if (searchTerm === '') return 0.8;
        return d.hasMatches ? 1 : 0.3;
      })
      .append('title')
      .text((d) => `${d.groupName} (${d.nodeCount} species)`);

    // Draw arc endpoints (optional visual enhancement)
    g.selectAll('.arc-startpoint')
      .data(
        groupArcs.flatMap((arc) => [
          { ...arc, angle: arc.startAngle, type: 'start' },
          // { ...arc, angle: arc.endAngle, type: 'end' }
        ]),
      )
      .enter()
      .append('rect')
      .attr('class', 'arc-startpoint')
      .attr('x', (d) => (d.radius + 2) * Math.cos(d.angle - Math.PI / 2) - 1) // Center the rect
      .attr('y', (d) => (d.radius + 2) * Math.sin(d.angle - Math.PI / 2) - 0) // Center the rect
      .attr('width', 3)
      .attr('height', 2)
      .attr('transform', (d) => {
        const x = (d.radius + 2) * Math.cos(d.angle - Math.PI / 2);
        const y = (d.radius + 2) * Math.sin(d.angle - Math.PI / 2);
        const rotation = (d.angle * 180) / Math.PI - 90;
        return `rotate(${rotation}, ${x}, ${y})`;
      })
      .style('fill', (d) => d.color)
      .style('opacity', (d) => {
        if (searchTerm === '') return 0.8;
        return d.hasMatches ? 1 : 0.3;
      });

    g.selectAll('.arc-endpoint')
      .data(
        groupArcs.flatMap((arc) => [
          // { ...arc, angle: arc.startAngle, type: 'start' },
          { ...arc, angle: arc.endAngle, type: 'end' },
        ]),
      )
      .enter()
      .append('rect')
      .attr('class', 'arc-endpoint')
      .attr('x', (d) => (d.radius + 2) * Math.cos(d.angle - Math.PI / 2) - 1) // Center the rect
      .attr('y', (d) => (d.radius + 2) * Math.sin(d.angle - Math.PI / 2) - 2) // Center the rect
      .attr('width', 3)
      .attr('height', 2)
      .attr('transform', (d) => {
        const x = (d.radius + 2) * Math.cos(d.angle - Math.PI / 2);
        const y = (d.radius + 2) * Math.sin(d.angle - Math.PI / 2);
        const rotation = (d.angle * 180) / Math.PI - 90;
        return `rotate(${rotation}, ${x}, ${y})`;
      })
      .style('fill', (d) => d.color)
      .style('opacity', (d) => {
        if (searchTerm === '') return 0.8;
        return d.hasMatches ? 1 : 0.3;
      });

    // // Create legend (fixed position, not affected by zoom)
    // const legend = controlsSvg.append('g')
    //   .attr('class', 'legend')
    //   .attr('transform', `translate(${width - 135}, 20)`)
    //   .style('pointer-events', 'all')
    //   .on('mousedown', (event) => {
    //     event.stopPropagation(); // Prevent zoom behavior from capturing this
    //   });

    // // Get the class names and colors for the legend
    // const legendData = Array.from(levelNames).map(levelName => ({
    //   name: levelName,
    //   color: colorScale(levelName)
    // }));

    // // Legend background
    // legend.append('rect')
    //   .attr('x', -10)
    //   .attr('y', 60)
    //   .attr('width', 135)
    //   .attr('height', legendData.length * 20)
    //   .attr('rx', borderRadius)
    //   .style('fill', 'rgba(255, 255, 255, 0.9)')
    //   .style('stroke', '#dee2e6')
    //   .style('stroke-width', 1);

    // // Legend items
    // const legendItems = legend.selectAll('.legend-item')
    //   .data(legendData)
    //   .enter().append('g')
    //   .attr('class', 'legend-item')
    //   .attr('transform', (_, i) => `translate(0, ${i * 20 + 70})`);

    // // Legend circles
    // legendItems.append('circle')
    //   .attr('r', 2.5)
    //   .style('fill', d => d.color as string);

    // // Legend text
    // legendItems.append('text')
    //   .attr('x', 12.5)
    //   .attr('y', 0)
    //   .attr('dy', '0.35em')
    //   .style('font-family', 'Nunito, arial, sans-serif')
    //   .style('font-size', '12px')
    //   .style('fill', '#333')
    //   .text(d => {
    //     const maxLength = 14;
    //     return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
    //   });

    // Add zoom controls (fixed position)
    const controls = controlsSvg
      .append('g')
      .attr('class', 'zoom-controls')
      // .attr('transform', `translate(${width - 40}, ${legendData.length * 20 + 15})`)
      .attr('transform', `translate(${width - 40}, 10)`)
      .style('pointer-events', 'all')
      .on('mousedown', (event) => {
        event.stopPropagation();
      });

    // Zoom in button
    const zoomInButton = controls
      .append('g')
      .attr('class', 'zoom-button')
      .style('cursor', 'pointer');

    zoomInButton
      .append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', borderRadius)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    zoomInButton
      .append('text')
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
        .call(zoom.scaleBy, 1.5, [width / 2, height / 2]);
    });

    zoomInButton.append('title').text('Zoom In');

    // Zoom out button
    const zoomOutButton = controls
      .append('g')
      .attr('class', 'zoom-button')
      .attr('transform', 'translate(-35, 0)')
      .style('cursor', 'pointer');

    zoomOutButton
      .append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', borderRadius)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    zoomOutButton
      .append('text')
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
        .call(zoom.scaleBy, 0.666666, [width / 2, height / 2]);
    });

    zoomOutButton.append('title').text('Zoom Out');

    // Reset zoom button
    const resetButton = controls
      .append('g')
      .attr('class', 'zoom-button')
      .attr('transform', 'translate(-70, 0)')
      .style('cursor', 'pointer');

    resetButton
      .append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', borderRadius)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    resetButton
      .append('text')
      .attr('x', 15)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#495057')
      .text('↻');

    resetButton.on('click', () => {
      setSelectedLevel(defaultSelectedLevel);
      setSelectedLevelInstance(['', '']);
      if (!svgRef.current) return;
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(
          zoom.transform,
          d3.zoomIdentity.scale(initialScale).translate(centerX, centerY),
        );
    });

    resetButton.append('title').text('Reset');

    // Panning button
    const panButton = controls
      .append('g')
      .attr('class', 'zoom-button')
      .attr('transform', 'translate(-105, 0)')
      .style('cursor', 'pointer');

    panButton
      .append('rect')
      .attr('width', 30)
      .attr('height', 30)
      .attr('rx', borderRadius)
      .style('fill', '#f8f9fa')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    panButton
      .append('text')
      .attr('x', 15)
      .attr('y', 20)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#495057')
      .text(isLocked ? '⊗' : '○');

    panButton.on('click', () => {
      if (!svgRef.current) return;
      isLocked = !isLocked;
      setIsActuallyLocked(isLocked);

      d3.select(panButton.node())
        .select('text')
        .text(isLocked ? '⊗' : '○');
    });

    panButton
      .append('title')
      .text(isLocked ? 'Enable Panning' : 'Disable Panning');

    // // Full screen toggle button
    // const fullScreenButton = controls.append('g')
    //   .attr('class', 'zoom-button')
    //   .attr('transform', 'translate(-140, 0)')
    //   .style('cursor', 'pointer');

    // fullScreenButton.append('rect')
    //   .attr('width', 30)
    //   .attr('height', 30)
    //   .attr('rx', borderRadius)
    //   .style('fill', '#f8f9fa')
    //   .style('stroke', '#dee2e6')
    //   .style('stroke-width', 1);

    // fullScreenButton.append('text')
    //   .attr('x', 15)
    //   .attr('y', 20)
    //   .style('text-anchor', 'middle')
    //   .style('font-size', '12px')
    //   .style('font-weight', 'bold')
    //   .style('fill', '#495057')
    //   .text(isFullScreen ? '■' : '□');

    // fullScreenButton.on('click', () => {
    //   if (!svgRef.current) return;
    //   setIsFullScreen(!isFullScreen);

    //   d3.select(fullScreenButton.node())
    //     .select('text')
    //     .text(isFullScreen ? '■' : '□');
    // });

    // fullScreenButton.append('title')
    //   .text(isFullScreen ? 'Disable Full Screen' : 'Enable Full Screen');

    const dropdown = controlsSvg
      .append('g')
      .attr('class', 'dropdown-box')
      .attr('transform', `translate(${width - 145}, 45)`)
      .style('pointer-events', 'all')
      .on('mousedown', (event) => {
        event.stopPropagation();
      });

    dropdown
      .append('rect')
      .attr('width', 135)
      .attr('height', 30)
      .attr('rx', borderRadius)
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('stroke', '#dee2e6')
      .style('stroke-width', 1);

    // Add hover behavior to the entire tree area
    // might be a problem if you hover the d3 while updating searchTerm because opacities reset
    controlsSvg
      .style('opacity', searchTerm === '' ? 0 : 1)
      .style('transition', 'opacity 0.25s ease');

    svg
      .on('mouseenter', () => {
        controlsSvg.transition().duration(0).style('opacity', 1);
      })
      .on('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget as Element;
        if (
          relatedTarget &&
          (relatedTarget.closest('.form-select') ||
            relatedTarget.closest('.zoom-controls') ||
            relatedTarget.closest('.legend') ||
            relatedTarget.closest('.dropdown-box') ||
            relatedTarget.closest('svg'))
        ) {
          return;
        }
        controlsSvg
          .transition()
          .duration(0)
          .style('opacity', searchTerm === '' ? 0 : 1);
      });
  }, [searchTerm, selectedLevel, selectedLevelInstance, isFullScreen]);

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
    <div
      ref={containerRef}
      className={`tree-container ${isActuallyLocked ? '' : 'cursor-grab'}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 'max(15%, 200px)',
        right: 0,
        height: '100vh',
        zIndex: 0,
      }}
    >
      <select
        className={`form-select form-select-sm border-0 bg-transparent fw-semibold cursor-pointer ${searchTerm === '' && 'hover-hide'}`}
        aria-label='Taxonomy Level Select'
        style={{
          position: 'fixed',
          right: '10px',
          top: '45px',
          width: '135px',
          height: '30px',
          fontSize: '12px',
          zIndex: 2,
        }}
        value={selectedLevel}
        onChange={(e) => setSelectedLevel(e.target.value)}
      >
        {prunedLevelOptions.map((level) => (
          <option key={level} value={level.toLowerCase()}>
            {level}
          </option>
        ))}
      </select>
      <svg
        ref={controlsSvgRef}
        className='w-100 rounded'
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 'max(15%, 200px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <svg
        ref={svgRef}
        className='w-100 rounded'
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100vh',
          zIndex: 0,
        }}
      />
    </div>
  );
}

// Extend the Window interface to include resizeTimeout
declare global {
  interface Window {
    resizeTimeout: number;
  }
}

export default Tree;
