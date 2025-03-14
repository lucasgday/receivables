
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { X } from "lucide-react";

type Step = {
  title: string;
  description: string;
  icon: string;
};

const steps: Step[] = [
  {
    title: "Welcome to the Invoice App",
    description: "This app helps you manage your invoices, track payments, and monitor your receivables.",
    icon: "👋",
  },
  {
    title: "Add Customers",
    description: "Start by adding your customers in the Customers section. You'll need them to create invoices.",
    icon: "👥",
  },
  {
    title: "Create Invoices",
    description: "Once you have customers, you can create invoices for them and track payments.",
    icon: "📄",
  },
  {
    title: "Bank Reconciliation",
    description: "Upload your bank statements to automatically match payments with your outstanding invoices.",
    icon: "🏦",
  },
  {
    title: "Manage Categories",
    description: "Organize your invoices with categories to better track your different income streams.",
    icon: "🏷️",
  },
  {
    title: "Monitor Dashboard",
    description: "Use the dashboard to get a quick overview of your receivables, open invoices, and payment status.",
    icon: "📊",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      toast.success("You're all set! Start by adding your first customer.");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onComplete}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <div className="text-center text-4xl mb-2">{steps[currentStep].icon}</div>
          <CardTitle className="text-center">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-center">
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">{steps[currentStep].description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button variant="outline" onClick={onComplete}>
            Skip
          </Button>
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? "Next" : "Get Started"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
