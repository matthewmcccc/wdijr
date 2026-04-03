interface CharacterInteractionCharacterCardProps {
    character: string;
    summary: string;
}

const CharacterInteractionCharacterCard = ({ character, summary }: CharacterInteractionCharacterCardProps) => {
    return (
        <div className="border border-gray-300 rounded-lg p-4 shadow-md h-full cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
            <h2 className="text-2xl font-serif">{character}</h2>
            <hr className="border-gray-300 my-2" />
            <p className="text-gray-700">{summary}</p>
            <hr className="border-gray-300 my-2" />
            <h1 className="text-lg font-serif mt-4 text-right">View Profile &rarr;</h1>
        </div>
    );
}

export default CharacterInteractionCharacterCard;