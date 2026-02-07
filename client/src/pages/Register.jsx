import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-400 mb-6">Register to start chatting.</p>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full p-3 rounded-xl bg-gray-800 outline-none"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            className="w-full p-3 rounded-xl bg-gray-800 outline-none"
            placeholder="Email"
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
            disabled={loading}
            className="w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-400 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
