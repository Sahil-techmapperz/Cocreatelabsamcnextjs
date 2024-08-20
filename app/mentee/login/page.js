"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Signup1 from "@/public/assets/signup.png";
import Logo1 from "@/public/assets/Logo1.png";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { checkSessionExpiration } from "@/lib/checkSessionExpiration";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check session expiration on initial load
    checkSessionExpiration(router, "mentee");

    // Set up an interval to check session expiration every second
    const interval = setInterval(() => {
      checkSessionExpiration(router, "mentee");
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password,
          remember,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        const user = data.user;

        // Determine the expiration times
        const expirationTime = remember ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 1 day or 1 hour in milliseconds
        const expirationDate = new Date(new Date().getTime() + expirationTime);

        // Store the token in cookies with the calculated expiration time
        Cookies.set("token", token, { expires: remember ? 1 : 1 / 24 }); // 1 day or 1 hour

        // Store user data in local storage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("expirationTime", expirationDate.getTime());

        if (user.role === "Client") {
          router.push("/mentee/dashbord");
        }
      } else {
        toast.error(data.message || "Failed to login. Please check your username and password.");
      }
    } catch (error) {
      console.error("Login error", error);
      toast.error("Failed to login. Please try again later.");
    }
  };

  return (
    <div className="flex max-sm:flex-col justify-around items-center min-h-screen bg-gray-50">
      <ToastContainer />
      <Image src={Signup1} alt="SignUp" className="w-full max-w-2xl mb-6" />
      <form
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <Image src={Logo1} alt="Logo" className="mx-auto mb-4" />
        <p className="text-lg font-semibold text-center text-black mb-6">Sign In As mentee</p>
        <p className="text-sm text-center mb-6">Enter your email and password to Sign In</p>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Current Password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="remember"
              onChange={(e) => setRemember(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm font-bold text-black">Remember Me</span>
          </label>
        </div>

        <div className="mb-4">
          <button
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            type="submit"
          >
            SIGN IN
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signin;
