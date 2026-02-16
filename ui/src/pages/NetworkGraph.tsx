import * as d3 from "d3"
import { useEffect } from "react";

const data = {
    "nodes": [
        {'id': 'alice', 'group': 1}, 
        {'id': 'the white rabbit', 'group': 1},
        {'id': 'mabel', 'group': 1}, {'id': 'mouse', 'group': 1},
        {'id': 'lory', 'group': 1},
        {'id': 'dinah', 'group': 1},
        {'id': 'mary ann', 'group': 1},
        {'id': 'footman', 'group': 1}, {'id': 'william', 'group': 1},
        {'id': 'duchess', 'group': 1},
        {'id': 'the march hare', 'group': 1},
        {'id': 'hatter', 'group': 1},
        {'id': 'march', 'group': 1}, 
        {'id': 'queen', 'group': 1},
        {'id': 'the mock turtle', 'group': 1}
    ],
    "links": [
        {'source': 'alice', 'target': 'the white rabbit', 'value': 1.0431},
        {'source': 'alice', 'target': 'mabel', 'value': 0.0},
        {'source': 'alice', 'target': 'mouse', 'value': -0.8658999999999999},
        {'source': 'alice', 'target': 'lory', 'value': 0.08090000000000003},
        {'source': 'alice', 'target': 'dinah', 'value': -0.3382},
        {'source': 'alice', 'target': 'william', 'value': 0.0},
        {'source': 'alice', 'target': 'footman', 'value': 0.07730000000000004},
        {'source': 'alice', 'target': 'duchess', 'value': 1.0197999999999998},
        {'source': 'alice', 'target': 'the march hare', 'value': 0.0},
        {'source': 'alice', 'target': 'hatter', 'value': 0.8992},
        {'source': 'alice', 'target': 'march', 'value': 0.0},
        {'source': 'alice', 'target': 'queen', 'value': 1.4890999999999999},
        {'source': 'alice', 'target': 'the mock turtle', 'value': 1.5452}, 
        {'source': 'the white rabbit', 'target': 'alice', 'value': 0.6795},
        {'source': 'the white rabbit', 'target': 'queen', 'value': 0.0}, 
        {'source': 'the white rabbit', 'target': 'march', 'value': 0.0}, 
        {'source': 'mabel', 'target': 'alice', 'value': 0.0},
        {'source': 'mouse', 'target': 'alice', 'value': -0.9362999999999999}, 
        {'source': 'mouse', 'target': 'lory', 'value': -0.4753},
        {'source': 'lory', 'target': 'mouse', 'value': 0.3802},
        {'source': 'dinah', 'target': 'alice', 'value': -0.3595},
        {'source': 'mary ann', 'target': 'alice', 'value': 0.0},
        {'source': 'footman', 'target': 'alice', 'value': 0.049899999999999944},
        {'source': 'footman', 'target': 'william', 'value': 0.0},
        {'source': 'william', 'target': 'alice', 'value': 0.0},
        {'source': 'duchess', 'target': 'alice', 'value': 2.8847},
        {'source': 'duchess', 'target': 'queen', 'value': -0.4184},
        {'source': 'the march hare', 'target': 'alice', 'value': 0.3802},
        {'source': 'the march hare', 'target': 'hatter', 'value': -0.128},
        {'source': 'hatter', 'target': 'alice', 'value': 0.47630000000000006}, {'source': 'hatter', 'target': 'the march hare', 'value': 1.4376}, {'source': 'hatter', 'target': 'march', 'value': -0.4767}, {'source': 'march', 'target': 'the march hare', 'value': 0.0}, {'source': 'march', 'target': 'alice', 'value': 0.4753}, {'source': 'march', 'target': 'the mock turtle', 'value': 0.0}, {'source': 'march', 'target': 'queen', 'value': 0.1457}, {'source': 'queen', 'target': 'march', 'value': 0.0}, {'source': 'queen', 'target': 'alice', 'value': 1.0839}, {'source': 'queen', 'target': 'duchess', 'value': 1.0472}, {'source': 'queen', 'target': 'the white rabbit', 'value': 0.0}, {'source': 'the mock turtle', 'target': 'alice', 'value': 0.864}, {'source': 'the mock turtle', 'target': 'march', 'value': 0.0}]
};

const createNetworkGraph = (data: any) => {
    const width = 600;
    const height = 400;

    const links = data.links.map((d: any) => Object.create(d));
    const nodes = data.nodes.map((d: any) => Object.create(d));
    
    const svg = d3.select("#network-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));
    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .attr("stroke", "gray");
    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 10)
        .attr("fill", (d: any) => d.group === 1 ? "blue" : "red");
    simulation.on("tick", () => {
        link
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);
        node
            .attr("cx", (d: any) => d.x)
            .attr("cy", (d: any) => d.y);
    });
}


export default function NetworkGraph() {
    useEffect(() => {
        createNetworkGraph(data);

        return () => {
            d3.select("#network-graph").selectAll("*").remove();
        }
    }, [])

    return (
        <div>
            <h1>Network Graph</h1>
            <p>This page will display the network graph once the processing is complete.</p>
            <div id="network-graph"></div>
        </div>
    )
}