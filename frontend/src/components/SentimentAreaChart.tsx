import * as d3 from 'd3'
import { useEffect } from 'react'

type SentimentPoint = { x: number; sentiment: number };

const createAreaChart = (containerId: string, data: SentimentPoint[], width: number, height: number, onChapterPage?: boolean) => {
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, innerWidth]);

    const maxVal = d3.max(data, d => Math.abs(d.sentiment)) || 1;

    const y = d3.scaleLinear()
        .domain([0, maxVal * 1.5])
        .range([innerHeight, 0]);

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => Math.round(Number(d) * 100) + "%"));

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("x", innerWidth / 2 + 75)
        .attr("y", innerHeight + 40)
        .text(onChapterPage ? "Progression through the chapter →" : "Progression through the novel →");

    const areaPos = d3.area<SentimentPoint>()
        .x(d => x(d.x))
        .y0(innerHeight)
        .y1(d => y(d.sentiment >= 0 ? d.sentiment : 0))
        .curve(d3.curveMonotoneX);

    const areaNeg = d3.area<SentimentPoint>()
        .x(d => x(d.x))
        .y0(innerHeight)
        .y1(d => y(d.sentiment < 0 ? Math.abs(d.sentiment) : 0))
        .curve(d3.curveMonotoneX);

    svg.append('path')
        .datum(data)
        .attr('fill', 'rgba(34, 197, 94, 0.6)')
        .attr('d', areaPos);

    svg.append('path')
        .datum(data)
        .attr('fill', 'rgba(239, 68, 68, 0.6)')
        .attr('d', areaNeg);
};

const SentimentAreaChart = ({ data, width, height, onChapterPage }: { data: SentimentPoint[], width: number, height: number, onChapterPage?: boolean }) => {
    useEffect(() => {
        if (data.length === 0) return;
        createAreaChart('sentimentAreaChartContainer', data, width, height, onChapterPage);

        return () => {
            d3.select('#sentimentAreaChartContainer').selectAll("*").remove();
        };
    }, [data, width, height, onChapterPage]);

    return (
        <div id="sentimentAreaChartContainer" className="w-full"></div>
    );
};

export default SentimentAreaChart;