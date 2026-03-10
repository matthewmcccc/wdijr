import * as d3 from 'd3' 
import { use, useContext, useEffect } from 'react'
import { BookContext } from '../contexts/bookContext'

const createAreaChart = (containerId: string, width: number, height: number, sentimentValues, peakPoints, peakPointsTooltips) => {
    const margin = { top: 20, right: 5, bottom: 30, left: 5 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear()
        .domain([0, sentimentValues.length - 1])
        .range([0, innerWidth])
    
    const y = d3.scaleLinear()
        .domain([d3.min(sentimentValues)!, d3.max(sentimentValues)!])
        .range([innerHeight, 0])

    svg.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
    
    const area = d3.area<number>()
        .x((d, i) => x(i))
        .y0(innerHeight)
        .y1(d => y(d))

    svg.append('path')
        .datum(sentimentValues)
        .attr('stroke', '#787878')
        .attr('fill', 'none')
        .attr('d', area)
        .attr("stroke-width", 1.5)

    const tooltip = d3.select(`#${containerId}`)
        .style('position', 'absolute')
        .append('div')
        .attr('class', 'absolute bg-gray-900 text-white text-sm px-3 py-2 rounded-lg max-w-xs pointer-events-none opacity-0 transition-opacity duration-200')

    svg.selectAll('circle')
        .data(peakPoints)
        .enter()
        .append('circle')
        .attr('cx', d => x(d[0] * (sentimentValues.length - 1)))
        .attr('cy', d => {
            const idx = Math.round(d[0] * (sentimentValues.length - 1))
            return y(sentimentValues[idx])
        })
        .attr('r', 4)
        .attr('fill', '#228B22')
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => {
            const i = peakPoints.indexOf(d)
            const idx = Math.round(d[0] * (sentimentValues.length - 1))
            const cx = x(d[0] * (sentimentValues.length - 1)) + margin.left
            const cy = y(sentimentValues[idx]) + margin.top

            tooltip
                .html(peakPointsTooltips[i])
                .style('opacity', '1')
                .style('left', `${cx}px`)
                .style('top', `${cy - 50}px`)
        })
        .on('mouseout', () => {
            tooltip.style('opacity', '0')
        })
    
}


const PlotAreaChart = ({ width, height }: { width: number, height: number }) => {
    const sentimentValues = useContext(BookContext)?.sentimentValues || []
    const peakPoints = useContext(BookContext)?.inflectionPoints || []
    const peakPointsTooltips = useContext(BookContext)?.plotSummaries || []

    useEffect(() => {
        console.log(sentimentValues, peakPoints, peakPointsTooltips);

        if (sentimentValues.length > 0) {
            createAreaChart('areaChartContainer', width, height, sentimentValues, peakPoints, peakPointsTooltips)
        }

        return () => {
            d3.select(`#areaChartContainer`).selectAll("*").remove()
        }
    }, [sentimentValues, peakPoints, peakPointsTooltips])

    return (
        <div>
            <div className="border border-gray-300 rounded-lg pt-8" id="areaChartContainer"></div>
        </div>
    )
}

export default PlotAreaChart