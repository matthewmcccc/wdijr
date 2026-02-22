const Breadcrumbs = ({ items }: { items: { label: string; url?: string }[] }) => {
    return (
        <div className="mb-8">
            <nav className="text-sm font-dewi text-gray-500 mb-4 rounded-md border-gray-400
                max-w-xs">
                    {items.map((item, index) => (
                        <span key={index}>
                            {item.url ? (
                                <a href={item.url} className="hover:underline">
                                    {item.label}
                                </a>
                            ) : (
                                <span>{item.label}</span>
                            )}
                            {index < items.length - 1 && <span className="mx-2">/</span>}
                        </span>
                    ))}
            </nav>
        </div>
       
    )
}

export default Breadcrumbs;