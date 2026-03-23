import { useState } from "react";

interface MotifAccordionProps {
    motifData: Record<string, string[]>;
}

const MotifAccordion = ({ motifData }: MotifAccordionProps) => {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggle = (group: string) => {
        setOpenIndex(openIndex === group ? null : group);
    };

    return (
        <div className="grid grid-cols-4 gap-4">
            {Object.entries(motifData).map(([group, motifs]) => (
                <div key={group} className="border border-gray-300 rounded-md">
                    <button
                        onClick={() => toggle(group)}
                        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                    >
                        <span className="text-lg font-serif">
                            {group} <span className="text-gray-500 text-sm">({motifs.length})</span>
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform duration-300 ${
                                openIndex === group ? "rotate-45" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <div
                        className={`overflow-auto transition-all duration-300 ${
                            openIndex === group ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                        <div className="p-4 pt-0">
                            <div className="flex flex-wrap gap-2">
                                {motifs.map((motif) => (
                                    <span
                                        key={motif}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {motif}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MotifAccordion;