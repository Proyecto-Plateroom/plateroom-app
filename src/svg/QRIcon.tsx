import type IconProps from "./IconProps";
import SVG from "./SVG";

function QRIcon(props: IconProps) {
    return (
        <SVG {...props}>
            <path fill="currentColor" d="M2 1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m1 2v6h6V3z"></path>
            <path fill="currentColor" fillRule="evenodd" d="M5 5h2v2H5z"></path>
            <path fill="currentColor" d="M14 1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m1 2v6h6V3z"></path>
            <path fill="currentColor" fillRule="evenodd" d="M17 5h2v2h-2z"></path>
            <path fill="currentColor" d="M2 13h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1m1 2v6h6v-6z"></path>
            <path fill="currentColor" fillRule="evenodd" d="M5 17h2v2H5z"></path>
            <path fill="currentColor" d="M23 19h-4v4h-5a1 1 0 0 1-1-1v-8v5h2v2h2v-6h-2v-2h-1h3v2h2v2h2v-4h1a1 1 0 0 1 1 1zm0 2v1a1 1 0 0 1-1 1h-1v-2z"></path>
        </SVG>
    );
}

export default QRIcon;
