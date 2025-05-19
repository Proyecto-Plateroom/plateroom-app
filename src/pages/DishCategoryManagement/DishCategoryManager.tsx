import type { DishCategory, DishCategoryModel } from "@/entities/DishCategory";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { createDishCategory, deleteDishCategory, editDishCategory, getAllDishCategories } from "@/services/DishCategory";
import Input from "@/utils/components/Input";
import Loading from "@/utils/components/Loading";
import { useOrganization } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const categoryBase: Omit<DishCategory, "organization_id"> = {
    id: "" as unknown as number,
    name: "",
}

export default function DishCategoryManager() {
    const supabase = useSupabaseClient();
    const { organization } = useOrganization();

    const [categories, setCategories] = useState<DishCategoryModel[]>([]);
    const [newCategory, setNewCategory] = useState(categoryBase);
    const newCategoryIsValid = newCategory.name === "";
    const handleAddNewDishField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
    const handleAddNewDishCategory = async () => {
        if (newCategoryIsValid) return;
        if (newCategory.id) {
            const newCategoryItem = await editDishCategory(supabase, {...newCategory, organization_id: organization?.id});
            setCategories((prev) => prev.map((item) => item.id === newCategoryItem.id ? newCategoryItem : item));
        } else {
            const newCategoryItem = await createDishCategory(supabase, {...newCategory, organization_id: organization?.id});
            setCategories((prev) => [...prev, newCategoryItem]);
        }
        setNewCategory(categoryBase);
    }    
    const handleLoadEditDishCategory = (item: DishCategoryModel) => {
        if (!item) return;
        setNewCategory((prev) => ({
            ...prev,
            id: item.id,
            name: item.name
        }));
    }
    const handleDeleteDishCategory = async (item: DishCategoryModel) => {
        if (!item) return;
        if (await deleteDishCategory(supabase, item.id)) {
            setCategories((prev) => prev.filter((category) => category.id !== item.id));
        }
    }

    const fetchCategories = async () => {
        const fetchCategories = await getAllDishCategories(supabase);
        setCategories(fetchCategories);
    }
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <main className="main-sidebar">
            <aside className="p-4 flex flex-col">
                <h2>New dish category</h2>
                <Input value={newCategory.name} label="Name" name="name" onChange={handleAddNewDishField} />

                <button className="btn btn-primary" disabled={newCategoryIsValid} onClick={handleAddNewDishCategory}>+</button>
            </aside>
            <article className="p-4">
                <div>
                    <h1>Categories</h1>
                </div>
                <Loading active={categories.length === 0}>
                    <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-4 p-4">

                        {categories.map((item) => (
                            <div key={item.id} className="card bg-base-200">
                                <div className="p-4 flex justify-between">
                                    <h2>{item.name}</h2>
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm btn-primary btn-circle" onClick={() => handleLoadEditDishCategory(item)}>edit</button>
                                        <button className="btn btn-sm btn-error btn-circle" onClick={() => handleDeleteDishCategory(item)}>×</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </Loading>
            </article>
        </main>
    );
}
