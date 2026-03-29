import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface MotifTreeGraphProps {
    motifData: Record<string, string[]>;
}

const MotifTreeGraph = ({ motifData }: MotifTreeGraphProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(800);
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const height = Math.max(300, width * 0.45);
    const innerHeight = height - margin.top - margin.bottom;

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            setWidth(entries[0].contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !motifData) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const hierarchyData = {
            name: "motifs",
            children: Object.entries(motifData).map(([group, motifs]) => ({
                name: group,
                value: motifs.length
            }))
        };

        const root = d3.hierarchy(hierarchyData)
            .sum(d => (d as any).value)
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        d3.treemap()
            .size([innerWidth, innerHeight])
            .padding(4)
            .round(true)(root);

        const color = d3.scaleOrdinal(d3.schemeTableau10);

        const nodes = g.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `translate(${(d as any).x0},${(d as any).y0})`);

        nodes.append("rect")
            .attr("width", d => (d as any).x1 - (d as any).x0)
            .attr("height", d => (d as any).y1 - (d as any).y0)
            .attr("fill", d => color(d.data.name))
            .attr("opacity", 0.85)
            .attr("rx", 6);

        const isMobile = width < 500;
        const titleSize = isMobile ? "10px" : "14px";
        const subtitleSize = isMobile ? "8px" : "12px";
        const charWidth = isMobile ? 6 : 8;
        const textPadding = isMobile ? 16 : 24;
        const titleY = isMobile ? 20 : 28;
        const subtitleY = isMobile ? 34 : 48;
        const textX = isMobile ? 6 : 12;

        nodes.append("text")
            .attr("x", textX)
            .attr("y", titleY)
            .text(d => {
                const rectWidth = (d as any).x1 - (d as any).x0;
                const rectHeight = (d as any).y1 - (d as any).y0;
                if (rectHeight < titleY + 5) return "";
                const name = d.data.name;
                const maxChars = Math.floor((rectWidth - textPadding) / charWidth);
                if (maxChars < 3) return "";
                if (name.length > maxChars) return name.slice(0, maxChars) + "…";
                return name;
            })
            .attr("font-size", titleSize)
            .attr("font-weight", "bold")
            .attr("fill", "white");

        nodes.append("text")
            .attr("x", textX)
            .attr("y", subtitleY)
            .text(d => {
                const rectHeight = (d as any).y1 - (d as any).y0;
                if (rectHeight < subtitleY + 5) return "";
                return `${d.value} motifs`;
            })
            .attr("font-size", subtitleSize)
            .attr("fill", "rgba(255,255,255,0.8)");

        nodes.on("mouseover", function () {
            d3.select(this).select("rect").attr("opacity", 1);
        }).on("mouseout", function () {
            d3.select(this).select("rect").attr("opacity", 0.85);
        });

    }, [motifData, width]);

    return (
        <div ref={containerRef} className="w-full">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
            />
        </div>
    );
};

export default MotifTreeGraph;