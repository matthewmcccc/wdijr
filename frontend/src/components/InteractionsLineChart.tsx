import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useContext } from 'react';
import { BookContext } from '../contexts/bookContext';

interface RelationshipDataPoint {
    chapter: number;
    interactions: number;
}

const InteractionsLineChart = ({ data }: { data: RelationshipDataPoint[] }) => {
    const chapterData = useContext(BookContext)?.chapterData || [];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const chapterIndex = label - 1;
        const chapterTitle = chapterData[chapterIndex]?.title || `Chapter ${label}`;
        return (
            <div className="bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{chapterTitle}</p>
                <p className="text-sm text-green-600">{payload[0].value} interactions</p>
            </div>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                    <linearGradient id="interactionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2c9b37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2c9b37" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chapter" label={{ value: 'Chapter', position: 'insideBottomRight', offset: -10 }} />
                <YAxis label={{ value: 'Interactions', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="interactions" stroke="#2c9b37" fill="url(#interactionGradient)" strokeWidth={2} dot={{ r: 4, fill: "#fff", stroke: "#2c9b37" }} activeDot={{ r: 6 }} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default InteractionsLineChart;