export default function IndexPage() {
  return (
    <div className="index-page">
      {/* Header Section */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <img src="/logo.png" alt="Travel Lounge Logo" />
          </div>
          <nav className="navigation">
            <ul className="nav-menu">
              <li><a href="#">HOME</a></li>
              <li><a href="#">ABOUT</a></li>
              <li><a href="#">SERVICES</a></li>
              <li><a href="#">FLIGHT</a></li>
              <li><a href="#">LOCAL DEALS</a></li>
              <li><a href="#">VISITING MAURITIUS</a></li>
            </ul>
          </nav>
          <div className="contact-info">
            <span className="phone-icon">📞</span>
            <span className="phone-number">+123 456 7890</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">LUXURY CRUISE ESCAPES</h1>
          <p className="hero-description">
            Discover the world's most breathtaking destinations on our premium cruise packages.
          </p>
          <button className="view-cruises-btn">VIEW CRUISES</button>
        </div>
      </section>

      {/* Find Your Perfect Escape Section */}
      <section className="find-perfect-escape">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">FIND YOUR PERFECT ESCAPE</h2>
            <p className="section-subtitle">
              Explore our curated collections of premium travel experiences.
            </p>
          </div>
          
          <div className="destination-gallery">
            {/* Gallery items would go here */}
            <div className="gallery-item">
              <img src="https://placehold.co/300x200/007bff/ffffff?text=Destination+1" alt="Destination 1" />
            </div>
            <div className="gallery-item">
              <img src="https://placehold.co/300x200/28a745/ffffff?text=Destination+2" alt="Destination 2" />
            </div>
            <div className="gallery-item">
              <img src="https://placehold.co/300x200/ffc107/000000?text=Destination+3" alt="Destination 3" />
            </div>
            <div className="gallery-item">
              <img src="https://placehold.co/300x200/dc3545/ffffff?text=Destination+4" alt="Destination 4" />
            </div>
            <div className="gallery-item">
              <img src="https://placehold.co/300x200/6c757d/ffffff?text=Destination+5" alt="Destination 5" />
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}