import BinIcon from "@/svg/BinIcon";
import type { Dish } from "../../../entities/Dish";

interface InfoCardProps {
    item: Dish;
    titleField?: keyof Dish;
    descriptionField?: keyof Dish;
    itemOnClick?: () => void;
}

export default function InfoCard({
    item,
    titleField = "name",
    descriptionField = "description",
    itemOnClick,
}: InfoCardProps) {
    return (
        <div className="card card-side bg-base-300 shadow-sm">
            {item.photo_path && (
                <figure className="w-1/3">
                    <img src={item.photo_path} alt="" />
                </figure>
            )}
            <div className="card-body p-4">
                <h2 className="card-title">{item[titleField] as string}</h2>
                {item[descriptionField] && <p>{item[descriptionField] as string}</p>}
                <div className="card-actions self-end mt-auto">
                    <button className="btn btn-sm btn-error btn-circle" onClick={itemOnClick}><BinIcon className="w-4"/></button>
                </div>
            </div>
        </div>
    );
}
