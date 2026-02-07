import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("✅ Login button clicked");
    console.log("Sending data:", form);

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", form);

      console.log("✅ Login response:", res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/chat");
    } catch (err) {
      console.log("❌ Login error:", err);

      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-400 mb-6">Login to continue.</p>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full p-3 rounded-xl bg-gray-800 outline-none"
            placeholder="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            className="w-full p-3 rounded-xl bg-gray-800 outline-none"
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-sm">
          Don’t have an account?{" "}
          <Link className="text-blue-400 hover:underline" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
