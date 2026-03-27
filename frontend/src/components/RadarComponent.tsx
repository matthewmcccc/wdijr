import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface RadarData {
    name: string;
    confidence: number;
}

const MAX = 100;

const RadarComponent = ({ data }: { data: RadarData[] }) => {

    return (
        <RadarChart
            cx={300}
            cy={250}
            outerRadius={150}
            width={600}
            height={500}
            data={data.map((d) => ({
                subject: d.name,
                confidence: Math.min(d.confidence, MAX)
            }))
            }
        >
            <Radar name="Main" dataKey="confidence" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, MAX]} />
        </RadarChart>
    )
}

export default RadarComponent;