import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Lock,
  Headphones,
  ChevronRight,
  Star,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// TradingView Widget Component
function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
        { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
        { proName: 'COMEX:GC1!', title: 'Gold' },
        { proName: 'NYMEX:CL1!', title: 'Crude Oil' },
      ],
      showSymbolLogo: true,
      colorTheme: 'light',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en'
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return <div ref={containerRef} className="tradingview-widget-container" />;
}

// Market Overview Widget
function MarketOverviewWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'light',
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: '100%',
      height: '100%',
      plotLineColorGrowing: '#2962FF',
      plotLineColorFalling: '#2962FF',
      gridLineColor: 'rgba(42, 46, 57, 0.06)',
      scaleFontColor: '#787B86',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      tabs: [
        {
          title: 'Indices',
          symbols: [
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
            { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100' },
            { s: 'FOREXCOM:DJI', d: 'Dow Jones' },
            { s: 'INDEX:NKY', d: 'Nikkei 225' },
            { s: 'INDEX:DEU40', d: 'DAX' },
            { s: 'FOREXCOM:UKXGBP', d: 'FTSE 100' },
          ],
          originalTitle: 'Indices'
        },
        {
          title: 'Crypto',
          symbols: [
            { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
            { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
            { s: 'BINANCE:SOLUSD', d: 'Solana' },
            { s: 'BINANCE:BNBUSD', d: 'BNB' },
            { s: 'BINANCE:ADAUSD', d: 'Cardano' },
            { s: 'BINANCE:DOTUSD', d: 'Polkadot' },
          ],
          originalTitle: 'Crypto'
        },
        {
          title: 'Forex',
          symbols: [
            { s: 'FX:EURUSD', d: 'EUR/USD' },
            { s: 'FX:GBPUSD', d: 'GBP/USD' },
            { s: 'FX:USDJPY', d: 'USD/JPY' },
            { s: 'FX:USDCHF', d: 'USD/CHF' },
            { s: 'FX:AUDUSD', d: 'AUD/USD' },
            { s: 'FX:USDCAD', d: 'USD/CAD' },
          ],
          originalTitle: 'Forex'
        }
      ]
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return <div ref={containerRef} className="tradingview-widget-container h-[400px]" />;
}

export default function Home() {
  const stats = [
    { value: '$2.5B+', label: 'Assets Under Management' },
    { value: '150K+', label: 'Active Investors' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Customer Support' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Smart Investing',
      description: 'AI-powered portfolio management with personalized investment strategies tailored to your goals.',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: '256-bit encryption, cold storage for crypto assets, and multi-factor authentication.',
    },
    {
      icon: Zap,
      title: 'Instant Execution',
      description: 'Lightning-fast trade execution with real-time market data and zero latency.',
    },
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Access to 50+ global markets including stocks, crypto, forex, and commodities.',
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Dedicated account managers and 24/7 customer support in multiple languages.',
    },
    {
      icon: Award,
      title: 'Regulated Platform',
      description: 'Fully licensed and regulated by top-tier financial authorities worldwide.',
    },
  ];

  const investmentPlans = [
    {
      name: 'Starter',
      minDeposit: '$100',
      returns: '0.5% Daily',
      duration: '28 Days',
      features: ['Daily Profit', 'Capital Protection', 'Instant Withdrawal'],
      color: 'from-green-500 to-emerald-600',
      popular: false,
    },
    {
      name: 'Growth',
      minDeposit: '$1,000',
      returns: '0.8% Daily',
      duration: '28 Days',
      features: ['Higher Returns', 'Portfolio Management', 'Priority Support'],
      color: 'from-blue-500 to-indigo-600',
      popular: true,
    },
    {
      name: 'Elite',
      minDeposit: '$10,000',
      returns: '1.5% Daily',
      duration: '28 Days',
      features: ['Maximum Returns', 'Dedicated Manager', 'VIP Events'],
      color: 'from-amber-500 to-orange-600',
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      content: 'Fintrivox transformed my approach to investing. The platform is intuitive and the returns have been consistently impressive.',
      rating: 5,
    },
    {
      name: 'Sarah Williams',
      role: 'Business Owner',
      content: 'The security features give me peace of mind. I have been investing for 2 years and the experience has been exceptional.',
      rating: 5,
    },
    {
      name: 'David Thompson',
      role: 'Financial Analyst',
      content: 'As someone who understands markets, I appreciate the transparency and professional approach of Fintrivox.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Live Market Ticker */}
      <div className="bg-gray-50 border-b border-gray-200">
        <TradingViewWidget />
      </div>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 opacity-70" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5">
                <Star className="w-3 h-3 mr-1 fill-blue-700" />
                Trusted by 150,000+ Investors Worldwide
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Grow Your Wealth with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Smart Investing
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join the leading investment platform with low fees, advanced trading tools,
                and expert guidance. Start building your financial future today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Start Investing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button size="lg" variant="outline" className="border-gray-300">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-gray-600">Regulated</span>
                </div>
              </div>
            </div>

            {/* Market Overview */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Live Market Overview
                  </h3>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                    Live
                  </Badge>
                </div>
                <MarketOverviewWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Fintrivox?
            </h2>
            <p className="text-lg text-gray-600">
              We combine cutting-edge technology with expert financial guidance to deliver
              an unparalleled investment experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Investment Plans
            </h2>
            <p className="text-lg text-gray-600">
              Choose from our range of carefully crafted investment plans designed to
              meet your financial goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {investmentPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : 'bg-white shadow-lg'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className={`p-8 ${plan.popular ? 'pt-14' : ''}`}>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{plan.returns}</div>
                  <div className="text-gray-500 mb-6">{plan.duration}</div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    Min. Deposit: <span className="font-semibold text-gray-900">{plan.minDeposit}</span>
                  </div>

                  <Link to="/register">
                    <Button
                      className={`w-full ${plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                    >
                      Get Started
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Investors Say
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of satisfied investors who have transformed their financial future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Create your account in minutes and start building your wealth with Fintrivox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/support">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Headphones className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
