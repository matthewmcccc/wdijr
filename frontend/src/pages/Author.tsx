import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import useNovelData from "../hooks/useNovelData";
import { useEffect } from "react";

const Author = () => {
    const novelId = useParams().novelId;
    const ctx = useNovelData(novelId);

    const authorData = ctx?.authorData;
    const otherWorks = authorData?.other_works || [];

    useEffect(() => {
        document.title = authorData ? `About the Author - ${authorData.name}` : "About the Author";
    }, [authorData]);

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <div>
                <Breadcrumbs items={[{ label: "Analysis", url: `/analysis/${novelId}` }, { label: "Miscellany", url: `/miscellany/${novelId}` }, { label: "About the Author", url: `/author/${novelId}` }]} />
                <h1 className="text-4xl text-center md:text-left md:text-5xl font-serif mb-4">About the Author</h1>
                <p className="text-lg text-gray-700 text-center md:text-left">
                    This page provides information about the author of the novel. Learn more about their background, other works, and contributions to literature.
                </p>
            </div>
            <hr className="border-gray-300 my-4" />
            <div>
                {authorData && (
                    <div>
                        <div>
                            <img
                                src={authorData.image_url || undefined}
                                alt={authorData.name}
                                className="float-left mr-8 mb-4 md:h-80 md:w-60 object-cover p-4 border border-gray-400 rounded-md"
                            />
                            <h2 className="text-3xl font-serif mb-4 text-center md:text-left">{authorData.name}</h2>
                            <p className="text-md text-gray-700 whitespace-pre-line text-center md:text-left">{authorData.description}</p>
                        </div>

                        {otherWorks.length > 0 && (
                            <div className="mt-8">
                                <h1 className="text-3xl font-serif mb-4">Other Works</h1>
                                <hr className="border-gray-300 my-4" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                    {otherWorks.map((work, index) => (
                                        <div key={index} className="border border-gray-300 rounded-md p-4">
                                            <img
                                                src={work.image_url || undefined}
                                                alt={work.title}
                                                className="w-full h-48 object-cover mb-4"
                                            />
                                            <h3 className="text-xl font-semibold">{work.title}</h3>
                                            <p className="text-gray-600">{work.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Author;