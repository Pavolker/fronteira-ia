
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useStore } from '../store';
import { AgentType, TaskNode } from '../types';

interface TitleProps {
    type: 'AI' | 'SHARED' | 'HUMAN';
    label: string;
}

const SimulationNodeGraph: React.FC<TitleProps> = ({ type, label }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const { currentScenario } = useStore();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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
        // Filter nodes based on the column type
        const nodes = currentScenario?.tasks.filter(t => {
            if (type === 'AI') return t.currentAgent === AgentType.AI;
            if (type === 'HUMAN') return t.currentAgent === AgentType.HUMAN;
            return t.currentAgent === AgentType.SHARED;
        }).map(t => ({ ...t })) || [];

        if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

        const width = dimensions.width;
        const height = dimensions.height;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        if (nodes.length === 0) {
            // Render placeholder if no nodes
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', '#555')
                .attr('font-family', 'monospace')
                .attr('font-size', '10px')
                .text('NENHUM NÓ DETECTADO');
            return;
        }

        const radius = 10; // Smaller radius for mini graph

        // Initialize positions to center to avoid "flying in"
        nodes.forEach(n => {
            n.x = width / 2 + (Math.random() - 0.5) * 20;
            n.y = height / 2 + (Math.random() - 0.5) * 20;
        });

        const simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(-30))
            .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
            .force('collision', d3.forceCollide().radius(radius + 2))
            .on('tick', () => {
                // Clamp to container with safe padding
                nodes.forEach(node => {
                    node.x = Math.max(radius + 6, Math.min(width - (radius + 6), node.x!));
                    node.y = Math.max(radius + 6, Math.min(height - (radius + 6), node.y!));
                });

                nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
            });

        // Color mapping
        const color = type === 'AI' ? '#0066ff' : type === 'HUMAN' ? '#ff9500' : '#bf5af2';

        // Glow filter
        const defs = svg.append('defs');
        const filter = defs.append('filter')
            .attr('id', `glow-${type}`)
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
        filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

        const nodeGroup = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g');

        nodeGroup.append('circle')
            .attr('r', radius)
            .attr('fill', color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('filter', `url(#glow-${type})`);

        // Add pulsing effect specifically for this view
        nodeGroup.select('circle')
            .append('animate')
            .attr('attributeName', 'r')
            .attr('values', `${radius};${radius + 3};${radius}`)
            .attr('dur', `${2 + Math.random()}s`)
            .attr('repeatCount', 'indefinite');

        return () => {
            simulation.stop();
        };
    }, [currentScenario, type, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-full bg-zinc-950 relative overflow-hidden group">
            <svg ref={svgRef} className="w-full h-full z-10 relative" />

            {/* Background Grid specific to type */}
            <div className={`absolute inset-0 opacity-20 pointer-events-none 
            ${type === 'AI' ? 'bg-territory-ai' : type === 'HUMAN' ? 'bg-territory-human' : 'bg-territory-shared'}
        `} />

            <div className={`absolute bottom-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-[9px] font-mono border z-20
            ${type === 'AI' ? 'text-blue-400 border-blue-500/20' :
                    type === 'HUMAN' ? 'text-amber-400 border-amber-500/20' :
                        'text-purple-400 border-purple-500/20'}
        `}>
                {label}
            </div>
        </div>
    );
};

export default SimulationNodeGraph;
