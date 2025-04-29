
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
import { 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  Layers, 
  Settings, 
  HeadphonesIcon,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

// FAQ data organized by categories
const faqCategories = [
  {
    id: "all",
    label: "All Questions",
    icon: MessageSquare
  },
  {
    id: "general",
    label: "General",
    icon: MessageSquare
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard
  },
  {
    id: "features",
    label: "Features",
    icon: Layers
  },
  {
    id: "technical",
    label: "Technical",
    icon: Settings
  },
  {
    id: "support",
    label: "Support",
    icon: HeadphonesIcon
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
    color: "border-primary/20"
  },
  {
    id: "get-started",
    question: "How do I get started with Katagrafy.ai?",
    answer: "Sign up for an account, explore the interface, and start a new conversation with our AI assistant. You can ask questions, request information, or use our tools to help organize your workspace.",
    category: "general",
    icon: MessageSquare,
    color: "border-primary/20"
  },
  {
    id: "data-secure",
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All your data is encrypted both in transit and at rest. We employ industry-standard security practices to protect your information.",
    category: "security",
    icon: ShieldCheck,
    color: "border-secondary/20"
  }
];

// All FAQ items organized by category
const faqItems = [
  {
    id: "billing-work",
    question: "How does billing work?",
    answer: "We offer monthly and annual subscription plans. You'll be billed at the start of each billing cycle. You can upgrade, downgrade, or cancel your subscription at any time through the account settings page.",
    category: "billing"
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and select regional payment methods. For enterprise customers, we also offer invoicing options.",
    category: "billing"
  },
  {
    id: "free-trial",
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on all plans. No credit card is required to start your trial. You'll be notified before your trial ends so you can decide if you want to continue with a paid subscription.",
    category: "billing"
  },
  {
    id: "data-privacy",
    question: "How is my data handled?",
    answer: "Your data is stored securely in encrypted form. We do not sell or share your data with third parties. You maintain ownership of all your content, and you can export or delete your data at any time.",
    category: "security"
  },
  {
    id: "access-controls",
    question: "Can I control who accesses my workspaces?",
    answer: "Yes, you have full control over who can access your workspaces. You can invite team members with different permission levels and revoke access at any time.",
    category: "security"
  },
  {
    id: "file-upload",
    question: "What file types can I upload?",
    answer: "Katagrafy.ai supports a wide range of file types including PDFs, Word documents, Excel spreadsheets, text files, images, and more. The maximum file size depends on your subscription plan.",
    category: "features"
  },
  {
    id: "ai-models",
    question: "What AI models power Katagrafy.ai?",
    answer: "Katagrafy.ai is powered by state-of-the-art language models, including Google Gemini and other specialized models tailored to specific tasks. We continuously update our AI technology to provide the best experience.",
    category: "technical"
  },
  {
    id: "api-access",
    question: "Do you provide API access?",
    answer: "Yes, enterprise and pro plans include API access that allows you to integrate Katagrafy.ai's capabilities into your own applications and workflows. Comprehensive documentation is available for developers.",
    category: "technical"
  },
  {
    id: "contact-support",
    question: "How can I contact support?",
    answer: "You can reach our support team through the in-app chat, by emailing support@katagrafy.ai, or by scheduling a call through the support page. Enterprise customers have access to dedicated support channels.",
    category: "support"
  }
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Filter FAQ items based on the active tab
  const filteredFaqs = activeTab === "all" 
    ? faqItems 
    : faqItems.filter(item => item.category === activeTab);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
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
                <TabsList className="inline-flex w-auto p-1 h-auto">
                  {faqCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <category.icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Featured FAQs */}
              {activeTab === "all" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                  {featuredFaqs.map((faq) => (
                    <Card key={faq.id} className={cn("overflow-hidden border-l-4", faq.color)}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="shrink-0">
                            <faq.icon className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold">{faq.question}</h3>
                        </div>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* All FAQs by category */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">More Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-b border-border/40">
                      <AccordionTrigger className="flex items-center gap-4 text-lg font-medium py-4">
                        {item.category === 'billing' && <CreditCard className="h-5 w-5 text-pink-500" />}
                        {item.category === 'security' && <ShieldCheck className="h-5 w-5 text-yellow-500" />}
                        {item.category === 'features' && <Layers className="h-5 w-5 text-blue-500" />}
                        {item.category === 'technical' && <Settings className="h-5 w-5 text-purple-500" />}
                        {item.category === 'support' && <HeadphonesIcon className="h-5 w-5 text-green-500" />}
                        {item.category === 'general' && <MessageSquare className="h-5 w-5 text-primary" />}
                        <span className="flex-1 text-left">{item.question}</span>
                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                      </AccordionTrigger>
                      <AccordionContent className="py-4 pl-12 text-gray-600 dark:text-gray-300">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Tabs>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="py-12 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="mb-6 text-muted-foreground">Our support team is here to help with any questions you might have.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:support@katagrafy.ai" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  Contact Support
                </a>
                <a href="#" className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                  View Documentation
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
