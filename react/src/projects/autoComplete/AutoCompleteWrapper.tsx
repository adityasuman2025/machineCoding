import { useCallback } from "react";
import AutoComplete from "./AutoComplete";
import "./AutoComplete.scoped.css";

const data = [
    { id: 1, name: "Alice Johnson", email: "alice.johnson@example.com" },
    { id: 2, name: "Bob Smith", email: "bob.smith@example.com" },
    { id: 3, name: "Charlie Brown", email: "charlie.brown@example.com" },
    { id: 4, name: "David Wilson", email: "david.wilson@example.com" },
    { id: 5, name: "Eva Davis", email: "eva.davis@example.com" },
    { id: 6, name: "Frank Miller", email: "frank.miller@example.com" },
    { id: 7, name: "Grace Lee", email: "grace.lee@example.com" },
    { id: 8, name: "Hannah Garcia", email: "hannah.garcia@example.com" },
    { id: 9, name: "Ian Martinez", email: "ian.martinez@example.com" },
    { id: 10, name: "Julia Robinson", email: "julia.robinson@example.com" },
    { id: 11, name: "Kevin Clark", email: "kevin.clark@example.com" },
    { id: 12, name: "Laura Rodriguez", email: "laura.rodriguez@example.com" },
    { id: 13, name: "Michael Lewis", email: "michael.lewis@example.com" },
    { id: 14, name: "Nina Walker", email: "nina.walker@example.com" },
    { id: 15, name: "Oscar Hall", email: "oscar.hall@example.com" },
    { id: 16, name: "Penelope Allen", email: "penelope.allen@example.com" },
    { id: 17, name: "Quincy Young", email: "quincy.young@example.com" },
    { id: 18, name: "Rachel King", email: "rachel.king@example.com" },
    { id: 19, name: "Samuel Wright", email: "samuel.wright@example.com" },
    { id: 20, name: "Tina Lopez", email: "tina.lopez@example.com" }
];

export default function AutoCompleteWrapper() {
    const getSuggestions = useCallback((qry: string) => {
        return data.filter(item =>
            item.name.toLowerCase().includes(qry.toLowerCase()) ||
            item.email.toLowerCase().includes(qry.toLowerCase())
        )
    }, []);

    const suggestionRenderer = useCallback((item) => (
        <div className="suggestionItem">
            <span>{item.name}</span>
            <span>{item.email}</span>
        </div>
    ), []);

    return (
        <div className="content">
            <AutoComplete
                getSuggestions={getSuggestions}
                suggestionUniqueKey={"id"}
                suggestionRenderer={suggestionRenderer}
                cachingEnabled={true}
                cacheTimeToLive={60}
            />
            <div>sahi hai bhai</div>
        </div>
    );
}