import { Student, Payment, Complaint, Visitor, HostelSettings, MessMenu, PartnerWithdrawal, HostelExpense } from './types';

export const DEFAULT_MESS_MENU: MessMenu = {
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
    Monday: {
      breakfast: 'प्याज पराठा 2 पिस',
      lunch: 'मिक्स दाल',
      dinner: 'सेव टमाटर, दाल, जीरा राईस'
    },
    Tuesday: {
      breakfast: 'नमकीन चावल',
      lunch: 'चने की दाल',
      dinner: 'कढ़ी, जीरा आलू, राईस'
    },
    Wednesday: {
      breakfast: 'आलु पराठा 2 पिस',
      lunch: 'मसूर की दाल',
      dinner: 'चोलाई, जीरा राईस'
    },
    Thursday: {
      breakfast: 'पास्ता',
      lunch: 'मुंग की दाल',
      dinner: 'आलू छोला, राईस'
    },
    Friday: {
      breakfast: 'दलिया उपमा',
      lunch: 'अरहर की दाल',
      dinner: 'राजमा, राईस'
    },
    Saturday: {
      breakfast: 'पोहा',
      lunch: 'मिक्स दाल',
      dinner: 'बेसन गटा, जीरा राईस'
    },
    Sunday: {
      breakfast: 'चाय',
      lunch: 'तुर दाल',
      dinner: 'सण्डे स्पेशल'
    }
  },
  sundaySpecialNote: 'Sunday स्पेशल में बनने वाला भोजन - पनीर, छोले कुलचे, पूरी, छोले भटूरे, सेवैया खीर, सूजी हलवा, चावल खीर'
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 1001,
    name: "Rohan Sharma",
    mobile: "9876543210",
    father: "Suresh Sharma",
    fatherMob: "9876543211",
    motherName: "Suman Sharma",
    dob: "2005-08-15",
    room: "202",
    sharing: "Single",
    fee: 12000,
    status: "Active",
    address: "Malviya Nagar, Jaipur, Rajasthan",
    paid: 12000,
    due: 0,
    joinDate: "01/05/2026"
  },
  {
    id: 1002,
    name: "Aryan Khan",
    mobile: "9123456789",
    father: "Salim Khan",
    fatherMob: "9123456780",
    motherName: "Zarina Khan",
    dob: "2004-12-10",
    room: "205",
    sharing: "Double",
    fee: 7500,
    status: "Notice",
    address: "Jodhpur, Rajasthan",
    paid: 5000,
    due: 2500,
    joinDate: "15/04/2026"
  },
  {
    id: 1003,
    name: "Amit Verma",
    mobile: "8888877777",
    father: "Manoj Verma",
    fatherMob: "8888866666",
    motherName: "Sunita Verma",
    dob: "2006-03-24",
    room: "104",
    sharing: "Triple",
    fee: 5500,
    status: "Active",
    address: "Kota, Rajasthan",
    paid: 0,
    due: 5500,
    joinDate: "01/06/2026"
  },
  {
    id: 1004,
    name: "Vijay Singh",
    mobile: "7777766666",
    father: "Rajesh Singh",
    fatherMob: "7777755555",
    motherName: "Komal Kanwar",
    dob: "2005-05-30",
    room: "301",
    sharing: "Double",
    fee: 7500,
    status: "Active",
    address: "Ajmer, Rajasthan",
    paid: 7500,
    due: 0,
    joinDate: "10/05/2026"
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 2001,
    receipt: "UBH849102",
    studentId: 1001,
    studentName: "Rohan Sharma",
    room: "202",
    amount: 12000,
    mode: "UPI",
    month: "2026-06",
    date: "05/06/2026",
    note: "Paid online via GPay"
  },
  {
    id: 2002,
    receipt: "UBH320145",
    studentId: 1002,
    studentName: "Aryan Khan",
    room: "205",
    amount: 5000,
    mode: "Cash",
    month: "2026-06",
    date: "02/06/2026",
    note: "Partial payment for June"
  },
  {
    id: 2003,
    receipt: "UBH739192",
    studentId: 1004,
    studentName: "Vijay Singh",
    room: "301",
    amount: 7500,
    mode: "Bank Transfer",
    month: "2026-06",
    date: "08/06/2026",
    note: "Net Banking Transfer"
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 3001,
    ticket: "T5201",
    studentId: 1001,
    studentName: "Rohan Sharma",
    room: "202",
    type: "WiFi",
    priority: "High",
    description: "WiFi is completely disconnected or speed is too slow in room 202",
    status: "Pending",
    date: "16/06/2026"
  },
  {
    id: 3002,
    ticket: "T1045",
    studentId: 1003,
    studentName: "Amit Verma",
    room: "104",
    type: "Plumbing",
    priority: "Medium",
    description: "Bathroom washbasin tap leaking continuously.",
    status: "Resolved",
    date: "12/06/2026"
  }
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 4001,
    name: "Suresh Sharma",
    contact: "9876543211",
    studentId: 1001,
    studentName: "Rohan Sharma",
    room: "202",
    purpose: "Paying hostel monthly fees",
    relation: "Father",
    date: "05/06/2026",
    time: "11:30 AM"
  },
  {
    id: 4002,
    name: "Ramesh Verma",
    contact: "8222211111",
    studentId: 1003,
    studentName: "Amit Verma",
    room: "104",
    purpose: "Came to deliver books",
    relation: "Uncle",
    date: "14/06/2026",
    time: "04:15 PM"
  }
];

export const DEFAULT_SETTINGS: HostelSettings = {
  name: "Unity Boys Hostel",
  phone: "8209696820, 9521512224",
  address: "Near JECRC College, India Gate, Sanganer, Jaipur, Rajasthan - 302033",
  wa: "8209696820",
  email: "unityhosteljpr@gmail.com",
  upi: "gpay-12189467181@okbizaxis",
  lateFee: 50,
  totalBeds: 100,
  singleRent: 8500,
  doubleRent: 6500,
  tripleRent: 5500,
  standardElecRate: 10,
  upiPayeeName: "Unity Boys Hostel Official",
  upiQrUrl: "",
  doubleRoomsCount: 25,
  tripleRoomsCount: 15,
  totalRoomsCount: 45,
  sidebarTheme: 'dark',
  registrationFormTemplate: 'comprehensive',
  quickActionFeature: 'inventory',
  messMenu: DEFAULT_MESS_MENU,
  isStudentPortalLive: true,
  blockStudentPasswordChange: false,
  showAdBanner: false,
  adBannerUrl: '',
  adBannerUrls: [],
  adBannerPdfUrl: '',
  adBannerPdfName: '',
  adBannerText: ''
};

export const INITIAL_PARTNER_WITHDRAWALS: PartnerWithdrawal[] = [];

export const INITIAL_HOSTEL_EXPENSES: HostelExpense[] = [];
