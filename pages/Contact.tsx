import React from 'react';

export default function Contact() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-stone-950 text-white">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="font-serif text-5xl mb-6 text-center">Concierge Support</h1>
        <p className="text-stone-400 text-center mb-12">
          Whether you have a question about copper care or need help with a wholesale order, our team is here to assist.
        </p>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">First Name</label>
              <input type="text" className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Last Name</label>
              <input type="text" className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Email Address</label>
            <input type="email" className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-500 font-bold">Message</label>
            <textarea rows={5} className="w-full bg-stone-900 border border-stone-800 p-3 text-white focus:border-copper-500 outline-none transition-colors"></textarea>
          </div>

          <button className="w-full bg-copper-600 hover:bg-copper-500 text-white font-bold uppercase tracking-widest text-sm py-4 transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}