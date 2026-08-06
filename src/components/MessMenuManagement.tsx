import React, { useState } from 'react';
import { Utensils, Edit3, Save, Printer, RefreshCw, Clock, CheckSquare, Award } from 'lucide-react';
import { HostelSettings, MessMenu, MessMenuItem } from '../types';

interface MessMenuManagementProps {
  settings: HostelSettings;
  onSaveSettings: (updated: HostelSettings) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

const DEFAULT_MENU_MAPPING: MessMenu = {
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

export default function MessMenuManagement({
  settings,
  onSaveSettings,
  onShowToast
}: MessMenuManagementProps) {
  const [menu, setMenu] = useState<MessMenu>(() => {
    if (settings.messMenu && typeof settings.messMenu === 'object' && settings.messMenu.days) {
      return settings.messMenu;
    }
    return DEFAULT_MENU_MAPPING;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedMenu, setEditedMenu] = useState<MessMenu>(menu);

  const startEditing = () => {
    setEditedMenu(JSON.parse(JSON.stringify(menu)));
    setIsEditing(true);
  };

  const handleTimingChange = (meal: 'breakfast' | 'lunch' | 'dinner', val: string) => {
    setEditedMenu(prev => ({
      ...prev,
      timings: {
        ...prev.timings,
        [meal]: val
      }
    }));
  };

  const handleCompulsoryChange = (meal: 'lunch' | 'dinner', val: string) => {
    setEditedMenu(prev => ({
      ...prev,
      compulsory: {
        ...prev.compulsory,
        [meal]: val
      }
    }));
  };

  const handleDayItemChange = (day: keyof MessMenu['days'], meal: keyof MessMenuItem, val: string) => {
    setEditedMenu(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [meal]: val
        }
      }
    }));
  };

  const handleNoteChange = (val: string) => {
    setEditedMenu(prev => ({
      ...prev,
      sundaySpecialNote: val
    }));
  };

  const saveMenuChanges = () => {
    setMenu(editedMenu);
    onSaveSettings({
      ...settings,
      messMenu: editedMenu
    });
    setIsEditing(false);
    onShowToast('Mess Menu saved successfully! 🍽️');
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset the mess menu to the default schedule?')) {
      setMenu(DEFAULT_MENU_MAPPING);
      onSaveSettings({
        ...settings,
        messMenu: DEFAULT_MENU_MAPPING
      });
      setIsEditing(false);
      onShowToast('Mess Menu reset to standard configuration 🔄');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onShowToast('Failed to open print window. Please allow popups! ⚠️', true);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mess Menu - ${settings.name}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;700;900&display=swap');
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
            margin: 0;
            padding: 24px;
            color: #000000;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: 700;
          }

          /* Full Dark Theme Mode */
          body.dark-poster {
            background-color: #090d16 !important;
            color: #ffffff !important;
          }
          body.dark-poster .container {
            background-color: #0f172a !important;
            border-color: #f8fafc !important;
            color: #ffffff !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.8);
          }
          body.dark-poster .header {
            border-bottom-color: #f8fafc !important;
          }
          body.dark-poster .hostel-name {
            color: #f59e0b !important;
          }
          body.dark-poster .title {
            color: #ffffff !important;
            background-color: #1e293b !important;
            border-color: #38bdf8 !important;
          }
          body.dark-poster .timings-container {
            background-color: #1e293b !important;
            border-color: #475569 !important;
            color: #ffffff !important;
          }
          body.dark-poster .timings-title {
            color: #f59e0b !important;
          }
          body.dark-poster table th {
            background-color: #1e293b !important;
            color: #f59e0b !important;
            border-color: #475569 !important;
          }
          body.dark-poster table td {
            border-color: #334155 !important;
            color: #f8fafc !important;
          }
          body.dark-poster .col-day {
            background-color: #1e293b !important;
            color: #38bdf8 !important;
          }
          body.dark-poster .compulsory-row {
            background-color: #2e1010 !important;
          }
          body.dark-poster .compulsory-label {
            color: #f87171 !important;
          }
          body.dark-poster .special-note {
            background-color: #1e293b !important;
            border-color: #f59e0b !important;
            color: #fde047 !important;
          }
          body.dark-poster .footer {
            color: #94a3b8 !important;
            border-top-color: #334155 !important;
          }

          /* Default High Contrast Deep Dark Bold Style */
          .container {
            border: 4px solid #000000;
            padding: 24px;
            max-width: 950px;
            margin: 0 auto;
            position: relative;
            background: #ffffff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #000000;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .hostel-name {
            font-size: 32px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 6px 0;
            color: #000000;
          }
          .title {
            font-size: 22px;
            font-weight: 900;
            margin: 0 0 12px 0;
            letter-spacing: 1px;
            color: #000000;
            background: #f1f5f9;
            display: inline-block;
            padding: 6px 20px;
            border: 2px solid #000000;
            border-radius: 8px;
          }
          .timings-container {
            display: flex;
            justify-content: space-around;
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            font-weight: 800;
            border: 2px solid #000000;
            color: #000000;
          }
          .timings-title {
            font-weight: 900;
            color: #000000;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 2px solid #000000;
            padding: 12px 10px;
            text-align: center;
            font-size: 14px;
            color: #000000;
          }
          th {
            background-color: #000000;
            color: #ffffff;
            font-weight: 900;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .col-day {
            width: 16%;
            font-weight: 900;
            background-color: #f1f5f9;
            text-transform: uppercase;
            color: #000000;
            font-size: 14px;
          }
          .col-meal {
            width: 28%;
            font-weight: 700;
            color: #000000;
            font-size: 14px;
            line-height: 1.4;
          }
          .compulsory-row {
            background-color: #fee2e2;
            font-weight: 800;
          }
          .compulsory-label {
            font-weight: 900;
            color: #991b1b;
            font-size: 12px;
            text-transform: uppercase;
          }
          .special-note {
            border: 3px dashed #000000;
            background-color: #fef9c3;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
            font-weight: 900;
            font-size: 15px;
            color: #000000;
            line-height: 1.6;
          }
          .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 12px;
            font-weight: 800;
            color: #000000;
            border-top: 2px solid #000000;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .container {
              border: 4px solid #000000 !important;
            }
            .no-print {
              display: none !important;
            }
            th, td {
              border: 2px solid #000000 !important;
              color: #000000;
              font-weight: 700;
            }
            th {
              background-color: #000000 !important;
              color: #ffffff !important;
            }
          }
          .print-btn-bar {
            text-align: center;
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .btn {
            background-color: #000000;
            color: #ffffff;
            border: 2px solid #000000;
            padding: 12px 24px;
            font-size: 15px;
            font-weight: 900;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          }
          .btn:hover {
            background-color: #1e293b;
          }
          .btn-toggle {
            background-color: #1e293b;
            color: #fbbf24;
            border: 2px solid #000000;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 800;
            border-radius: 8px;
            cursor: pointer;
          }
          .btn-toggle:hover {
            background-color: #0f172a;
          }
        </style>
      </head>
      <body>
        <div class="print-btn-bar no-print">
          <button class="btn" onclick="window.print()">🖨️ Click to Print Menu (गहरा डार्क प्रिंट करें)</button>
          <button class="btn-toggle" onclick="document.body.classList.toggle('dark-poster')">🌓 Dark / Light Theme Toggle (डार्क थीम बदलें)</button>
        </div>
        <div class="container">
          <div class="header">
            <h1 class="hostel-name">${settings.name}</h1>
            <div class="title">MESS MENU (मैस मेनू)</div>
            <div class="timings-container">
              <div><span class="timings-title">⏰ Breakfast:</span> <strong>${menu.timings.breakfast}</strong></div>
              <div><span class="timings-title">⏰ Lunch:</span> <strong>${menu.timings.lunch}</strong></div>
              <div><span class="timings-title">⏰ Dinner:</span> <strong>${menu.timings.dinner}</strong></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>DAYS (दिन)</th>
                <th>BREAKFAST (नाश्ता)</th>
                <th>LUNCH (दोपहर का भोजन)</th>
                <th>DINNER (रात्रि का भोजन)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="compulsory-row">
                <td class="col-day">
                  <div class="compulsory-label">DAILY</div>
                  <div style="font-size:11px; font-weight:800;">(COMPULSORY)</div>
                </td>
                <td class="col-meal" style="color: #64748b; font-size:12px; font-weight:800;">--</td>
                <td class="col-meal" style="color:#991b1b; font-weight:900;">${menu.compulsory.lunch}</td>
                <td class="col-meal" style="color:#991b1b; font-weight:900;">${menu.compulsory.dinner}</td>
              </tr>
              <tr>
                <td class="col-day">MONDAY</td>
                <td class="col-meal">${menu.days.Monday.breakfast}</td>
                <td class="col-meal">${menu.days.Monday.lunch}</td>
                <td class="col-meal">${menu.days.Monday.dinner}</td>
              </tr>
              <tr>
                <td class="col-day">TUESDAY</td>
                <td class="col-meal">${menu.days.Tuesday.breakfast}</td>
                <td class="col-meal">${menu.days.Tuesday.lunch}</td>
                <td class="col-meal">${menu.days.Tuesday.dinner}</td>
              </tr>
              <tr>
                <td class="col-day">WEDNESDAY</td>
                <td class="col-meal">${menu.days.Wednesday.breakfast}</td>
                <td class="col-meal">${menu.days.Wednesday.lunch}</td>
                <td class="col-meal">${menu.days.Wednesday.dinner}</td>
              </tr>
              <tr>
                <td class="col-day">THURSDAY</td>
                <td class="col-meal">${menu.days.Thursday.breakfast}</td>
                <td class="col-meal">${menu.days.Thursday.lunch}</td>
                <td class="col-meal">${menu.days.Thursday.dinner}</td>
              </tr>
              <tr>
                <td class="col-day">FRIDAY</td>
                <td class="col-meal">${menu.days.Friday.breakfast}</td>
                <td class="col-meal">${menu.days.Friday.lunch}</td>
                <td class="col-meal">${menu.days.Friday.dinner}</td>
              </tr>
              <tr>
                <td class="col-day">SATURDAY</td>
                <td class="col-meal">${menu.days.Saturday.breakfast}</td>
                <td class="col-meal">${menu.days.Saturday.lunch}</td>
                <td class="col-meal">${menu.days.Saturday.dinner}</td>
              </tr>
              <tr>
                <td class="col-day" style="color:#991b1b; font-weight:900;">SUNDAY</td>
                <td class="col-meal">${menu.days.Sunday.breakfast}</td>
                <td class="col-meal">${menu.days.Sunday.lunch}</td>
                <td class="col-meal" style="font-weight: 900; color:#1e3a8a;">${menu.days.Sunday.dinner}</td>
              </tr>
            </tbody>
          </table>

          <div class="special-note">
            📌 ${menu.sundaySpecialNote}
          </div>

          <div class="footer">
            Printed from Warden Management Portal &bull; Phone: ${settings.phone} &bull; Address: ${settings.address}
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const daysList: Array<keyof MessMenu['days']> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const daysHindi: Record<string, string> = {
    Monday: 'सोमवार',
    Tuesday: 'मंगलवार',
    Wednesday: 'बुधवार',
    Thursday: 'गुरुवार',
    Friday: 'शुक्रवार',
    Saturday: 'शनिवार',
    Sunday: 'रविवार'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1A1A2E] flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#FF6B35]" />
              Warden Online Mess Menu Configurator (मैस मेनू नियंत्रक)
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              View, edit and customize daily breakfast, lunch, and dinner menus. Print poster cardboards for hostel notice boards.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={saveMenuChanges}
                  className="flex-1 sm:flex-none py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes (मेन्यू सुरक्षित करें)
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 sm:flex-none py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition active:scale-95 cursor-pointer"
                >
                  Cancel (रद्द करें)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEditing}
                  className="flex-1 sm:flex-none py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Menu (बदलाव करें)
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Menu (मेन्यू प्रिंट करें)
                </button>
                <button
                  onClick={resetToDefault}
                  title="Reset Mess schedule to default template"
                  className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Timings & Compulsory Row Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Meal Timings Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              Meal Timings (भोजन का समय)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1 uppercase">🍳 Breakfast (नाश्ता):</label>
                <input
                  type="text"
                  value={isEditing ? editedMenu.timings.breakfast : menu.timings.breakfast}
                  disabled={!isEditing}
                  onChange={e => handleTimingChange('breakfast', e.target.value)}
                  className="w-full px-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] bg-white disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1 uppercase">🍲 Lunch (दोपहर का भोजन):</label>
                <input
                  type="text"
                  value={isEditing ? editedMenu.timings.lunch : menu.timings.lunch}
                  disabled={!isEditing}
                  onChange={e => handleTimingChange('lunch', e.target.value)}
                  className="w-full px-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] bg-white disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1 uppercase">🍽️ Dinner (रात्रि का भोजन):</label>
                <input
                  type="text"
                  value={isEditing ? editedMenu.timings.dinner : menu.timings.dinner}
                  disabled={!isEditing}
                  onChange={e => handleTimingChange('dinner', e.target.value)}
                  className="w-full px-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] bg-white disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Daily Compulsory Items */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              Daily Compulsory items (रोज मिलने वाला भोजन)
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1 uppercase">🥗 Compulsory Lunch (दोपहर भोजन के साथ):</label>
                <input
                  type="text"
                  value={isEditing ? editedMenu.compulsory.lunch : menu.compulsory.lunch}
                  disabled={!isEditing}
                  onChange={e => handleCompulsoryChange('lunch', e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] bg-white disabled:bg-slate-100 disabled:text-slate-500 font-extrabold text-[#c53030]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-1 uppercase">🍛 Compulsory Dinner (रात्रि भोजन के साथ):</label>
                <input
                  type="text"
                  value={isEditing ? editedMenu.compulsory.dinner : menu.compulsory.dinner}
                  disabled={!isEditing}
                  onChange={e => handleCompulsoryChange('dinner', e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] bg-white disabled:bg-slate-100 disabled:text-slate-500 font-extrabold text-[#c53030]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Menu Matrix Schedule Grid */}
        <div className="overflow-x-auto border border-gray-100 rounded-2xl mb-6 shadow-xs">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-black uppercase">
                <th className="p-4 rounded-tl-2xl">DAYS (दिन)</th>
                <th className="p-4">🍳 BREAKFAST (नाश्ता)</th>
                <th className="p-4">🍲 LUNCH (दोपहर भोजन)</th>
                <th className="p-4 rounded-tr-2xl">🍽️ DINNER (रात्रि भोजन)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {daysList.map(day => {
                const dayItem = isEditing ? editedMenu.days[day] : menu.days[day];
                const isSunday = day === 'Sunday';

                return (
                  <tr key={day} className={`hover:bg-slate-50/50 transition ${isSunday ? 'bg-amber-50/20' : ''}`}>
                    <td className="p-4 font-black text-slate-800 text-xs sm:text-sm flex flex-col justify-center">
                      <span className={isSunday ? 'text-rose-600' : 'text-slate-800'}>{day.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400 font-bold">({daysHindi[day]})</span>
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={dayItem.breakfast}
                          onChange={e => handleDayItemChange(day, 'breakfast', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] text-xs font-bold"
                        />
                      ) : (
                        <span className="font-semibold text-slate-700">{dayItem.breakfast}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={dayItem.lunch}
                          onChange={e => handleDayItemChange(day, 'lunch', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] text-xs font-bold"
                        />
                      ) : (
                        <span className="font-semibold text-slate-700">{dayItem.lunch}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={dayItem.dinner}
                          onChange={e => handleDayItemChange(day, 'dinner', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#FF6B35] text-xs font-bold"
                        />
                      ) : (
                        <span className={`font-semibold ${isSunday ? 'text-indigo-600 font-extrabold' : 'text-slate-700'}`}>{dayItem.dinner}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Special Sunday Note bottom card */}
        <div className="bg-amber-50/35 border-2 border-dashed border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-800">
            <Award className="w-5 h-5 text-amber-500 fill-amber-100" />
            <h5 className="text-xs sm:text-sm font-black uppercase">🌟 Sunday Special Note (रविवार स्पेशल मेनू)</h5>
          </div>
          {isEditing ? (
            <textarea
              value={editedMenu.sundaySpecialNote}
              onChange={e => handleNoteChange(e.target.value)}
              rows={3}
              className="w-full p-4 border border-amber-200 rounded-xl outline-none focus:border-[#FF6B35] text-xs sm:text-sm font-semibold bg-white"
            />
          ) : (
            <p className="text-xs sm:text-sm text-amber-800 font-bold leading-relaxed">
              {menu.sundaySpecialNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
