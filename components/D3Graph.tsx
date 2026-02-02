
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useStore } from '../store';
import { TaskNode, AgentType } from '../types';

const D3Graph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<any, undefined>>(null);
  const nodesRef = useRef<any[]>([]);
  const boundariesRef = useRef<[number, number]>([33, 66]);
  const { currentScenario, boundaries, updateNodeAgent } = useStore();
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    boundariesRef.current = boundaries;
    // Wake up simulation when boundaries change to re-center nodes in their new lanes
    if (simRef.current) simRef.current.alpha(0.3).restart();
  }, [boundaries]);

  // Handle resizing robustly for all browsers (fixes Safari 0-width issue)
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !currentScenario || dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();

    // Re-initialize nodes
    nodesRef.current = currentScenario.tasks.map(t => ({ ...t }));

    // PRE-POSITION NODES: Prevent "Pink Wall" race condition
    // We strictly place nodes in their correct visual lanes before simulation starts
    // so the position-based re-classification doesn't accidentally overwrite strict API types.
    nodesRef.current.forEach(node => {
      const b1 = (boundariesRef.current[0] / 100) * width;
      const b2 = (boundariesRef.current[1] / 100) * width;

      let targetX = width / 2;
      if (node.currentAgent === AgentType.AI) targetX = b1 / 2;
      else if (node.currentAgent === AgentType.HUMAN) targetX = b2 + (width - b2) / 2;
      else targetX = b1 + (b2 - b1) / 2;

      node.x = targetX + (Math.random() - 0.5) * 50; // Add jitter
      node.y = height / 2 + (Math.random() - 0.5) * 50;
    });

    // Extract links from dependencies
    const links: any[] = [];
    nodesRef.current.forEach(node => {
      if (node.dependencies) {
        node.dependencies.forEach((depId: string) => {
          // Check if dependency exists in current set to avoid crashes
          if (nodesRef.current.find(n => n.id === depId)) {
            links.push({ source: depId, target: node.id });
          }
        });
      }
    });

    const radius = 32;
    const TOP_OFFSET = 180; // Space for headers/titles

    const simulation = d3.forceSimulation(nodesRef.current)
      .force('charge', d3.forceManyBody().strength(-300)) // Reduced charge to allow tighter columns
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80).strength(0.1)) // Weak links to prevent pulling across lanes
      .force('collision', d3.forceCollide().radius(radius + 5).strength(0.8))
      .force('y', d3.forceY((height + TOP_OFFSET) / 2).strength(0.08))
      .force('x', d3.forceX((d: any) => {
        const b1 = (boundariesRef.current[0] / 100) * width;
        const b2 = (boundariesRef.current[1] / 100) * width;

        // STRONG pull to the exact center of the lane to enforce strict logic
        if (d.currentAgent === AgentType.AI) return b1 / 2;
        if (d.currentAgent === AgentType.SHARED) return b1 + (b2 - b1) / 2;
        return b2 + (width - b2) / 2;
      }).strength(0.5))
      .on('tick', () => {
        nodesRef.current.forEach(node => {
          // Dynamic clamping with Top Offset
          node.x = Math.max(radius, Math.min(width - radius, node.x));
          node.y = Math.max(TOP_OFFSET + radius, Math.min(height - radius, node.y));

          // Determine agent based on strict X position
          const xPercent = (node.x / width) * 100;
          let newAgent = AgentType.SHARED;
          if (xPercent < boundariesRef.current[0]) newAgent = AgentType.AI;
          if (xPercent > boundariesRef.current[1]) newAgent = AgentType.HUMAN;

          // Update agent if changed (dragging across boundary)
          if (node.currentAgent !== newAgent) {
            node.currentAgent = newAgent;
            updateNodeAgent(node.id, newAgent);

            d3.select(`#node-${node.id} circle`)
              .transition()
              .duration(200)
              .attr('fill', newAgent === AgentType.AI ? '#0066ff' : newAgent === AgentType.HUMAN ? '#ff9500' : '#bf5af2');

            // No full restart, just let the forceX pull it to the new center eventually
            simulation.alpha(0.2).restart();
          }
        });

        // Update link positions and visual states dynamically
        linkGroup
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y)
          .attr('stroke', (d: any) => {
            // Only color if in same layer
            if (d.source.currentAgent !== d.target.currentAgent) return 'transparent';
            if (d.source.currentAgent === AgentType.AI) return '#0066ff';
            if (d.source.currentAgent === AgentType.HUMAN) return '#ff9500';
            return '#bf5af2';
          })
          .attr('opacity', (d: any) => {
            // Hide if layers don't match
            return d.source.currentAgent === d.target.currentAgent ? 0.6 : 0;
          });

        nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    simRef.current = simulation;

    // Filters and Markers definition
    const defs = svg.append('defs');

    // Arrow Marker (Neutral color)
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', radius + 12)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#52525b');

    // Glow Filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '8')
      .attr('result', 'blur');

    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Render Links (Before nodes)
    const linkGroup = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(nodesRef.current)
      .enter()
      .append('g')
      .attr('id', d => `node-${d.id}`)
      .attr('class', 'cursor-grab active:cursor-grabbing')
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = Math.max(radius, Math.min(width - radius, event.x));
          d.fy = Math.max(radius, Math.min(height - radius, event.y));
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    nodeGroup.append('circle')
      .attr('r', radius)
      .attr('fill', d => {
        if (d.currentAgent === AgentType.AI) return '#0066ff';
        if (d.currentAgent === AgentType.HUMAN) return '#ff9500';
        return '#bf5af2';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    nodeGroup.append('text')
      .text(d => d.label.length > 10 ? d.label.substring(0, 8) + '..' : d.label)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('class', 'font-mono pointer-events-none font-bold uppercase');

    nodeGroup.on('mouseenter', (event, d) => {
      const info = d3.select('#node-info');
      info.style('opacity', 1).html(`
        <div class="p-4 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl min-w-[200px]">
          <h3 class="font-bold text-white mb-1 font-space text-sm uppercase tracking-tight">${d.label}</h3>
          <p class="text-[10px] text-zinc-400 mb-3 leading-relaxed">${d.description}</p>
          <div class="grid grid-cols-2 gap-2 text-[9px] font-mono">
            <div class="flex flex-col">
              <span class="text-zinc-500 uppercase">Confiança IA</span>
              <span class="text-blue-400 font-bold">${Math.round(d.aiConfidence * 100)}%</span>
            </div>
            <div class="flex flex-col">
              <span class="text-zinc-500 uppercase">Carga Ética</span>
              <span class="text-amber-400 font-bold">${Math.round(d.ethicalComplexity * 100)}%</span>
            </div>
          </div>
          ${d.dependencies && d.dependencies.length > 0 ? `
            <div class="mt-3 pt-2 border-t border-zinc-700/50">
               <span class="text-[9px] text-zinc-500 uppercase font-bold">Depende de:</span>
               <div class="flex flex-wrap gap-1 mt-1">
                 ${d.dependencies.map((dep: string) => `<span class="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] text-zinc-300 font-mono">${dep}</span>`).join('')}
               </div>
            </div>
          ` : ''}
        </div>
      `);
    });

    nodeGroup.on('mouseleave', () => {
      d3.select('#node-info').style('opacity', 0);
    });

    return () => {
      simulation.stop();
    };
  }, [currentScenario?.title, dimensions.width, dimensions.height]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} id="main-d3-graph" className="w-full h-full" />
      <div id="node-info" className="absolute top-6 left-6 pointer-events-none transition-all duration-300 opacity-0 transform scale-95" />
    </div>
  );
};

export default D3Graph;
