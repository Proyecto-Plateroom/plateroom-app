interface InputProps {
    type?: string;
    label?: string;
    name: string;
    placeholder?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    optional?: boolean;
}

export default function Input({ type = "text", label, name, placeholder, value, onChange, disabled = false, optional = false }: InputProps) {
    const numberFieldRegex = /^-?\d*\.?\d*$/
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === "number" && !numberFieldRegex.test(e.target.value)) {
            return;
        }
        onChange(e);
    };

    return (
        <fieldset className="fieldset">
            <legend className="fieldset-legend">{label}</legend>
            <input type={type === "number" ? "text" : type} className={`${type === "file" ? "file-input" : "input"} w-full`} value={value ?? ""} name={name} disabled={disabled} placeholder={placeholder} onChange={handleChange} />
            {optional && <p className="label">Optional</p>}
        </fieldset>
    );
}
