import Breadcrumbs from "../components/Breadcrumbs";
import Navbar from "../components/Navbar";

const Contact = () => {
    return (
    <div className="container mx-auto px-4 py-8">
        <Navbar />
        <div>
            {/* <Breadcrumbs items={[{ label: "Contact", url: "/contact" }]} /> */}
            <h1 className="text-3xl text-center md:text-left md:text-4xl font-serif">Contact</h1>
        </div>
        <hr className="border-gray-300 my-4 w-full"/>
        <div>
            <p className="w-1/2">If you have any questions or inquiries regarding the application, please feel free to contact me directly at: <a href="mailto:180013892@dundee.ac.uk" className="text-blue-500 underline">180013892@dundee.ac.uk</a></p>
        </div>
    </div>)
}

export default Contact;