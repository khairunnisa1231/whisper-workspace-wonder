
import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useGemini } from "@/hooks/use-gemini";
import { Loader2, MessageSquare, Search } from "lucide-react";

// Sample FAQ data
const faqItems = [
  {
    id: "faq-1",
    question: "What is Katagrafy.ai?",
    answer: "Katagrafy.ai is an AI-powered conversation assistant that helps you organize your thoughts, boost productivity, and get instant answers to your questions.",
  },
  {
    id: "faq-2",
    question: "How do I get started with Katagrafy.ai?",
    answer: "To get started, simply sign up for an account, choose a plan that fits your needs, and start chatting with our AI assistant. You can ask questions, upload documents, and organize your conversations in folders.",
  },
  {
    id: "faq-3",
    question: "What plans are available?",
    answer: "We offer three plans: Starter, Basic, and Pro. Each plan comes with different features and usage limits. You can view the details on our pricing page.",
  },
  {
    id: "faq-4",
    question: "Can I upload documents?",
    answer: "Yes, all plans allow you to upload documents. The file size and number of documents vary by plan. Starter allows 5 documents up to 25MB each, Basic allows 10 documents up to 50MB each, and Pro allows 25 documents up to 100MB each.",
  },
  {
    id: "faq-5",
    question: "How does AI customization work?",
    answer: "AI customization allows you to personalize how the AI responds to your prompts. You can adjust the tone, style, and focus areas of the AI to better match your needs. This feature is available on Basic and Pro plans.",
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const { toast } = useToast();
  const aiResponseRef = useRef<HTMLDivElement>(null);
  const { askQuestion, isLoading } = useGemini();

  // Filter FAQ items based on search query
  const filteredFAQs = searchQuery 
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  // Handle custom question submission
  const handleCustomQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customQuestion.trim()) {
      toast({
        title: "Please enter a question",
        description: "Your question cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    setAiResponse("");

    try {
      const answer = await askQuestion(customQuestion);
      setAiResponse(answer);
      
      // Scroll to answer
      setTimeout(() => {
        aiResponseRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error getting answer:', error);
      // Error handling is done in the hook
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Frequently Asked Questions
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Find answers to common questions about Katagrafy.ai and its features
              </p>
              <div className="w-full max-w-xl flex items-center space-x-2 relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2" 
                    onClick={() => setSearchQuery("")}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4">
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-lg font-medium text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-300">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">
                    No FAQ matches your search. Try asking your question below.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
        
        <section className="py-8 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <Card>
                <CardHeader>
                  <CardTitle>Ask Gemini AI</CardTitle>
                  <CardDescription>
                    Can't find what you're looking for? Ask our AI assistant powered by Google Gemini.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCustomQuestionSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Type your question here..."
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button type="submit" disabled={isLoading || !customQuestion.trim()}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Answer...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Get Answer
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                {aiResponse && (
                  <CardFooter className="flex flex-col items-start" ref={aiResponseRef}>
                    <div className="pt-4 border-t w-full">
                      <h3 className="font-semibold mb-2">Answer:</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {aiResponse.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-2">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
