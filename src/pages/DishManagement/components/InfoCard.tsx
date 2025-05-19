import type { Dish } from "../../../entities/Dish";

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
                <figure>
                    <img src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp" alt="Movie" />
                </figure>
            )}
            <div className="card-body p-4">
                <h2 className="card-title">{item[titleField] as string}</h2>
                {item[descriptionField] && <p>{item[descriptionField] as string}</p>}
                {item.supplement > 0 && <p>Supplement: {item.supplement}</p>}
                <div className="card-actions justify-end mt-auto">
                    <button className="btn btn-sm btn-primary btn-circle" onClick={itemEdit}>edit</button>
                    <button className="btn btn-sm btn-error btn-circle" onClick={itemDelete}>×</button>
                </div>
            </div>
        </div>
    );
}
