import { motion } from 'framer-motion';
import { Github, Twitter, MessageCircle, Mail, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    product: [
      { name: 'About', href: '#about' },
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Advantages', href: '#advantages' }
    ],
    development: [
      { name: 'Roadmap', href: '#roadmap' },
      { name: 'Documentation', href: '#' },
      { name: 'GitHub', href: '#' },
      { name: 'Testnet', href: '#' }
    ],
    community: [
      { name: 'Discord', href: '#' },
      { name: 'Twitter/X', href: '#' },
      { name: 'Newsletter', href: '#' },
      { name: 'Blog', href: '#' }
    ],
    company: [
      { name: 'Team', href: '#team' },
      { name: 'Careers', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter/X' },
    { icon: MessageCircle, href: '#', label: 'Discord' },
    { icon: Mail, href: 'mailto:contact@amnesiachain.com', label: 'Email' }
  ];

  return (
    <footer className="bg-background border-t border-glass-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">A</span>
                </div>
                <span className="font-inter font-bold text-xl text-foreground">AmnesiaChain</span>
              </div>
              <p className="text-muted-foreground font-inter text-sm mb-6 leading-relaxed">
                The first cognitive blockchain that learns and forgets, solving storage bloat through intelligent memory management.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-9 h-9 p-0 hover:text-neon-blue transition-colors duration-200"
                    asChild
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                      <social.icon className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Product */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-foreground mb-4 font-inter">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-inter text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Development */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-foreground mb-4 font-inter">Development</h3>
              <ul className="space-y-2">
                {footerLinks.development.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-inter text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Community */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-foreground mb-4 font-inter">Community</h3>
              <ul className="space-y-2">
                {footerLinks.community.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-inter text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-foreground mb-4 font-inter">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-inter text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-glass-border pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground font-inter text-sm mb-4 md:mb-0">
              © 2024 AmnesiaChain. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-inter text-sm"
              >
                Privacy Policy
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-inter text-sm"
              >
                Terms of Service
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="ml-4 w-8 h-8 p-0 hover:text-neon-blue transition-colors duration-200"
                aria-label="Scroll to top"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-primary"></div>
    </footer>
  );
};

export default Footer;