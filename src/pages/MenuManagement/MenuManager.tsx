import { useEffect, useState } from "react";
import { addDish, createMenu, deleteDishFromMenu, deleteMenu, getAllMenus, getMenu } from "../../services/Menu";
import { getAllDishes } from "../../services/Dish";
import { useSupabaseClient } from "../../hooks/useSupabaseClient";
import { MenuModel } from "../../entities/Menu";
import { type Dish } from "../../entities/Dish";
import List from "../../utils/components/List";
import InfoCard from "./components/InfoCard";
import Loading from "../../utils/components/Loading";
import Select from "../../utils/components/Select";
import { useOrganization } from "@clerk/clerk-react";
import AddIcon from "@/svg/AddIcon";

const menuBase = {
    name: "",
    price: 0
}

export default function MenuManagement() {
    const supabase = useSupabaseClient();
    const { organization } = useOrganization();

    const [menus, setMenus] = useState<MenuModel[]>([]);
    const [menu, setMenu] = useState<MenuModel | null>(null);
    const [newMenu, setNewMenu] = useState(menuBase);
    const handleNewMenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Validate price input to allow only numbers and decimal points
        if (name === "price" && !/^\d*\.?\d*$/.test(value)) return;
        setNewMenu((prev) => ({...prev, [name]: value}));
    }

    const [dishes, setDishes] = useState<Dish[]>([]);
    const [dishesMenu, setDishesMenu] = useState<Dish[]>([]);
    const [newDish, setNewDish] = useState<Dish | null>(null);
    const [fetchingDishesMenu, setFetchingDishesMenu] = useState(false);

    const handleAddNewMenu = async () => {
        if (!newMenu.name || !newMenu.price) return;
        const newMenuItem = await createMenu(supabase, {...newMenu, organization_id: organization?.id});
        fetchMenus();
        fetchMenu(newMenuItem);
        setMenu(newMenuItem);
        setNewMenu(menuBase);
    }
    const handleDeleteMenu = async () => {
        if (!menu) return;
        await deleteMenu(menu);
        setMenu(null);
        fetchMenus();
    }
    const handleDeletedishFromMenu = async (item: Dish) => {
        if (!menu) return;
        const newDishList = await deleteDishFromMenu(supabase, menu.id, item.id);   
        setDishesMenu(newDishList);
    }
    const handleAddDishToMenu = async () => {
        if (!menu || !newDish) return;        
        const newDishList = await addDish(supabase, menu.id, newDish.id);
        setDishesMenu(newDishList);
        setNewDish(null);
    }

    const fetchMenus = async () => {
        const fetchMenus = await getAllMenus(supabase);
        setMenus(fetchMenus);
    }
    const fetchMenu = async (item: MenuModel) => {
        setFetchingDishesMenu(true);

        const fetchMenu = await getMenu(supabase, item?.id);
        setMenu(fetchMenu);
        const fetchDishesMenu = await fetchMenu?.getDishes() ?? [];
        setDishesMenu(fetchDishesMenu);

        setFetchingDishesMenu(false);
    }
    const fetchDishes = async () => {
        const fetchDishes = await getAllDishes(supabase);
        setDishes(fetchDishes);
    }

    useEffect(() => {
        fetchMenus();
        fetchDishes();
    }, []);

    return (
        <main className="main-sidebar">
            <aside className="p-4 flex flex-col gap-4">
                <List title="Menus" items={menus} itemOnClick={ (item) => fetchMenu(item) } />
                <div className="join w-full">
                    <input type="text" name="name" placeholder="Menu name" className="input join-item w-2/3" value={newMenu.name} onChange={handleNewMenuChange} />
                    <input type="text" name="price" placeholder="12.5" min={0} className="input join-item w-1/3 decoration-0" value={newMenu.price ? newMenu.price : ""} onChange={handleNewMenuChange} />
                </div>
                <button className="btn btn-primary" disabled={!newMenu.name || !newMenu.price} onClick={handleAddNewMenu}><AddIcon className="w-4" stroke /></button>
            </aside>
            <article className="p-4">
                {menu && (
                    <div className="flex justify-between">
                        <h1>{menu?.name}</h1>
                        <button className="btn btn-error" onClick={handleDeleteMenu}>Delete Menu</button>
                    </div>
                )}
                <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] auto-rows-[150px] gap-4 p-4">
                    {!menu
                        ? <p className="italic text-gray-400">No menu selected</p>
                        : (
                            <Loading active={fetchingDishesMenu} text="Loading dishes">
                                {dishesMenu.length === 0
                                    ? <p className="italic text-gray-400">No dishes found</p>
                                    : dishesMenu.map((dish, index) => <InfoCard key={index} item={dish} itemOnClick={() => handleDeletedishFromMenu(dish)} />)
                                }
                                {dishes.length !== dishesMenu.length &&
                                    <div className="flex justify-center col-span-full h-min">
                                        <div className="flex items-center w-fit gap-2">
                                            <Select items={dishes.filter((dish) => !dishesMenu.some((menuDish) => menuDish.id === dish.id))} itemOnSelect={(dish) => setNewDish(dish)} />
                                            <button className="btn btn-square btn-primary" onClick={handleAddDishToMenu}><AddIcon className="w-4" stroke /></button>
                                        </div>
                                    </div>
                                }
                            </Loading>
                        )}
                </div>
            </article>
        </main>
    );
}
