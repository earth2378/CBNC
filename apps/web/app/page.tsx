import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 3H15M9 3V9M15 3H19C20.1046 3 21 3.89543 21 5V9M15 3V9M21 9V15M21 15V19C21 20.1046 20.1046 21 19 21H15M21 15H15M3 9V15M3 15V19C3 20.1046 3.89543 21 5 21H9M3 15H9M9 21H15M9 21V15M15 21V15M15 15H9M15 15V9M9 15V9M9 9H15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Digital Name Cards
        </div>

        <h1 className="hero-title">
          Your Professional Identity,<br />Shared Instantly
        </h1>

        <p className="hero-sub">
          Create multilingual digital name cards, share via QR code, and export as PDF or JPG — all in one place.
        </p>

        <div className="hero-cta">
          <Link href="/register" className="btn-primary">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/login" className="btn-outline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="features-grid">
        <div className="feature-tile">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L8.96701 10.0166C10.0631 12.3638 11.6362 13.9369 13.9834 15.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3>Multilingual Profiles</h3>
          <p>Maintain your profile in Thai, English, and Chinese. Each language card is independently editable.</p>
        </div>

        <div className="feature-tile">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 3H9V9H3V3ZM15 3H21V9H15V3ZM3 15H9V21H3V15ZM15 18H18M18 18H21M18 18V15M18 18V21M6 6H6.01M6 18H6.01M18 6H18.01"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3>Instant QR Sharing</h3>
          <p>Every profile gets a unique QR code that links to your public card — scan to connect instantly.</p>
        </div>

        <div className="feature-tile">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3V15M12 15L7 10M12 15L17 10M4 17V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V17"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3>PDF &amp; JPG Export</h3>
          <p>Download your name card as a high-quality PDF or share as an image directly from your phone.</p>
        </div>
      </div>
    </div>
  );
}
