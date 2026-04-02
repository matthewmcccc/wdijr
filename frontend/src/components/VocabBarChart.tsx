import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import humanize from '../utils/humanize';

const VocabBarChart = ({ data }: { data: Array<{ character: string; confidence: Record<string, any> }> }) => {
    const sorted = data
        .filter(d => d.confidence.word_count > 100)
        .map(d => ({ character: humanize(d.character), score: d.confidence.mattr, wordCount: d.confidence.word_count }))
        .sort((a, b) => b.score - a.score);

    const CustomLabel = (props: any) => {
        const { x, y, width, height, index } = props;
        const entry = sorted[index];
        return (
            <text x={x + width + 6} y={y + height / 2 + 4} fontSize={11} fill="#888">
                {entry.score.toFixed(3)} · {entry.wordCount.toLocaleString()} words
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={sorted.length * 40}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 120 }}>
                <XAxis
                    type="number"
                    domain={[(min: number) => Math.floor(min * 20) / 20, (max: number) => Math.ceil(max * 20) / 20]}
                    tickFormatter={(v: number) => v.toFixed(2)}
                    fontSize={12}
                />
                <YAxis
                    type="category"
                    dataKey="character"
                    width={Math.max(...sorted.map(d => d.character.length)) * 8 + 20}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    formatter={(value: number) => [value.toFixed(3), 'MATTR Score']}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar
                    dataKey="score"
                    fill="#2f8f2f"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    label={<CustomLabel />}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default VocabBarChart;