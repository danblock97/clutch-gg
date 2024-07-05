// pages/privacy-policy.js

import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0e1015] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <p className="mb-4">Last updated: 5th July 2024</p>

                <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
                <p className="mb-4">
                    Welcome to RiftSpy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using our application, you agree to the collection and use of information in accordance with this policy.
                </p>

                <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
                <p className="mb-4">
                    - <strong>Game Data</strong>: When you use the Riot RSO to log in, we collect your in-game name and tagline to display your League of Legends profile.
                    <br />
                    - <strong>Hosting Data</strong>: Our application is hosted on Vercel, and Vercel may collect additional data as per their own privacy policy.
                </p>

                <h2 className="text-2xl font-semibold mb-2">3. Use of Your Information</h2>
                <p className="mb-4">
                    We use the collected data for the following purposes:
                    <br />
                    - To display your League of Legends profile
                    <br />
                    - To monitor and analyze the use of our service
                    <br />
                    - To detect, prevent, and address technical issues
                </p>

                <h2 className="text-2xl font-semibold mb-2">4. Sharing of Your Information</h2>
                <p className="mb-4">
                    We do not share your personal information with third parties except as described in this Privacy Policy. We may share information with:
                    <br />
                    - Service providers to monitor and analyze the use of our service
                    <br />
                    - Law enforcement if required by law or to respond to legal requests
                </p>

                <h2 className="text-2xl font-semibold mb-2">5. Security of Your Information</h2>
                <p className="mb-4">
                    We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>

                <h2 className="text-2xl font-semibold mb-2">6. Your Data Protection Rights</h2>
                <p className="mb-4">
                    Depending on your location, you may have the following rights:
                    <br />
                    - The right to access, update or delete the information we have on you
                    <br />
                    - The right to rectification
                    <br />
                    - The right to object
                    <br />
                    - The right of restriction
                    <br />
                    - The right to data portability
                    <br />
                    - The right to withdraw consent
                </p>

                <h2 className="text-2xl font-semibold mb-2">7. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </p>

                <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:danblock1997@hotmail.co.uk">here</a>
                </p>
            </div>
        </div>
    );
}
