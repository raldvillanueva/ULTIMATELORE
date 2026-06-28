import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";


export default function Login(){

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [loading,setLoading] = useState(false);

    const navigate = useNavigate();


    async function handleLogin(){

        setLoading(true);

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password
        });


        if(error){

            alert(error.message);

        }else{

            navigate("/dashboard");

        }

        setLoading(false);

    }


    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center">


            <div className="w-full max-w-md">


                {/* Logo / Title */}

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Field Order System
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Login to access your dashboard
                    </p>

                </div>



                {/* Login Card */}

                <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">


                    <h2 className="text-xl font-semibold text-slate-800 mb-6">
                        Welcome Back
                    </h2>



                    <div className="space-y-4">


                        <div>

                            <label className="text-sm text-slate-600">
                                Email
                            </label>


                            <input

                            type="email"

                            className="
                            w-full mt-1 px-4 py-3
                            border border-slate-300
                            rounded-lg
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            "

                            placeholder="Enter your email"

                            onChange={(e)=>setEmail(e.target.value)}

                            />

                        </div>



                        <div>

                            <label className="text-sm text-slate-600">
                                Password
                            </label>


                            <input

                            type="password"

                            className="
                            w-full mt-1 px-4 py-3
                            border border-slate-300
                            rounded-lg
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            "

                            placeholder="Enter your password"

                            onChange={(e)=>setPassword(e.target.value)}

                            />

                        </div>



                        <button

                        onClick={handleLogin}

                        disabled={loading}

                        className="
                        w-full
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        py-3
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        gap-2
                        transition
                        "

                        >


                        <LogIn size={18}/>


                        {loading ? "Logging in..." : "Login"}


                        </button>


                    </div>


                </div>


                <p className="text-center text-sm text-slate-400 mt-6">

                Company Management System

                </p>


            </div>


        </div>

    )

}