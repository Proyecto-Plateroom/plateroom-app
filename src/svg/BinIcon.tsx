import type IconProps from "./IconProps";
import SVG from "./SVG";

function BinIcon(props: IconProps) {
    return (
        <SVG {...props}>
            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"></path>
        </SVG>
    );
}

export default BinIcon;
