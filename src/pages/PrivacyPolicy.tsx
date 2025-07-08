

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-crypto-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-crypto-secondary rounded-lg p-8">
          <h1 className="text-3xl font-bold text-crypto-gold mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <div>
              <p className="mb-4">
                <strong className="text-crypto-gold">Last updated:</strong> July 5, 2025
              </p>
              <p className="mb-4">
                Crypto News Pulse ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website cryptonewspulse.xyz (the "Service").
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Information We Collect</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">Personal Information</h3>
                <p>We may collect personal information that you voluntarily provide to us when you:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Contact us through our website</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p>This information may include your name, email address, and any other information you choose to provide.</p>
              </div>
              
              <div className="space-y-3 mt-4">
                <h3 className="text-lg font-medium text-white">Automatically Collected Information</h3>
                <p>When you visit our Service, we automatically collect certain information about your device, including:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide and maintain our cryptocurrency news service</li>
                <li>Improve our website and user experience</li>
                <li>Analyze usage patterns and trends</li>
                <li>Send you updates and newsletters (with your consent)</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Ensure the security and integrity of our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve our service performance</li>
              </ul>
              <p className="mt-3">You can control cookie settings through your browser preferences.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Third-Party Services</h2>
              <p>We may use third-party services that collect, monitor, and analyze data, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Google Analytics for website analytics</li>
                <li>Social media platforms for sharing features</li>
                <li>News APIs and RSS feeds for content aggregation</li>
              </ul>
              <p className="mt-3">These third-party services have their own privacy policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Data Security</h2>
              <p>Crypto News Pulse implements appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Children's Privacy</h2>
              <p>Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-crypto-gold mb-3">Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-3 p-4 bg-crypto-primary rounded-lg">
                <p><strong>Email:</strong> privacy@cryptonewspulse.xyz</p>
                <p><strong>Website:</strong> cryptonewspulse.xyz</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-crypto-accent/20">
              <a 
                href="/" 
                className="text-crypto-gold hover:text-yellow-400 transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy 