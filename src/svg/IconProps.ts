export default interface IconProps {
    className?: string;
    fill?: string;
    stroke?: boolean;
    strokeWidth?: number | string;
    onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
}
