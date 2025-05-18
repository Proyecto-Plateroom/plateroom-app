interface LoadingProps {
    active: boolean;
    text?: string;
    size?: string;
    children?: React.ReactNode;
}

export default function Loading({active = true, text, size = "xl", children}: LoadingProps) {
    return (
        <>
            {active
                ? <p className="text-gray-400">{text} <span className={`loading loading-dots loading-${size}`}></span></p>
                : children
            }
        </>
    )
}
