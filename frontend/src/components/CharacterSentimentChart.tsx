import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

interface CharacterSentimentChartProps {
    speakerName: string;
    targetName: string;
    speakerToTarget: number[];
    targetToSpeaker: number[];
    width: number;
    height: number;
}

const CharacterSentimentChart = ({ speakerName, targetName, speakerToTarget, targetToSpeaker, width, height }: CharacterSentimentChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const containerId = `c2c-sentiment-${speakerName}-${targetName}`.replace(/\s+/g, '-');

    useEffect(() => {
        if (speakerToTarget.length === 0 && targetToSpeaker.length === 0) return;

        const margin = { top: 20, right: 30, bottom: 50, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // cumulative sums
        let sum = 0;
        const cumA = speakerToTarget.map(v => { sum += v; return sum; });
        sum = 0;
        const cumB = targetToSpeaker.map(v => { sum += v; return sum; });

        const maxLen = Math.max(cumA.length, cumB.length);
        const allValues = [...cumA, ...cumB];

        const x = d3.scaleLinear()
            .domain([0, maxLen - 1])
            .range([0, innerWidth]);

        const yMin = d3.min(allValues)! * 1.2;
        const yMax = d3.max(allValues)! * 1.2;
        const y = d3.scaleLinear()
            .domain([Math.min(yMin, -0.5), Math.max(yMax, 0.5)])
            .range([innerHeight, 0]);

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        svg.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(6));

        svg.append('g')
            .call(d3.axisLeft(y).ticks(6));

        // zero line
        svg.append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', y(0))
            .attr('y2', y(0))
            .attr('stroke', '#9ca3af')
            .attr('stroke-dasharray', '4,4');

        const line = d3.line<number>()
            .x((_, i) => x(i))
            .y(d => y(d))
            .curve(d3.curveMonotoneX);

        // speaker → target line (green)
        svg.append('path')
            .datum(cumA)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(34, 197, 94, 0.9)')
            .attr('stroke-width', 2)
            .attr('d', line);

        // target → speaker line (blue)
        svg.append('path')
            .datum(cumB)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(59, 130, 246, 0.9)')
            .attr('stroke-width', 2)
            .attr('d', line);

        // legend
        const legend = svg.append('g')
            .attr('transform', `translate(${innerWidth - 180}, 0)`);

        legend.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 0).attr('y2', 0)
            .attr('stroke', 'rgba(34, 197, 94, 0.9)').attr('stroke-width', 2);
        legend.append('text').attr('x', 25).attr('y', 4)
            .attr('font-size', '11px').text(`${speakerName} → ${targetName}`);

        legend.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 18).attr('y2', 18)
            .attr('stroke', 'rgba(59, 130, 246, 0.9)').attr('stroke-width', 2);
        legend.append('text').attr('x', 25).attr('y', 22)
            .attr('font-size', '11px').text(`${targetName} → ${speakerName}`);

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 40)
            .text("Quote sequence →");

        d3.select(containerRef.current)

        return () => {
            d3.select(containerRef.current).selectAll("*").remove();
        };
    }, [speakerToTarget, targetToSpeaker, speakerName, targetName, width, height]);

    return (
        <div ref={containerRef} id={containerId} className="border border-gray-300 rounded-lg w-fit"></div>
    );
};

export default CharacterSentimentChart;