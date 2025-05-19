import { useParams } from "react-router-dom";

export default function Room() {
    const { order_uuid } = useParams();

    return (
        <div>
            <h1>Room {order_uuid}</h1>
        </div>
    );
}
