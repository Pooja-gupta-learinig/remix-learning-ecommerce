import { AppLayout } from "~/layouts/AppLayouts";
import type { Route } from "./+types/contact";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Page" },
    { name: "description", content: "Welcome to e-commerce site!" },
  ];
}
export default function Contact() {
  return (
    <AppLayout>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Contact Us
        </h1>

        <form className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Write your message..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
    </AppLayout>
  );
}
