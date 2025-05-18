import { useEffect, useState } from "react";

interface SelectProps<T> {
    items: T[];
    itemIdField?: keyof T;
    itemNameField?: keyof T;
    itemOnSelect: (item: T) => void;
}

export default function Select<T>({
    items,
    itemIdField = "id" as keyof T,
    itemNameField = "name" as keyof T,
    itemOnSelect
}: SelectProps<T>) {
    const [selectedId, setSelectedId] = useState<string>('');

    useEffect(() => {
        setSelectedId('');
    }, [items]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setSelectedId(selectedId);
        console.log("selectedId", selectedId);
        
        const selectedItem = items.find(item => String(item[itemIdField]) === selectedId);
        if (selectedItem) itemOnSelect(selectedItem);
    };

    return (
        <select className="select" onChange={handleChange} value={selectedId}>
            <option value="" disabled={true}></option>
            {items.map((item) => (
                <option key={item[itemIdField] as string} value={item[itemIdField] as string}>
                    {item[itemNameField] as string}
                </option>
            ))}
        </select>
    )
}
