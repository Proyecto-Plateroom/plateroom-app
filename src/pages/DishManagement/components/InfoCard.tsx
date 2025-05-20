import BinIcon from "@/svg/BinIcon";
import type { Dish } from "../../../entities/Dish";
import EditIcon from "@/svg/EditIcon";

interface InfoCardProps {
    item: Dish;
    titleField?: keyof Dish;
    descriptionField?: keyof Dish;
    itemEdit: () => void;
    itemDelete: () => void;
}

export default function InfoCard({
    item,
    titleField = "name",
    descriptionField = "description",
    itemEdit,
    itemDelete
}: InfoCardProps) {
    return (
        <div className="card card-side bg-base-300 shadow-sm">
            {item.photo_path && (
                <figure className="w-1/3">
                    <img src={item.photo_path} alt="Movie" />
                </figure>
            )}
            <div className="card-body p-4">
                <h2 className="card-title">{item[titleField] as string}</h2>
                {item[descriptionField] && <p>{item[descriptionField] as string}</p>}
                {item.supplement > 0 && <p>Supplement: {item.supplement}</p>}
                <div className="card-actions justify-end mt-auto">
                    <button className="btn btn-sm btn-primary btn-circle" onClick={itemEdit}><EditIcon className="w-4" /></button>
                    <button className="btn btn-sm btn-error btn-circle" onClick={itemDelete}><BinIcon className="w-4"/></button>
                </div>
            </div>
        </div>
    );
}
