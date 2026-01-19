import {
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router";

import StepOne from "~/components/wizard/StepOne";
import StepTwo from "~/components/wizard/StepTwo";
import StepThree from "~/components/wizard/StepThree";

export default function Wizard() {
  const { pathname } = useLocation();

  const steps = [
    { name: "Step 1", path: "/wizard" },
    { name: "Step 2", path: "/wizard/step-2" },
    { name: "Step 3", path: "/wizard/step-3" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
        
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Some Wizard with Steps
        </h1>

        {/* Step Navigation */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => {
            const isActive = pathname === step.path;
            return (
              <Link
                key={step.name}
                to={step.path}
                className={`flex-1 text-center py-2 mx-1 rounded-lg text-sm font-medium
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {index + 1}. {step.name}
              </Link>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <Routes>
            <Route index element={<StepOne />} />
            <Route path="step-2" element={<StepTwo />} />
            <Route path="step-3" element={<StepThree />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}
