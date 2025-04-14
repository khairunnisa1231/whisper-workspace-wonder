
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-8 w-8 text-secondary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground">Last updated: April 14, 2025</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Katagrafy.ai. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website 
              and tell you about your privacy rights and how the law protects you.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. The Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
              <li><strong>Chat Data</strong> includes the content of conversations you have with our AI assistant.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>To register you as a new customer.</li>
              <li>To process and deliver your service including managing payments, fees and charges.</li>
              <li>To manage our relationship with you.</li>
              <li>To improve our website, products/services, marketing or customer relationships.</li>
              <li>To recommend products or services that may be of interest to you.</li>
              <li>To provide personalized AI assistance based on your conversations.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or 
              accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those 
              employees, agents, contractors and other third parties who have a business need to know.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>The right to access your personal data.</li>
              <li>The right to request correction of your personal data.</li>
              <li>The right to request erasure of your personal data.</li>
              <li>The right to object to processing of your personal data.</li>
              <li>The right to request restriction of processing your personal data.</li>
              <li>The right to data portability.</li>
              <li>The right to withdraw consent.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
              <br /><br />
              <strong>Email:</strong> privacy@katagrafy.ai<br />
              <strong>Address:</strong> 123 AI Boulevard, Tech City, TC 12345
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
