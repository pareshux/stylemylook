import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EC]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[#E3DDCF] bg-[#F5F3EC]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          <Link href="/">
            {/* Use the same hosted logo as the rest of the app for consistency */}
            <img
              src="https://eqwqddsgvxrpksvptlmx.supabase.co/storage/v1/object/public/assets/stylemylook_logo.svg"
              alt="StyleMyLook"
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-sm text-[#4E4E4E] transition-colors hover:text-[#2A2A2A]"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-4 text-4xl font-bold text-[#2A2A2A] md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mb-12 text-base text-[#8A8680]">
          Last updated: March 2025
        </p>

        <div className="space-y-10 text-lg leading-relaxed text-[#4E4E4E]">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              1. Who we are
            </h2>
            <p>
              StyleMyLook (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is
              an AI-powered wardrobe styling app built and operated by Paresh
              Khatri. We are based in India. Our website is{' '}
              <a
                href="https://stylemylook.xyz"
                className="text-[#2A2A2A] underline underline-offset-2"
              >
                stylemylook.xyz
              </a>
              .
            </p>
            <p className="mt-3">
              You can contact us at:{' '}
              <a
                href="mailto:hello@stylemylook.xyz"
                className="text-[#2A2A2A] underline underline-offset-2"
              >
                hello@stylemylook.xyz
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              2. What information we collect
            </h2>
            <p>We collect the following types of information when you use StyleMyLook:</p>
            <ul className="mt-4 space-y-2 pl-6 list-disc">
              <li>
                <strong className="text-[#2A2A2A]">Account information:</strong>{' '}
                Your email address and name when you sign up via email or Google.
              </li>
              <li>
                <strong className="text-[#2A2A2A]">Wardrobe photos:</strong>{' '}
                Photos of clothing items you upload to build your digital wardrobe.
              </li>
              <li>
                <strong className="text-[#2A2A2A]">Usage data:</strong> Events you
                select, outfit suggestions generated, and features you use.
              </li>
              <li>
                <strong className="text-[#2A2A2A]">Device information:</strong>{' '}
                Browser type, device type, and general location (country/region).
              </li>
              <li>
                <strong className="text-[#2A2A2A]">Waitlist emails:</strong> If
                you join our early access waitlist, we store your email address.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              3. How we use your information
            </h2>
            <p>We use your information solely to provide and improve StyleMyLook:</p>
            <ul className="mt-4 space-y-2 pl-6 list-disc">
              <li>
                To generate AI-powered outfit suggestions from your wardrobe photos.
              </li>
              <li>To store and display your wardrobe items within the app.</li>
              <li>
                To send you early access and product update emails (only if you
                opted in).
              </li>
              <li>
                To understand how people use the app and improve the experience.
              </li>
              <li>To respond to your support requests.</li>
            </ul>
            <p className="mt-4">
              We do{' '}
              <strong className="text-[#2A2A2A]">not</strong> sell your data. We
              do <strong className="text-[#2A2A2A]">not</strong> share your
              wardrobe photos with third parties for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              4. AI processing of your photos
            </h2>
            <p>
              When you upload wardrobe photos, they may be sent to Anthropic&apos;s
              Claude AI API for analysis. This allows us to automatically identify
              clothing items, colours, and styles. Anthropic processes these
              images as part of our API requests in accordance with their{' '}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-[#2A2A2A] underline underline-offset-2"
              >
                privacy policy
              </a>
              .
            </p>
            <p className="mt-3">
              Your photos are stored securely in Supabase Storage and are only
              accessible to you through your account.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              5. Data storage and security
            </h2>
            <p>Your data is stored using the following services:</p>
            <ul className="mt-4 space-y-2 pl-6 list-disc">
              <li>
                <strong className="text-[#2A2A2A]">Supabase:</strong> Database and
                file storage, hosted on AWS infrastructure. Your data is protected
                by row-level security — only you can access your own wardrobe and
                outfits.
              </li>
              <li>
                <strong className="text-[#2A2A2A]">Vercel:</strong> Our app is
                hosted on Vercel&apos;s infrastructure.
              </li>
              <li>
                <strong className="text-[#2A2A2A]">Resend:</strong> Used to send
                transactional emails (waitlist confirmations, etc.).
              </li>
            </ul>
            <p className="mt-4">
              We use industry-standard security practices including HTTPS
              encryption for all data in transit.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              6. Your rights
            </h2>
            <p>You have the right to:</p>
            <ul className="mt-4 space-y-2 pl-6 list-disc">
              <li>Access the personal data we hold about you.</li>
              <li>Delete your account and all associated data at any time.</li>
              <li>Export your data.</li>
              <li>
                Opt out of marketing emails at any time using the unsubscribe link.
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at{' '}
              <a
                href="mailto:hello@stylemylook.xyz"
                className="text-[#2A2A2A] underline underline-offset-2"
              >
                hello@stylemylook.xyz
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              7. Cookies
            </h2>
            <p>
              We use essential cookies only — specifically, authentication cookies
              managed by Supabase to keep you logged in. We do not use advertising
              or cross-site tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              8. Children&apos;s privacy
            </h2>
            <p>
              StyleMyLook is not directed at children under 13. If you are under
              13, please do not use our service. Users between 13–18 should use
              the service with parental consent.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              9. Changes to this policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify
              you of significant changes by email or by displaying a notice in the
              app. Your continued use of StyleMyLook after changes means you
              accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2A2A2A]">
              10. Contact us
            </h2>
            <p>
              If you have any questions about this privacy policy or how we handle
              your data, please contact us:
            </p>
            <div className="mt-4 rounded-2xl border border-[#E3DDCF] bg-white p-6">
              <p className="font-semibold text-[#2A2A2A]">StyleMyLook</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:hello@stylemylook.xyz"
                  className="text-[#2A2A2A] underline underline-offset-2"
                >
                  hello@stylemylook.xyz
                </a>
              </p>
              <p>
                Website:{' '}
                <a
                  href="https://stylemylook.xyz"
                  className="text-[#2A2A2A] underline underline-offset-2"
                >
                  stylemylook.xyz
                </a>
              </p>
              <p>India 🇮🇳</p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#E3DDCF] px-6 py-8 text-center">
        <p className="text-sm text-[#8A8680]">
          © 2025 StyleMyLook · Made with ❤️ in India 🇮🇳
        </p>
      </footer>
    </div>
  )
}

