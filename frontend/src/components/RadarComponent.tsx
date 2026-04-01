import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { BookContext } from '../contexts/bookContext';
import { useContext, useEffect } from 'react';
import fetchNovelData from '../utils/fetchNovelData';

interface RadarData {
    character: string;
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
                subject: d.character,
                confidence: Math.min(d.confidence * 100, MAX)
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