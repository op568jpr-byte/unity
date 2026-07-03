import React from 'react';
import { Utensils, Clock, Coffee, Sun, Moon, Calendar, Sparkles } from 'lucide-react';
import { HostelSettings, MessMenu } from '../types';

interface MessMenuSectionProps {
  settings: HostelSettings;
}

const DEFAULT_MENU_FALLBACK: MessMenu = {
  timings: {
    breakfast: '8.00 AM TO 9.00 AM',
    lunch: '11.30 AM TO 1.30 PM',
    dinner: '7.30 PM TO 9.00 PM'
  },
  compulsory: {
    lunch: 'सादा रोटी, सिजनेबल सब्जी',
    dinner: 'सादा रोटी'
  },
  days: {
    Monday: { breakfast: 'प्याज पराठा 2 पिस', lunch: 'मिक्स दाल', dinner: 'सेव टमाटर, दाल, जीरा राईस' },
    Tuesday: { breakfast: 'नमकीन चावल', lunch: 'चने की दाल', dinner: 'कढ़ी, जीरा आलू, राईस' },
    Wednesday: { breakfast: 'आलु पराठा 2 पिस', lunch: 'मसूर की दाल', dinner: 'चोलाई, जीरा राईस' },
    Thursday: { breakfast: 'पास्ता', lunch: 'मुंग की दाल', dinner: 'आलू छोला, राईस' },
    Friday: { breakfast: 'दलिया उपमा', lunch: 'अरहर की दाल', dinner: 'राजमा, राईस' },
    Saturday: { breakfast: 'पोहा', lunch: 'मिक्स दाल', dinner: 'बेसन गटा, जीरा राईस' },
    Sunday: { breakfast: 'चाय', lunch: 'तुर दाल', dinner: 'सण्डे स्पेशल' }
  },
  sundaySpecialNote: 'Sunday स्पेशल में बनने वाला भोजन - पनीर, छोले कुलचे, पूरी, छोले भटूरे, सेवैया खीर, सूजी हलवा, चावल खीर'
};

const DAYS_ORDER: Array<keyof MessMenu['days']> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function MessMenuSection({ settings }: MessMenuSectionProps) {
  const menu: MessMenu = settings.messMenu && typeof settings.messMenu === 'object' && settings.messMenu.days
    ? settings.messMenu
    : DEFAULT_MENU_FALLBACK;

  return (
    <section 
      id="mess-section" 
      className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-50/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-black uppercase tracking-wider mb-4">
            <Utensils className="w-3.5 h-3.5" />
            <span>मैस मेनू (Weekly Mess Menu)</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Delicious & Hygienic Meals
          </h2>
          <p className="text-gray-600 font-medium">
            Take a look at our daily menu designed for student health and comfort, made with fresh quality ingredients.
          </p>
        </div>

        {/* Timings & Compulsories Bento Grid Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Timing Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#D4AF37]">
                <Clock className="w-5 h-5 shrink-0" />
                <h4 className="font-extrabold text-gray-900 tracking-tight">Mess Timings (समय सारणी)</h4>
              </div>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                  <span className="text-gray-500 font-bold flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-500" /> Breakfast
                  </span>
                  <span className="font-black text-gray-800">{menu.timings.breakfast}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                  <span className="text-gray-500 font-bold flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-orange-500" /> Lunch
                  </span>
                  <span className="font-black text-gray-800">{menu.timings.lunch}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-500" /> Dinner
                  </span>
                  <span className="font-black text-gray-800">{menu.timings.dinner}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Standards Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <Sparkles className="w-5 h-5 shrink-0" />
              <h4 className="font-extrabold text-gray-900 tracking-tight">Daily Compulsory Inclusions (दैनिक आहार)</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-amber-50/40 border border-amber-100/50 rounded-2xl p-4.5">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">Standard Lunch</span>
                <p className="text-gray-800 font-bold text-sm leading-relaxed">{menu.compulsory.lunch}</p>
              </div>
              <div className="bg-orange-50/40 border border-orange-100/50 rounded-2xl p-4.5">
                <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest block mb-1">Standard Dinner</span>
                <p className="text-gray-800 font-bold text-sm leading-relaxed">{menu.compulsory.dinner}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Days Scrollable Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {DAYS_ORDER.map((day) => {
            const isSunday = day === 'Sunday';
            const items = menu.days[day] || { breakfast: '-', lunch: '-', dinner: '-' };

            return (
              <div 
                key={day}
                className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  isSunday 
                    ? 'bg-amber-500/5 border-amber-300 shadow-md shadow-amber-500/5 scale-[1.01]' 
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100/70 pb-2.5">
                    <span className={`text-sm font-black tracking-tight ${isSunday ? 'text-amber-700' : 'text-gray-900'}`}>
                      {day}
                    </span>
                    <Calendar className={`w-4 h-4 ${isSunday ? 'text-amber-500' : 'text-gray-400'}`} />
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[9px] font-black text-amber-600 block uppercase tracking-wider mb-0.5">🍳 Breakfast</span>
                      <p className="text-gray-800 font-semibold line-clamp-2">{items.breakfast}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-orange-600 block uppercase tracking-wider mb-0.5">🥗 Lunch Side</span>
                      <p className="text-gray-800 font-semibold line-clamp-2">{items.lunch}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-indigo-600 block uppercase tracking-wider mb-0.5">🍛 Dinner Main</span>
                      <p className="text-gray-800 font-semibold line-clamp-2">{items.dinner}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sunday Special Note footer bar */}
        {menu.sundaySpecialNote && (
          <div className="mt-8 bg-amber-50 border border-amber-200/60 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-amber-900 text-sm mb-1 uppercase tracking-wide">🎉 Sunday Special (रविवार विशेष भोजन)</h5>
              <p className="text-amber-800 text-sm font-semibold leading-relaxed">{menu.sundaySpecialNote}</p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
