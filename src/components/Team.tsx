import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Team = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Founder & CEO',
      bio: 'Former blockchain researcher at MIT with 10+ years in distributed systems and cognitive computing.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b588?w=400&h=400&fit=crop&crop=face',
      links: {
        linkedin: '#',
        github: '#',
        email: 'sarah@amnesiachain.com'
      }
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack blockchain developer and former senior engineer at Ethereum Foundation.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      links: {
        linkedin: '#',
        github: '#',
        email: 'marcus@amnesiachain.com'
      }
    },
    {
      name: 'Dr. Aisha Patel',
      role: 'Head of Research',
      bio: 'AI/ML expert specializing in neural networks and adaptive algorithms for distributed systems.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      links: {
        linkedin: '#',
        github: '#',
        email: 'aisha@amnesiachain.com'
      }
    },
    {
      name: 'James Thompson',
      role: 'Lead Developer',
      bio: 'Smart contract architect with expertise in Solidity and decentralized application development.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      links: {
        linkedin: '#',
        github: '#',
        email: 'james@amnesiachain.com'
      }
    }
  ];

  const advisors = [
    {
      name: 'Prof. Michael Kim',
      role: 'Technical Advisor',
      company: 'Stanford University'
    },
    {
      name: 'Lisa Zhang',
      role: 'Business Advisor',
      company: 'Former VP at Coinbase'
    },
    {
      name: 'Dr. Roberto Silva',
      role: 'Research Advisor',
      company: 'IBM Research'
    }
  ];

  return (
    <section id="team" className="py-24 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-inter mb-6"
          >
            Meet the <span className="bg-gradient-accent bg-clip-text text-transparent">Team</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter"
          >
            Experienced professionals driving the future of cognitive blockchain technology
          </motion.p>
        </div>

        {/* Core Team */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card-glass backdrop-blur-sm border-glass-border hover:border-neon-blue/30 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-neon-blue/20 group-hover:border-neon-blue/50 transition-colors duration-300"
                    />
                    <div className="absolute inset-0 w-24 h-24 rounded-full mx-auto bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </div>

                  {/* Info */}
                  <h3 className="text-xl font-bold text-foreground mb-2 font-inter">
                    {member.name}
                  </h3>
                  <div className="text-neon-blue font-semibold mb-4 font-inter text-sm">
                    {member.role}
                  </div>
                  <p className="text-muted-foreground font-inter text-sm mb-6 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 hover:text-neon-blue"
                      asChild
                    >
                      <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 hover:text-neon-purple"
                      asChild
                    >
                      <a href={member.links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 hover:text-neon-green"
                      asChild
                    >
                      <a href={`mailto:${member.links.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Advisors */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-secondary/5 border-neon-purple/20 shadow-glass">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-foreground mb-8 font-inter">
                Advisory Board
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {advisors.map((advisor, index) => (
                  <div key={index} className="text-center p-6 rounded-lg bg-background/50 border border-glass-border">
                    <h4 className="font-semibold text-foreground mb-2 font-inter">
                      {advisor.name}
                    </h4>
                    <div className="text-neon-purple text-sm font-inter mb-1">
                      {advisor.role}
                    </div>
                    <div className="text-muted-foreground text-sm font-inter">
                      {advisor.company}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Join Team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-primary/10 border border-neon-blue/20">
            <h3 className="text-2xl font-bold text-foreground mb-4 font-inter">
              Join Our Team
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-xl font-inter">
              We're always looking for talented individuals passionate about revolutionizing blockchain technology.
            </p>
            <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-inter font-semibold px-6 py-2">
              View Open Positions
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Team;