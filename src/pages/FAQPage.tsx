
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  Shield, 
  CreditCard, 
  FileQuestion, 
  Settings, 
  Users, 
  Bot,
  Layers,
  MoveRight
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "general": <MessageSquare className="h-6 w-6 text-primary" />,
  "security": <Shield className="h-6 w-6 text-accent3" />,
  "billing": <CreditCard className="h-6 w-6 text-accent2" />,
  "technical": <Settings className="h-6 w-6 text-secondary" />,
  "support": <Users className="h-6 w-6 text-accent1" />,
  "features": <Bot className="h-6 w-6 text-accent2" />,
};

const getBgColorClass = (category: string) => {
  switch (category) {
    case "general": return "bg-primary/10";
    case "security": return "bg-accent3/10";
    case "billing": return "bg-accent2/10";
    case "technical": return "bg-secondary/10";
    case "support": return "bg-accent1/10";
    case "features": return "bg-accent2/10";
    default: return "bg-primary/10";
  }
};

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is Katagrafy.ai?",
    answer: "Katagrafy.ai is an AI-powered conversation assistant that helps you organize thoughts, boost productivity, and get instant answers to your questions.",
    category: "general"
  },
  {
    question: "How do I get started with Katagrafy.ai?",
    answer: "Sign up for an account, explore the interface, and start a new conversation with our AI assistant. You can ask questions, request information, or use our tools to help organize your workspace.",
    category: "general"
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All your data is encrypted both in transit and at rest. We employ industry-standard security practices to protect your information.",
    category: "security"
  },
  {
    question: "How does billing work?",
    answer: "We offer various subscription plans, including a free tier with limited features. Paid plans are billed monthly or annually, with discounts for annual commitments. You can upgrade, downgrade, or cancel your subscription at any time.",
    category: "billing"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and PayPal for subscription payments.",
    category: "billing"
  },
  {
    question: "Can I upload my own documents for the AI to analyze?",
    answer: "Yes, depending on your subscription plan, you can upload various document types including text files, PDFs, and more for the AI to analyze and reference.",
    category: "features"
  },
  {
    question: "How accurate is the AI assistant?",
    answer: "Our AI assistant is built on state-of-the-art language models and is continuously improving. While it provides high-quality responses, we recommend verifying critical information from authoritative sources.",
    category: "technical"
  },
  {
    question: "What file formats are supported for upload?",
    answer: "We support text files (.txt), documents (.doc, .docx), PDFs (.pdf), spreadsheets (.xls, .xlsx), and markdown (.md) files.",
    category: "technical"
  },
  {
    question: "How do I organize my workspace?",
    answer: "You can create folders, categorize conversations, save important responses, and use tags to organize your workspace efficiently.",
    category: "features"
  },
  {
    question: "Can I share conversations with others?",
    answer: "Yes, you can share individual conversations or entire folders with other users, depending on your subscription plan.",
    category: "features"
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team through the Help section in the application, or by emailing support@katagrafy.ai.",
    category: "support"
  },
  {
    question: "Is there a mobile app?",
    answer: "We are currently developing mobile applications for iOS and Android. In the meantime, our web application is fully responsive and works well on mobile browsers.",
    category: "technical"
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const categories = [
    { id: "all", label: "All Questions", icon: <FileQuestion className="h-5 w-5" /> },
    { id: "general", label: "General", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "security", label: "Security", icon: <Shield className="h-5 w-5" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="h-5 w-5" /> },
    { id: "features", label: "Features", icon: <Layers className="h-5 w-5" /> },
    { id: "technical", label: "Technical", icon: <Settings className="h-5 w-5" /> },
    { id: "support", label: "Support", icon: <Users className="h-5 w-5" /> },
  ];
  
  const filteredFAQs = activeCategory === "all" 
    ? faqItems 
    : faqItems.filter(item => item.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Katagrafy.ai. If you can't find what you're looking for,
              feel free to contact our support team.
            </p>
          </div>
          
          {/* Categories */}
          <div className="mb-8 overflow-x-auto pb-3">
            <div className="flex space-x-2 min-w-max">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Featured FAQs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredFAQs.slice(0, 3).map((item, i) => (
              <Card key={i} className="overflow-hidden bg-card hover:shadow-md transition-shadow">
                <div className={`h-2 ${item.category === 'general' ? 'bg-primary' : 
                                       item.category === 'security' ? 'bg-accent3' : 
                                       item.category === 'billing' ? 'bg-accent2' : 
                                       item.category === 'technical' ? 'bg-secondary' : 
                                       item.category === 'support' ? 'bg-accent1' : 
                                       'bg-accent2'}`} />
                <CardContent className="p-6">
                  <div className="flex items-start mb-4">
                    <div className={`rounded-full p-2 mr-3 ${getBgColorClass(item.category)}`}>
                      {iconMap[item.category]}
                    </div>
                    <h3 className="text-lg font-semibold">{item.question}</h3>
                  </div>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Accordion FAQs */}
          <div className="bg-card rounded-lg border p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">More Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.slice(3).map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="hover:text-secondary flex items-center">
                    <div className="flex items-center">
                      <div className={`rounded-full p-1.5 mr-3 ${getBgColorClass(item.category)}`}>
                        {iconMap[item.category]}
                      </div>
                      <span>{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-11 pr-4">{item.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Contact Support */}
          <div className="bg-secondary/10 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Can't find the answer you're looking for? Please contact our friendly support team.
            </p>
            <a 
              href="mailto:support@katagrafy.ai"
              className="inline-flex items-center bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Contact Support <MoveRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
