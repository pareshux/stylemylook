'use client'

import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EC] text-[#2A2A2A]">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <header className="mb-10">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-[#8A8680]">Last updated: March 2025</p>
        </header>

        <div className="space-y-8 text-[15px] leading-relaxed text-[#4E4E4E]">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#2A2A2A]">
              What we collect
            </h2>
            <p className="mb-3">
              To power your AI stylist, we collect a small amount of personal data:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your email address when you sign up or join the waitlist.</li>
              <li>
                Wardrobe photos you upload to StyleMyLook (clothes, shoes,
                accessories).
              </li>
              <li>
                Basic usage data such as the pages you visit, buttons you click,
                and the events or occasions you select in the app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#2A2A2A]">
              How we use it
            </h2>
            <p>
              We use this data only to run and improve StyleMyLook. That means:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Creating outfit suggestions from the wardrobe photos you add.</li>
              <li>
                Sending essential emails about your account, access, and product
                updates (we don&apos;t sell your email or spam you).
              </li>
              <li>
                Understanding which features are being used so we can make the app
                better over time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#2A2A2A]">
              Data storage and security
            </h2>
            <p>
              StyleMyLook runs on Supabase for authentication, database, and file
              storage. Your wardrobe photos and profile data are stored securely in
              Supabase, and access is restricted to your account. We do not sell
              your data, and we only use trusted third-party providers to operate
              the service (for example, email and analytics tools).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#2A2A2A]">
              Contact
            </h2>
            <p>
              If you have any questions about this privacy policy or want to
              request deletion of your data, you can reach us at{' '}
              <a
                href="mailto:hello@stylemylook.xyz"
                className="font-medium text-[#2A2A2A] underline underline-offset-2"
              >
                hello@stylemylook.xyz
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

