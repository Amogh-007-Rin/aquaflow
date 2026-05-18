import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const NEXT_AUTH_CONFIG = {

    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Eg: Enjin@28" },
                password: { label: "Password", type: "password" }
            },

            //@ts-ignore
            async authorize(credentials, req) {
                // TODO
                // Add logic to authenticate the user inputs and find the matchin result in the database
                const user = { id: "1", username: "username", password: "password" }

                if (!user) {
                    return null
                }
            }
        })

    ],
    secret: process.env.NEXTAUTH_SECRET
}
