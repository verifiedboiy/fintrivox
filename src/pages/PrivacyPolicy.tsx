import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12 px-8 text-white text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto">
                        Your privacy is our priority. Learn how we protect and manage your personal data at Fintrivox.
                    </p>
                    <p className="text-sm text-blue-200 mt-6 font-medium">Last Updated: March 2, 2024</p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 space-y-12 text-gray-600 leading-relaxed">
                    {/* Section 1 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                        </div>
                        <p className="mb-4">
                            When you use Fintrivox, we collect information that helps us provide a secure and personalized experience. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Identification:</strong> Name, email address, phone number, and date of birth during registration.</li>
                            <li><strong>KYC Documentation:</strong> Identity documents (ID, passport), proof of address, and facial recognition data to comply with financial regulations.</li>
                            <li><strong>Financial Information:</strong> Transaction history, wallet addresses, and deposit/withdrawal details.</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device info, and usage patterns (cookies).</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">How We Use Your Data</h2>
                        </div>
                        <p className="mb-4">We use your information for the following purposes:</p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-2">Platform Services</h4>
                                <p className="text-sm">To process your investments, manage your portfolio, and facilitate secure transactions.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-2">Regulatory Compliance</h4>
                                <p className="text-sm">To verify your identity and prevent fraudulent activities, money laundering, and unauthorized access.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-2">Support & Comms</h4>
                                <p className="text-sm">To provide customer support, send account notifications, and update you on platform improvements.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="font-semibold text-gray-910 mb-2">Security Monitoring</h4>
                                <p className="text-sm">To monitor for suspicious activity and maintain the integrity of our financial ecosystem.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                        </div>
                        <p className="mb-4">
                            We implement bank-grade security measures to protect your data:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Encryption:</strong> All sensitive data is encrypted using AES-256 and SSL/TLS protocols.</li>
                            <li><strong>2FA:</strong> Mandatory Two-Factor Authentication for sensitive actions and account access.</li>
                            <li><strong>Cold Storage:</strong> The majority of user funds are kept in offline cold wallets for maximum protection.</li>
                            <li><strong>Regular Audits:</strong> Frequent security audits and vulnerability assessments conducted by external firms.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Cookies & Tracking</h2>
                        <p className="text-sm">
                            We use cookies to improve your browsing experience and provide analytics. You can control cookie preferences through your browser settings, though some features may be limited if cookies are disabled.
                        </p>
                    </section>

                    {/* Footer Contact */}
                    <div className="pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 mb-4">Have questions about your privacy?</p>
                        <a
                            href="mailto:support@fintrivox.com"
                            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                        >
                            Contact Privacy Team: support@fintrivox.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
