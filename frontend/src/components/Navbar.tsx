import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="rounded-4xl border border-gray-200 py-1 flex justify-center mt-6 max-w-xs mx-auto">
            <ul className="flex gap-6 font-dewi text-md">
                <li className="cursor-pointer" onClick={() => navigate("/")}>Home</li>
                <li className="cursor-pointer" onClick={() => navigate("/about")}>About</li>
                <li className="cursor-pointer" onClick={() => navigate("/contact")}>Contact</li>
            </ul>
        </nav>
    )
}