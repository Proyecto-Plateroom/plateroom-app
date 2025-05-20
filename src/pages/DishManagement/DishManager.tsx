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
import { createFileName } from "@/utils/helpers";

const dishBase: Omit<Dish, "organization_id"> & { file?: File } = {
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
    const handleAddNewDishFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!files || files.length === 0) return;

        const file = files[0];
        setNewDish((prev) => ({
            ...prev,
            file,
            photo_path: createFileName(organization?.id as string, file),
        }));
    };
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
                <h2>Nuevo plato</h2>
                <Input value={""} label="Foto" name="photo_path" onChange={handleAddNewDishFile} type="file" optional />
                <Input value={newDish.name} label="Nombre" name="name" onChange={handleAddNewDishField} />
                <Input value={newDish.description as string} label="Descripción" name="description" onChange={handleAddNewDishField} optional />
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Categoría</legend>
                    <Select items={categories} itemOnSelect={handleAddNewDishCategory} />
                </fieldset>
                <Input value={newDish.supplement} label="Suplemento" name="supplement" onChange={handleAddNewDishField} type="number" />

                <button className="btn btn-primary" disabled={newDishIsValid} onClick={handleAddNewDish}>Añadir plato<AddIcon className="w-4" stroke /></button>

            </aside>
            <article className="p-4">
                <div className="flex justify-between">
                    <h1>Platos</h1>
                </div>
                    <Loading active={dishes.length === 0}>
                        <div className="flex flex-col gap-2">

                            {categories.map((category) => {
                                const dishByCategory = (categoryId: number) => dishes.filter((item) => item.category_id === categoryId);
                                if (dishByCategory(category.id).length === 0) return null;

                                return (
                                    <section key={category.id}>
                                        <h2 className="border-b">{category.name}</h2>
                                        <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] auto-rows-[150px] gap-4 pt-4">

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
