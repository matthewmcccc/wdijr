import * as d3 from "d3"
import { useEffect } from "react";

const nameMap: Record<string, string> = {
    "ellen": "nelly",
    "ellen dean": "nelly", 
    "dean": "nelly",
    "catherine earnshaw": "catherine",
    "cathy": "catherine",
    "isabella linton": "isabella",
};

let rawData = {
    "nodes": 
        [{'id': 'heathcliff', 'group': 0}, {'id': 'joseph', 'group': 2}, {'id': 'hareton', 'group': 0}, {'id': 'nelly', 'group': 0}, {'id': 'cathy', 'group': 2}, {'id': 'linton', 'group': 0}, {'id': 'catherine', 'group': 2}, {'id': 'catherine earnshaw', 'group': 1}, {'id': 'edgar', 'group': 1}, {'id': 'isabella linton', 'group': 1}, {'id': 'kenneth', 'group': 1}, {'id': 'zillah', 'group': 0}, {'id': 'isabella', 'group': 1}, {'id': 'hindley', 'group': 2}, {'id': 'papa', 'group': 2}, {'id': 'ellen', 'group': 1}, {'id': 'lockwood', 'group': 0}, {'id': 'green', 'group': 0}, {'id': 'ellen dean', 'group': 1}, {'id': 'jabez', 'group': 0}, {'id': 'miss', 'group': 2}, {'id': 'dean', 'group': 2}, {'id': 'frances', 'group': 2}],
    "links": 
        [{'source': 'heathcliff', 'target': 'joseph', 'value': -2.3615}, {'source': 'heathcliff', 'target': 'hareton', 'value': 0.4404}, {'source': 'heathcliff', 'target': 'nelly', 'value': 0.9285}, {'source': 'heathcliff', 'target': 'cathy', 'value': -0.8213}, {'source': 'heathcliff', 'target': 'linton', 'value': -0.34}, {'source': 'heathcliff', 'target': 'catherine', 'value': -0.10339999999999999}, {'source': 'heathcliff', 'target': 'catherine earnshaw', 'value': 1.4808000000000001}, {'source': 'heathcliff', 'target': 'edgar', 'value': 0.6751}, {'source': 'heathcliff', 'target': 'isabella linton', 'value': -0.9686999999999999}, {'source': 'heathcliff', 'target': 'kenneth', 'value': 0.0258}, {'source': 'heathcliff', 'target': 'zillah', 'value': 0.0}, {'source': 'joseph', 'target': 'heathcliff', 'value': -1.9488999999999999}, {'source': 'joseph', 'target': 'nelly', 'value': 2.519}, {'source': 'joseph', 'target': 'catherine', 'value': 0.18930000000000002}, {'source': 'joseph', 'target': 'cathy', 'value': 0.0}, {'source': 'joseph', 'target': 'isabella linton', 'value': -0.4288}, {'source': 'joseph', 'target': 'hareton', 'value': 0.18160000000000004}, {'source': 'joseph', 'target': 'isabella', 'value': 0.0}, {'source': 'joseph', 'target': 'hindley', 'value': -0.9958}, {'source': 'joseph', 'target': 'catherine earnshaw', 'value': -1.938}, {'source': 'joseph', 'target': 'papa', 'value': 0.0}, {'source': 'joseph', 'target': 'ellen', 'value': 0.0}, {'source': 'joseph', 'target': 'lockwood', 'value': -0.6597}, {'source': 'joseph', 'target': 'green', 'value': 0.484}, {'source': 'hareton', 'target': 'joseph', 'value': 0.0}, {'source': 'hareton', 'target': 'isabella linton', 'value': -0.2867}, {'source': 'hareton', 'target': 'catherine', 'value': 0.0}, {'source': 'hareton', 'target': 'ellen dean', 'value': 0.0}, {'source': 'hareton', 'target': 'nelly', 'value': 0.0}, {'source': 'hareton', 'target': 'heathcliff', 'value': 0.1763}, {'source': 'jabez', 'target': 'zillah', 'value': 0.4926}, {'source': 'jabez', 'target': 'lockwood', 'value': -0.872}, {'source': 'ellen dean', 'target': 'catherine', 'value': -0.0062}, {'source': 'ellen dean', 'target': 'linton', 'value': 0.3246}, {'source': 'ellen dean', 'target': 'ellen', 'value': 0.0}, {'source': 'ellen dean', 'target': 'edgar', 'value': -0.4574}, {'source': 'ellen dean', 'target': 'papa', 'value': -0.6341}, {'source': 'ellen dean', 'target': 'cathy', 'value': 0.3802}, {'source': 'ellen dean', 'target': 'catherine earnshaw', 'value': 0.9994}, {'source': 'ellen dean', 'target': 'lockwood', 'value': 0.6239}, {'source': 'ellen dean', 'target': 'isabella linton', 'value': 0.0}, {'source': 'ellen dean', 'target': 'hareton', 'value': 0.0}, {'source': 'ellen dean', 'target': 'nelly', 'value': 0.0}, {'source': 'catherine earnshaw', 'target': 'isabella linton', 'value': 0.34}, {'source': 'catherine earnshaw', 'target': 'edgar', 'value': 0.778}, {'source': 'catherine earnshaw', 'target': 'hindley', 'value': -0.4215}, {'source': 'catherine earnshaw', 'target': 'kenneth', 'value': 0.3335}, {'source': 'catherine earnshaw', 'target': 'catherine', 'value': -0.6524}, {'source': 'catherine earnshaw', 'target': 'nelly', 'value': -0.4753}, {'source': 'catherine earnshaw', 'target': 'heathcliff', 'value': -1.2749}, {'source': 'catherine earnshaw', 'target': 'isabella', 'value': 0.0}, {'source': 'catherine earnshaw', 'target': 'ellen dean', 'value': 0.8022}, {'source': 'catherine earnshaw', 'target': 'linton', 'value': -0.4215}, {'source': 'catherine earnshaw', 'target': 'joseph', 'value': -0.08519999999999994}, {'source': 'catherine earnshaw', 'target': 'hareton', 'value': -0.6597}, {'source': 'catherine earnshaw', 'target': 'cathy', 'value': -1.3161}, {'source': 'catherine earnshaw', 'target': 'papa', 'value': 0.5574}, {'source': 'catherine earnshaw', 'target': 'ellen', 'value': 0.3182}, {'source': 'miss', 'target': 'joseph', 'value': -1.6319}, {'source': 'miss', 'target': 'heathcliff', 'value': -0.4023}, {'source': 'miss', 'target': 'nelly', 'value': 1.1611}, {'source': 'miss', 'target': 'catherine', 'value': 0.2263}, {'source': 'miss', 'target': 'isabella', 'value': 0.3182}, {'source': 'hindley', 'target': 'joseph', 'value': 0.0}, {'source': 'hindley', 'target': 'catherine earnshaw', 'value': 0.4588}, {'source': 'hindley', 'target': 'isabella linton', 'value': 0.0}, {'source': 'hindley', 'target': 'cathy', 'value': 0.0}, {'source': 'hindley', 'target': 'linton', 'value': -0.4389}, {'source': 'hindley', 'target': 'miss', 'value': -0.9958}, {'source': 'nelly', 'target': 'joseph', 'value': -1.8312}, {'source': 'nelly', 'target': 'heathcliff', 'value': -0.69}, {'source': 'nelly', 'target': 'hindley', 'value': 0.0}, {'source': 'nelly', 'target': 'catherine', 'value': 0.0}, {'source': 'nelly', 'target': 'isabella', 'value': -0.34}, {'source': 'nelly', 'target': 'linton', 'value': 0.0}, {'source': 'nelly', 'target': 'ellen dean', 'value': -0.3851}, {'source': 'nelly', 'target': 'hareton', 'value': 0.7906}, {'source': 'nelly', 'target': 'catherine earnshaw', 'value': 0.2732}, {'source': 'nelly', 'target': 'lockwood', 'value': -0.1027}, {'source': 'isabella', 'target': 'isabella linton', 'value': 2.1993}, {'source': 'isabella', 'target': 'ellen dean', 'value': -0.934}, {'source': 'isabella', 'target': 'catherine earnshaw', 'value': 0.0752}, {'source': 'isabella linton', 'target': 'catherine', 'value': 0.46}, {'source': 'isabella linton', 'target': 'catherine earnshaw', 'value': -1.4081000000000001}, {'source': 'isabella linton', 'target': 'nelly', 'value': 0.4003}, {'source': 'isabella linton', 'target': 'isabella', 'value': -0.7579}, {'source': 'isabella linton', 'target': 'joseph', 'value': 0.9127}, {'source': 'isabella linton', 'target': 'heathcliff', 'value': 0.45530000000000004}, {'source': 'isabella linton', 'target': 'edgar', 'value': -1.647}, {'source': 'isabella linton', 'target': 'ellen', 'value': 0.0}, {'source': 'isabella linton', 'target': 'miss', 'value': -0.9988}, {'source': 'isabella linton', 'target': 'linton', 'value': 0.2818}, {'source': 'isabella linton', 'target': 'cathy', 'value': 0.0}, {'source': 'catherine', 'target': 'hindley', 'value': 0.0}, {'source': 'catherine', 'target': 'catherine earnshaw', 'value': 1.9222}, {'source': 'catherine', 'target': 'ellen dean', 'value': -0.2046}, {'source': 'catherine', 'target': 'heathcliff', 'value': 0.1502}, {'source': 'catherine', 'target': 'edgar', 'value': 0.4019}, {'source': 'catherine', 'target': 'joseph', 'value': 1.4138}, {'source': 'catherine', 'target': 'miss', 'value': -0.3202999999999999}, {'source': 'catherine', 'target': 'cathy', 'value': 0.2913}, {'source': 'catherine', 'target': 'nelly', 'value': -0.7803}, {'source': 'catherine', 'target': 'isabella linton', 'value': -0.391}, {'source': 'catherine', 'target': 'linton', 'value': 0.4019}, {'source': 'catherine', 'target': 'papa', 'value': -0.4738}, {'source': 'catherine', 'target': 'isabella', 'value': 0.0}, {'source': 'catherine', 'target': 'hareton', 'value': 0.0}, {'source': 'linton', 'target': 'isabella linton', 'value': -0.3617}, {'source': 'linton', 'target': 'catherine earnshaw', 'value': -1.9432}, {'source': 'linton', 'target': 'ellen dean', 'value': 0.7070000000000001}, {'source': 'linton', 'target': 'nelly', 'value': -0.4329}, {'source': 'linton', 'target': 'isabella', 'value': 0.0}, {'source': 'linton', 'target': 'heathcliff', 'value': -2.2729}, {'source': 'linton', 'target': 'cathy', 'value': -0.5927}, {'source': 'linton', 'target': 'catherine', 'value': 1.6216}, {'source': 'linton', 'target': 'hareton', 'value': 0.0}, {'source': 'linton', 'target': 'joseph', 'value': 0.0772}, {'source': 'linton', 'target': 'zillah', 'value': 0.0}, {'source': 'dean', 'target': 'cathy', 'value': -0.4497}, {'source': 'dean', 'target': 'frances', 'value': -0.4574}, {'source': 'cathy', 'target': 'dean', 'value': 0.0}, {'source': 'cathy', 'target': 'miss', 'value': 0.4404}, {'source': 'cathy', 'target': 'joseph', 'value': 0.4926}, {'source': 'cathy', 'target': 'catherine', 'value': 0.2671}, {'source': 'cathy', 'target': 'catherine earnshaw', 'value': -0.1007}, {'source': 'cathy', 'target': 'isabella linton', 'value': -0.8779}, {'source': 'cathy', 'target': 'linton', 'value': 0.4019}, {'source': 'cathy', 'target': 'heathcliff', 'value': 0.0}, {'source': 'cathy', 'target': 'ellen dean', 'value': 0.7491}, {'source': 'cathy', 'target': 'hareton', 'value': 0.2732}, {'source': 'edgar', 'target': 'catherine', 'value': -0.7698}, {'source': 'edgar', 'target': 'catherine earnshaw', 'value': 0.0}, {'source': 'edgar', 'target': 'heathcliff', 'value': 0.7503000000000001}, {'source': 'edgar', 'target': 'isabella', 'value': 0.0}, {'source': 'edgar', 'target': 'isabella linton', 'value': 1.3258999999999999}, {'source': 'edgar', 'target': 'zillah', 'value': 0.4404}, {'source': 'ellen', 'target': 'isabella linton', 'value': -0.013799999999999979}, {'source': 'ellen', 'target': 'catherine earnshaw', 'value': 1.1256}, {'source': 'kenneth', 'target': 'isabella linton', 'value': 0.636}, {'source': 'kenneth', 'target': 'catherine earnshaw', 'value': -0.9235}, {'source': 'papa', 'target': 'isabella linton', 'value': 0.0}, {'source': 'papa', 'target': 'catherine', 'value': -0.4019}, {'source': 'papa', 'target': 'cathy', 'value': -0.679}, {'source': 'zillah', 'target': 'linton', 'value': 0.0}, {'source': 'zillah', 'target': 'edgar', 'value': 0.0}, {'source': 'green', 'target': 'linton', 'value': 0.4389}, {'source': 'lockwood', 'target': 'nelly', 'value': 0.0}]
};

const remappedLinks = rawData.links.map(l => ({
    ...l,
    source: nameMap[l.source] || l.source,
    target: nameMap[l.target] || l.target,
}));

const edgeMap = new Map();
remappedLinks.forEach(l => {
    const key = [l.source, l.target].sort().join("--");
    if (edgeMap.has(key)) {
        edgeMap.get(key).value += l.value;
    } else {
        edgeMap.set(key, { ...l });
    }
});

const data = {
    nodes: rawData.nodes.filter(n => !nameMap[n.id]),
    links: Array.from(edgeMap.values())
};

const getColor = (group: number): string => {
    const colors = ["#6366f1", "#f59e0b", "#06b6d4"];
    return colors[group] || "#999";
};

const createNetworkGraph = (data: any, containerId: string) => {
    const width = 700;
    const height = 400;

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
        .style("background", "#1a1a1a");
    
    const g = svg.append("g");

    svg.call(d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        }));

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id((d: any) => d.id)
            .distance(100))
        .force("charge", d3.forceManyBody()
            .strength(-400))
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
        .attr("fill", (d: any) => getColor(d.group));

    const labels = g.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("font-size", "12px")
        .attr("dx", 15)
        .attr("dy", 4)
        .attr("pointer-events", "none")
        .attr("fill", "white")
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
};

interface NetworkGraphProps {
    id?: string;
}

const NetworkGraph = ({ id = "network-graph" }: NetworkGraphProps) => {
    useEffect(() => {
        createNetworkGraph(data, id);

        return () => {
            d3.select(`#${id}`).selectAll("*").remove();
        };
    }, [id]);

    return (
        <div>
            <div className="border border-gray-300 rounded-lg" id={id}></div>
        </div>
    );  
}

export default NetworkGraph;