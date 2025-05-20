import type IconProps from "./IconProps";
import SVG from "./SVG";

function MinusIcon(props: IconProps) {
    return (
        <SVG {...props}>
            <path fill="currentColor" d="M4 11q-.425 0-.712.288T3 12t.288.713T4 13h16q.425 0 .713-.288T21 12t-.288-.712T20 11H4z"/>
        </SVG>
    );
}

export default MinusIcon;
