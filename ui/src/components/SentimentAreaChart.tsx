import * as d3 from 'd3'
import { useEffect } from 'react'
import { BookContext } from '../contexts/bookContext';
import { useContext } from 'react';
import { selectAll } from 'd3';



const createAreaChart = (containerId: string, valenceData: number[], width: number, height: number) => {
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain([0, valenceData.length - 1])
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(valenceData)! * 1.5])
        .range([innerHeight, 0]);

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(10));

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("x", width / 2 + margin.left + 50)
        .attr("y", height + margin.top + 10)
        .text("Progression through the novel ->");

    const area = d3.area<number>()
        .x((_, i) => x(i))
        .y0(innerHeight)
        .y1(d => y(d))
        .curve(d3.curveMonotoneX);

    // Positive (green) area
    svg.append('path')
        .datum(valenceData.map(d => d >= 0 ? d : 0))
        .attr('fill', 'rgba(34, 197, 94, 0.6)')
        .attr('d', area);

    // Negative (red) area — use absolute value
    svg.append('path')
        .datum(valenceData.map(d => d < 0 ? Math.abs(d) : 0))
        .attr('fill', 'rgba(239, 68, 68, 0.6)')
        .attr('d', area);
};

const SentimentAreaChart = ({ data, width, height }: { data: number[], width: number, height: number }) => {
    const valenceData = data || [];

    useEffect(() => {
        if (valenceData.length === 0) return;
        createAreaChart('sentimentAreaChartContainer', valenceData, width, height);

        return () => {
            d3.select('#sentimentAreaChartContainer').selectAll("*").remove();
        };
    }, [valenceData, width, height]);

    return (
        <div id="sentimentAreaChartContainer" className="border border-gray-300 rounded-lg w-fit"></div>
    );
};

export default SentimentAreaChart