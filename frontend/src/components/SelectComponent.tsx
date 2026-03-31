import * as Select from "@radix-ui/react-select";

interface SelectComponentProps {
    networkMode: "conversational" | "cooccurrence";
    setNetworkMode: (mode: "conversational" | "cooccurrence") => void;
}

const SelectComponent = ({ networkMode, setNetworkMode }: SelectComponentProps) => {
    return (
        <Select.Root value={networkMode} onValueChange={setNetworkMode}>
            <Select.Trigger className="">
                <Select.Value placeholder="Select network type" />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="bg-gray-100 border border-gray-300 rounded-md p-2">
                    <Select.Viewport>
                        <Select.Item value="conversational">
                            <Select.ItemText>Conversational</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="cooccurrence">
                            <Select.ItemText>Co-occurrence</Select.ItemText>
                        </Select.Item>
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}

export default SelectComponent;