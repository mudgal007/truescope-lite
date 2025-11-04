import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Hero Section */}
      <header
        style={{
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: scrollY > 50 ? "rgba(255, 255, 255, 0.95)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(10px)" : "none",
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ fontSize: "28px", fontWeight: "bold", color: scrollY > 50 ? "#667eea" : "#fff" }}>
          TrueScope
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link
            to="/login"
            style={{
              padding: "10px 24px",
              background: "transparent",
              border: `2px solid ${scrollY > 50 ? "#667eea" : "#fff"}`,
              color: scrollY > 50 ? "#667eea" : "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = scrollY > 50 ? "#667eea" : "#fff";
              e.currentTarget.style.color = scrollY > 50 ? "#fff" : "#667eea";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = scrollY > 50 ? "#667eea" : "#fff";
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              padding: "10px 24px",
              background: scrollY > 50 ? "#667eea" : "#fff",
              color: scrollY > 50 ? "#fff" : "#667eea",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Register
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <section
        style={{
          padding: "120px 40px 80px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            marginBottom: "24px",
            textShadow: "0 2px 20px rgba(0,0,0,0.2)",
            animation: "fadeInUp 1s ease",
          }}
        >
          Verify Claims. Build Trust.
        </h1>
        <p
          style={{
            fontSize: "clamp(18px, 2.5vw, 24px)",
            marginBottom: "40px",
            opacity: 0.95,
            maxWidth: "700px",
            margin: "0 auto 40px",
            animation: "fadeInUp 1.2s ease",
          }}
        >
          TrueScope helps you verify claims, fact-check information, and build a
          trusted knowledge base. Join our community of truth seekers.
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/register"
            style={{
              padding: "16px 32px",
              background: "#fff",
              color: "#667eea",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "18px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
            }}
          >
            Get Started
          </Link>
          <Link
            to="/login"
            style={{
              padding: "16px 32px",
              background: "transparent",
              border: "2px solid #fff",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "18px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#667eea";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#fff";
            }}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "80px 40px",
          background: "#fff",
          color: "#333",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(32px, 4vw, 48px)",
            marginBottom: "60px",
            color: "#667eea",
          }}
        >
          Powerful Features
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "40px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {[
            {
              icon: "🔍",
              title: "Smart Verification",
              description: "Automatically verify claims from URLs or text with AI-powered fact-checking.",
            },
            {
              icon: "📊",
              title: "Status Tracking",
              description: "Track claim status: Unverified, Under Review, Verified True, Misleading, or False.",
            },
            {
              icon: "🏷️",
              title: "Tag & Filter",
              description: "Organize claims with tags and filter by status, category, or search terms.",
            },
            {
              icon: "👥",
              title: "Community Driven",
              description: "Join a community of reviewers working together to verify information.",
            },
            {
              icon: "📈",
              title: "Dashboard Analytics",
              description: "View your claims, track verification progress, and manage your submissions.",
            },
            {
              icon: "🔐",
              title: "Secure & Private",
              description: "Your data is protected with secure authentication and privacy controls.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                padding: "32px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(102, 126, 234, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: "24px",
                  marginBottom: "12px",
                  color: "#667eea",
                  fontWeight: 700,
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "100px 40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 4vw, 48px)",
            marginBottom: "24px",
            fontWeight: 800,
          }}
        >
          Ready to Get Started?
        </h2>
        <p
          style={{
            fontSize: "20px",
            marginBottom: "40px",
            opacity: 0.95,
            maxWidth: "600px",
            margin: "0 auto 40px",
          }}
        >
          Join TrueScope today and start verifying claims with confidence.
        </p>
        <Link
          to="/register"
          style={{
            padding: "18px 40px",
            background: "#fff",
            color: "#667eea",
            textDecoration: "none",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "20px",
            display: "inline-block",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
          }}
        >
          Create Your Account
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px",
          background: "#1a1a2e",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>TrueScope</div>
        <div style={{ opacity: 0.7, fontSize: "14px" }}>
          © 2025 TrueScope. All rights reserved.
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

