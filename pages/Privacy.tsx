import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Privacy() {
    return (
        <>
            <SEO
                title="Privacy Policy | Moscow Mix"
                description="Moscow Mix Privacy Policy - Learn how we collect, use, and protect your personal information."
                url="https://www.moscowmix.com/privacy"
            />
            <div className="pt-32 pb-24 min-h-screen bg-stone-950 text-white">
                <div className="max-w-3xl mx-auto px-6">
                    <h1 className="font-serif text-5xl mb-4 text-center">Privacy Policy</h1>
                    <p className="text-stone-500 text-center mb-12">Last updated: January 6, 2026</p>

                    <div className="prose prose-invert prose-stone max-w-none space-y-8">

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Introduction</h2>
                            <p className="text-stone-300 leading-relaxed">
                                Moscow Mix ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.moscowmix.com and purchase our products.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Information We Collect</h2>
                            <h3 className="text-lg text-copper-400 mb-2">Personal Information</h3>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                When you make a purchase or contact us, we may collect:
                            </p>
                            <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                                <li>Name and contact information (email address, phone number)</li>
                                <li>Shipping and billing address</li>
                                <li>Payment information (processed securely through third-party payment processors)</li>
                                <li>Order history and preferences</li>
                            </ul>

                            <h3 className="text-lg text-copper-400 mb-2 mt-6">Automatically Collected Information</h3>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                When you browse our website, we automatically collect:
                            </p>
                            <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                                <li>Device information (browser type, operating system)</li>
                                <li>IP address and general location</li>
                                <li>Pages visited and time spent on our site</li>
                                <li>Referring website or source</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">How We Use Your Information</h2>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                                <li>Process and fulfill your orders</li>
                                <li>Communicate with you about your orders and inquiries</li>
                                <li>Send promotional emails (with your consent)</li>
                                <li>Improve our website and customer experience</li>
                                <li>Prevent fraud and maintain security</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Information Sharing</h2>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                We do not sell your personal information. We may share your information with:
                            </p>
                            <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                                <li>Service providers who help us operate our business (shipping carriers, payment processors)</li>
                                <li>Analytics providers to improve our website</li>
                                <li>Law enforcement when required by law</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Cookies and Tracking</h2>
                            <p className="text-stone-300 leading-relaxed">
                                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings, though some features may not function properly if cookies are disabled.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Data Security</h2>
                            <p className="text-stone-300 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Your Rights</h2>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                Depending on your location, you may have the right to:
                            </p>
                            <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                                <li>Access the personal information we hold about you</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your information</li>
                                <li>Opt out of marketing communications</li>
                                <li>Object to certain processing activities</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Third-Party Links</h2>
                            <p className="text-stone-300 leading-relaxed">
                                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Children's Privacy</h2>
                            <p className="text-stone-300 leading-relaxed">
                                Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Changes to This Policy</h2>
                            <p className="text-stone-300 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Contact Us</h2>
                            <p className="text-stone-300 leading-relaxed">
                                If you have questions about this Privacy Policy or wish to exercise your rights, please{' '}
                                <Link to="/contact" className="text-copper-400 hover:text-copper-300 underline">
                                    contact us through our contact page
                                </Link>.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </>
    );
}
