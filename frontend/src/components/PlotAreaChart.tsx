import * as d3 from 'd3' 
import { use, useContext, useEffect } from 'react'
import { BookContext } from '../contexts/bookContext'

const peakPointsTooltips = ['Catherine Linton weeps with disgust and scorn upon discovering that Hareton Earnshaw, whom she took for a servant, is her crude cousin.', 'Ellen Dean burns Catherine Linton’s letters to Linton, despite her desperate pleas and injury, leaving her distraught and subdued.', 'Heathcliff, consumed by grief and rage for Catherine Earnshaw, secretly visits her corpse.', "Heathcliff overhears Catherine Earnshaw declare marrying him would degrade her, despite her profound love and soul's connection.", "Newly married, Isabella Linton writes Ellen Dean, lamenting her misery at Wuthering Heights and questioning Heathcliff's humanity.", 'Catherine Heathcliff erupts in disgust when Hareton Earnshaw touches her hair, then scornfully rejects his presence.', 'Catherine Linton is arrested by Mr. Heathcliff for poaching on his land.', 'Mr. Lockwood flees the returning couple, later contemplating the graves of Catherine, Edgar Linton, and Heathcliff.', 'Mr. Heathcliff exhibits unsettling joy, declaring himself "within sight of my heaven," deeply terrifying Nelly Dean.', "Mr. Lockwood's violent nightmare of Catherine Linton's ghost leaves Heathcliff profoundly disturbed.", "Enraged by Catherine Linton's defiance and threats, Heathcliff violently attacks her, with Hareton Earnshaw attempting to intervene.", 'Catherine Linton joyfully reunited with Edgar Linton, then saw a sickly Linton Heathcliff for the first time.', "Dismayed by Joseph's rudeness and Hareton's wildness, the narrator struggles to secure an acceptable sleeping room.", 'Heathcliff detains Catherine and Ellen, forcing Catherine to agree to marry Linton by holding her captive.', 'Mr. Earnshaw returns from Liverpool with a mysterious, ragged child, startling the Earnshaw family.', 'Edgar Linton finds his delirious wife, Catherine Linton, yearning for death and Heathcliff.']

const createAreaChart = (containerId: string, width: number, height: number, sentimentValues, peakPoints) => {
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

    useEffect(() => {
        console.log(sentimentValues, peakPoints);

        if (sentimentValues.length > 0) {
            createAreaChart('areaChartContainer', width, height, sentimentValues, peakPoints)
        }

        return () => {
            d3.select(`#areaChartContainer`).selectAll("*").remove()
        }
    }, [sentimentValues, peakPoints])

    return (
        <div>
            <div className="border border-gray-300 rounded-lg pt-8" id="areaChartContainer"></div>
        </div>
    )
}

export default PlotAreaChart