import * as Select from "@radix-ui/react-select";
import humanize from "../utils/humanize";

interface CharacterSelectComponentProps {
    characters: string[];
    selectedCharacter: string | null;
    setSelectedCharacter: (character: string | null) => void;
}

const CharacterSelectComponent = ({ characters, selectedCharacter, setSelectedCharacter }: CharacterSelectComponentProps) => {
    return (
        <Select.Root value={selectedCharacter ?? undefined} onValueChange={setSelectedCharacter}>
            <Select.Trigger  asChild className="">
                <div className="flex items-center gap-2 cursor-pointer">
                    <h1 className="font-serif text-center text-black text-lg cursor-pointer">
                        <Select.Value placeholder="Select character..." />
                    </h1>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                </div>  
            </Select.Trigger>
            <Select.Portal>
                <Select.Content position="popper" side="bottom" sideOffset={4} align="start" avoidCollisions={false} className="border border-gray-300 text-black bg-white p-1 rounded z-50 min-w-[280px] cursor-pointer">
                    <Select.Viewport>
                        {characters.map(character => (
                            <Select.Item key={character} value={character} className="px-3 py-1 rounded hover:bg-gray-100 outline-none data-[highlighted]:bg-gray-100">
                                <Select.ItemText>{humanize(character)}</Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

export default CharacterSelectComponent;