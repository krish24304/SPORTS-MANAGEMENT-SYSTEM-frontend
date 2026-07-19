"use client";

import { useParams } from "next/navigation";

export default function ManageSportPage() {

    const params = useParams();

    return (

        <div className="min-h-screen bg-black text-white flex items-center justify-center">

            <div className="text-center">

                <h1 className="text-5xl font-black">
                    Manage Sport
                </h1>

                <p className="text-zinc-400 mt-4">
                    Sport ID:
                </p>

                <p className="text-emerald-400 text-2xl mt-2">
                    {params.id}
                </p>

            </div>

        </div>

    );

}