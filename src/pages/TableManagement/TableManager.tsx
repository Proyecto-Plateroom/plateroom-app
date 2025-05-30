import type { Table, TableModel } from "@/entities/Table";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { createTable, deleteTable, editTable, getAllTables } from "@/services/Table";
import AddIcon from "@/svg/AddIcon";
import BinIcon from "@/svg/BinIcon";
import EditIcon from "@/svg/EditIcon";
import Input from "@/utils/components/Input";
import Loading from "@/utils/components/Loading";
import { useOrganization } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const tableBase: Omit<Table, "organization_id"> = {
    id: "" as unknown as number,
    name: "",
    seats: 0,
}

export default function TableManager() {
    const supabase = useSupabaseClient();
    const { organization } = useOrganization();

    const [tables, setTables] = useState<TableModel[]>([]);
    const [newTable, setNewTable] = useState(tableBase);
    const newTableIsValid = newTable.name === "" || newTable.seats <= 0;
    const handleAddNewDishField = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewTable((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
    const handleAddNewTable = async () => {
        if (newTableIsValid) return;
        if (newTable.id) {
            const newTableItem = await editTable(supabase, {...newTable, organization_id: organization?.id});
            setTables((prev) => prev.map((item) => item.id === newTableItem.id ? newTableItem : item));
        } else {
            const newTableItem = await createTable(supabase, {...newTable, organization_id: organization?.id});
            setTables((prev) => [...prev, newTableItem]);
        }
        setNewTable(tableBase);
    }
    const handleLoadEditTable = (item: TableModel) => {
        if (!item) return;
        setNewTable((prev) => ({
            ...prev,
            id: item.id,
            name: item.name,
            seats: item.seats
        }));
    }
    const handleDeleteTable = async (item: TableModel) => {
        if (!item) return;
        if (await deleteTable(supabase, item.id)) {
            setTables((prev) => prev.filter((table) => table.id !== item.id));
        }
    }

    const fetchTables = async () => {
        const fetchTables = await getAllTables(supabase);
        setTables(fetchTables);
    }
    useEffect(() => {
        fetchTables();
    }, []);

    return (
        <main className="main-sidebar">
            <aside className="p-4 flex flex-col">
                <h2>Nueva mesa</h2>
                <Input value={newTable.name} label="Nombre" name="name" onChange={handleAddNewDishField} />
                <Input value={newTable.seats} label="Sitios" name="seats" onChange={handleAddNewDishField} type="number" />

                <button className="btn btn-primary" disabled={newTableIsValid} onClick={handleAddNewTable}>Añadir mesa<AddIcon className="w-4" stroke /></button>
            </aside>
                <article className="p-4">
                    <div>
                        <h1>Mesas</h1>
                    </div>
                    <Loading active={tables.length === 0}>
                        <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-4 pt-4">
    
                            {tables.map((item) => (
                                <div key={item.id} className="card bg-base-200">
                                    <div className="p-4 ">
                                            <h2>{item.name}</h2>
                                            <span className="text-gray-400 self-center">{item.seats} Sitios</span>
                                        <div className="flex gap-2 justify-end mt-auto">
                                            <button className="btn btn-sm btn-primary btn-circle" onClick={() => handleLoadEditTable(item)}><EditIcon className="w-4" /></button>
                                            <button className="btn btn-sm btn-error btn-circle" onClick={() => handleDeleteTable(item)}><BinIcon className="w-4"/></button>
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
