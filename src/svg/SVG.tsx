import type IconProps from "./IconProps";

function SVG(props: IconProps & { children?: React.ReactNode }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${props.className ?? "w-6"}`} viewBox="0 0 24 24" stroke={props.stroke ?"currentColor" : ""} strokeWidth={props.strokeWidth ? "2" : ""} onClick={props.onClick} >
            {props.children}
        </svg>
    )
}

export default SVG;
