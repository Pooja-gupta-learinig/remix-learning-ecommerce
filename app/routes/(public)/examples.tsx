import { Link } from "react-router";
import { BookOpen, Code, Layers, Route, Loader, Zap, BarChart } from "lucide-react";

export default function Examples() {
  const examples = [
    {
      title: "Wizard Example",
      description: "Component routing example with wizard flow",
      path: "/wizard",
      icon: Layers,
      color: "text-blue-500",
    },
    {
      title: "Concerts (Nested Routes with shared layout Example)",
      description: "Demonstrates nested routes with a shared layout",
      path: "/concerts",
      icon: Route,
      color: "text-purple-500",
    },
    {
      title: "Optional Route with manual routing example",
      description: "Shows optional route parameters with manual routing",
      path: "/optionalRoutewithmanual",
      icon: Code,
      color: "text-green-500",
    },
    {
      title: "Optional Route with manual routing example with lang en",
      description: "Optional route with language parameter (en)",
      path: "/en/optionalRoutewithmanual",
      icon: Code,
      color: "text-green-500",
    },
    {
      title: "Client Data Loader Example",
      description: "Demonstrates client-side data loading",
      path: "/clientloader",
      icon: Loader,
      color: "text-orange-500",
    },
    {
      title: "Await Defer Examples",
      description: "Examples using await and defer for data loading",
      path: "/await-defer-examples",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Use Fetcher Defer Dashboard",
      description: "Dashboard example using useFetcher with defer",
      path: "/use-fetcher-defer-dashboard",
      icon: BarChart,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">React Router Examples</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore various React Router patterns and examples to understand routing concepts,
            data loading strategies, and advanced features.
          </p>
        </div>
        <div className="text-right mb-12">
        <Link
						to={"/"}
						className="text-gray-600 hover:text-gray-900 font-medium transition-colors mb-4"
					>
						← Back to Home
					</Link>
          </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example) => {
            const Icon = example.icon;
            return (
              <Link
                key={example.path}
                to={example.path}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-indigo-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`${example.color} p-3 rounded-lg bg-gray-50 group-hover:bg-indigo-50 transition-colors`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {example.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{example.description}</p>
                    <div className="flex items-center text-sm text-indigo-600 font-medium group-hover:text-indigo-700">
                      View Example
                      <svg
                        className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-indigo-50 rounded-lg p-6 border border-indigo-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">About These Examples</h2>
          <p className="text-gray-700 leading-relaxed">
            These examples demonstrate various React Router v7 features including nested routes,
            optional parameters, client-side data loading, and advanced data fetching patterns.
            Each example is designed to showcase specific routing concepts and best practices.
          </p>
        </div>
      </div>
    </div>
  );
}

