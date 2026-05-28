'use client';

import { useState } from 'react';
import { Mail, MapPin, Send, Music, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function ContactSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    subject: '',
    message: '',
    demoLink: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.artistName || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.submitContract(formData);
      if (response && (response as any).success) {
        setSuccess(true);
        toast({
          title: 'Success!',
          description: 'Your contract demo request has been submitted successfully.',
        });
        setFormData({
          artistName: '',
          email: '',
          subject: '',
          message: '',
          demoLink: '',
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (err: any) {
      console.error('Failed to submit demo contract:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit contract demo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-32 px-4 relative overflow-hidden bg-background">
      {/* Dynamic light strip */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="max-w-4xl mx-auto glass rounded-2xl p-8 md:p-12 relative z-10 neon-border">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">
            Demo & <span className="gradient-text-cyan">Contracts</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Looking to release your music under our label? Submit your demo below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="glass-card rounded-lg p-6 hover:border-accent/30 transition-colors">
            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-2">Email</h3>
            <p className="text-sm text-muted-foreground">info@zirect.asia</p>
          </div>

          <div className="glass-card rounded-lg p-6 hover:border-accent/30 transition-colors">
            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mb-4">
              <Instagram className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-2">Instagram</h3>
            <p className="text-sm text-muted-foreground">@zirectlabel</p>
          </div>

          <div className="glass-card rounded-lg p-6 hover:border-accent/30 transition-colors">
            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-2">Office</h3>
            <p className="text-sm text-muted-foreground">Asia</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card rounded-lg p-8 sm:p-10 relative overflow-hidden">
          {success ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center mx-auto text-accent">
                <Music className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold">Demo Received!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Thank you for submitting your demo. Our A&R team will review your details and get back to you!
              </p>
              <Button
                variant="outline"
                onClick={() => setSuccess(false)}
                className="mt-4 border-accent/20 hover:border-accent/40 text-foreground hover:bg-accent/5"
              >
                Submit another demo
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name <span className="text-accent">*</span></label>
                  <Input
                    required
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    placeholder="Your Name"
                    className="bg-[rgba(8,20,45,0.5)] border-accent/15 focus:border-accent/40 transition-colors text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address <span className="text-accent">*</span></label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="zirect@example.com"
                    className="bg-[rgba(8,20,45,0.5)] border-accent/15 focus:border-accent/40 transition-colors text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subject / Pitch Title <span className="text-accent">*</span></label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Demo Submission - Progressive House Single"
                  className="bg-[rgba(8,20,45,0.5)] border-accent/15 focus:border-accent/40 transition-colors text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Demo Track Link (SoundCloud, Dropbox, Drive) <span className="text-xs text-muted-foreground">(Optional)</span></label>
                <Input
                  value={formData.demoLink}
                  onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                  placeholder="https://soundcloud.com/user/track-demo"
                  className="bg-[rgba(8,20,45,0.5)] border-accent/15 focus:border-accent/40 transition-colors text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Artist Intro & Pitch Message <span className="text-accent">*</span></label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us a little bit about yourself, your musical journey, and this project..."
                  className="bg-[rgba(8,20,45,0.5)] border-accent/15 focus:border-accent/40 transition-colors min-h-32 resize-none text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-sm group font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Demo Pitch'}
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
