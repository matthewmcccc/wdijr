import { useNavigate, useParams } from "react-router-dom";
import humanize from "../utils/humanize";

interface SideCharacterCardProps {
    name: string;
    description: string;
    top_relationships: [string, number][];
    quote_count?: number;
    avg_sentiment?: number;
}

const SideCharacterCard = ({ name, description, top_relationships, quote_count, avg_sentiment }: SideCharacterCardProps) => {
    const navigate = useNavigate();
    const { novelId } = useParams<{ novelId: string }>();

    const sentimentLabel = avg_sentiment != null
        ? avg_sentiment > 0.15 ? "Positive" : avg_sentiment < -0.15 ? "Negative" : "Neutral"
        : null;

    const sentimentColor = avg_sentiment != null
        ? avg_sentiment > 0.15 ? "#2ecc71" : avg_sentiment < -0.15 ? "#e74c3c" : "#94a3b8"
        : null;

    return (
        <div className="w-72 shrink-0 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 px-5 py-4">
                <h3 className="text-white text-lg font-semibold tracking-tight">
                    {humanize(name)}
                </h3>
            </div>

            <div className="px-5 py-4 space-y-4">
                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {description}
                </p>

                {/* Stats row */}
                {(quote_count != null || sentimentLabel) && (
                    <div className="flex gap-3">
                        {quote_count != null && (
                            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
                                <div className="text-lg font-semibold text-gray-800">{quote_count}</div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Quotes</div>
                            </div>
                        )}
                        {sentimentLabel && (
                            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
                                <div className="text-lg font-semibold" style={{ color: sentimentColor ?? undefined }}>
                                    {sentimentLabel}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Sentiment</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Relationships */}
                {top_relationships.length > 0 && (
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">
                            Connections
                        </div>
                        <div className="space-y-1.5">
                            {top_relationships.slice(0, 5).map(([relName], idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: idx === 0 ? "#6366f1" : idx === 1 ? "#f59e0b" : "#06b6d4",
                                        }}
                                    />
                                    {humanize(relName)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View profile link */}
                <button
                    onClick={() => navigate(`/character-analysis/${novelId}/${name}`)}
                    className="w-full text-center text-sm text-indigo-500 hover:text-indigo-700 font-medium pt-2 border-t border-gray-100 cursor-pointer transition-colors"
                >
                    View full profile &rarr;
                </button>
            </div>
        </div>
    );
};

export default SideCharacterCard;