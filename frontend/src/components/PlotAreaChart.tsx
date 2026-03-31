import * as d3 from 'd3' 
import { useContext, useEffect } from 'react'
import { BookContext } from '../contexts/bookContext'

const iconSize = 16

const makeIcon = (category: string) => {
    const color = '#228B22'
    const icons = {
        'Death': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/></svg>`,
        'Conflict': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>`,
        'Discovery': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
        'Reunion': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>`,
        'Departure': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20H2"/><path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"/><path d="M11 4H8a2 2 0 0 0-2 2v14"/><path d="M14 12h.01"/><path d="M22 20h-3"/></svg>`,
        'Romance': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        'Betrayal': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        'Transformation': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>`,
        'Peril': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>`,
        'Resolution': `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13V2l8 4-8 4"/><path d="M20.561 10.222a9 9 0 1 1-12.55-5.29"/><path d="M8.002 9.997a5 5 0 1 0 8.9 2.02"/></svg>`
    }
    return icons[category] || icons['Discovery']
}

const createAreaChart = (
    containerId: string,
    width: number,
    height: number,
    sentimentValues: number[],
    peakPoints: number[][],
    peakPointsTooltips: string[],
    chapterLengths: number[],
    onEventClick?: (event: any) => void
) => {
    const contextHeight = 50
    const gap = 30
    const margin = { top: 40, right: 5, bottom: 10, left: 5 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom - contextHeight - gap
    console.log(peakPoints)

    const parsedSummaries = peakPointsTooltips.map(s => {
        try {
            const raw = Array.isArray(s) ? s[0] : s;
            return JSON.parse(raw);
        } catch {
            return { summary: String(s), category: '', characters: [], headline: '' };
        }
    })

    let chOffset = 0
    const chapterBoundaries: { start: number, end: number, idx: number }[] = []
    chapterLengths.forEach((len, i) => {
        chapterBoundaries.push({ start: chOffset, end: chOffset + len - 1, idx: i })
        chOffset += len
    })

    const svgEl = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    svgEl.append('defs')
        .append('clipPath')
        .attr('id', 'focus-clip')
        .append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight + margin.top)
        .attr('x', 0)
        .attr('y', -margin.top)

    const focus = svgEl.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const focusContent = focus.append('g')
        .attr('clip-path', 'url(#focus-clip)')

    const xBase = d3.scaleLinear()
        .domain([0, sentimentValues.length - 1])
        .range([0, innerWidth])

    let xFocus = xBase.copy()

    const yFocus = d3.scaleLinear()
        .domain([d3.min(sentimentValues)!, d3.max(sentimentValues)!])
        .range([innerHeight, 0])

    const contextTop = margin.top + innerHeight + gap
    const context = svgEl.append('g')
        .attr('transform', `translate(${margin.left},${contextTop})`)

    const xContext = d3.scaleLinear()
        .domain([0, sentimentValues.length - 1])
        .range([0, innerWidth])

    const yContext = d3.scaleLinear()
        .domain([d3.min(sentimentValues)!, d3.max(sentimentValues)!])
        .range([contextHeight, 0])

    const contextArea = d3.area<number>()
        .x((d, i) => xContext(i))
        .y0(contextHeight)
        .y1(d => yContext(d))

    context.append('path')
        .datum(sentimentValues)
        .attr('fill', 'rgba(0, 0, 0, 0.08)')
        .attr('d', contextArea)

    const contextLine = d3.line<number>()
        .x((d, i) => xContext(i))
        .y(d => yContext(d))

    context.append('path')
        .datum(sentimentValues)
        .attr('stroke', '#aaa')
        .attr('fill', 'none')
        .attr('d', contextLine)
        .attr('stroke-width', 1)

    chapterBoundaries.forEach((ch, i) => {
        if (i > 0) {
            context.append('line')
                .attr('x1', xContext(ch.start))
                .attr('x2', xContext(ch.start))
                .attr('y1', 0)
                .attr('y2', contextHeight)
                .attr('stroke', '#e5e7eb')
                .attr('stroke-width', 1)
        }
    })

    context.append('rect')
        .attr('width', innerWidth)
        .attr('height', contextHeight)
        .attr('fill', 'none')
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1)

    const badgeRadius = iconSize / 2 + 4

    const handleEventClick = (d: number[], i: number) => {
        const idx = Math.round(d[0])
        const chapter = chapterBoundaries.find(c => idx >= c.start && idx <= c.end)
        if (onEventClick) {
            onEventClick({
                title: parsedSummaries[i]?.category || 'Key Event',
                chapter: chapter ? `Chapter ${chapter.idx + 1}` : '',
                description: parsedSummaries[i]?.summary || '',
                category: parsedSummaries[i]?.category || '',
                characters: parsedSummaries[i]?.characters || [],
                headline: parsedSummaries[i]?.headline || ''
            })
        }
    }

    function drawFocus() {
        focusContent.selectAll('*').remove()

        chapterBoundaries.forEach((ch, i) => {
            const bandStart = xFocus(ch.start)

            if (i > 0) {
                focusContent.append('line')
                    .attr('x1', bandStart)
                    .attr('x2', bandStart)
                    .attr('y1', 0)
                    .attr('y2', innerHeight)
                    .attr('stroke', '#d1d5db')
                    .attr('stroke-width', 1)
            }
        })

        const area = d3.area<number>()
            .x((d, i) => xFocus(i))
            .y0(innerHeight)
            .y1(d => yFocus(d))

        focusContent.append('path')
            .datum(sentimentValues)
            .attr('fill', 'rgba(0, 0, 0, 0.06)')
            .attr('d', area)

        const line = d3.line<number>()
            .x((d, i) => xFocus(i))
            .y(d => yFocus(d))

        focusContent.append('path')
            .datum(sentimentValues)
            .attr('stroke', '#787878')
            .attr('fill', 'none')
            .attr('d', line)
            .attr('stroke-width', 1.5)

        focusContent.selectAll('circle.badge')
            .data(peakPoints)
            .enter()
            .append('circle')
            .attr('class', 'badge')
            .attr('cx', d => xFocus(d[0]))
            .attr('cy', d => yFocus(sentimentValues[Math.round(d[0])]) - badgeRadius - 2)
            .attr('r', badgeRadius)
            .attr('fill', 'white')
            .attr('stroke', '#228B22')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                const i = peakPoints.indexOf(d)
                handleEventClick(d, i)
            })

        focusContent.selectAll('foreignObject.icon')
            .data(peakPoints)
            .enter()
            .append('foreignObject')
            .attr('class', 'icon')
            .attr('x', d => xFocus(d[0]) - iconSize / 2)
            .attr('y', d => yFocus(sentimentValues[Math.round(d[0])]) - badgeRadius - 2 - iconSize / 2)
            .attr('width', iconSize)
            .attr('height', iconSize)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                const i = peakPoints.indexOf(d)
                handleEventClick(d, i)
            })
            .append('xhtml:div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .html((d, i) => {
                const category = parsedSummaries[i]?.category || ''
                return makeIcon(category)
            })
    }

    drawFocus()

    const brush = d3.brushX()
        .extent([[0, 0], [innerWidth, contextHeight]])
        .on('brush end', (event) => {
            if (!event.selection) {
                xFocus.domain(xBase.domain())
            } else {
                const [x0, x1] = event.selection as [number, number]
                xFocus.domain([xContext.invert(x0), xContext.invert(x1)])
            }
            drawFocus()
        })

    const brushGroup = context.append('g')
        .attr('class', 'brush')
        .call(brush)
        .call(brush.move, [0, innerWidth])

    brushGroup.selectAll('.handle')
        .attr('fill', '#228B22')
        .attr('rx', 3)
        .attr('width', 8)
        .style('cursor', 'ew-resize')

    brushGroup.selectAll('.selection')
        .attr('fill', 'rgba(34, 139, 34, 0.2)')
        .attr('stroke', 'rgba(34, 139, 34, 0.6)')
        .style('cursor', 'grab')
}


interface PlotEventData {
    title: string;
    chapter: string;
    description: string;
    category: string;
    characters: string[];
}

const PlotAreaChart = ({ width, height, onEventClick }: { width: number, height: number, onEventClick?: (event: PlotEventData) => void }) => {
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
            createAreaChart('areaChartContainer', width, height, sentimentValues, peakPoints, peakPointsTooltips, chapterLengths, onEventClick)
        }

        return () => {
            d3.select(`#areaChartContainer`).selectAll("*").remove()
        }
    }, [sentimentValues, peakPoints, peakPointsTooltips, chapterLengths, width, height, onEventClick])

    return (
        <div>
            <div className="" id="areaChartContainer"></div>
        </div>
    )
}

export default PlotAreaChart