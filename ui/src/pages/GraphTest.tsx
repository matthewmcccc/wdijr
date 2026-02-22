import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

const data = [
 { chapter: 1, sentiment: 0.3, label: "Lockwood visits Wuthering Heights" },
  { chapter: 3, sentiment: 0.1, label: "Lockwood's nightmare, Catherine's ghost" },
  { chapter: 4, sentiment: 0.4, label: "Nelly begins her story" },
  { chapter: 6, sentiment: 0.6, label: "Heathcliff and Catherine's childhood bond" },
  { chapter: 8, sentiment: 0.3, label: "Hindley's cruelty after Frances dies" },
  { chapter: 9, sentiment: 0.7, label: "Catherine's 'he's more myself than I am' speech" },
  { chapter: 10, sentiment: 0.5, label: "Heathcliff returns, now wealthy" },
  { chapter: 11, sentiment: 0.35, label: "Tensions between Edgar and Heathcliff" },
  { chapter: 12, sentiment: 0.15, label: "Catherine's delirium and breakdown" },
  { chapter: 15, sentiment: 0.25, label: "Heathcliff and Catherine's final meeting" },
  { chapter: 16, sentiment: 0.05, label: "Catherine dies" },
  { chapter: 17, sentiment: 0.1, label: "Isabella flees, Hindley dies" },
  { chapter: 20, sentiment: 0.2, label: "Young Cathy meets Hareton" },
  { chapter: 25, sentiment: 0.15, label: "Linton's manipulation, forced marriage" },
  { chapter: 28, sentiment: 0.1, label: "Edgar dies" },
  { chapter: 30, sentiment: 0.2, label: "Heathcliff's obsession peaks" },
  { chapter: 33, sentiment: 0.5, label: "Cathy and Hareton begin to bond" },
  { chapter: 34, sentiment: 0.3, label: "Heathcliff dies" },
]

const GraphTest = () => {
    return (
        <AreaChart width={600} height={400} data={data} >
            <Tooltip />
            <Area type="monotone" dataKey="sentiment" fill="#8884d8" dot={{ r: 3, fill: "#8884d8", stroke: "#fff", strokeWidth: 1.5 }} />
        </AreaChart>
    )
}

export default GraphTest