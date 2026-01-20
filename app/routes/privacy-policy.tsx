


import { AppLayout } from "~/layouts/AppLayouts";
import type { Route } from "./+types/privacy-policy";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Page" },
    { name: "description", content: "Privacy policy for e-commerce site!" },
  ];
}

export default function Privacy() {
  return (
    <AppLayout hasSidebar={false}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="text-gray-600 mb-6">
          This Privacy Policy describes how we collect, use, and protect your
          personal information when you use our shopping website.
        </p>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Personal details such as name, email, phone number, and address</li>
            <li>Payment and transaction information</li>
            <li>Account login details and order history</li>
            <li>Device, browser, and usage data</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>To process orders and payments</li>
            <li>To deliver products and services</li>
            <li>To communicate order updates and offers</li>
            <li>To improve our website, services, and user experience</li>
          </ul>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            3. Sharing of Information
          </h2>
          <p className="text-gray-600">
            We do not sell or rent your personal information. We may share data
            with trusted service providers only to fulfill orders and improve
            our services, in compliance with applicable laws.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            4. Cookies & Tracking
          </h2>
          <p className="text-gray-600">
            We use cookies and similar technologies to enhance your browsing
            experience, analyze traffic, and personalize content.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            5. Data Security
          </h2>
          <p className="text-gray-600">
            We implement appropriate security measures to protect your personal
            data against unauthorized access, alteration, or disclosure.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            6. Your Rights
          </h2>
          <p className="text-gray-600">
            You have the right to access, update, or delete your personal
            information. You may also opt out of marketing communications at any
            time.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            7. Changes to This Policy
          </h2>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated effective date.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            8. Contact Us
          </h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <span className="font-medium">support@yourshop.com</span>.
          </p>
        </section>

        <p className="text-sm text-gray-400 mt-10">
          Effective Date: January 2026
        </p>
      </div>
    </AppLayout>
  );
}
