import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Web3Forms access key - email destination is configured on web3forms.com dashboard
// To set this up: 1) Go to web3forms.com 2) Enter cheryl@omnihaus.co 3) Get the access key
const WEB3FORMS_ACCESS_KEY = '2006286d-5d73-447a-92ee-5d2133792070';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.firstName || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all required fields.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          message: formData.message,
          subject: `Moscow Mix Contact: ${formData.firstName} ${formData.lastName}`,
          from_name: 'Moscow Mix Website'
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-stone-950 text-white">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="font-serif text-5xl mb-6 text-center">Concierge Support</h1>
        <p className="text-stone-400 text-center mb-12">
          Whether you have a question about copper care or need help with a wholesale order, our team is here to assist.
        </p>

        {status === 'success' ? (
          <div className="text-center py-16 px-8 bg-stone-900 border border-green-900/50 rounded-lg">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h2 className="font-serif text-2xl text-white mb-2">Message Sent!</h2>
            <p className="text-stone-400 mb-8">
              Thank you for reaching out. We'll get back to you within 24-48 hours.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-copper-400 hover:text-copper-300 uppercase tracking-widest text-xs font-bold"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && errorMessage && (
              <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-sm">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                  First Name <span className="text-copper-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                Email Address <span className="text-copper-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                Message <span className="text-copper-500">*</span>
              </label>
              <textarea
                rows={5}
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-copper-600 hover:bg-copper-500 disabled:bg-copper-800 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm py-4 transition-colors flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}