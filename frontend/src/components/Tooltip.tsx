import * as Tooltip from "@radix-ui/react-tooltip"

interface TooltipProps {
    content: string;
    title?: string;
}

const TooltipComponent = ({ content, title }: TooltipProps) => {
    return (
        <Tooltip.Provider delayDuration={0}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#228B22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="border border-gray-300 bg-white text-black p-2 rounded max-w-xs text-sm z-[9999] whitespace-pre-line">
                        {title && <div className="font-bold text-lg">{title}</div>}
                        {title && <hr className="my-2 border-gray-300"/>}
                        {content}
                        <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    )
}

export default TooltipComponent;