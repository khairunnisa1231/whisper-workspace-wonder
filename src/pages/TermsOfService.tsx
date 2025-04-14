
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Gavel } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Gavel className="h-8 w-8 text-secondary" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground">Last updated: April 14, 2025</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you and Katagrafy.ai 
              concerning your access to and use of our website and services. You agree that by accessing the 
              Service, you have read, understood, and agree to be bound by all of these Terms of Service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Service and its original content, features, and functionality 
              are and will remain the exclusive property of Katagrafy.ai and its licensors. The Service is 
              protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current 
              at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate 
              termination of your account on our Service.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any 
              activities or actions under your password, whether your password is with our Service or a third-party service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. User Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, 
              text, graphics, videos, or other material. You are responsible for the content you submit to the Service, 
              including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting content to the Service, you grant us the right to use, modify, publicly perform, publicly 
              display, reproduce, and distribute such content on and through the Service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
            <p>
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the Service in any way that violates any applicable law or regulation.</li>
              <li>Use the Service for the purpose of exploiting, harming, or attempting to exploit or harm minors.</li>
              <li>Transmit any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable.</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service.</li>
              <li>Use the Service in any manner that could disable, overburden, damage, or impair the site.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any 
              reason whatsoever, including without limitation if you breach the Terms. Upon termination, your 
              right to use the Service will immediately cease.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              In no event shall Katagrafy.ai, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your access to or use of or inability to access or use the Service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
              <br /><br />
              <strong>Email:</strong> legal@katagrafy.ai<br />
              <strong>Address:</strong> 123 AI Boulevard, Tech City, TC 12345
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
