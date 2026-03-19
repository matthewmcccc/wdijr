import * as d3 from 'd3' 
import { useContext, useEffect } from 'react'
import { BookContext } from '../contexts/bookContext'

const createAreaChart = (containerId: string, width: number, height: number, sentimentValues, peakPoints, peakPointsTooltips, chapterLengths) => {
    const margin = { top: 10, right: 5, bottom: 30, left: 5 }
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

    // Chapter boundaries
    let offset = 0
    const chapterBoundaries: { start: number, end: number, idx: number }[] = []
    chapterLengths.forEach((len, i) => {
        const bandStart = x(offset)
        const bandEnd = x(offset + len - 1)

        chapterBoundaries.push({ start: offset, end: offset + len - 1, idx: i })

        if (i > 0) {
            svg.append('line')
                .attr('x1', bandStart)
                .attr('x2', bandStart)
                .attr('y1', 0)
                .attr('y2', innerHeight)
                .attr('stroke', '#d1d5db')
                .attr('stroke-width', 1)
        }

        svg.append('text')
            .attr('x', (bandStart + bandEnd) / 2)
            .attr('y', innerHeight + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#999')
            .text(`Ch ${i + 1}`)

        offset += len
    })

    // Area fill
    const area = d3.area<number>()
        .x((d, i) => x(i))
        .y0(innerHeight)
        .y1(d => y(d))

    svg.append('path')
        .datum(sentimentValues)
        .attr('fill', 'rgba(0, 0, 0, 0.06)')
        .attr('d', area)

    // Sentiment line
    const line = d3.line<number>()
        .x((d, i) => x(i))
        .y(d => y(d))

    svg.append('path')
        .datum(sentimentValues)
        .attr('stroke', '#787878')
        .attr('fill', 'none')
        .attr('d', line)
        .attr('stroke-width', 1.5)

    // Build lookup for inflection points
    const SNAP_DISTANCE = 0
    const inflectionLookup = peakPoints.map((d, i) => ({
        idx: Math.round(d[0]),
        summary: peakPointsTooltips[i] || ''
    }))

    // Inflection point dots
    svg.selectAll('circle.inflection')
        .data(peakPoints)
        .enter()
        .append('circle')
        .attr('class', 'inflection')
        .attr('cx', d => x(d[0]))
        .attr('cy', d => y(sentimentValues[Math.round(d[0])]))
        .attr('r', 4)
        .attr('fill', '#228B22')

    const tooltip = d3.select(`#${containerId}`)
        .style('position', 'relative')
        .append('div')
        .attr('class', 'absolute bg-gray-900 text-white text-sm px-3 py-2 rounded-lg max-w-xs pointer-events-none opacity-0 transition-opacity duration-200')

    const crosshairLine = svg.append('line')
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0)

    const crosshairDot = svg.append('circle')
        .attr('r', 5)
        .attr('fill', '#374151')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('opacity', 0)

    const crosshairLabel = svg.append('text')
        .attr('font-size', '11px')
        .attr('fill', '#374151')
        .style('opacity', 0)

    const chapterLabel = svg.append('text')
        .attr('font-size', '11px')
        .attr('fill', '#6b7280')
        .style('opacity', 0)

    // Invisible overlay for mouse tracking
    svg.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .on('mousemove', (event) => {
            const [mouseX] = d3.pointer(event)
            const dataIdx = Math.round(x.invert(mouseX))
            const clampedIdx = Math.max(0, Math.min(sentimentValues.length - 1, dataIdx))
            const val = sentimentValues[clampedIdx]
            const cx = x(clampedIdx)
            const cy = y(val)

            crosshairLine
                .attr('x1', cx)
                .attr('x2', cx)
                .style('opacity', 1)

            crosshairDot
                .attr('cx', cx)
                .attr('cy', cy)
                .style('opacity', 1)

            const chapter = chapterBoundaries.find(c => clampedIdx >= c.start && clampedIdx <= c.end)
            if (chapter) {
                chapterLabel
                    .attr('x', cx + 8)
                    .attr('y', cy + 16)
                    .text(`Chapter ${chapter.idx + 1}`)
                    .style('opacity', 1)
            }

            // Check for nearby inflection point
            const nearbyInflection = inflectionLookup.find(p => Math.abs(p.idx - clampedIdx) <= SNAP_DISTANCE)
            if (nearbyInflection && nearbyInflection.summary) {
                const tooltipLeft = cx > innerWidth / 2
                    ? cx + margin.left - 220
                    : cx + margin.left + 20

                tooltip
                    .html(nearbyInflection.summary)
                    .style('opacity', '1')
                    .style('left', `${tooltipLeft}px`)
                    .style('top', `${cy + margin.top - 50}px`)

                // Snap dot to inflection point
                const snapCx = x(nearbyInflection.idx)
                const snapCy = y(sentimentValues[nearbyInflection.idx])
                crosshairDot
                    .attr('cx', snapCx)
                    .attr('cy', snapCy)
                    .attr('fill', '#228B22')
            } else {
                tooltip.style('opacity', '0')
                crosshairDot.attr('fill', '#374151')
            }
        })
        .on('mouseleave', () => {
            crosshairLine.style('opacity', 0)
            crosshairDot.style('opacity', 0)
            crosshairLabel.style('opacity', 0)
            chapterLabel.style('opacity', 0)
            tooltip.style('opacity', '0')
        })
}


const PlotAreaChart = ({ width, height }: { width: number, height: number }) => {
    const sentimentValues = useContext(BookContext)?.sentimentValues || []
    const peakPoints = useContext(BookContext)?.inflectionPoints || []
    const peakPointsTooltips = useContext(BookContext)?.plotSummaries || []
    const chapterData = useContext(BookContext)?.chapterData || []
    let chapterLengths = useContext(BookContext)?.chapterLengths || []

    if (!chapterLengths || chapterLengths.length == 0) {
        chapterLengths = chapterData.map(
            c => c.sentiment.length
        )
    }

    useEffect(() => {
        if (sentimentValues.length > 0) {
            createAreaChart('areaChartContainer', width, height, sentimentValues, peakPoints, peakPointsTooltips, chapterLengths)
        }

        return () => {
            d3.select(`#areaChartContainer`).selectAll("*").remove()
        }
    }, [sentimentValues, peakPoints, peakPointsTooltips, chapterLengths])

    return (
        <div>
            <div className="border border-gray-300 rounded-lg pt-8" id="areaChartContainer"></div>
        </div>
    )
}

export default PlotAreaChart