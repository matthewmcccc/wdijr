import * as d3 from 'd3'
import { useEffect } from 'react'

const valenceData = [5.758832917705742, 5.757223291626568, 5.741433397683406, 5.727549066539018, 5.711745126010466, 5.736782776971464, 5.707483253588518, 5.744458450046692, 5.770215004574571, 5.799387846291337, 5.766431698774088, 5.766939407341882, 5.77092294296909, 5.776121919584959, 5.744383916990928, 5.7268177929854645, 5.747184300341304, 5.7315234870926846, 5.723466270683081, 5.693192508710809, 5.690758500435922, 5.669727831431084, 5.676507515473036, 5.6722496691663, 5.716124100719425, 5.733321476211647, 5.741283086585911, 5.718374769797418, 5.7359443430656905, 5.717730116175157, 5.7135159407274365, 5.693151167915379, 5.671644193127449, 5.665456885456888, 5.6436180904522635, 5.6330578158458255, 5.631501925545578, 5.655798031664534, 5.629883620689665, 5.662639503985837, 5.683379526151103, 5.706882770870349, 5.750354138999566, 5.754935238945963, 5.789958563535922, 5.783004041311191, 5.759572907679039, 5.73229850746269, 5.717472480948354, 5.713877635386526, 5.701235125153878, 5.686841666666664, 5.638957081545058, 5.620004315925763, 5.588619658119655, 5.615365535248042, 5.64424021838035, 5.650131698455955, 5.668356417359192, 5.685342338146254, 5.715876865671645, 5.773069444444446, 5.808745454545456, 5.83818098720293, 5.85768636363637, 5.858884426595279, 5.818827215756494, 5.795059760956179, 5.816902771667405, 5.794602824360116, 5.7826476929711195, 5.732621231979039, 5.737269247128884, 5.724606413994176, 5.714758563763932, 5.733347124534548, 5.756414392059554, 5.744430379746838, 5.752832491582493, 5.760999583506874, 5.769394449116908, 5.788390041493781, 5.760952380952385, 5.763916913946591, 5.757479061976552, 5.72303962900506, 5.719623721881392, 5.743295500608031, 5.718743882544867, 5.7082267792521115, 5.696344827586206, 5.679126173948551, 5.722592285358774, 5.7361180382377395, 5.738649228130363, 5.7458347676419965, 5.746345132743366, 5.753164726947183, 5.760343007915568, 5.796945454545458, 5.786912232833107, 5.79713627992634, 5.75890705277908, 5.745715635333023, 5.750368597415036, 5.710687855787486]
const peakPoints = [[0.580952380952381, 0.05719257877280093], [0.6761904761904762, -0.05002646099208086], [0.49523809523809526, -0.047884585121606094], [0.22857142857142856, 0.04387443155312454], [0.4, 0.04347136812921715], [0.8761904761904762, 0.04346611141022283], [0.6285714285714286, -0.04005721083878466], [1.0, -0.03968074162754931], [0.9714285714285714, -0.038229227147259515], [0.06666666666666667, 0.03697519645817415], [0.9428571428571428, 0.03660244662988976], [0.5904761904761905, 0.03567601010101029], [0.41904761904761906, 0.03502332458995916], [0.8095238095238095, -0.03443943297149232], [0.09523809523809523, -0.032956147517248624], [0.37142857142857144, 0.032755883296171184]]
const peakPointsTooltips = ['Catherine Linton weeps with disgust and scorn upon discovering that Hareton Earnshaw, whom she took for a servant, is her crude cousin.', 'Ellen Dean burns Catherine Linton’s letters to Linton, despite her desperate pleas and injury, leaving her distraught and subdued.', 'Heathcliff, consumed by grief and rage for Catherine Earnshaw, secretly visits her corpse.', "Heathcliff overhears Catherine Earnshaw declare marrying him would degrade her, despite her profound love and soul's connection.", "Newly married, Isabella Linton writes Ellen Dean, lamenting her misery at Wuthering Heights and questioning Heathcliff's humanity.", 'Catherine Heathcliff erupts in disgust when Hareton Earnshaw touches her hair, then scornfully rejects his presence.', 'Catherine Linton is arrested by Mr. Heathcliff for poaching on his land.', 'Mr. Lockwood flees the returning couple, later contemplating the graves of Catherine, Edgar Linton, and Heathcliff.', 'Mr. Heathcliff exhibits unsettling joy, declaring himself "within sight of my heaven," deeply terrifying Nelly Dean.', "Mr. Lockwood's violent nightmare of Catherine Linton's ghost leaves Heathcliff profoundly disturbed.", "Enraged by Catherine Linton's defiance and threats, Heathcliff violently attacks her, with Hareton Earnshaw attempting to intervene.", 'Catherine Linton joyfully reunited with Edgar Linton, then saw a sickly Linton Heathcliff for the first time.', "Dismayed by Joseph's rudeness and Hareton's wildness, the narrator struggles to secure an acceptable sleeping room.", 'Heathcliff detains Catherine and Ellen, forcing Catherine to agree to marry Linton by holding her captive.', 'Mr. Earnshaw returns from Liverpool with a mysterious, ragged child, startling the Earnshaw family.', 'Edgar Linton finds his delirious wife, Catherine Linton, yearning for death and Heathcliff.']

const createAreaChart = (containerId: string) => {
    const margin = { top: 20, right: 5, bottom: 30, left: 5 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear()
        .domain([0, valenceData.length - 1])
        .range([0, width])
    
    const y = d3.scaleLinear()
        .domain([d3.min(valenceData)!, d3.max(valenceData)!])
        .range([height, 0])

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
    
    const area = d3.area<number>()
        .x((d, i) => x(i))
        .y0(height)
        .y1(d => y(d))

    svg.append('path')
        .datum(valenceData)
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
        .attr('cx', d => x(d[0] * (valenceData.length - 1)))
        .attr('cy', d => {
            const idx = Math.round(d[0] * (valenceData.length - 1))
            return y(valenceData[idx])
        })
        .attr('r', 4)
        .attr('fill', '#228B22')
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => {
            const i = peakPoints.indexOf(d)
            const idx = Math.round(d[0] * (valenceData.length - 1))
            const cx = x(d[0] * (valenceData.length - 1)) + margin.left
            const cy = y(valenceData[idx]) + margin.top

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


const AreaChart = () => {
    useEffect(() => {
        createAreaChart('areaChartContainer')

        return () => {
            d3.select(`#areaChartContainer`).selectAll("*").remove()
        }
    }, [])

    return (
        <div>
            <div className="border border-gray-300 rounded-lg pt-8" id="areaChartContainer"></div>
        </div>
    )
}

export default AreaChart