'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Badge from '@/components/ui/badge';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.985_0.015_240)] via-card to-[oklch(0.985_0.01_240)] px-6 lg:px-8 py-24">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20">Legal</Badge>
          <h1 className="font-display font-bold text-4xl lg:text-6xl leading-tight text-foreground">
            Terms, Privacy & Cookies
          </h1>
          <p className="text-lg text-muted-foreground">Please read these policies carefully.</p>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <section className="space-y-3">
            <h2 id="contact" className="font-display font-bold text-2xl text-foreground">Contact me</h2>
            <p className="text-muted-foreground">
              Contact me{' '}
              <Link href="mailto:admin@neurallift.com" className="underline">
                here
              </Link>
              .
            </p>
          </section>
        </Card>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <section className="space-y-6">
            <h2 className="font-display font-bold text-3xl text-foreground">Terms of Service</h2>
            <p className="text-sm text-muted-foreground">Effective Date: 8/13/25 • Last Updated: 8/13/25</p>
            <div className="prose prose-neutral max-w-none leading-relaxed text-foreground">
              <h3>1. Acceptance of Terms</h3>
              <p>
                Welcome to NeuralLift (“the App”, “we”, “our”, or “us”). These Terms of Service (“Terms”) govern your access to and use of the App and any related services, including our AI-generated fitness programs, dashboards, and payment systems.
              </p>
              <p>By creating an account, accessing, or using the App, you:</p>
              <ul>
                <li>Confirm you have read, understood, and agree to these Terms</li>
                <li>Agree to comply with applicable laws and regulations</li>
                <li>Accept that the App is provided “AS IS” without warranties</li>
              </ul>
              <p>If you do not agree, do not use the App.</p>

              <h3>2. Eligibility</h3>
              <p>You must:</p>
              <ul>
                <li>Be at least 16 years old</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>If under 18, have a parent or guardian’s consent</li>
                <li>Not be barred from using the App under applicable laws</li>
              </ul>

              <h3>3. Description of Service</h3>
              <p>
                The App provides AI-generated science-based weightlifting training programs rooted in current exercise science. Programs are informed by publicly available fitness research and principles inspired by respected trainers, but are not affiliated with or endorsed by any such individuals.
              </p>
              <p>The App also offers:</p>
              <ul>
                <li>Personalized onboarding questionnaire</li>
                <li>Week-by-week hypertrophy program generation</li>
                <li>PR tracking dashboard with progress graphs</li>
                <li>Paid features for full program access and program regeneration</li>
              </ul>

              <h3>4. No Medical Advice</h3>
              <p>The App’s content is for informational purposes only. It is not intended to:</p>
              <ul>
                <li>Diagnose, treat, cure, or prevent any disease</li>
                <li>Replace professional medical advice</li>
                <li>Substitute for a consultation with a qualified health professional</li>
              </ul>
              <p>You agree to consult your physician before starting any exercise or nutrition program.</p>

              <h3>5. Account Registration</h3>
              <ul>
                <li>You may register via Google OAuth or other supported methods.</li>
                <li>You must provide accurate, up-to-date information.</li>
                <li>You are responsible for all activity under your account.</li>
                <li>You must keep your login credentials secure.</li>
                <li>We reserve the right to suspend or terminate accounts for violations.</li>
              </ul>

              <h3>6. Payments, Billing, and Refunds</h3>
              <ul>
                <li>Paid features require payment via Stripe or another authorized processor.</li>
                <li>Prices are shown in USD and may change with notice.</li>
                <li>Unless otherwise stated, all sales are final.</li>
                <li>If required by law, refunds will be provided. Otherwise, no refunds are offered once a program has been generated.</li>
                <li>Subscription or one-time payment terms will be clearly displayed at checkout.</li>
              </ul>

              <h3>7. License and Restrictions</h3>
              <p>You are granted a personal, non-transferable, non-exclusive, revocable license to use the App. You may not:</p>
              <ul>
                <li>Copy, modify, or distribute our content or code</li>
                <li>Reverse-engineer, scrape, or bypass security measures</li>
                <li>Sell or resell any AI-generated programs</li>
                <li>Use the App to develop a competing service</li>
              </ul>

              <h3>8. User-Generated Content</h3>
              <p>You may enter personal lifting data (PRs, stats, etc.). By submitting content, you:</p>
              <ul>
                <li>Grant us a worldwide, royalty-free, non-exclusive license to use it to operate and improve the App</li>
                <li>Confirm you have the right to share such data</li>
                <li>Agree not to post harmful, false, or infringing material</li>
              </ul>
              <p>We reserve the right to remove content at our discretion.</p>

              <h3>9. AI-Generated Content Disclaimer</h3>
              <p>The App uses artificial intelligence to generate training recommendations. You acknowledge that:</p>
              <ul>
                <li>AI output may contain errors or outdated information</li>
                <li>Results vary based on your input and adherence</li>
                <li>We make no guarantees about specific outcomes</li>
                <li>You assume all risk in following any AI-generated plan</li>
              </ul>

              <h3>10. Health and Safety Assumption of Risk</h3>
              <p>By using the App, you acknowledge:</p>
              <ul>
                <li>Exercise carries inherent risks, including serious injury or death</li>
                <li>You voluntarily assume all associated risks</li>
                <li>You release us from any liability related to your participation in any program</li>
              </ul>

              <h3>11. Beta Testing Disclaimer</h3>
              <ul>
                <li>Features may be incomplete or unstable</li>
                <li>Downtime and bugs are expected</li>
                <li>Feedback you provide may be used without compensation</li>
              </ul>

              <h3>12. Data Privacy</h3>
              <p>
                We collect and process personal data as described in our Privacy Policy. By using the App, you consent to our data practices, including GDPR and CCPA compliance measures.
              </p>

              <h3>13. Third-Party Services</h3>
              <p>The App integrates with third-party platforms (e.g., Google, Stripe). Your use of these services is subject to their terms and policies.</p>

              <h3>14. Intellectual Property</h3>
              <p>All content, branding, software, and designs are our property or licensed to us. You may not use our intellectual property without written permission.</p>

              <h3>15. Export Compliance</h3>
              <p>You may not use or export the App in violation of applicable export laws or regulations.</p>

              <h3>16. Termination</h3>
              <p>We may suspend or terminate your account at any time for:</p>
              <ul>
                <li>Violations of these Terms</li>
                <li>Fraudulent or abusive behavior</li>
                <li>Legal compliance requirements</li>
              </ul>

              <h3>17. No Guarantee of Availability</h3>
              <p>We do not guarantee continuous, error-free, or secure access to the App. Maintenance and outages may occur.</p>

              <h3>18. Limitation of Liability</h3>
              <p>To the fullest extent permitted by law:</p>
              <ul>
                <li>We are not liable for indirect, incidental, consequential, or punitive damages</li>
                <li>Our total liability will not exceed the greater of: The amount you paid in the past 3 months or $50 USD</li>
              </ul>

              <h3>19. Indemnification</h3>
              <p>You agree to defend, indemnify, and hold us harmless from any claims arising from:</p>
              <ul>
                <li>Your use of the App</li>
                <li>Your violation of these Terms</li>
                <li>Your infringement of third-party rights</li>
              </ul>

              <h3>20. Dispute Resolution & Arbitration</h3>
              <p>
                Any disputes will be resolved through binding arbitration under the rules of the American Arbitration Association, rather than in court. You waive the right to a jury trial. Class actions are not permitted.
              </p>

              <h3>21. Changes to the Terms</h3>
              <p>We may update these Terms from time to time. Continued use of the App after updates constitutes acceptance.</p>

              <h3>22. Governing Law</h3>
              <p>
                These Terms are governed by the laws of the State of California, without regard to conflicts of law. Jurisdiction lies in San Francisco County, California.
              </p>

              <h3>23. Contact Us</h3>
              <p>
                NeuralLift, Inc.
                <br />Los Angeles, CA
                <br />admin@neurallift.com
              </p>
            </div>
          </section>
        </Card>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <section className="space-y-6">
            <h2 id="privacy-policy" className="font-display font-bold text-3xl text-foreground">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground">Effective Date: 8/13/25 • Last Updated: 8/13/25</p>
            <div className="prose prose-neutral max-w-none leading-relaxed text-foreground">
              <p>
                NeuralLift (“we”, “our”, “us”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share information when you use our website and services (collectively, “the App”).
              </p>
              <p>By using the App, you agree to the practices described in this Privacy Policy.</p>

              <h3>1. Information We Collect</h3>
              <p>We collect the following types of information:</p>

              <h4>1.1 Information You Provide</h4>
              <ul>
                <li>Account Information – Name, email address (collected via Google OAuth or other sign-in methods)</li>
                <li>Profile & Onboarding Data – Your fitness goals, lifting history, training preferences, PRs, and questionnaire responses</li>
                <li>Payment Information – Processed securely by Stripe; we do not store full payment card details</li>
                <li>Communications – Emails, support messages, or other contact you make with us</li>
              </ul>

              <h4>1.2 Information Collected Automatically</h4>
              <ul>
                <li>Device type, operating system, browser type</li>
                <li>IP address, location (city-level, approximate)</li>
                <li>Pages viewed, time spent, navigation patterns</li>
                <li>Cookies and similar tracking technologies (see Cookies Policy)</li>
              </ul>

              <h4>1.3 AI Data Processing</h4>
              <p>
                The App uses AI models to generate training programs based on your responses. Your input data is processed securely for this purpose.
              </p>

              <h3>2. How We Use Your Information</h3>
              <ul>
                <li>Provide and personalize your training program</li>
                <li>Process payments and provide receipts</li>
                <li>Improve the App’s performance and features</li>
                <li>Communicate with you about updates, offers, and service changes</li>
                <li>Enforce our Terms of Service and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h3>3. Legal Basis for Processing (GDPR)</h3>
              <p>If you are in the EU/EEA, we process your personal data under one or more of the following legal bases:</p>
              <ul>
                <li>Contract – To deliver the services you requested</li>
                <li>Consent – For optional marketing and analytics</li>
                <li>Legal obligation – To comply with applicable laws</li>
                <li>Legitimate interests – For improving services and preventing abuse</li>
              </ul>

              <h3>4. How We Share Your Information</h3>
              <ul>
                <li>Service Providers – e.g., Google (sign-in), Stripe (payments), analytics providers</li>
                <li>Legal Authorities – If required by law or to protect our legal rights</li>
                <li>Business Transfers – In case of merger, acquisition, or sale of assets</li>
              </ul>
              <p>We do not sell your personal data.</p>

              <h3>5. Data Storage & Security</h3>
              <ul>
                <li>Data is stored on secure servers in the United States</li>
                <li>We use encryption (HTTPS/TLS) and industry-standard safeguards</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
                <li>While we take reasonable precautions, no method of transmission is 100% secure</li>
              </ul>

              <h3>6. Data Retention</h3>
              <ul>
                <li>As long as your account is active</li>
                <li>For up to 12 months after account deletion, unless a longer period is required by law</li>
                <li>Payment records may be retained for accounting and tax compliance</li>
              </ul>

              <h3>7. Your Privacy Rights</h3>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access the data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Object to or restrict processing</li>
                <li>Withdraw consent at any time (without affecting prior processing)</li>
                <li>Receive a copy of your data in a portable format (data portability)</li>
                <li>File a complaint with a supervisory authority</li>
              </ul>
              <p>To exercise your rights: Contact us at admin@neurallift.com.</p>

              <h3>8. California Consumer Privacy Act (CCPA) Rights</h3>
              <ul>
                <li>Request disclosure of the personal data we collect</li>
                <li>Request deletion of your personal data</li>
                <li>Opt out of the sale of personal data (we do not sell data)</li>
              </ul>

              <h3>9. Children’s Privacy</h3>
              <p>
                The App is not intended for children under 16. We do not knowingly collect personal data from children. If you believe we have collected such data, contact us immediately.
              </p>

              <h3>10. International Data Transfers</h3>
              <p>
                If you use the App from outside the United States, your information may be transferred and stored in a country with different data protection laws.
              </p>

              <h3>11. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. Material changes will be posted on this page with an updated “Last Updated” date.
              </p>

              <h3>12. Contact Us</h3>
              <p>
                NeuralLift, Inc.
                <br />Los Angeles, CA
                <br />Email: admin@neurallift.com
              </p>
            </div>
          </section>
        </Card>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <section className="space-y-6">
            <h2 className="font-display font-bold text-3xl text-foreground">Cookies Policy</h2>
            <p className="text-sm text-muted-foreground">Effective Date: 8/13/25</p>
            <div className="prose prose-neutral max-w-none leading-relaxed text-foreground">
              <h3>1. What Are Cookies?</h3>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help improve functionality, performance, and personalization.
              </p>

              <h3>2. How We Use Cookies</h3>
              <p>We use cookies for:</p>
              <ul>
                <li>Essential functionality – Account login, payment processing</li>
                <li>Analytics – Understanding user behavior to improve the App</li>
                <li>Preferences – Remembering your settings and choices</li>
                <li>Marketing – Showing relevant offers (if you consent)</li>
              </ul>

              <h3>3. Types of Cookies We Use</h3>
              <ul>
                <li>Strictly Necessary Cookies – Required for core site functions</li>
                <li>Performance Cookies – Measure site performance and usage</li>
                <li>Functional Cookies – Store user preferences</li>
                <li>Targeting/Advertising Cookies – Used with consent for marketing campaigns</li>
              </ul>

              <h3>4. Third-Party Cookies</h3>
              <p>
                We may allow third parties (e.g., Google Analytics, Stripe) to set cookies to help deliver services and analyze performance.
              </p>

              <h3>5. Managing Cookies</h3>
              <p>
                You can control or delete cookies through your browser settings. Note: Disabling cookies may limit your ability to use certain features of the App.
              </p>
              <p>
                For EU/EEA users, we display a cookie consent banner on first visit allowing you to accept or reject non-essential cookies.
              </p>

              <h3>6. Changes to This Cookies Policy</h3>
              <p>We may update this policy from time to time. Updates will be posted here.</p>
            </div>
          </section>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline hover:text-foreground">Back to home</Link>
        </div>
      </div>
    </div>
  );
}


