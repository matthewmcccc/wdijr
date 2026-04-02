// Source: https://observablehq.com/@d3/zoomable-treemap#chart

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

interface MotifTreeGraphProps {
    motifData: Record<string, string[]>;
}

let uidCount = 0;
function uid(name: string) {
    const id = `${name}-${++uidCount}`;
    return { id, href: `#${id}` };
}

const MotifTreeGraph = ({ motifData }: MotifTreeGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const render = useCallback(() => {
        if (!containerRef.current || !motifData || Object.keys(motifData).length === 0) return;

        d3.select(containerRef.current).selectAll("*").remove();

        const width = containerRef.current.clientWidth || 928;
        const height = 500;

        function tile(node: any, x0: number, y0: number, x1: number, y1: number) {
            d3.treemapBinary(node, 0, 0, width, height);
            for (const child of node.children) {
                child.x0 = x0 + (child.x0 / width) * (x1 - x0);
                child.x1 = x0 + (child.x1 / width) * (x1 - x0);
                child.y0 = y0 + (child.y0 / height) * (y1 - y0);
                child.y1 = y0 + (child.y1 / height) * (y1 - y0);
            }
        }

        const data = {
            name: "Motifs",
            children: Object.entries(motifData).map(([group, motifs]) => ({
                name: group,
                children: motifs.map(m => ({ name: m, value: 1 }))
            }))
        };

        const hierarchy = d3.hierarchy(data)
            .sum(d => (d as any).value || 0)
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

        const root = d3.treemap().tile(tile as any)(hierarchy);

        const x = d3.scaleLinear().rangeRound([0, width]);
        const y = d3.scaleLinear().rangeRound([0, height]);

        const format = d3.format(",d");
        const name = (d: any) =>
            d.ancestors().reverse().map((d: any) => d.data.name).join("/");

        const color = d3.scaleOrdinal(d3.schemeTableau10);

        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("viewBox", [0.5, -30.5, width, height + 30].join(" "))
            .attr("width", width)
            .attr("height", height + 30)
            .attr("style", "max-width: 100%; height: auto;")
            .style("font", "10px sans-serif");

        let group = svg.append("g").call(renderGroup, root);

        function renderGroup(group: any, root: any) {
            const node = group
                .selectAll("g")
                .data(root.children.concat(root))
                .join("g");

            node.filter((d: any) => (d === root ? d.parent : d.children))
                .attr("cursor", "pointer")
                .on("click", (_event: any, d: any) =>
                    d === root ? zoomout(root) : zoomin(d)
                );

            node.append("title")
                .text((d: any) => `${name(d)}\n${format(d.value)}`);

            node.append("rect")
                .attr("id", (d: any) => (d.leafUid = uid("leaf")).id)
                .attr("fill", (d: any) => {
                    if (d === root) return "#555";
                    if (d.children) return color(d.data.name);
                    const parentCol = d3.color(color(d.parent.data.name));
                    if (parentCol) {
                        const hsl = d3.hsl(parentCol);
                        hsl.l = Math.min(0.85, hsl.l + 0.25);
                        hsl.s = Math.max(0.15, hsl.s - 0.15);
                        return hsl.toString();
                    }
                    return "#ddd";
                })
                .attr("stroke", "#fff");

            node.append("clipPath")
                .attr("id", (d: any) => (d.clipUid = uid("clip")).id)
                .append("use")
                .attr("xlink:href", (d: any) => d.leafUid.href);

            node.append("text")
                .attr("clip-path", (d: any) => `url(${d.clipUid.href})`)
                .attr("font-weight", (d: any) => (d === root ? "bold" : null))
                .attr("fill", (d: any) => {
                    if (d === root) return "#fff";
                    if (d.children) return "#fff";
                    return "#333";
                })
                .selectAll("tspan")
                .data((d: any) => {
                    const label = d === root ? name(d) : d.data.name;
                    return [label, format(d.value)];
                })
                .join("tspan")
                .attr("x", 3)
                .attr("y", (_d: any, i: number, nodes: any) =>
                    `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
                )
                .attr("fill-opacity", (_d: any, i: number, nodes: any) =>
                    i === nodes.length - 1 ? 0.7 : null
                )
                .attr("font-weight", (_d: any, i: number, nodes: any) =>
                    i === nodes.length - 1 ? "normal" : null
                )
                .text((d: any) => d);

            group.call(position, root);
        }

        function position(group: any, root: any) {
            group
                .selectAll("g")
                .attr("transform", (d: any) =>
                    d === root
                        ? `translate(0,-30)`
                        : `translate(${x(d.x0)},${y(d.y0)})`
                )
                .select("rect")
                .attr("width", (d: any) =>
                    d === root ? width : x(d.x1) - x(d.x0)
                )
                .attr("height", (d: any) =>
                    d === root ? 30 : y(d.y1) - y(d.y0)
                );
        }

        function zoomin(d: any) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = (group = svg.append("g").call(renderGroup, d));

            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);

            svg.transition()
                .duration(750)
                .call((t: any) =>
                    group0
                        .transition(t)
                        .remove()
                        .call(position, d.parent)
                )
                .call((t: any) =>
                    group1
                        .transition(t)
                        .attrTween("opacity", () => d3.interpolate(0, 1) as any)
                        .call(position, d)
                );
        }

        function zoomout(d: any) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = (group = svg.insert("g", "*").call(renderGroup, d.parent));

            x.domain([d.parent.x0, d.parent.x1]);
            y.domain([d.parent.y0, d.parent.y1]);

            svg.transition()
                .duration(750)
                .call((t: any) =>
                    group0
                        .transition(t)
                        .remove()
                        .attrTween("opacity", () => d3.interpolate(1, 0) as any)
                        .call(position, d)
                )
                .call((t: any) =>
                    group1.transition(t).call(position, d.parent)
                );
        }
    }, [motifData]);

    useEffect(() => {
        render();

        const handleResize = () => render();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [render]);

    return <div ref={containerRef} className="w-full p-4" />;
};

export default MotifTreeGraph;