interface AnalysisItemProps {
    analysis_type: string;
    img: string;
}

export default function AnalysisItem({ analysis_type, img }: AnalysisItemProps) {
    return (
        <div className="px-6 py-4 w-sm rounded-md border border-gray-200 overflow-hidden">
            <div className="font-serif text-2xl mb-2">{analysis_type}</div>
            <img className="w-full" src={img} alt={analysis_type} />
            <button className="font-serif text-lg">
                View
            </button>
        </div>
    )
}