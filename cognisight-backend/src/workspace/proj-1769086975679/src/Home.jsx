import "./styles.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const nav = useNavigate();
  
  return (
    <div className="home-container">
      {/* Navbar with Glass Effect */}
      <nav className="navbar">
        <h2 className="logo" onClick={() => nav("/")}>MyApp</h2>
        
        <div className="nav-links">
            {/* These buttons now look like transparent links thanks to the CSS */}
            <button onClick={() => nav("/login")}>Login</button>
            <button onClick={() => nav("/signup")}>Sign Up</button>
        </div>
      </nav>

      {/* Hero Section with Entry Animations */}
      <section className="hero">
        <h1>Build Faster with React ⚡</h1>
        <p>
          Create modern, responsive, and beautiful web applications using React.
        </p>
        <button className="cta-btn" onClick={() => nav("/signup")}>
          Get Started
        </button>
      </section>
    </div>
  );
}

export default Home;