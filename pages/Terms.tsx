import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Terms() {
    return (
        <>
            <SEO
                title="Terms of Service | Moscow Mix"
                description="Moscow Mix Terms of Service - Read the terms and conditions for using our website and purchasing our products."
                url="https://www.moscowmix.com/terms"
            />
            <div className="pt-32 pb-24 min-h-screen bg-stone-950 text-white">
                <div className="max-w-3xl mx-auto px-6">
                    <h1 className="font-serif text-5xl mb-4 text-center">Terms of Service</h1>
                    <p className="text-stone-500 text-center mb-12">Last updated: January 6, 2026</p>

                    <div className="prose prose-invert prose-stone max-w-none space-y-8">

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Agreement to Terms</h2>
                            <p className="text-stone-300 leading-relaxed">
                                By accessing or using the Moscow Mix website (www.moscowmix.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or purchase our products.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Use of Our Website</h2>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                You agree to use our website only for lawful purposes and in accordance with these Terms. You agree not to:
                            </p>
                            <ul className="list-disc list-inside text-stone-300 space-y-2 ml-4">
                                <li>Use the website in any way that violates applicable laws or regulations</li>
                                <li>Attempt to gain unauthorized access to our systems or networks</li>
                                <li>Use automated systems (bots, scrapers) without our permission</li>
                                <li>Transmit viruses, malware, or other harmful code</li>
                                <li>Interfere with the proper functioning of the website</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Products and Orders</h2>
                            <h3 className="text-lg text-copper-400 mb-2">Product Descriptions</h3>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                We strive to accurately describe our products. However, we do not warrant that product descriptions, images, pricing, or other content is accurate, complete, or error-free. Colors may vary slightly due to monitor settings.
                            </p>

                            <h3 className="text-lg text-copper-400 mb-2 mt-6">Pricing</h3>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                All prices are in US dollars and are subject to change without notice. We reserve the right to correct pricing errors. If an item is listed at an incorrect price, we will notify you and either cancel your order or offer you the correct price.
                            </p>

                            <h3 className="text-lg text-copper-400 mb-2 mt-6">Order Acceptance</h3>
                            <p className="text-stone-300 leading-relaxed">
                                Your order is an offer to purchase. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraud.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Shipping and Delivery</h2>
                            <p className="text-stone-300 leading-relaxed">
                                Shipping times are estimates and not guaranteed. We are not responsible for delays caused by carriers, customs, weather, or other factors beyond our control. Risk of loss and title pass to you upon delivery to the carrier.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Returns and Refunds</h2>
                            <p className="text-stone-300 leading-relaxed mb-4">
                                We offer a 30-day return policy for unused items in original packaging. To initiate a return, please{' '}
                                <Link to="/contact" className="text-copper-400 hover:text-copper-300 underline">
                                    contact us
                                </Link>
                                . Refunds will be processed within 5-10 business days after we receive the returned item.
                            </p>
                            <p className="text-stone-300 leading-relaxed">
                                Custom or personalized items are not eligible for return. Damaged items must be reported within 48 hours of delivery with photos.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Intellectual Property</h2>
                            <p className="text-stone-300 leading-relaxed">
                                All content on this website, including text, graphics, logos, images, and software, is the property of Moscow Mix or its content suppliers and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">User Content</h2>
                            <p className="text-stone-300 leading-relaxed">
                                If you submit reviews, comments, or other content, you grant us a non-exclusive, royalty-free license to use, reproduce, and display that content. You represent that you own or have the right to submit any content you provide.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Disclaimer of Warranties</h2>
                            <p className="text-stone-300 leading-relaxed">
                                OUR WEBSITE AND PRODUCTS ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not guarantee that our website will be uninterrupted, error-free, or secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Limitation of Liability</h2>
                            <p className="text-stone-300 leading-relaxed">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOSCOW MIX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR WEBSITE OR PRODUCTS. Our total liability shall not exceed the amount you paid for the product in question.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Indemnification</h2>
                            <p className="text-stone-300 leading-relaxed">
                                You agree to indemnify and hold harmless Moscow Mix and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our website or violation of these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Governing Law</h2>
                            <p className="text-stone-300 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Changes to Terms</h2>
                            <p className="text-stone-300 leading-relaxed">
                                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the website after changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Severability</h2>
                            <p className="text-stone-300 leading-relaxed">
                                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl text-white mb-4">Contact Us</h2>
                            <p className="text-stone-300 leading-relaxed">
                                If you have questions about these Terms of Service, please{' '}
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
