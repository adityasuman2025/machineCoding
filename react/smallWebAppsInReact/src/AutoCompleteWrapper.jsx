import { useState } from "react";
import AutoComplete from "./AutoComplete";

async function apiCall(url, method = "get", body) {
    try {
        const resp = await fetch(url, {
            method: method || "get",
            ...(method !== "get" && body ? { body: JSON.stringify(body) } : {})
        });
        const jsonResp = await resp.json();

        return jsonResp;
    } catch (e) {
        throw Error(e);
    }
}

const DATA = [{ "name": "january", "days": 31 }, { "name": "february", "days": 28 }, { "name": "march", "days": 31 }, { "name": "april", "days": 30 }, { "name": "may", "days": 31 }, { "name": "june", "days": 30 }, { "name": "july", "days": 31 }, { "name": "august", "days": 31 }, { "name": "september", "days": 30 }, { "name": "october", "days": 31 }, { "name": "november", "days": 30 }, { "name": "december", "days": 31 }];

export default function AutoCompleteWrapper() {
    const [value, setValue] = useState("");
    async function filterSuggestions(query) {
        const data = await apiCall("https://jsonblob.com/api/1164846962242871296");
        return data.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    }

    return (
        <div id="content">
            <AutoComplete
                value={value}
                totalPaginationPages={5}
                getSuggestions={filterSuggestions}
                getMoreSuggestions={(query, page) => {
                    console.log("getMoreSuggestions", query, page)
                    return DATA;
                }}

                suggestionItemRenderer={(item) => (
                    <div>{item.name} - {item.days + " days"}</div>
                )}
                onSuggestionItemClick={(item) => {
                    setValue(item.name);
                }}
            />
        </div>
    )
}