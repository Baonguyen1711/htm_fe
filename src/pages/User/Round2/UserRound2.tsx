import { useEffect, useState } from "react";
import Round2 from "../../../layouts/RoundBase/Round2";
import ReactPlaceholder from "react-placeholder";
import "react-placeholder/lib/reactPlaceholder.css";

function UserRound2() {


    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<string>("");

    useEffect(() => {
        setTimeout(() => {
            setData("loaded");
            setLoading(false);
        }, 3000); // Simulating an API call
    }, []);

    return (
        <ReactPlaceholder
            type="text"
            rows={3}
            ready={!loading}
        >
            <Round2 />;
        </ReactPlaceholder>
    )

}

export default UserRound2;