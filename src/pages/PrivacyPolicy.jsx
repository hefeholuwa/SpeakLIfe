import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-[#FDFCF8] font-sans text-gray-800">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </button>

                <h1 className="text-4xl font-black text-gray-900 mb-8">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last Updated: December 6, 2025</p>

                <div className="prose prose-lg prose-purple text-gray-600">
                    <p>
                        At SpeakLife, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website and use our mobile application.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application (such as posting in forums or entering competitions, contests or giveaways) or otherwise when you contact us.
                    </p>
                    <ul>
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information that you voluntarily give to us when you register.</li>
                        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the application.</li>
                    </ul>

                    <h3>2. Use of Your Information</h3>
                    <p>
                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:
                    </p>
                    <ul>
                        <li>Create and manage your account.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the application.</li>
                        <li>Generate a personal profile about you to make future visits to the application more personalized.</li>
                        <li>Monitor and analyze usage and trends to improve your experience with the application.</li>
                    </ul>

                    <h3>3. Disclosure of Your Information</h3>
                    <p>
                        We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                    </p>
                    <ul>
                        <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                    </ul>

                    <h3>4. Security of Your Information</h3>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>

                    <h3>5. Contact Us</h3>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact us at: support@speaklife.app
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
