import React, { useState } from "react";
import { heroSectionData } from "../assets/assets";
import { Link } from "react-router-dom";
import { BikeIcon, UserIcon, MailIcon, LockIcon, Loader2Icon} from "lucide-react";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => (window.location.href = "/"), 1000);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side */}

            <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
                <img
                    src={heroSectionData.hero_image}
                    alt=""
                    className="absolute inset-0 object-cover h-full bg-center opacity-10"
                />

                <div className="relative text-center px-12">
                    <h2 className="text-4xl font-semibold text-white mb-4">
                        Welcome back to E-Grocery Platform
                    </h2>
                    <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">
                        Fresh groceries and organic produce, delivered to your doorstep.
                    </p>
                </div>
            </div>

            {/* Right side */}

            <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
                <div className="w-full max-w-md">
                    {/* form header msg */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <BikeIcon className="size-8 text-app-green" />
                            <span className="text-2xl font-semibold text-app-green">E-Grocery Platform</span>
                        </Link>
                        <h1 className="text-2xl font-semibold text-app-green mb-2">
                            {isLogin ? "Sign in to your account" : "Sign up for an account"}
                        </h1>

                        <p className="text-sm text-app-text-light">
                            {isLogin ? "Don't have an account?" : "Already have an account"}
                            <button onClick={() => setIsLogin(!isLogin)}
                                className="text-blue-500 ml-1 font-semibold hover:text-blue-600 transition-colors"
                            >
                                {isLogin ? "Sign Up" : "Sign In"}
                            </button>
                        </p>
                    </div>

                    {/* Login / Register form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <label className="text-sm flex flex-col gap-1">
                                Name
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Your name"
                                        className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border transition-all"
                                    />
                                </div>
                            </label>
                        )}

                        <label className="text-sm flex flex-col gap-1">
                            Email Address
                            <div className="relative">
                                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="example@gmail.com"
                                    className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border transition-all"
                                />
                            </div>
                        </label>

                        <label className="text-sm flex flex-col gap-1">
                            Password
                            <div className="relative">
                                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="********"
                                    className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border not-focus:border-app-border transition-all"
                                />
                            </div>
                        </label>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-center w-full py-3 bg-blue-950 text-white font-semibold rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2Icon className="animate-spin"/> : isLogin? "Sign In" : "Sign Up"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
