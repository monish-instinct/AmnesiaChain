import { motion } from 'framer-motion';
import { MessageCircle, Github, Twitter, Mail, Users, FileText, Code, Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GetInvolved = () => {
  const communityLinks = [
    {
      icon: MessageCircle,
      title: 'Discord',
      description: 'Join our active community for real-time discussions and support',
      link: '#',
      color: 'neon-blue',
      members: '5,000+'
    },
    {
      icon: Github,
      title: 'GitHub',
      description: 'Contribute to open-source development and report issues',
      link: '#',
      color: 'neon-purple',
      members: '1,200+'
    },
    {
      icon: Twitter,
      title: 'Twitter/X',
      description: 'Follow updates, announcements, and ecosystem news',
      link: '#',
      color: 'neon-cyan',
      members: '15K+'
    },
    {
      icon: Mail,
      title: 'Newsletter',
      description: 'Get weekly updates and exclusive insights delivered to your inbox',
      link: '#',
      color: 'neon-green',
      members: '3,000+'
    }
  ];

  const waysToengage = [
    {
      icon: Code,
      title: 'Developers',
      description: 'Build on our testnet, contribute code, create tools and integrations',
      action: 'Start Building'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join discussions, provide feedback, help newcomers learn',
      action: 'Join Community'
    },
    {
      icon: FileText,
      title: 'Researchers',
      description: 'Contribute to research, write papers, explore new possibilities',
      action: 'Research Hub'
    },
    {
      icon: Megaphone,
      title: 'Evangelists',
      description: 'Spread awareness, create content, organize events and meetups',
      action: 'Become Ambassador'
    }
  ];

  return (
    <section id="get-involved" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            Get <span className="bg-gradient-primary bg-clip-text text-transparent">Involved</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Join our growing community and help shape the future of cognitive blockchain technology
          </motion.p>
        </div>

        {/* Community Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {communityLinks.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-blue/30 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-4 rounded-full bg-${link.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <link.icon className={`h-8 w-8 text-${link.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 font-inter">
                    {link.title}
                  </h3>
                  <p className="text-muted-foreground font-inter text-sm mb-4 leading-relaxed">
                    {link.description}
                  </p>
                  <div className={`text-${link.color} font-semibold text-sm font-mono`}>
                    {link.members} members
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Ways to Engage */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center text-foreground mb-8 font-inter">
            Ways to Contribute
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {waysToengage.map((way, index) => (
              <Card key={index} className="bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-green/30 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-3 rounded-full bg-neon-green/10 mb-4">
                    <way.icon className="h-6 w-6 text-neon-green" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2 font-inter">
                    {way.title}
                  </h4>
                  <p className="text-muted-foreground font-inter text-sm mb-4">
                    {way.description}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-neon-green text-neon-green hover:bg-neon-green/10 font-inter"
                  >
                    {way.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-primary/5 border-neon-blue/20 shadow-neon-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4 font-inter">
                Stay Updated
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto font-inter">
                Be the first to know about testnet launches, partnership announcements, 
                and major milestones in our development journey.
              </p>
              
              <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-glass-border focus:border-neon-blue/50 focus:outline-none font-inter"
                  />
                </div>
                <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-inter font-semibold px-6 py-2">
                  Subscribe
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4 font-inter">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-6 font-inter">
            Questions? We're here to help
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              className="border-neon-purple text-neon-purple hover:bg-neon-purple/10 font-inter"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-inter"
            >
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GetInvolved;