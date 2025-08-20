
import React from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  User,
  Key,
  Settings,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const faqItems = [
  {
    question: "How do I join an event?",
    answer: "Go to the Events page, select an event, and click 'Register'.",
  },
  {
    question: "How do I become an organizer?",
    answer:
      "Register as an organizer or contact support to upgrade your account.",
  },
  {
    question: "How do I report an issue?",
    answer: "Use the Contact page to send us details about your issue.",
  },
  {
    question: "How does the recommendation system work?",
    answer:
      "We use AI to suggest events and connections based on your interests and activity.",
  },
  {
    question: "Is my data safe?",
    answer: "Yes, we use industry-standard security to protect your data.",
  },
];

const helpItems = [
  {
    title: "Register for Events",
    description:
      "Browse events on the Events page and click 'Register'. You’ll get confirmation instantly.",
    icon: HelpCircle,
  },
  {
    title: "Contact Organizers",
    description:
      "Use the 'Contact Organizer' button on any event page or visit the Contact page.",
    icon: User,
  },
  {
    title: "Reset Password",
    description:
      "Go to Settings > Security, or use the 'Forgot Password' link on login.",
    icon: Key,
  },
  {
    title: "Update Profile",
    description:
      "Access your profile from the dashboard to update your info and preferences.",
    icon: Settings,
  },
  {
    title: "Get Recommendations",
    description:
      "AI predicts event success for organizers and helps students connect with like-minded peers by sharing only email addresses.",
    icon: Sparkles,
  },
];

export default function Support() {
  const location = useLocation();
  const hash = location.hash.replace("#", "") || "help";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Support</h1>

        <Separator className="my-4" />

        <Tabs defaultValue={hash} className="w-full">
          <TabsList className="flex flex-wrap gap-2 mb-6">
            <TabsTrigger value="help">Help Center</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Help Center */}
          <TabsContent value="help">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Help Center</h2>
                <p className="text-gray-600">
                  Quick guides to help you use CampusSync AI effectively:
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {helpItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <item.icon className="h-6 w-6 text-indigo-600 mt-1" />
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4">
                  Still need help?{" "}
                  <a href="/contact" className="text-indigo-600 underline">
                    Contact us
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Policy (Improved UI) */}
          <TabsContent value="privacy">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold">Privacy Policy</h2>
                  <Badge variant="secondary">Updated 2025</Badge>
                </div>

                <Alert>
                  <AlertTitle>🔒 Your privacy matters</AlertTitle>
                  <AlertDescription>
                    We are committed to keeping your personal data secure and
                    transparent about how we use it.
                  </AlertDescription>
                </Alert>

                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="data-collection">
                    <AccordionTrigger>
                      What data do we collect?
                    </AccordionTrigger>
                    <AccordionContent>
                      We only collect the data necessary to provide event
                      management and personalized recommendations.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-sharing">
                    <AccordionTrigger>Do we share your data?</AccordionTrigger>
                    <AccordionContent>
                      Your data is <strong>never</strong> sold to third parties.
                      It is only used internally to enhance your experience.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="security">
                    <AccordionTrigger>
                      How do we protect your data?
                    </AccordionTrigger>
                    <AccordionContent>
                      We use industry-standard <strong>encryption</strong> and
                      secure protocols to keep your data safe.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="account-deletion">
                    <AccordionTrigger>Can I delete my data?</AccordionTrigger>
                    <AccordionContent>
                      Yes. You can request full account and data deletion
                      anytime by contacting our support team.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Service */}
          <TabsContent value="terms">
            <Card className="shadow-md rounded-2xl border">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-indigo-600 mb-4">
                  Terms of Service
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  By using{" "}
                  <span className="font-semibold">CampusSync AI</span>, you
                  agree to the following terms and conditions:
                </p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✔</span>
                    <span>
                      You are responsible for the accuracy of your registration
                      and profile information.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">📅</span>
                    <span>
                      Event organizers are responsible for the content and
                      management of their events.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 mt-1">⚠</span>
                    <span>
                      Abusive or inappropriate behavior will result in account
                      suspension.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-600 mt-1">🔄</span>
                    <span>
                      We reserve the right to update these terms at any time.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-2">
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible>
                  {faqItems.map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
