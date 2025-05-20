import { useEffect, useState } from "react";
import { addDish, deleteDish, editDish, getAllDishes } from "../../services/Dish";
import { getAllDishCategories } from "@/services/DishCategory";
import { useSupabaseClient } from "../../hooks/useSupabaseClient";
import { useOrganization } from "@clerk/clerk-react";
import type { Dish, DishModel } from "@/entities/Dish";
import type { DishCategoryModel } from "@/entities/DishCategory";
import Loading from "../../utils/components/Loading";
import Input from "../../utils/components/Input";
import Select from "../../utils/components/Select";
import InfoCard from "./components/InfoCard";
import AddIcon from "@/svg/AddIcon";

const dishBase: Omit<Dish, "organization_id"> = {
    id: "" as unknown as number,
    name: "",
    description: "",
    category_id: 0,
    supplement: 0,
    photo_path: "",
}

export default function DishManager() {
    const supabase = useSupabaseClient();
    const { organization } = useOrganization();

    const [dishes, setDishes] = useState<DishModel[]>([]);
    const [categories, setCategories] = useState<DishCategoryModel[]>([]);
    const [newDish, setNewDish] = useState(dishBase);
    const newDishIsValid = newDish.name === "" && newDish.supplement <= 0;
    const handleAddNewDishField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewDish((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
    const handleAddNewDishCategory = (category: DishCategoryModel) => {
        const selectedId = String(category.id);
        const selectedItem = categories.find(item => String(item.id) === selectedId);
        if (selectedItem) {
            setNewDish((prev) => ({
                ...prev,
                category_id: selectedItem.id,
            }));
        }
    }
    const handleAddNewDish = async () => {
        if (newDishIsValid) return;
        if (newDish.id) {
            const newDishItem = await editDish(supabase, {...newDish, organization_id: organization?.id});
            setDishes((prev) => prev.map((item) => item.id === newDishItem.id ? newDishItem : item));
        } else {
            const newDishItem = await addDish(supabase, {...newDish, organization_id: organization?.id});
            setDishes((prev) => [...prev, newDishItem]);
        }
        setNewDish(dishBase);
    }
    const handleLoadEditDish = (item: DishModel) => {
        if (!item) return;
        setNewDish((prev) => ({
            ...prev,
            id: item.id,
            name: item.name,
            description: item.description,
            category_id: item.category_id,
            supplement: item.supplement,
            photo_path: item.photo_path,
        }));
    }

    const handleDeleteDish = async (item: DishModel) => {
        if (!item) return;
        const newDishesList = await deleteDish(supabase, item.id);
        setDishes(newDishesList);
    }

    const fetchDishes = async () => {
        const fetchDishes = await getAllDishes(supabase);
        setDishes(fetchDishes);
    }
    const fetchCategories = async () => {
        const fetchCategories = await getAllDishCategories(supabase);
        setCategories(fetchCategories);
    }
    useEffect(() => {
        fetchDishes();
        fetchCategories();
    }, []);

    return (
        <main className="main-sidebar">
            <aside className="p-4 flex flex-col">
                <h2> New dish</h2>
                <Input value={newDish.photo_path} label="Photo" name="photo_path" onChange={handleAddNewDishField} type="file" optional />
                <Input value={newDish.name} label="Name" name="name" onChange={handleAddNewDishField} />
                <Input value={newDish.description} label="Description" name="description" onChange={handleAddNewDishField} optional />
                <Select items={categories} itemOnSelect={handleAddNewDishCategory} />
                <Input value={newDish.supplement} label="Supplement" name="supplement" onChange={handleAddNewDishField} type="number" />

                <button className="btn btn-primary" disabled={newDishIsValid} onClick={handleAddNewDish}>Añadir plato<AddIcon className="w-4" stroke /></button>

            </aside>
            <article className="p-4">
                <div className="flex justify-between">
                    <h1>Dishes</h1>
                </div>
                    <Loading active={dishes.length === 0}>
                        <div className="flex flex-col gap-2">

                            {categories.map((category) => {
                                const dishByCategory = (categoryId: number) => dishes.filter((item) => item.category_id === categoryId);
                                if (dishByCategory(category.id).length === 0) return null;

                                return (
                                    <section key={category.id}>
                                        <h2 className="border-b">{category.name}</h2>
                                        <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] auto-rows-[150px] gap-4 p-4">

                                            {dishByCategory(category.id).map((item) => (
                                                <InfoCard item={item} key={item.id} itemEdit={() => handleLoadEditDish(item)} itemDelete={() => handleDeleteDish(item)} />
                                            ))}

                                        </div>
                                    </section>
                                )
                            })}

                        </div>
                    </Loading>
            </article>
        </main>
    );
}
