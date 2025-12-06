"use client";

import React from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Target, 
  Zap, 
  Users, 
  Globe, 
  BookOpen, 
  Heart, 
  Award,
  Lightbulb,
  Rocket,
  TrendingUp,
  Shield,
  Clock,
  FileText,
  GraduationCap,
  Brain,
  Cpu,
  Code,
  Palette,
  CheckCircle,
  ArrowRight,
  Linkedin,
  Github,
  Twitter,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

function AboutPage() {
  const founderInfo = {
    name: "Om Avchar",
    role: "Founder & CEO",
    bio: "A passionate developer and entrepreneur with a vision to revolutionize how people learn from video content. With background in computer science and AI, Om started PaperTube to solve the problem of information overload in educational videos.",
    education: "B.Tech in Computer Science",
    expertise: ["AI/ML", "Full-Stack Development", "Product Design", "EdTech"],
    social: {
      linkedin: "https://linkedin.com/in/omavchar",
      github: "https://github.com/omavchar",
      twitter: "https://twitter.com/omavchar",
      email: "om@papertube.ai"
    },
    quote: "Education should be accessible, organized, and efficient. That's why we built PaperTube.",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  };

  const coreValues = [
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Innovation First",
      description: "Constantly pushing boundaries in AI-powered learning technology",
      color: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "User-Centric",
      description: "Every feature is designed with the learner's experience in mind",
      color: "from-red-500/10 to-pink-500/10"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Privacy & Security",
      description: "Your data and learning materials are protected with enterprise-grade security",
      color: "from-green-500/10 to-emerald-500/10"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Accessibility",
      description: "Making quality education tools available to everyone, everywhere",
      color: "from-purple-500/10 to-violet-500/10"
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Continuous Growth",
      description: "Always evolving to meet the changing needs of modern learners",
      color: "from-yellow-500/10 to-amber-500/10"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description: "Building tools that empower learning communities to thrive",
      color: "from-indigo-500/10 to-blue-500/10"
    },
  ];

  const milestones = [
    {
      year: "2023",
      title: "Concept Born",
      description: "The idea of PaperTube was conceived during a hackathon",
      icon: <Lightbulb className="h-6 w-6" />
    },
    {
      year: "2024 Q1",
      title: "First Prototype",
      description: "Built the initial AI model for YouTube transcription",
      icon: <Code className="h-6 w-6" />
    },
    {
      year: "2024 Q2",
      title: "Beta Launch",
      description: "Released to first 1000 users with positive feedback",
      icon: <Rocket className="h-6 w-6" />
    },
    {
      year: "2024 Q3",
      title: "Feature Expansion",
      description: "Added multiple AI models and PDF export features",
      icon: <Zap className="h-6 w-6" />
    },
    {
      year: "Present",
      title: "Growing Community",
      description: "Serving thousands of students and educators worldwide",
      icon: <Globe className="h-6 w-6" />
    },
    {
      year: "Future",
      title: "Global Impact",
      description: "Expanding to support multiple languages and platforms",
      icon: <TrendingUp className="h-6 w-6" />
    },
  ];

  const technologyStack = [
    {
      category: "Frontend",
      technologies: ["Next.js 14", "React", "TypeScript", "Tailwind CSS", "Shadcn UI"],
      icon: <Palette className="h-6 w-6" />
    },
    {
      category: "Backend",
      technologies: ["Node.js", "Express", "MongoDB", "Redis", "Docker"],
      icon: <Cpu className="h-6 w-6" />
    },
    {
      category: "AI/ML",
      technologies: ["OpenAI API", "LangChain", "TensorFlow", "PyTorch", "Whisper"],
      icon: <Brain className="h-6 w-6" />
    },
    {
      category: "Infrastructure",
      technologies: ["AWS", "Vercel", "Cloudflare", "GitHub Actions", "Sentry"],
      icon: <Code className="h-6 w-6" />
    },
  ];

  const impactStats = [
    { value: "10,000+", label: "Notes Generated", icon: <FileText className="h-5 w-5" /> },
    { value: "50,000+", label: "Hours Saved", icon: <Clock className="h-5 w-5" /> },
    { value: "5,000+", label: "Active Users", icon: <Users className="h-5 w-5" /> },
    { value: "100+", label: "Countries Served", icon: <Globe className="h-5 w-5" /> },
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/20">
            <Sparkles className="h-4 w-4" />
            Our Story • Our Mission • Our Vision
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Title and Description */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-red-500/10 p-2.5">
                  <BookOpen className="h-6 w-6 text-red-400" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  Transforming Education
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                About <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">PaperTube</span>
              </h1>
              
              <p className="text-lg text-neutral-300 mb-6">
                PaperTube is your AI-powered learning companion — transforming long
                YouTube lectures into clear, time-stamped, and beautifully designed
                notes within minutes. Our mission is to make learning smarter,
                faster, and more enjoyable for every student, creator, and lifelong learner.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">2023</div>
                  <div className="text-xs text-neutral-400">Founded</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">1</div>
                  <div className="text-xs text-neutral-400">Founder</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">5K+</div>
                  <div className="text-xs text-neutral-400">Users</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-900/50">
                  <div className="text-2xl font-bold text-red-500">∞</div>
                  <div className="text-xs text-neutral-400">Potential</div>
                </div>
              </div>
            </div>

            {/* Right Column - Mission Card */}
            <div className="lg:w-1/2">
              <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-400" />
                    Our Vision & Mission
                  </CardTitle>
                  <CardDescription>
                    What drives us to build PaperTube every day
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">🌟 Vision</h3>
                    <p className="text-sm text-neutral-400">
                      To become the world's most intelligent learning companion,
                      transforming passive video consumption into active, productive learning.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">🎯 Mission</h3>
                    <p className="text-sm text-neutral-400">
                      Empower every learner to extract maximum value from educational content
                      through AI-powered summarization, organization, and knowledge retention tools.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Making education accessible to everyone</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Reducing study time by 70% on average</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Building the future of personalized learning</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <Card key={index} className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-lg bg-red-500/10 mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <p className="text-sm text-neutral-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Meet Our Founder
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              The visionary behind PaperTube's mission
            </p>
          </div>

          <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Founder Image */}
                <div className="lg:w-1/3 flex flex-col items-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-red-500/20 mb-6">
                    <Image
                      src={founderInfo.src}
                      alt={founderInfo.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white">{founderInfo.name}</h3>
                    <p className="text-red-400 font-medium mb-2">{founderInfo.role}</p>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                      {founderInfo.education}
                    </Badge>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-full"
                      onClick={() => window.open(founderInfo.social.linkedin, '_blank')}
                    >
                      <Linkedin className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-full"
                      onClick={() => window.open(founderInfo.social.github, '_blank')}
                    >
                      <Github className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-full"
                      onClick={() => window.open(founderInfo.social.twitter, '_blank')}
                    >
                      <Twitter className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 rounded-full"
                      onClick={() => window.location.href = `mailto:${founderInfo.social.email}`}
                    >
                      <Mail className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Founder Details */}
                <div className="lg:w-2/3 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">About {founderInfo.name.split(' ')[0]}</h4>
                    <p className="text-neutral-300">{founderInfo.bio}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Areas of Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {founderInfo.expertise.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-neutral-800/50 text-neutral-300 border-neutral-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <QuoteIcon className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium italic">"{founderInfo.quote}"</p>
                        <p className="text-red-400 text-sm mt-2">— {founderInfo.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Our Core Values
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, index) => (
              <Card 
                key={index} 
                className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm hover:border-red-500/30 transition-colors duration-300"
              >
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-lg ${value.color} mb-4`}>
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-neutral-400">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Technology Stack
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              Built with modern technologies for maximum performance
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {technologyStack.map((stack, index) => (
              <Card 
                key={index} 
                className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm hover:border-blue-500/30 transition-colors duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      {stack.icon}
                    </div>
                    <CardTitle className="text-lg">{stack.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stack.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-neutral-300">{tech}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Our Journey
            </h2>
            <p className="mt-3 text-gray-400 sm:mt-4">
              From concept to growing platform
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-red-500 via-orange-500 to-transparent"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8 text-right' : 'md:pl-8'}`}>
                    <Card className={`border-neutral-800 bg-neutral-900/50 backdrop-blur-sm ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            {milestone.icon}
                          </div>
                          <div>
                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                              {milestone.year}
                            </Badge>
                            <h3 className="text-lg font-semibold text-white mt-2">{milestone.title}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-400">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 border-4 border-black"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Ready to transform your learning?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-400 sm:mt-4">
              Join thousands of students and educators who are already using PaperTube
              to make their learning more efficient and effective.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:mt-8">
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                Start Generating Notes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
                onClick={() => window.location.href = '/pricing'}
              >
                View Pricing Plans
              </Button>
            </div>
            <p className="mt-5 text-xs text-neutral-500 sm:mt-6">
              Free tier available • No credit card required • Start in seconds
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Helper component for quote icon
function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

export default AboutPage;