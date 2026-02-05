type Props = {
    onFileSelect: (file: File | null) => void
}

export default function FilePicker({ onFileSelect }: Props) {

    return (
        <input type="file" onChange={e => {
            const selectedFile = e.target.files ? e.target.files[0] : null;
            onFileSelect(selectedFile);
        }} className="file-input file-input-bordered file-input-primary" />
    )
}