'use client';

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContactSection() {
  return (
    <section id="contact" className="py-20 sm:py-32 px-4">
      <div className="max-w-4xl mx-auto bg-gradient-overlay rounded-2xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground">
            Want to collaborate? Have questions? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="card-overlay border border-border/30 rounded-lg p-6 hover:border-accent/40 transition-colors">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-2">Email</h3>
            <p className="text-sm text-muted-foreground">hello@zirect.com</p>
          </div>

          <div className="card-overlay border border-border/30 rounded-lg p-6 hover:border-accent/40 transition-colors">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-2">Phone</h3>
            <p className="text-sm text-muted-foreground">+84 (123) 456-789</p>
          </div>

          <div className="card-overlay border border-border/30 rounded-lg p-6 hover:border-accent/40 transition-colors">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-2">Location</h3>
            <p className="text-sm text-muted-foreground">Ho Chi Minh City, Vietnam</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card-overlay border border-border/30 rounded-lg p-8 sm:p-10">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <Input placeholder="John Doe" className="bg-slate-800/50 border-border/30" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input type="email" placeholder="john@example.com" className="bg-slate-800/50 border-border/30" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input placeholder="How can we help?" className="bg-slate-800/50 border-border/30" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Tell us more about your project..."
                className="bg-slate-800/50 border-border/30 min-h-32 resize-none"
              />
            </div>

            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 group">
              Send Message
              <Send className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
