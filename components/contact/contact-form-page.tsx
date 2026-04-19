'use client';

import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export function ContactFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    artistName: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', artistName: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 group hover:opacity-75 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Heading */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tighter">Join Zirect Label</h1>
            <p className="text-lg text-muted-foreground">
              Fill out this form to get in touch with us about collaboration opportunities.
            </p>
          </div>

          {/* Success Message */}
          {submitted && (
            <Card className="bg-green-500/10 border border-green-500/20 p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-green-500">Message Sent Successfully!</h3>
                  <p className="text-sm text-green-500/80">We&apos;ll review your submission and get back to you soon.</p>
                </div>
              </div>
            </Card>
          )}

          {/* Contact Form */}
          <Card className="bg-card border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Artist / Project Name *</label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  required
                  placeholder="Your Artist Name or Project Name"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <option value="">Select a subject</option>
                  <option value="distribution">Music Distribution</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="partnership">Partnership</option>
                  <option value="support">Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your music, goals, and why you&apos;d like to work with Zirect Label..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all min-h-32 resize-none"
                />
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  By submitting this form, you agree to be contacted by Zirect Label. We&apos;ll review your submission and respond within 3-5 business days.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={submitted}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11"
              >
                {submitted ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card border-border p-6 text-center">
              <h3 className="font-bold mb-2">Quick Response</h3>
              <p className="text-sm text-muted-foreground">We respond within 3-5 business days</p>
            </Card>
            <Card className="bg-card border-border p-6 text-center">
              <h3 className="font-bold mb-2">No Fees</h3>
              <p className="text-sm text-muted-foreground">No application or review fees</p>
            </Card>
            <Card className="bg-card border-border p-6 text-center">
              <h3 className="font-bold mb-2">Direct Contact</h3>
              <p className="text-sm text-muted-foreground">hello@zirect.com</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
