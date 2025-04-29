
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
    color: "bg-primary text-white"
  },
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    color: "bg-primary-200 text-primary-700"
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    color: "bg-yellow-100 text-yellow-700"
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    color: "bg-pink-100 text-pink-700"
  },
  {
    id: "features",
    label: "Features",
    icon: Layers,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "technical",
    label: "Technical",
    icon: Settings,
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: "support",
    label: "Support",
    icon: HeadphonesIcon,
    color: "bg-green-100 text-green-700"
  }
];

// Featured FAQ items to be displayed at the top
const featuredFaqs = [
  {
    id: "what-is",
    question: "What is Katagrafy.ai?",
    answer: "Katagrafy.ai is an AI-powered conversation assistant that helps you organize thoughts, boost productivity, and get instant answers to your questions.",
    category: "general",
    icon: HelpCircle,
    color: "from-primary-200 to-primary-500 text-white",
    iconColor: "text-secondary"
  },
  {
    id: "get-started",
    question: "How do I get started with Katagrafy.ai?",
    answer: "Sign up for an account, explore the interface, and start a new conversation with our AI assistant. You can ask questions, request information, or use our tools to help organize your workspace.",
    category: "general",
    icon: BookOpen,
    color: "from-accent1 to-accent2 text-primary",
    iconColor: "text-primary"
  },
  {
    id: "data-secure",
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All your data is encrypted both in transit and at rest. We employ industry-standard security practices to protect your information.",
    category: "security",
    icon: ShieldCheck,
    color: "from-secondary-200 to-secondary-500 text-white",
    iconColor: "text-accent3"
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
        <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary px-3 py-1 text-sm">
                Knowledge Base
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-primary via-secondary to-accent2 bg-clip-text text-transparent">
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
                <TabsList className="inline-flex w-auto p-1 h-auto bg-primary/5">
                  {faqCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                        "data-[state=active]:shadow-md",
                        activeTab === category.id && category.color
                      )}
                    >
                      <category.icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Featured FAQs */}
              {activeTab === "all" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 animate-fade-in">
                  {featuredFaqs.map((faq) => (
                    <Card key={faq.id} className={cn("overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all", "hover:-translate-y-1")}>
                      <CardContent className={cn("p-0")}>
                        <div className={cn("bg-gradient-to-br p-6", faq.color)}>
                          <div className="flex items-start gap-4 mb-4">
                            <div className="shrink-0 bg-white/20 p-2 rounded-full">
                              <faq.icon className={cn("h-6 w-6", faq.iconColor)} />
                            </div>
                            <h3 className="text-xl font-semibold">{faq.question}</h3>
                          </div>
                          <p className="text-current/90">{faq.answer}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* All FAQs by category */}
              <div className="mt-12 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">More Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((item) => (
                    <AccordionItem 
                      key={item.id} 
                      value={item.id} 
                      className="border border-muted/40 mb-4 rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <AccordionTrigger 
                        className="flex items-center gap-4 text-lg font-medium py-4 px-5 [&[data-state=open]]:bg-primary/5 hover:bg-muted/20"
                      >
                        {item.category === 'billing' && <CreditCard className="h-5 w-5 text-pink-500" />}
                        {item.category === 'security' && <ShieldCheck className="h-5 w-5 text-yellow-500" />}
                        {item.category === 'features' && <Layers className="h-5 w-5 text-blue-500" />}
                        {item.category === 'technical' && <Settings className="h-5 w-5 text-purple-500" />}
                        {item.category === 'support' && <HeadphonesIcon className="h-5 w-5 text-green-500" />}
                        {item.category === 'general' && <Info className="h-5 w-5 text-primary" />}
                        <span className="flex-1 text-left">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="py-4 px-5 pl-14 text-gray-600 dark:text-gray-300 bg-muted/10">
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
        <section className="py-12 bg-gradient-to-b from-muted/20 to-primary/5">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center justify-center p-2 bg-secondary/10 rounded-full mb-4">
                <HeadphonesIcon className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Still have questions?</h2>
              <p className="mb-6 text-muted-foreground">Our support team is here to help with any questions you might have.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:support@katagrafy.ai" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Support
                </a>
                <a href="#" className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all shadow-sm">
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Documentation
                </a>
              </div>
              <div className="mt-8 pt-6 border-t border-border/40 flex justify-center">
                <a href="tel:+18001234567" className="inline-flex items-center text-muted-foreground hover:text-foreground">
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
