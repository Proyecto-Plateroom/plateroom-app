import type IconProps from "./IconProps";
import SVG from "./SVG";

function CheckIcon(props: IconProps) {
    return (
        <SVG {...props}>
            <path fill="currentColor" d="M9 16.17L5.53 12.7a.996.996 0 1 0-1.41 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71a.996.996 0 1 0-1.41-1.41z"></path>
        </SVG>
    );
}

export default CheckIcon;
