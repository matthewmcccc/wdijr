// Source: https://d3-graph-gallery.com/graph/heatmap_style.html

import * as d3 from "d3";
import { useEffect, useRef } from "react";
import humanize from "../utils/humanize";

interface CharacterOccurrencesHeatmapProps {
    data: Record<string, Record<string, number>> | undefined;
}

const CharacterOccurrencesHeatmap = ({ data }: CharacterOccurrencesHeatmapProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!data || !containerRef.current) return;

        d3.select(containerRef.current).selectAll("*").remove();

        const chapters = Object.keys(data).sort((a, b) => +a - +b);

        const charTotals: Record<string, number> = {};
        for (const ch of chapters) {
            for (const [char, count] of Object.entries(data[ch])) {
                charTotals[char] = (charTotals[char] || 0) + count;
            }
        }
        const characters = Object.keys(charTotals).sort(
            (a, b) => charTotals[b] - charTotals[a]
        );

        const flat: { chapter: string; character: string; value: number }[] = [];
        for (const ch of chapters) {
            for (const char of characters) {
                flat.push({
                    chapter: ch,
                    character: char,
                    value: data[ch]?.[char] || 0,
                });
            }
        }

        const margin = { top: 30, right: 60, bottom: 80, left: 160 };
        const cellSize = 160 / Math.sqrt(chapters.length);
        const width = chapters.length * cellSize;
        const height = characters.length * cellSize;

        const svg = d3
            .select(containerRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(chapters)
            .padding(0.05);

        const y = d3.scaleBand()
            .range([0, height])
            .domain(characters)
            .padding(0.05);

        const maxVal = d3.max(flat, (d) => d.value) || 1;

        const color = d3.scaleSequential()
            .interpolator(d3.interpolateGreens)
            .domain([0, maxVal]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(x)
                    .tickFormat((d) => `Ch ${+d + 1}`)
                    .tickSize(0)
            )
            .select(".domain").remove();

        svg.selectAll(".tick text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();

        svg.selectAll(".tick text")
            .style("font-size", "12px")
            .style("text-transform", "capitalize");

        const tooltip = d3
            .select(containerRef.current)
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("padding", "6px 10px")
            .style("font-size", "13px")
            .style("pointer-events", "none")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.15)");

        svg.selectAll()
            .data(flat)
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.chapter)!)
            .attr("y", (d) => y(d.character)!)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill", (d) => (d.value === 0 ? "#f5f5f5" : color(d.value)))
            .style("stroke", "none")
            .style("cursor", "pointer")
            .on("mouseover", function (_event, d) {
                tooltip.style("opacity", 1);
                d3.select(this).style("stroke", "#333").style("stroke-width", "2px");
            })
            .on("mousemove", function (event, d) {
                const [mx, my] = d3.pointer(event, containerRef.current);
                tooltip
                    .html(
                        `<strong style="text-transform:capitalize">${humanize(d.character)}</strong><br/>` +
                        `Chapter ${+d.chapter + 1}<br/>` +
                        `Mentions: ${d.value}`
                    )
                    .style("left", mx + 15 + "px")
                    .style("top", my - 10 + "px");
            })
            .on("mouseleave", function () {
                tooltip.style("opacity", 0);
                d3.select(this).style("stroke", "none");
            });

        svg.selectAll()
            .data(flat.filter((d) => d.value > 0))
            .enter()
            .append("text")
            .attr("x", (d) => x(d.chapter)! + x.bandwidth() / 2)
            .attr("y", (d) => y(d.character)! + y.bandwidth() / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "11px")
            .style("fill", (d) => (d.value > maxVal * 0.6 ? "white" : "#333"))
            .style("pointer-events", "none")
            .text((d) => d.value);

    }, [data]);

    return <div ref={containerRef} style={{ position: "relative", overflowX: "auto", display: "flex", justifyContent: "center" }} />;
};

export default CharacterOccurrencesHeatmap;