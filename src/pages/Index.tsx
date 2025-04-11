
import { useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { 
  MessageSquare, 
  Brain, 
  Zap, 
  Layers, 
  Shield, 
  Clock, 
  Check,
  CircleDollarSign,
  Star,
  Folder,
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
            <div className="ml-2 text-sm text-muted-foreground">Katagrafy.ai</div>
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

const TrustedCompanies = () => (
  <section className="py-12 bg-muted/30">
    <div className="container px-4 md:px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold">Trusted by Industry Leaders</h2>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
        <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="text-2xl font-bold text-gray-700">Microsoft</div>
        </div>
        <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="text-2xl font-bold text-gray-700">Google</div>
        </div>
        <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="text-2xl font-bold text-gray-700">Amazon</div>
        </div>
        <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="text-2xl font-bold text-gray-700">Intel</div>
        </div>
        <div className="flex items-center justify-center h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
          <div className="text-2xl font-bold text-gray-700">Spotify</div>
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

const Highlights = () => (
  <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
    <div className="container px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm border">
          <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
            <Zap className="h-7 w-7 text-secondary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Get responses in milliseconds, no matter how complex your question.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm border">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Star className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Top Quality Responses</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Trained on premium datasets to deliver accurate, comprehensive answers.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-sm border">
          <div className="h-14 w-14 rounded-full bg-accent2/10 flex items-center justify-center mb-4">
            <Folder className="h-7 w-7 text-accent2" />
          </div>
          <h3 className="text-xl font-bold mb-2">Document Processing</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Upload documents for analysis, summarization, and Q&A capabilities.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  
  const getDiscountedPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.85; // 15% discount
    return (yearlyPrice / 12).toFixed(2);
  };
  
  return (
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
          
          <div className="flex items-center space-x-2 mt-6">
            <span className={`text-sm font-medium ${!isYearly ? 'text-primary' : 'text-gray-500'}`}>Monthly</span>
            <Toggle 
              pressed={isYearly} 
              onPressedChange={setIsYearly}
              aria-label="Toggle billing cycle"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-primary' : 'text-gray-500'}`}>
              Yearly (15% off)
            </span>
          </div>
        </div>
        
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 mt-12">
          {/* Starter Plan */}
          <div className="flex flex-col rounded-lg border shadow-sm">
            <div className="p-6">
              <h3 className="text-xl font-bold">Starter</h3>
              <div className="mt-4 text-3xl font-bold">
                ${isYearly ? getDiscountedPrice(3.99) : '3.99'}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              {isYearly && (
                <p className="mt-1 text-sm text-secondary">Save 15% with yearly billing</p>
              )}
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>100 prompts/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>5 documents (25 MB each)</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Short and Long prompts</span>
                </li>
                <li className="flex items-center text-gray-500">
                  <span className="mr-2">✕</span>
                  <span>AI Customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Folder Creation</span>
                </li>
              </ul>
              <Link to="/login?tab=signup" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Basic (Recommended) Plan */}
          <div className="flex flex-col rounded-lg border shadow-lg border-secondary relative">
            <div className="absolute -top-4 left-0 right-0 mx-auto w-max px-4 py-1 bg-secondary text-white text-sm font-medium rounded-full">
              Recommended
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold">Basic</h3>
              <div className="mt-4 text-3xl font-bold">
                ${isYearly ? getDiscountedPrice(9.99) : '9.99'}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              {isYearly && (
                <p className="mt-1 text-sm text-secondary">Save 15% with yearly billing</p>
              )}
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>500 prompts/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>10 documents (50 MB each)</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Short and Long prompts</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>AI Customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Folder Creation</span>
                </li>
              </ul>
              <Link to="/login?tab=signup" className="mt-6 block">
                <Button className="w-full">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="flex flex-col rounded-lg border shadow-sm">
            <div className="p-6">
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="mt-4 text-3xl font-bold">
                ${isYearly ? getDiscountedPrice(19.99) : '19.99'}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              {isYearly && (
                <p className="mt-1 text-sm text-secondary">Save 15% with yearly billing</p>
              )}
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>1000 prompts/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>25 documents (100 MB each)</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Short and Long prompts</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>AI Customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Folder Creation</span>
                </li>
              </ul>
              <Link to="/login?tab=signup" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function IndexPage() {
  const featuresRef = useRef<HTMLElement | null>(null);
  const pricingRef = useRef<HTMLElement | null>(null);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustedCompanies />
        <Features />
        <Highlights />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
