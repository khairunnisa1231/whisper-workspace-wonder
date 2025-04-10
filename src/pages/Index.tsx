
import { useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Brain, 
  Zap, 
  Layers, 
  Shield, 
  Clock, 
  Check, 
  ArrowRight 
} from "lucide-react";

const Hero = () => (
  <section className="py-20 md:py-32 relative">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-10 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
            Your AI Powered
            <span className="gradient-text block"> Conversation Assistant</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Organize your thoughts, boost productivity, and get instant answers with our
            powerful AI chat assistant and workspace organizer.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/login?tab=signup">
            <Button size="lg" className="font-medium">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="font-medium">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
    
    <div className="mt-16 md:mt-24 max-w-5xl mx-auto px-4">
      <div className="rounded-lg overflow-hidden shadow-xl border border-border">
        <div className="bg-card p-2">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div className="ml-2 text-sm text-muted-foreground">ChatWiz</div>
          </div>
        </div>
        <div className="bg-muted p-6 md:p-10 dark:bg-gray-900/90">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-4 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                AI
              </div>
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <p>How can I help you today?</p>
              </div>
            </div>
            <div className="flex items-start justify-end">
              <div className="rounded-lg bg-secondary p-4 shadow-sm text-white">
                <p>Can you help me organize my workspace?</p>
              </div>
              <div className="ml-4 h-8 w-8 rounded-full bg-accent2 flex items-center justify-center text-white">
                U
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-4 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                AI
              </div>
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <p>
                  Absolutely! I can help you organize your workspace efficiently. 
                  Let's start by creating folders for your different projects...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="py-20 bg-muted/50 dark:bg-muted/10">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          Features
        </div>
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
          Everything You Need in One Place
        </h2>
        <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Powerful features designed to enhance your productivity and organization.
        </p>
      </div>
      
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 mt-12">
        <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 text-primary dark:bg-primary/20">
            <Brain className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">AI Assistant</h3>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Advanced AI to answer questions, generate content, and solve problems.
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
          <div className="rounded-full bg-secondary/10 p-3 text-secondary dark:bg-secondary/20">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Workspace Organization</h3>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Organize your conversations in folders and projects for easy access.
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
          <div className="rounded-full bg-accent2/10 p-3 text-accent2 dark:bg-accent2/20">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Instant Responses</h3>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Get immediate answers and assistance for your questions.
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
          <div className="rounded-full bg-accent1/10 p-3 text-primary dark:bg-accent1/20">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Multi-Session Support</h3>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Work on multiple chat sessions simultaneously and switch between them.
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
          <div className="rounded-full bg-accent3/10 p-3 text-accent3 dark:bg-accent3/20">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Privacy Focused</h3>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Your data is private and secure with advanced encryption.
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 text-primary dark:bg-primary/20">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Conversation History</h3>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Access your past conversations and continue where you left off.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-20">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          Pricing
        </div>
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Choose the plan that works best for you and start chatting with our AI assistant.
        </p>
      </div>
      
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 mt-12">
        {/* Free Plan */}
        <div className="flex flex-col rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="text-xl font-bold">Free</h3>
            <div className="mt-4 text-3xl font-bold">$0</div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Forever free</p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Basic AI conversations</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>5 Workspaces</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Limited history (7 days)</span>
              </li>
            </ul>
            <Link to="/login?tab=signup" className="mt-6 block">
              <Button variant="outline" className="w-full">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Premium Plan */}
        <div className="flex flex-col rounded-lg border border-secondary shadow-sm">
          <div className="bg-secondary p-2 text-center text-sm font-medium text-secondary-foreground">
            Most Popular
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold">Premium</h3>
            <div className="mt-4 text-3xl font-bold">$12</div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Per month</p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Advanced AI capabilities</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Unlimited workspaces</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Unlimited history</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Priority support</span>
              </li>
            </ul>
            <Link to="/login?tab=signup" className="mt-6 block">
              <Button className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Enterprise Plan */}
        <div className="flex flex-col rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="text-xl font-bold">Enterprise</h3>
            <div className="mt-4 text-3xl font-bold">Custom</div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Contact sales</p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Custom AI model training</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>SSO authentication</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>SLA guarantees</span>
              </li>
            </ul>
            <Button variant="outline" className="mt-6 w-full">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function IndexPage() {
  const featuresRef = useRef<HTMLElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
