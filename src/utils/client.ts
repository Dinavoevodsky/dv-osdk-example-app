// // Replace the package name with your application's package name instead.
// import { FoundryClient, PublicClientAuth } from "@dv-osdk-revised-app//sdk";

// /**
//  * Initialize the client to interact with the Ontology SDK
//  */
// export const client = new FoundryClient({
//     url: process.env.FOUNDRY_API_URL!,
//     auth: new PublicClientAuth({
//         clientId: process.env.FOUNDRY_CLIENT_ID!,
//         url: process.env.FOUNDRY_API_URL!,
//         redirectUrl: process.env.APPLICATION_REDIRECT_URL!,
//     }),
// });
import { FoundryClient, PublicClientAuth } from "@dv-osdk-revised-app/sdk";
import React, { useEffect } from "react";

export const client = new FoundryClient({
    url: "https://danube-staging.palantircloud.com",
    auth: new PublicClientAuth({
        clientId: "f13da65b92544a1133d6d91368811a16",
        url: "https://danube-staging.palantircloud.com",
        redirectUrl: "http://localhost:8080/auth/callback",
    }),
});

export default function SimpleReactComponent() {
    useEffect(() => {
        if (client.auth.token == null || client.auth.token.isExpired) {
            client.auth
                .refresh()
                .catch(() => {
                    // If we cannot refresh the token (i.e. the user is not logged in) we initiate the login flow in Foundry
                    // Once login has completed, the user will be redirected back to http://localhost:8080/auth/callback
                    client.auth.signIn();
                });
        } else {
            client.ontology.objects.UnitImdb
                .all()
                .then(unitimdbs => {
                    console.log(unitimdbs);
                });
        }
    }, []);
}