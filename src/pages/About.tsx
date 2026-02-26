import { TrendingUp, Shield, Users, Globe, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your assets are protected with bank-grade security and encryption.',
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'We put our customers first with 24/7 support and transparent pricing.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access global markets and investment opportunities from anywhere.',
    },
    {
      icon: Award,
      title: 'Regulated Platform',
      description: 'Fully licensed and compliant with international regulations.',
    },
  ];

  const stats = [
    { value: '$2.5B+', label: 'Assets Under Management' },
    { value: '150K+', label: 'Active Investors' },
    { value: '50+', label: 'Global Markets' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About Fintrivox
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Empowering investors worldwide with secure, transparent, and innovative investment solutions since 2020.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Fintrivox, we believe that everyone should have access to professional-grade investment tools and opportunities. Our mission is to democratize investing by providing a secure, transparent, and user-friendly platform.
              </p>
              <p className="text-lg text-gray-600">
                Whether you are a beginner or an experienced investor, we provide the tools, insights, and support you need to achieve your financial goals.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-12 flex items-center justify-center">
              <TrendingUp className="w-32 h-32 text-blue-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Legal Information</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Regulatory Compliance</h3>
                <p className="text-gray-600">
                  Fintrivox is registered with and regulated by the Financial Conduct Authority (FCA) and complies with all applicable laws and regulations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Data Protection</h3>
                <p className="text-gray-600">
                  We are GDPR compliant and take your privacy seriously. Your data is encrypted and stored securely.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Risk Disclosure</h3>
                <p className="text-gray-600">
                  All investments carry risk. Please read our full risk disclosure before investing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
