// pages/terms-of-service.js

import React from 'react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0e1015] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
                <p className="mb-4">Last updated: 5th July 2024</p>

                <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing and using Clutch ("the Application"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Application.
                </p>

                <h2 className="text-2xl font-semibold mb-2">2. Use of the Application</h2>
                <p className="mb-4">
                    You agree to use the Application only for lawful purposes and in accordance with these Terms. You are responsible for your use of the Application and for any content you post.
                </p>

                <h2 className="text-2xl font-semibold mb-2">3. User Accounts</h2>
                <p className="mb-4">
                    To access certain features of the Application, you may need to log in using the Riot RSO. You agree to provide accurate and complete information during the login process.
                </p>

                <h2 className="text-2xl font-semibold mb-2">4. Prohibited Activities</h2>
                <p className="mb-4">
                    You agree not to engage in any of the following prohibited activities:
                    <br />
                    - Violating any applicable laws or regulations
                    <br />
                    - Posting any harmful, false, or misleading content
                    <br />
                    - Interfering with the operation of the Application
                    <br />
                    - Attempting to gain unauthorized access to any part of the Application
                </p>

                <h2 className="text-2xl font-semibold mb-2">5. Changes to These Terms</h2>
                <p className="mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>

                <h2 className="text-2xl font-semibold mb-2">10. Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about these Terms, please contact us at: [Your Contact Information]
                </p>
            </div>
        </div>
    );
}
