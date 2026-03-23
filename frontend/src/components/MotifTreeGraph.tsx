import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface MotifTreeGraphProps {
    motifData: Record<string, string[]>;
}

const MotifTreeGraph = ({ motifData }: MotifTreeGraphProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 1450 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

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
            .size([width, height])
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

        nodes.append("text")
            .attr("x", 12)
            .attr("y", 28)
            .text(d => {
                const rectWidth = (d as any).x1 - (d as any).x0;
                const name = d.data.name;
                if (rectWidth < name.length * 8 + 24) {
                    return name.slice(0, Math.floor((rectWidth - 24) / 8)) + "…";
                }
                return name;
            })
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "white");

        nodes.append("text")
            .attr("x", 12)
            .attr("y", 48)
            .text(d => `${d.value} motifs`)
            .attr("font-size", "12px")
            .attr("fill", "rgba(255,255,255,0.8)");

        nodes.on("mouseover", function (event, d) {
            d3.select(this).select("rect").attr("opacity", 1);
        }).on("mouseout", function (event, d) {
            d3.select(this).select("rect").attr("opacity", 0.85);
        });

    }, [motifData]);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}
            className="w-full h-auto"
        />
    );
};

export default MotifTreeGraph;