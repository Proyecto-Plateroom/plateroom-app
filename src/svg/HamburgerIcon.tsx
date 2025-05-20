import type IconProps from "./IconProps";
import SVG from "./SVG";

function HamburgerIcon(props: IconProps) {
    return (
        <SVG {...props}>
            <path fill="currentColor" d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"></path>
        </SVG>
    )
}

export default HamburgerIcon;
