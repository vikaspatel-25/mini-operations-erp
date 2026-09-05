import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/authService.js";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await loginUser(email, password);
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "380px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                    padding: "28px"
                }}
            >
                <div style={{ marginBottom: "28px" }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "600",
                            color: "#0f172a"
                        }}
                    >
                        Operations ERP
                    </h1>

                    <p
                        style={{
                            margin: "6px 0 0",
                            fontSize: "14px",
                            color: "#64748b"
                        }}
                    >
                        Sign in to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#334155",
                                marginBottom: "7px"
                            }}
                        >
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            style={{
                                width: "100%",
                                height: "40px",
                                boxSizing: "border-box",
                                padding: "0 12px",
                                fontSize: "14px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                outline: "none",
                                color: "#0f172a"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#334155",
                                marginBottom: "7px"
                            }}
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            style={{
                                width: "100%",
                                height: "40px",
                                boxSizing: "border-box",
                                padding: "0 12px",
                                fontSize: "14px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                outline: "none",
                                color: "#0f172a"
                            }}
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                fontSize: "13px",
                                color: "#dc2626",
                                backgroundColor: "#fef2f2",
                                border: "1px solid #fecaca",
                                borderRadius: "8px",
                                padding: "9px 12px",
                                marginBottom: "18px"
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            height: "40px",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: loading ? "#64748b" : "#0f172a",
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: "4px"
                        }}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;