"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import {
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Lock,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  Target,
  Heart,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TermSection {
  id: string;
  title: string;
  content: string[];
  expanded?: boolean;
}

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['acceptance', 'user-accounts']));

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const terms: TermSection[] = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using PaperTube, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
        "These terms constitute a legally binding agreement between you and PaperTube. If you do not agree with any part of these terms, you must not use our services.",
        "We reserve the right to modify these terms at any time. Continued use of PaperTube after changes constitutes acceptance of the new terms."
      ]
    },
    {
      id: "user-accounts",
      title: "2. User Accounts and Registration",
      content: [
        "You must be at least 13 years old to use PaperTube. If you are under 18, you must have parental consent.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
        "You agree to provide accurate, current, and complete information during registration and keep it updated.",
        "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities."
      ]
    },
    {
      id: "services",
      title: "3. Services Description",
      content: [
        "PaperTube provides AI-powered tools to convert YouTube videos into organized notes and summaries.",
        "We offer both free and premium subscription plans with varying features and limitations.",
        "We may modify, suspend, or discontinue any aspect of our services at any time without prior notice.",
        "We do not guarantee uninterrupted service and may perform maintenance that temporarily affects availability."
      ]
    },
    {
      id: "user-content",
      title: "4. User Content and Rights",
      content: [
        "You retain ownership of all content you create using PaperTube, including generated notes and summaries.",
        "By using our services, you grant PaperTube a license to process, store, and analyze your content to provide the service.",
        "You are solely responsible for the content you create and share using PaperTube.",
        "You must not use PaperTube to create content that violates copyrights, privacy rights, or any applicable laws."
      ]
    },
    {
      id: "intellectual-property",
      title: "5. Intellectual Property",
      content: [
        "All PaperTube software, algorithms, AI models, designs, and branding are our intellectual property.",
        "You may not reverse engineer, decompile, or attempt to extract source code from our services.",
        "PaperTube respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA).",
        "If you believe your copyright has been infringed, please contact us at copyright@papertube.ai."
      ]
    },
    {
      id: "privacy",
      title: "6. Privacy and Data Protection",
      content: [
        "Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your data.",
        "We implement industry-standard security measures to protect your data, but cannot guarantee absolute security.",
        "We may collect usage data to improve our services and personalize your experience.",
        "We do not sell your personal data to third parties."
      ]
    },
    {
      id: "subscriptions",
      title: "7. Subscription and Payments",
      content: [
        "Premium features require a subscription with either monthly or yearly billing cycles.",
        "All payments are processed through secure third-party payment processors.",
        "Subscriptions automatically renew unless canceled at least 24 hours before the renewal date.",
        "We offer a 14-day money-back guarantee for first-time premium subscriptions.",
        "Prices are subject to change with 30 days notice to existing subscribers."
      ]
    },
    {
      id: "prohibited-uses",
      title: "8. Prohibited Uses",
      content: [
        "You may not use PaperTube for any illegal purposes or to violate any laws.",
        "Do not attempt to hack, disrupt, or interfere with our services or networks.",
        "You may not use automated systems (bots, scrapers) to access PaperTube without permission.",
        "Do not upload or process content containing viruses, malware, or harmful code.",
        "Do not impersonate others or create fake accounts."
      ]
    },
    {
      id: "limitation-liability",
      title: "9. Limitation of Liability",
      content: [
        "PaperTube is provided 'as is' without warranties of any kind, express or implied.",
        "We are not liable for any indirect, incidental, special, or consequential damages.",
        "Our total liability for any claim shall not exceed the amount you paid us in the last 6 months.",
        "We are not responsible for content generated by our AI tools or how you use such content."
      ]
    },
    {
      id: "termination",
      title: "10. Termination",
      content: [
        "We may terminate or suspend your account for violations of these terms.",
        "You may terminate your account at any time by contacting support.",
        "Upon termination, your right to use PaperTube immediately ceases.",
        "We may retain your data for a reasonable period as required by law or for legitimate business purposes."
      ]
    },
    {
      id: "governing-law",
      title: "11. Governing Law",
      content: [
        "These terms are governed by the laws of India, without regard to conflict of law principles.",
        "Any disputes shall be resolved through arbitration in Pune, India.",
        "You agree to submit to the personal jurisdiction of courts located in Pune for any litigation."
      ]
    },
    {
      id: "contact",
      title: "12. Contact Information",
      content: [
        "For questions about these terms, please contact:",
        "Email: legal@papertube.ai",
        "Address: PaperTube Inc., Pune, Maharashtra, India",
        "We aim to respond to all legal inquiries within 7 business days."
      ]
    }
  ];

  const keyPoints = [
    {
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      text: "You own the notes you create",
      color: "bg-green-500/10"
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
      text: "Respect copyright and fair use",
      color: "bg-yellow-500/10"
    },
    {
      icon: <Lock className="h-5 w-5 text-blue-400" />,
      text: "Your data is protected",
      color: "bg-blue-500/10"
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      text: "No illegal activities allowed",
      color: "bg-red-500/10"
    },
    {
      icon: <Clock className="h-5 w-5 text-purple-400" />,
      text: "14-day refund guarantee",
      color: "bg-purple-500/10"
    },
    {
      icon: <Globe className="h-5 w-5 text-cyan-400" />,
      text: "Service available worldwide",
      color: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 border border-blue-500/20">
            <Shield className="h-4 w-4" />
            Legal • Transparency • Trust
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-blue-500/10 p-2.5">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Last Updated: Dec 2024
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Terms of <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Service</span>
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                These terms govern your use of PaperTube. Please read them carefully.
                By using our services, you agree to these terms and our Privacy Policy.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-blue-500">12</div>
                  <div className="text-xs text-neutral-400">Sections</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-blue-500">5</div>
                  <div className="text-xs text-neutral-400">Min Read</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-blue-500">✓</div>
                  <div className="text-xs text-neutral-400">Easy to Understand</div>
                </div>
              </div>
            </div>

            {/* Right Column - Key Points */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Key Points Summary
                  </CardTitle>
                  <CardDescription>
                    Important highlights from our terms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {keyPoints.map((point, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${point.color} border border-white/5`}
                      >
                        <div className="p-1.5 rounded bg-white/5">
                          {point.icon}
                        </div>
                        <span className="text-sm font-medium">{point.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm text-green-300 font-medium">
                          We're committed to being transparent and fair
                        </p>
                        <p className="text-xs text-green-400/70 mt-1">
                          These terms are designed to protect both you and PaperTube
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle>Complete Terms of Service</CardTitle>
              <CardDescription>
                Click on any section to expand and read the details
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                {terms.map((section) => (
                  <div 
                    key={section.id} 
                    className="border border-neutral-800 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 text-left flex items-center justify-between bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-500/10">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="font-semibold text-white">{section.title}</span>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      )}
                    </button>
                    
                    {expandedSections.has(section.id) && (
                      <div className="p-4 pt-0 animate-in fade-in-50">
                        <div className="pl-11 space-y-3">
                          {section.content.map((paragraph, idx) => (
                            <p key={idx} className="text-neutral-300 text-sm leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Separator className="my-8 bg-neutral-800" />
              
              <div className="text-center">
                <div className="inline-flex items-center gap-2 p-3 rounded-lg bg-neutral-800/30">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm text-neutral-300">
                    By using PaperTube, you acknowledge you have read and agree to these terms
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Questions About Our Terms?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              We're here to help clarify any part of our terms of service
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button 
                onClick={() => window.location.href = '/support'}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
                onClick={() => window.location.href = '/privacy'}
              >
                View Privacy Policy
              </Button>
            </div>
            <p className="mt-5 text-xs text-neutral-500 sm:mt-6">
              Response within 24 hours • Legal inquiries: legal@papertube.ai
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
