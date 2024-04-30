import React, { useEffect, useState } from "react";
import { client } from "../utils/client";
import { UnitImdb } from "@dv-osdk-revised-app//sdk/ontology/objects";
import { ErrorVisitor, ListObjectsError, Result, visitError, isOk, isErr, Page } from "@dv-osdk-revised-app/sdk";

import "./home.scss";

export const HomePage: React.FC = () => {
    const [objectList, setObjectList] = useState<
        { status: "loading" } | { status: "loaded"; value: UnitImdb[] } | { status: "failed_loading"; msg: string }
    >({ status: "loading" });

    const getData = React.useCallback(async () => {
        const result: Result<Page<UnitImdb>, ListObjectsError> = await client.ontology.objects.UnitImdb.page({
            pageSize: 10,
        });
        if (isOk(result)) {
            setObjectList({ value: result.value.data, status: "loaded" });
        } else if (isErr(result)) {
            const visitor: ErrorVisitor<ListObjectsError, void> = {
                ObjectTypeNotFound: err => {
                    setObjectList({ status: "failed_loading", msg: `Object type ${err.objectType} was not found` });
                },
                default: () => {
                    setObjectList({ status: "failed_loading", msg: "failed loading object type" });
                },
            };
            visitError(result.error, visitor);
        }
    }, []);

    // Do an initial load of all Objects of a particular type
    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <div className="home">
            <header className="app-header">
                <h1>Dina's OSDK App</h1>
            </header>
            {objectList.status === "loading" && <div>Loading…</div>}
            {objectList.status === "loaded" && (
                <table className="object-table">
                    <thead>
                        <tr>
                            <th>Unit Name</th>
                            <th>Affiliation</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {objectList.value.map(object => (
                            <tr key={object.$primaryKey}>
                                <td>{object.unitName}</td>
                                <td>{object.affiliation}</td>
                                <td>{object.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
    
};
