import * as d3 from "d3"
import { use, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookContext } from "../contexts/bookContext";
import buildNameMap from "../utils/buildNameMap";


const getColor = (group: number): string => {
    const colors = ["#6366f1", "#f59e0b", "#06b6d4"];
    return colors[group] || "#999";
};


const createNetworkGraph = (data: any, containerId: string, height: number = 400, width: number = 600) => {
    const links = data.links.map((d: any) => Object.create(d));
    const nodes = data.nodes.map((d: any) => Object.create(d));

    const connectedNodes = new Set();
    links.forEach((d: any) => {
        connectedNodes.add(d.source);
        connectedNodes.add(d.target);
    });
    
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
    
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 3])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    const [xMin = 0, xMax = width] = d3.extent(nodes, (d: any) => d.x as number);
    const [yMin = 0, yMax = height] = d3.extent(nodes, (d: any) => d.y as number);
    const dx = xMax - xMin;
    const dy = yMax - yMin;
    const padding = 40;
    const scale = Math.min(width / (dx + padding * 2), height / (dy + padding * 2));
    const tx = width / 2 - scale * (xMin + dx / 2);
    const ty = height / 2 - scale * (yMin + dy / 2);

    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id((d: any) => d.id)
            .distance(150))
        .force("charge", d3.forceManyBody()
            .strength(-600))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(40))
        .force("x", d3.forceX((d: any) => {
            if (d.group === 0) return width * 0.3;
            if (d.group === 1) return width * 0.7;
            return width * 0.5;
        }).strength(0.1))
        .force("y", d3.forceY((d: any) => {
            if (d.group === 0) return height * 0.5;
            if (d.group === 1) return height * 0.3;
            return height * 0.7;
        }).strength(0.1));

    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", (d: any) => Math.max(1, Math.abs(d.value) * 2))
        .attr("stroke", (d: any) => {
            if (d.value > 0.2) return "#2ecc71";
            if (d.value < -0.2) return "#e74c3c";
            return "#555";
        })
        .attr("opacity", 0.7);

    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", (d: any) => connectedNodes.has(d.id) ? 10 : 5)
        .attr("opacity", (d: any) => connectedNodes.has(d.id) ? 1 : 0.4)
        .attr("fill", (d: any) => getColor(d.group))

    node.on("click", (event: any, clickedNode: any) => {
        const connectedNodeIds = new Set([clickedNode.id]);
        links.forEach((l: any) => {
            if (l.source.id === clickedNode.id) connectedNodeIds.add(l.target.id);
            if (l.target.id === clickedNode.id) connectedNodeIds.add(l.source.id);
        });

        node.attr("opacity", (d: any) => connectedNodeIds.has(d.id) ? 1 : 0.1);
        link.attr("opacity", (d: any) =>
            d.source.id === clickedNode.id || d.target.id === clickedNode.id ? 1 : 0.1
        );
        labels.attr("opacity", (d: any) => connectedNodeIds.has(d.id) ? 1 : 0.1);
    });

    svg.on("click", (event: any) => {
        if (event.target.tagName === "svg") {
            node.attr("opacity", (d: any) => connectedNodes.has(d.id) ? 1 : 0.4);
            link.attr("opacity", 0.7);
            labels.attr("opacity", 1);
        }
    });

    const labels = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("font-size", "12px")
        .attr("dx", 15)
        .attr("dy", 4)
        .attr("pointer-events", "none")
        .attr("fill", "black")
        .text((d: any) => d.id.split(' ').map((w: string) => 
            w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

    simulation.stop();
    for (let i = 0; i< 300; ++i) simulation.tick();
    link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
    node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(100), 20`);
    
    legend.append("rect")
        .attr("width", 160)
        .attr("height", 130)
        .attr("rx", 5)
        .attr("fill", "#000000")
        .attr("stroke", "#444")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.8);

    legend.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "14px")
        .attr("font-family", "sans-serif")
        .attr("fill", "white")
        .text("Legend");
    
    const sentimentData = [
        { label: "Positive Sentiment", color: "#2ecc71", y: 40 },
        { label: "Neutral Sentiment",  color: "#555",    y: 58 },
        { label: "Negative Sentiment", color: "#e74c3c", y: 76 },
    ];

    sentimentData.forEach(({ label, color, y }) => {
        legend.append("line")
            .attr("x1", 10).attr("y1", y)
            .attr("x2", 22).attr("y2", y)
            .attr("stroke", color)
            .attr("stroke-width", 2);

        legend.append("text")
            .attr("x", 28).attr("y", y + 4)
            .attr("font-size", "12px")
            .attr("fill", "#f3f3f3")
            .text(label);
    });

    legend.append("text")
        .attr("x", 12)
        .attr("y", 100)
        .attr("fill", "#ededed")
        .attr("font-size", 9)
        .text("Thickness = dialogue volume");

    legend.append("line")
        .attr("x1", 16).attr("y1", 115)
        .attr("x2", 45).attr("y2", 115)
        .attr("stroke", "#888")
        .attr("stroke-width", 1);

    legend.append("text")
        .attr("x", 50).attr("y", 118)
        .attr("fill", "#777")
        .attr("font-size", 9)
        .text("less");

    legend.append("line")
        .attr("x1", 90).attr("y1", 115)
        .attr("x2", 119).attr("y2", 115)
        .attr("stroke", "#888")
        .attr("stroke-width", 5);

    legend.append("text")
        .attr("x", 124).attr("y", 118)
        .attr("fill", "#777")
        .attr("font-size", 9)
        .text("more");

    
};

interface NetworkGraphProps {
    id?: string;
    filterCharacter?: string;
    height?: number;
    width?: number;
}

const NetworkGraph = ({ id = "network-graph", filterCharacter, height = 400, width = 400 }: NetworkGraphProps) => {
    const networkData = useContext(BookContext)?.networkData;
    const characterData = useContext(BookContext)?.characterData;

    const edgeMap = new Map();
    networkData?.links.forEach(l => {
        const key = [l.source, l.target].sort().join("--");
        if (edgeMap.has(key)) {
            edgeMap.get(key).value += l.value;
        } else {
            edgeMap.set(key, { ...l });
        }
    });

    const data = {
        nodes: networkData?.nodes.filter(n => !characterData?.[n.name]) || [],
        links: Array.from(edgeMap.values())
};

    const filteredData = filterCharacter
        ? (() => {
            const name = filterCharacter.toLowerCase();
            const filteredLinks = data.links.filter(
                l => l.source === name || l.target === name
            );
            const connectedIds = new Set(
                filteredLinks.flatMap(l => [l.source, l.target])
            );
            return {
                nodes: data.nodes.filter(n => connectedIds.has(n.id)),
                links: filteredLinks,
            };
        })()
        : data;

    useEffect(() => {
        createNetworkGraph(filteredData, id, height, width);
        return () => {
            d3.select(`#${id}`).selectAll("*").remove();
        };
    }, [id, filterCharacter, height, width, networkData]);

    return (
        <div>
            <div className="border border-gray-300 rounded-lg w-fit" id={id}></div>
        </div>
    );
};

export default NetworkGraph;