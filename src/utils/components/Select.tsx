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
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedItem = items.find(item => String(item[itemIdField]) === selectedId);
        if (selectedItem) itemOnSelect(selectedItem);
    };

    return (
        <select defaultValue="" className="select" disabled={items.length === 0} onChange={handleChange}>
            <option disabled={true} hidden></option>
            {items.map((item, index) => (
                <option key={index} value={item[itemIdField] as string}>
                    {item[itemNameField] as string}
                </option>
            ))}
        </select>
    )
}