import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = ({ onNavigate }) => {
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

                <h1 className="text-4xl font-black text-gray-900 mb-8">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last Updated: December 6, 2025</p>

                <div className="prose prose-lg prose-purple text-gray-600">
                    <p>
                        Welcome to SpeakLife! These Terms of Service ("Terms") govern your access to and use of the SpeakLife website, mobile application, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
                    </p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By creating an account or using the Service, you agree to comply with and be legally bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                    </p>

                    <h3>2. Community Guidelines</h3>
                    <p>
                        SpeakLife is a community focused on spiritual growth, encouragement, and positivity. We expect all users to respectful and kind.
                    </p>
                    <ul>
                        <li><strong>Be Respectful:</strong> Treat others with kindness and respect. Harassment, hate speech, and bullying are strictly prohibited.</li>
                        <li><strong>No Inappropriate Content:</strong> Do not post content that is offensive, sexually explicit, violent, or otherwise inappropriate.</li>
                        <li><strong>No Spam:</strong> Do not use the Service for unauthorized advertising or spam.</li>
                    </ul>
                    <p>
                        We reserve the right to remove any content that violates these guidelines and to suspend or ban users who repeatedly violate these Terms.
                    </p>

                    <h3>3. User Accounts</h3>
                    <p>
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                    </p>

                    <h3>4. Intellectual Property</h3>
                    <p>
                        The Service and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of SpeakLife and its licensors.
                    </p>

                    <h3>5. Disclaimer of Warranties</h3>
                    <p>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. SpeakLife makes no representations or warranties of any kind, express or implied, regarding the operation of the Service or the information, content, or materials included therein.
                    </p>

                    <h3>6. Limitation of Liability</h3>
                    <p>
                        In no event shall SpeakLife, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>

                    <h3>7. Changes to Terms</h3>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes. By continuing to access or use the Service after those revisions become effective, you agree to be bound by the revised Terms.
                    </p>

                    <h3>8. Contact Us</h3>
                    <p>
                        If you have any questions about these Terms, please contact us at: terms@speaklife.app
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
