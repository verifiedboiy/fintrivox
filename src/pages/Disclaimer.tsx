import { AlertTriangle, TrendingUp, Shield, BarChart3, Globe, Lock } from 'lucide-react';

export default function RiskDisclaimer() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-amber-600 to-orange-700 py-12 px-8 text-white text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Risk Disclosure & Disclaimer</h1>
                    <p className="text-amber-100 max-w-2xl mx-auto">
                        Please read this financial risk disclosure carefully before using the Fintrivox platform.
                    </p>
                    <p className="text-sm text-amber-200 mt-6 font-medium">Last Updated: March 4, 2026</p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 space-y-12 text-gray-600 leading-relaxed">
                    {/* Section 1: General Risk */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">General Investment Risk</h2>
                        </div>
                        <p className="mb-4">
                            Trading and investing in financial markets, including but not limited to cryptocurrencies, stocks, forex, and commodities, involves a high level of risk and may not be suitable for all investors. Before deciding to trade or invest, you should carefully consider your investment objectives, level of experience, and risk appetite.
                        </p>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 font-medium">
                            You should never invest money that you cannot afford to lose. There is a possibility that you could sustain a loss of some or all of your initial investment.
                        </div>
                    </section>

                    {/* Section 2: Specific Markets */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Market Volatility</h2>
                        </div>
                        <p className="mb-4">
                            Financial markets are subject to high volatility. The prices of assets can change rapidly and unexpectedly due to various factors, including global economic events, political changes, and market sentiment.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Cryptocurrency Risk:</strong> Digital assets are highly speculative and can experience extreme price fluctuations in short periods.</li>
                            <li><strong>Forex Risk:</strong> Currency trading involves significant leverage risks which can work for you as well as against you.</li>
                            <li><strong>Stock Market Risk:</strong> Equity investments are subject to company-specific risks and broader economic cycles.</li>
                        </ul>
                    </section>

                    {/* Section 3: No Financial Advice */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">No Financial Advice</h2>
                        </div>
                        <p>
                            The information provided by Fintrivox, including market data, educational content, and automated profit calculations, is for informational purposes only. Fintrivox does NOT provide financial, legal, tax, or investment advice. Any decisions made based on information on our platform are the sole responsibility of the user. We recommend consulting with a qualified professional financial advisor before making any financial commitments.
                        </p>
                    </section>

                    {/* Section 4: Platform Usage */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Platform Liability</h2>
                        </div>
                        <p>
                            Fintrivox strives to maintain the accuracy and availability of its platform; however, we are not liable for any losses resulting from technical errors, system downtime, market data inaccuracies, or unauthorized access to user accounts. Users are responsible for maintaining the security of their own credentials and wallet addresses.
                        </p>
                    </section>

                    {/* Section 5: Past Performance */}
                    <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Past Performance Disclosure</h2>
                        <p className="italic">
                            "Past performance is not indicative of future results. Any historical returns, expected returns, or probability projections may not reflect actual future performance."
                        </p>
                    </section>

                    {/* Footer Contact */}
                    <div className="pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 mb-4">Questions regarding our risk policies?</p>
                        <a
                            href="mailto:support@fintrivox.com"
                            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                        >
                            Contact Compliance: support@fintrivox.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
