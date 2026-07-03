import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Compass, Send, CheckCircle } from 'lucide-react';

export default function HostelLocation() {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setIsSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      setIsSuccess(false);
    }, 4000);
  };

  const nearbyHubs = [
    { name: 'MNIT Jaipur', distance: '1.2 km', time: '4 mins ride', desc: 'Main engineering university hub.' },
    { name: 'Gopalpura Bypass', distance: '2.5 km', time: '8 mins ride', desc: 'Top IAS, GATE & JEE coaching hubs.' },
    { name: 'Jaipur National University', distance: '4.8 km', time: '12 mins ride', desc: 'Siddharth Nagar campus corridor.' },
    { name: 'Jaipur Airport (Sanganer)', distance: '5.5 km', time: '15 mins drive', desc: 'Easy transit for outstation students.' },
    { name: 'Gaurav Tower (Malviya Nagar)', distance: '1.8 km', time: '5 mins ride', desc: 'Shopping, food, and student hangout.' },
    { name: 'Gandhinagar Railway Station', distance: '3.0 km', time: '10 mins drive', desc: 'Convenient rail transit for weekend trips.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16" id="hostel-location-view">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500 font-bold bg-rose-50 px-3 py-1 rounded-full">Jaipur Campus Directory</span>
        <h2 className="text-3xl font-sans font-extrabold text-gray-900 tracking-tight">Location & Student Transit Map</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Centrally located in Malviya Nagar, Jaipur - the premium institutional corridor of Rajasthan.</p>
      </div>

      {/* Visual map and quick details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mock Map Vector & details */}
        <div className="lg:col-span-7 bg-white border border-rose-50 p-6 rounded-3xl shadow-xs space-y-6">
          <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-rose-50 border border-rose-100/50 shadow-inner flex flex-col justify-between p-6">
            
            {/* Map Decorative Grid background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e11d48_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
            
            {/* Interactive styled landmarks */}
            <div className="relative flex-1">
              {/* Landmark 1: Hostel */}
              <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <div className="bg-rose-500 text-white p-3 rounded-full shadow-lg border-2 border-white animate-bounce inline-block">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="block mt-1.5 text-xs font-bold text-rose-900 bg-white/90 px-2 py-0.5 rounded-md shadow border border-rose-50">
                  Unity Boys Hostel (Main)
                </span>
              </div>

              {/* Landmark 2: MNIT */}
              <div className="absolute top-[20%] left-[25%] text-center">
                <div className="bg-gray-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold shadow-md flex items-center space-x-1">
                  <Compass className="h-3 w-3 text-amber-300" />
                  <span>MNIT Jaipur campus</span>
                </div>
                <div className="h-8 w-0.5 border-l-2 border-dashed border-gray-400 mx-auto mt-0.5" />
              </div>

              {/* Landmark 3: Gopalpura Coaching Hub */}
              <div className="absolute bottom-[15%] left-[15%] text-center">
                <div className="bg-gray-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold shadow-md flex items-center space-x-1">
                  <Compass className="h-3 w-3 text-amber-300" />
                  <span>Gopalpura Bypass (Coaching Hub)</span>
                </div>
              </div>

              {/* Landmark 4: GT Mall */}
              <div className="absolute top-[30%] right-[15%] text-center">
                <div className="bg-gray-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold shadow-md flex items-center space-x-1">
                  <Compass className="h-3 w-3 text-amber-300" />
                  <span>Gaurav Tower (GT) Mall</span>
                </div>
              </div>
            </div>

            {/* Bottom map overlay */}
            <div className="relative bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div>
                <p className="font-bold text-gray-900 flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span>Sector 4, Malviya Nagar, Jaipur, Rajasthan 302017</span>
                </p>
                <p className="text-gray-500 mt-0.5">Behind Jaipur National Engineering College Corridor.</p>
              </div>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-lg font-semibold transition whitespace-nowrap self-stretch sm:self-auto text-center"
              >
                Open Google Maps
              </a>
            </div>
          </div>

          {/* Quick contact values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-rose-50">
            <div className="space-y-1">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold block">Admissions Helpline</span>
              <p className="font-semibold text-gray-900 text-sm flex items-center space-x-1">
                <Phone className="h-4 w-4 text-rose-500" />
                <span>+91 99887 76655</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold block">Official Email</span>
              <p className="font-semibold text-gray-900 text-sm flex items-center space-x-1">
                <Mail className="h-4 w-4 text-rose-500" />
                <span>admissions@unityhostel.com</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold block">Office Timings</span>
              <p className="font-semibold text-gray-900 text-sm flex items-center space-x-1">
                <Clock className="h-4 w-4 text-rose-500" />
                <span>Daily 9:00 AM - 7:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-5 bg-white border border-rose-50 p-8 rounded-3xl shadow-xs space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-sans font-bold text-gray-900">Direct Contact Desk</h3>
            <p className="text-xs text-gray-500">Have a custom query regarding pure-vegetarian diet limits, AC cooling bills, or room swapping? Drop your query here.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">Your Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Rajan Goel (Parent)" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">Your Email Address *</label>
              <input 
                type="email" 
                placeholder="e.g. rajan.goel@gmail.com" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">Subject (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Diet customization for lactose intolerance" 
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 block">Detailed Message *</label>
              <textarea 
                rows={4}
                placeholder="Write your details or special requests here..." 
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
              />
            </div>

            {isSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
                <span>Contact form received! Our team will call you back shortly.</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={!contactName || !contactEmail || !contactMessage}
              className={`w-full py-3 rounded-xl font-semibold text-xs transition shadow-md flex items-center justify-center space-x-2 cursor-pointer ${
                contactName && contactEmail && contactMessage 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>

      {/* Campus Proximity Guide */}
      <section className="bg-rose-50/40 rounded-3xl p-8 sm:p-12 border border-rose-100 space-y-8">
        <div className="text-center space-y-2">
          <ShieldCheck className="h-8 w-8 text-rose-500 mx-auto" />
          <h3 className="text-2xl font-sans font-bold text-gray-900 tracking-tight">Jaipur Transit & Proximity Index</h3>
          <p className="text-gray-500 max-w-2xl mx-auto">Unity Boys Hostel sits perfectly in Jaipur's best connected neighborhood, giving students extremely short travel times.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyHubs.map((hub, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-rose-100/50 space-y-2 shadow-xs hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-gray-900">{hub.name}</h4>
                <span className="bg-rose-50 text-rose-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">{hub.distance}</span>
              </div>
              <p className="text-xs font-semibold text-amber-600">{hub.time}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{hub.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
