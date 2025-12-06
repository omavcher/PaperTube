"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import {
  Headphones,
  MessageSquare,
  HelpCircle,
  Mail,
  Clock,
  CheckCircle,
  Users,
  BookOpen,
  Video,
  FileText,
  CreditCard,
  Smartphone,
  Globe,
  Zap,
  Sparkles,
  Search,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  Wrench,
  Rocket,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'billing' | 'features';
  icon: React.ReactNode;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'technical' | 'billing' | 'feature' | 'other';
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'technical'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqItems: FAQItem[] = [
    {
      question: "How do I generate notes from YouTube videos?",
      answer: "Simply paste any YouTube URL into the input field on our homepage, select your preferred AI model and settings, then click 'Generate'. Your notes will be ready in seconds!",
      category: 'general',
      icon: <Video className="h-5 w-5" />
    },
    {
      question: "What video lengths does PaperTube support?",
      answer: "Free tier supports videos up to 90 minutes. Premium plans support up to 8 hours. For longer videos, consider using our batch processing feature.",
      category: 'features',
      icon: <Clock className="h-5 w-5" />
    },
    {
      question: "How do I download my notes as PDF?",
      answer: "After generating notes, click the 'Download PDF' button in the note viewer. You can choose between different templates and formats before downloading.",
      category: 'features',
      icon: <FileText className="h-5 w-5" />
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI, Net Banking, and digital wallets through Razorpay's secure payment gateway.",
      category: 'billing',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel anytime from your account settings. Your premium features will remain active until the end of your billing period. No questions asked.",
      category: 'billing',
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      question: "Is PaperTube available on mobile?",
      answer: "Yes! PaperTube is fully responsive and works perfectly on all mobile devices. We also offer progressive web app features for native-like experience.",
      category: 'technical',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      question: "How accurate are the AI-generated notes?",
      answer: "Our AI models achieve over 95% accuracy for most educational content. Accuracy may vary for heavily accented speech or poor audio quality videos.",
      category: 'technical',
      icon: <Zap className="h-5 w-5" />
    },
    {
      question: "What languages does PaperTube support?",
      answer: "We currently support 7 languages: English, Hindi, Marathi, Bengali, Telugu, Tamil, and Kannada. More languages coming soon!",
      category: 'features',
      icon: <Globe className="h-5 w-5" />
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Account Settings → Privacy → Delete Account. All your data will be permanently deleted within 30 days as per our data retention policy.",
      category: 'general',
      icon: <Users className="h-5 w-5" />
    },
    {
      question: "Are my notes private?",
      answer: "Yes! All your notes are private by default. You can choose to make specific notes public if you want to share them with the community.",
      category: 'general',
      icon: <Shield className="h-5 w-5" />
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 14-day money-back guarantee for first-time premium subscriptions. Contact support within 14 days of purchase for a full refund.",
      category: 'billing',
      icon: <LifeBuoy className="h-5 w-5" />
    },
    {
      question: "Can I process multiple videos at once?",
      answer: "Yes! Premium users can use our batch processing feature to process up to 20 videos simultaneously. This is perfect for course materials.",
      category: 'features',
      icon: <Rocket className="h-5 w-5" />
    },
  ];

  const categories = [
    { id: 'all', label: 'All Questions', count: faqItems.length },
    { id: 'general', label: 'General', count: faqItems.filter(f => f.category === 'general').length },
    { id: 'features', label: 'Features', count: faqItems.filter(f => f.category === 'features').length },
    { id: 'billing', label: 'Billing', count: faqItems.filter(f => f.category === 'billing').length },
    { id: 'technical', label: 'Technical', count: faqItems.filter(f => f.category === 'technical').length },
  ];

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message sent! We'll respond within 24 hours.");
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'technical'
    });
    setIsSubmitting(false);
  };

  const quickLinks = [
    {
      title: "Getting Started Guide",
      description: "Learn how to make the most of PaperTube",
      icon: <Rocket className="h-6 w-6" />,
      link: "/docs/getting-started",
      color: "from-purple-500/10 to-pink-500/10"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step tutorials",
      icon: <Video className="h-6 w-6" />,
      link: "/tutorials",
      color: "from-red-500/10 to-orange-500/10"
    },
    {
      title: "API Documentation",
      description: "For developers and integrations",
      icon: <Code className="h-6 w-6" />,
      link: "/docs/api",
      color: "from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "Community Forum",
      description: "Join discussions with other users",
      icon: <Users className="h-6 w-6" />,
      link: "https://community.papertube.ai",
      color: "from-green-500/10 to-emerald-500/10"
    },
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 border border-green-500/20">
            <Headphones className="h-4 w-4" />
            24/7 Support • Fast Response • Happy to Help
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-green-500/10 p-2.5">
                  <LifeBuoy className="h-6 w-6 text-green-400" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  Help & Support
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                How Can We <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Help You?</span>
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                Get answers to common questions, troubleshoot issues, or contact our support team.
                We're here to ensure you have the best experience with PaperTube.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">24/7</div>
                  <div className="text-xs text-neutral-400">Support</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">2h</div>
                  <div className="text-xs text-neutral-400">Avg Response</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">98%</div>
                  <div className="text-xs text-neutral-400">Satisfaction</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-green-500">✓</div>
                  <div className="text-xs text-neutral-400">Always Free</div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Help */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Quick Help Options
                  </CardTitle>
                  <CardDescription>
                    Get help faster with these options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto py-3 border-neutral-700 hover:bg-neutral-800"
                      onClick={() => window.location.href = '/docs'}
                    >
                      <BookOpen className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Documentation</div>
                        <div className="text-xs text-neutral-400">Detailed guides</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto py-3 border-neutral-700 hover:bg-neutral-800"
                      onClick={() => window.location.href = '/tutorials'}
                    >
                      <Video className="mr-3 h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Video Tutorials</div>
                        <div className="text-xs text-neutral-400">Step-by-step</div>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-blue-300 font-medium">
                          Support Response Times
                        </p>
                        <p className="text-xs text-blue-400/70">
                          Email: Within 24 hours • Live Chat: 2 hours
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

      {/* Search Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-5 w-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers (e.g., 'PDF export', 'subscription', 'mobile')..."
              className="pl-12 bg-neutral-900/50 border-neutral-700 focus:border-green-500 focus:ring-0 h-12 text-base"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Find quick answers to common questions
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "rounded-full",
                  activeCategory === category.id 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "border-neutral-700 hover:bg-neutral-800"
                )}
              >
                {category.label}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-2 text-xs",
                    activeCategory === category.id 
                      ? "bg-white/20" 
                      : "bg-neutral-800"
                  )}
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* FAQ Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFAQs.map((faq, index) => (
              <Card 
                key={index} 
                className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm hover:border-green-500/30 transition-colors duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-green-500/10 flex-shrink-0">
                      {faq.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                      <p className="text-sm text-neutral-400">{faq.answer}</p>
                      <Badge 
                        variant="outline" 
                        className="mt-3 bg-neutral-800/50 text-neutral-300 border-neutral-700 text-xs capitalize"
                      >
                        {faq.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-neutral-400">Try different search terms or browse by category</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                Contact Our Support Team
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="contact" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-neutral-900/50">
                  <TabsTrigger value="contact">Contact Form</TabsTrigger>
                  <TabsTrigger value="direct">Direct Contact</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contact" className="pt-6">
                  <form onSubmit={handleSubmitContact} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="Your name"
                          className="bg-neutral-800/50 border-neutral-700"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="you@example.com"
                          className="bg-neutral-800/50 border-neutral-700"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        placeholder="Brief description of your issue"
                        className="bg-neutral-800/50 border-neutral-700"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['technical', 'billing', 'feature', 'other'].map((cat) => (
                          <Button
                            key={cat}
                            type="button"
                            variant={contactForm.category === cat ? "default" : "outline"}
                            onClick={() => setContactForm({...contactForm, category: cat as any})}
                            className={cn(
                              "capitalize",
                              contactForm.category === cat 
                                ? "bg-green-600 hover:bg-green-700" 
                                : "border-neutral-700"
                            )}
                          >
                            {cat}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        placeholder="Please describe your issue or question in detail..."
                        className="min-h-[150px] bg-neutral-800/50 border-neutral-700"
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin mr-2" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="direct" className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-neutral-800 bg-neutral-800/30">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Mail className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">Email Support</h3>
                              <p className="text-sm text-neutral-400">For detailed inquiries</p>
                            </div>
                          </div>
                          <a 
                            href="mailto:support@papertube.ai" 
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            support@papertube.ai
                          </a>
                          <p className="text-xs text-neutral-500 mt-2">
                            Response within 24 hours
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-neutral-800 bg-neutral-800/30">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <MessageSquare className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">Live Chat</h3>
                              <p className="text-sm text-neutral-400">For quick questions</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full border-green-600 text-green-400 hover:bg-green-600/20"
                            onClick={() => toast.info("Live chat coming soon!")}
                          >
                            Start Chat
                          </Button>
                          <p className="text-xs text-neutral-500 mt-2">
                            Available 9 AM - 9 PM IST
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card className="border-neutral-800 bg-neutral-800/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <BookOpen className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">Knowledge Base</h3>
                            <p className="text-sm text-neutral-400">Self-help resources</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {quickLinks.map((link, index) => (
                            <a 
                              key={index}
                              href={link.link}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${link.color}`}>
                                  {link.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-white">{link.title}</div>
                                  <div className="text-sm text-neutral-400">{link.description}</div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-neutral-500" />
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Helpful Resources
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Explore these resources for additional help
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link, index) => (
              <Card 
                key={index} 
                className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm hover:border-green-500/30 transition-colors duration-300 group"
              >
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-lg ${link.color} mb-4 group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{link.title}</h3>
                  <p className="text-sm text-neutral-400 mb-4">{link.description}</p>
                  <Button 
                    variant="ghost" 
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-0 h-auto"
                    onClick={() => window.open(link.link, '_blank')}
                  >
                    Visit Resource
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Still Need Help?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              Our support team is always ready to assist you with any questions or issues
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button 
                onClick={() => window.location.href = 'mailto:support@papertube.ai'}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
                onClick={() => window.location.href = '/community'}
              >
                <Users className="mr-2 h-4 w-4" />
                Join Community
              </Button>
            </div>
            <p className="mt-5 text-xs text-neutral-500 sm:mt-6">
              Average response time: 2 hours • 98% customer satisfaction • Always free support
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Helper component for code icon
function Code({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}