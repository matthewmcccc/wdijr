import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useContext } from 'react';
import { BookContext } from '../contexts/bookContext';

interface RelationshipDataPoint {
    chapter: number;
    interactions: number;
}

const InteractionsLineChart = ({ data }: { data: RelationshipDataPoint[] }) => {
    const bookContext = useContext(BookContext);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chapter" label={{ value: 'Chapter', position: 'insideBottomRight', offset: -10 }} />
                <YAxis label={{ value: 'Interactions', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="interactions" stroke="#2c9b37" activeDot r={8} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default InteractionsLineChart;