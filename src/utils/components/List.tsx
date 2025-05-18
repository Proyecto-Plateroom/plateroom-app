import { Link } from "react-router-dom";

interface ListProps<T, K extends keyof T = keyof T> {
    title?: string;
    emptyMessage?: string;
    items: T[];
    itemField?: K;
    itemOnClick?: (item: T) => void;
}

export default function List<T, K extends keyof T = keyof T>({
    title,
    emptyMessage = "No items found",
    items,
    itemField = "name" as K,
    itemOnClick,
}: ListProps<T, K>) {
    return (
        <>
            <ul className="menu bg-base-200 rounded-box w-full">
                {title && <li className="menu-title">{title}</li>}
                {items.length === 0
                    ? <li>{emptyMessage}</li>
                    : (
                        items.map((item, index) => (
                            <li key={index}>
                                {itemOnClick
                                    ? <span onClick={() => itemOnClick(item)}>{item[itemField as keyof T] as string}</span>
                                    : <Link to={`/${item["id" as keyof T]}`}>{item[itemField as keyof T] as string}</Link>
                                    // <Link>{item[itemField as keyof T] as string}</a>
                                }
                            </li>
                        ))
                    )}
            </ul>
        </>

    );
}
