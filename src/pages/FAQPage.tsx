
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  Layers, 
  Settings, 
  HeadphonesIcon,
  ChevronDown,
  HelpCircle,
  Info,
  Mail,
  Phone,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

// FAQ data organized by categories
const faqCategories = [
  {
    id: "all",
    label: "All Questions",
    icon: MessageSquare,
    color: "bg-background text-primary hover:bg-primary/5",
    activeColor: "bg-primary text-white"
  },
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    color: "bg-background text-secondary hover:bg-secondary/5",
    activeColor: "bg-secondary text-white"
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    color: "bg-background text-accent3 hover:bg-accent3/5",
    activeColor: "bg-accent3 text-primary"
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    color: "bg-background text-accent2 hover:bg-accent2/5",
    activeColor: "bg-accent2 text-white"
  },
  {
    id: "features",
    label: "Features",
    icon: Layers,
    color: "bg-background text-accent1 hover:bg-accent1/5",
    activeColor: "bg-accent1 text-primary"
  },
  {
    id: "technical",
    label: "Technical",
    icon: Settings,
    color: "bg-background text-primary hover:bg-primary/5",
    activeColor: "bg-primary text-white"
  },
  {
    id: "support",
    label: "Support",
    icon: HeadphonesIcon,
    color: "bg-background text-secondary hover:bg-secondary/5",
    activeColor: "bg-secondary text-white"
  }
];

// Featured FAQ items to be displayed at the top
const featuredFaqs = [
  {
    id: "what-is",
    question: "What is Katagrafy.ai?",
    answer: "Katagrafy.ai is an AI-powered conversation assistant that helps you organize thoughts, boost productivity, and get instant answers to your questions.",
    category: "general",
    icon: MessageSquare,
    bgColor: "bg-primary-500",
    textColor: "text-white",
    iconBgColor: "bg-primary-600",
    iconColor: "text-white",
    borderColor: "border-primary-700"
  },
  {
    id: "get-started",
    question: "How do I get started with Katagrafy.ai?",
    answer: "Sign up for an account, explore the interface, and start a new conversation with our AI assistant. You can ask questions, request information, or use our tools to help organize your workspace.",
    category: "general",
    icon: BookOpen,
    bgColor: "bg-secondary-700",
    textColor: "text-white",
    iconBgColor: "bg-secondary-800",
    iconColor: "text-white",
    borderColor: "border-secondary-900"
  },
  {
    id: "data-secure",
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All your data is encrypted both in transit and at rest. We employ industry-standard security practices to protect your information.",
    category: "security",
    icon: ShieldCheck,
    bgColor: "bg-accent3",
    textColor: "text-primary-800",
    iconBgColor: "bg-accent3/80",
    iconColor: "text-primary-800",
    borderColor: "border-accent3/80"
  }
];

// All FAQ items organized by category
const faqItems = [
  {
    id: "billing-work",
    question: "How does billing work?",
    answer: "We offer monthly and annual subscription plans. You'll be billed at the start of each billing cycle. You can upgrade, downgrade, or cancel your subscription at any time through the account settings page.",
    category: "billing",
    icon: CreditCard,
    bgColor: "bg-accent2/90",
    textColor: "text-white",
    iconColor: "text-white"
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and select regional payment methods. For enterprise customers, we also offer invoicing options.",
    category: "billing",
    icon: CreditCard,
    bgColor: "bg-accent2/90",
    textColor: "text-white",
    iconColor: "text-white"
  },
  {
    id: "free-trial",
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on all plans. No credit card is required to start your trial. You'll be notified before your trial ends so you can decide if you want to continue with a paid subscription.",
    category: "billing",
    icon: CreditCard,
    bgColor: "bg-accent2/90",
    textColor: "text-white",
    iconColor: "text-white"
  },
  {
    id: "data-privacy",
    question: "How is my data handled?",
    answer: "Your data is stored securely in encrypted form. We do not sell or share your data with third parties. You maintain ownership of all your content, and you can export or delete your data at any time.",
    category: "security",
    icon: ShieldCheck,
    bgColor: "bg-accent3",
    textColor: "text-primary-800",
    iconColor: "text-primary-800"
  },
  {
    id: "access-controls",
    question: "Can I control who accesses my workspaces?",
    answer: "Yes, you have full control over who can access your workspaces. You can invite team members with different permission levels and revoke access at any time.",
    category: "security",
    icon: ShieldCheck,
    bgColor: "bg-accent3",
    textColor: "text-primary-800",
    iconColor: "text-primary-800"
  },
  {
    id: "file-upload",
    question: "What file types can I upload?",
    answer: "Katagrafy.ai supports a wide range of file types including PDFs, Word documents, Excel spreadsheets, text files, images, and more. The maximum file size depends on your subscription plan.",
    category: "features",
    icon: Layers,
    bgColor: "bg-accent1",
    textColor: "text-primary-800",
    iconColor: "text-primary-800"
  },
  {
    id: "ai-models",
    question: "What AI models power Katagrafy.ai?",
    answer: "Katagrafy.ai is powered by state-of-the-art language models, including Google Gemini and other specialized models tailored to specific tasks. We continuously update our AI technology to provide the best experience.",
    category: "technical",
    icon: Settings,
    bgColor: "bg-primary-500",
    textColor: "text-white",
    iconColor: "text-white"
  },
  {
    id: "api-access",
    question: "Do you provide API access?",
    answer: "Yes, enterprise and pro plans include API access that allows you to integrate Katagrafy.ai's capabilities into your own applications and workflows. Comprehensive documentation is available for developers.",
    category: "technical",
    icon: Settings,
    bgColor: "bg-primary-500",
    textColor: "text-white",
    iconColor: "text-white"
  },
  {
    id: "contact-support",
    question: "How can I contact support?",
    answer: "You can reach our support team through the in-app chat, by emailing support@katagrafy.ai, or by scheduling a call through the support page. Enterprise customers have access to dedicated support channels.",
    category: "support",
    icon: HeadphonesIcon,
    bgColor: "bg-secondary-700",
    textColor: "text-white",
    iconColor: "text-white"
  }
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Filter FAQ items based on the active tab
  const filteredFaqs = activeTab === "all" 
    ? faqItems 
    : faqItems.filter(item => item.category === activeTab);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary-800 to-primary-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="max-w-[700px] text-gray-200 md:text-xl">
                Find answers to common questions about Katagrafy.ai. If you can't find what you're looking for, feel free to contact our support team.
              </p>
            </div>
          </div>
        </section>
        
        {/* Category Tabs */}
        <section className="py-6">
          <div className="container px-4 md:px-6">
            <Tabs 
              defaultValue="all" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex w-auto p-1 h-auto bg-gray-100 dark:bg-gray-800 rounded-full">
                  {faqCategories.map((category) => {
                    const isActive = activeTab === category.id;
                    return (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                          "data-[state=active]:shadow-md",
                          isActive ? category.activeColor : category.color
                        )}
                      >
                        <category.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{category.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Featured FAQs */}
              {activeTab === "all" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 animate-fade-in">
                  {featuredFaqs.map((faq) => (
                    <Card 
                      key={faq.id} 
                      className={cn(
                        "overflow-hidden shadow-lg rounded-xl border-0", 
                        faq.borderColor
                      )}
                    >
                      <CardContent className="p-0">
                        <div className={cn(
                          "p-6", 
                          faq.bgColor, 
                          faq.textColor
                        )}>
                          <div className="flex items-start gap-4 mb-4">
                            <div className={cn(
                              "shrink-0 p-2 rounded-full",
                              faq.iconBgColor
                            )}>
                              <faq.icon className={cn("h-6 w-6", faq.iconColor)} />
                            </div>
                            <h3 className="text-xl font-semibold leading-tight">{faq.question}</h3>
                          </div>
                          <p className="opacity-90">
                            {faq.answer}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* All FAQs by category */}
              <div className="mt-12 animate-fade-in max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-foreground">More Questions</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredFaqs.map((item) => (
                    <Card 
                      key={item.id} 
                      className={cn(
                        "overflow-hidden shadow-md rounded-xl border-0", 
                      )}
                    >
                      <CardContent className={cn(
                        "p-6", 
                        item.bgColor,
                        item.textColor
                      )}>
                        <div className="flex items-start gap-4 mb-3">
                          <div className="shrink-0 p-2 rounded-full bg-white/20">
                            <item.icon className={cn("h-5 w-5", item.iconColor)} />
                          </div>
                          <h3 className="text-lg font-semibold">{item.question}</h3>
                        </div>
                        <p className="pl-12 opacity-90">
                          {item.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Tabs>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="py-12 bg-gray-100 dark:bg-gray-800 mt-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center justify-center p-2 bg-secondary/20 rounded-full mb-4">
                <HeadphonesIcon className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Still have questions?</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">Our support team is here to help with any questions you might have.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:support@katagrafy.ai" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-secondary text-white hover:bg-secondary/90 shadow-md transition-all">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Support
                </a>
                <a href="#" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-md transition-all">
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Documentation
                </a>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                <a href="tel:+18001234567" className="inline-flex items-center text-gray-600 hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>Call us: +1 (800) 123-4567</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
