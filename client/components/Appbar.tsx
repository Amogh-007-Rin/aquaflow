"use client";
import { signIn, signOut } from "next-auth/react";

export default function Appbar(){
    return(
        <div>
            <button onClick={() => signIn()}>SignIn</button>
            <button onClick={() => signOut()}>SignOut</button>
        </div>
    )
}