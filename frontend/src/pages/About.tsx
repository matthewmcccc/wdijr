import Breadcrumbs from "../components/Breadcrumbs";
import Navbar from "../components/Navbar";

const About = () => {
    return (
    <div className="container mx-auto px-4 py-8">
        <Navbar />
        <div>
            {/* <Breadcrumbs items={[{ label: "About", url: "/about" }]} /> */}
            <h1 className="text-3xl text-center md:text-left md:text-4xl font-serif">About</h1>
        </div>
        <hr className="border-gray-300 my-4 w-full"/>
        <div>
            <p className="text-lg text-gray-700 mb-4">Welcome to the World of Digital Literary Journalism Research (WDIJR) project! This platform is dedicated to exploring the rich landscape of digital literary journalism, providing insights, analyses, and resources for scholars, students, and enthusiasts alike.</p>
        </div>
    </div>)
}

export default About;