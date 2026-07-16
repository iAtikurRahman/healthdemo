export interface DivisionSeed {
  name: string;
  nameBn: string;
  lat: number;
  lng: number;
}

export interface DistrictSeed {
  name: string;
  nameBn: string;
  division: string;
  lat: number;
  lng: number;
}

export const DIVISIONS: DivisionSeed[] = [
  { name: "Dhaka", nameBn: "উ ঢাকা", lat: 23.777, lng: 90.399 },
  { name: "Chattogram", nameBn: "চট্টগ্রাম", lat: 22.356, lng: 91.783 },
  { name: "Rajshahi", nameBn: "রাজশাহী", lat: 24.364, lng: 88.624 },
  { name: "Khulna", nameBn: "খুলনা", lat: 22.845, lng: 89.540 },
  { name: "Barishal", nameBn: "বরিশাল", lat: 22.701, lng: 90.353 },
  { name: "Sylhet", nameBn: "সিলেট", lat: 24.894, lng: 91.868 },
  { name: "Rangpur", nameBn: "রংপুর", lat: 25.746, lng: 89.251 },
  { name: "Mymensingh", nameBn: "ময়মনসিংহ", lat: 24.747, lng: 90.408 },
];

export const DISTRICTS: DistrictSeed[] = [
  // Dhaka Division (13)
  { name: "Dhaka", nameBn: "ঢাকা", division: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Faridpur", nameBn: "ফরিদপুর", division: "Dhaka", lat: 23.607, lng: 89.842 },
  { name: "Gazipur", nameBn: "গাজীপুর", division: "Dhaka", lat: 23.999, lng: 90.420 },
  { name: "Gopalganj", nameBn: "গোপালগঞ্জ", division: "Dhaka", lat: 23.005, lng: 89.826 },
  { name: "Kishoreganj", nameBn: "কিশোরগঞ্জ", division: "Dhaka", lat: 24.444, lng: 90.776 },
  { name: "Madaripur", nameBn: "মাদারীপুর", division: "Dhaka", lat: 23.164, lng: 90.189 },
  { name: "Manikganj", nameBn: "মানিকগঞ্জ", division: "Dhaka", lat: 23.863, lng: 90.005 },
  { name: "Munshiganj", nameBn: "মুন্সিগঞ্জ", division: "Dhaka", lat: 23.542, lng: 90.532 },
  { name: "Narayanganj", nameBn: "নারায়ণগঞ্জ", division: "Dhaka", lat: 23.622, lng: 90.500 },
  { name: "Narsingdi", nameBn: "নরসিংদী", division: "Dhaka", lat: 23.932, lng: 90.715 },
  { name: "Rajbari", nameBn: "রাজবাড়ী", division: "Dhaka", lat: 23.757, lng: 89.644 },
  { name: "Shariatpur", nameBn: "শরীয়তপুর", division: "Dhaka", lat: 23.242, lng: 90.435 },
  { name: "Tangail", nameBn: "টাঙ্গাইল", division: "Dhaka", lat: 24.251, lng: 89.919 },

  // Chattogram Division (11)
  { name: "Bandarban", nameBn: "বান্দরবান", division: "Chattogram", lat: 22.195, lng: 92.218 },
  { name: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া", division: "Chattogram", lat: 23.958, lng: 91.111 },
  { name: "Chandpur", nameBn: "চাঁদপুর", division: "Chattogram", lat: 23.233, lng: 90.671 },
  { name: "Chattogram", nameBn: "চট্টগ্রাম", division: "Chattogram", lat: 22.356, lng: 91.783 },
  { name: "Cumilla", nameBn: "কুমিল্লা", division: "Chattogram", lat: 23.460, lng: 91.181 },
  { name: "Cox's Bazar", nameBn: "কক্সবাজার", division: "Chattogram", lat: 21.427, lng: 92.005 },
  { name: "Feni", nameBn: "ফেনী", division: "Chattogram", lat: 23.023, lng: 91.397 },
  { name: "Khagrachhari", nameBn: "খাগড়াছড়ি", division: "Chattogram", lat: 23.119, lng: 91.984 },
  { name: "Lakshmipur", nameBn: "লক্ষ্মীপুর", division: "Chattogram", lat: 22.943, lng: 90.841 },
  { name: "Noakhali", nameBn: "নোয়াখালী", division: "Chattogram", lat: 22.869, lng: 91.099 },
  { name: "Rangamati", nameBn: "রাঙ্গামাটি", division: "Chattogram", lat: 22.652, lng: 92.174 },

  // Rajshahi Division (8)
  { name: "Bogura", nameBn: "বগুড়া", division: "Rajshahi", lat: 24.849, lng: 89.372 },
  { name: "Joypurhat", nameBn: "জয়পুরহাট", division: "Rajshahi", lat: 25.095, lng: 89.027 },
  { name: "Naogaon", nameBn: "নওগাঁ", division: "Rajshahi", lat: 24.807, lng: 88.943 },
  { name: "Natore", nameBn: "নাটোর", division: "Rajshahi", lat: 24.420, lng: 89.001 },
  { name: "Chapainawabganj", nameBn: "চাঁপাইনবাবগঞ্জ", division: "Rajshahi", lat: 24.596, lng: 88.277 },
  { name: "Pabna", nameBn: "পাবনা", division: "Rajshahi", lat: 24.003, lng: 89.237 },
  { name: "Rajshahi", nameBn: "রাজশাহী", division: "Rajshahi", lat: 24.364, lng: 88.624 },
  { name: "Sirajganj", nameBn: "সিরাজগঞ্জ", division: "Rajshahi", lat: 24.454, lng: 89.700 },

  // Khulna Division (10)
  { name: "Bagerhat", nameBn: "বাগেরহাট", division: "Khulna", lat: 22.651, lng: 89.785 },
  { name: "Chuadanga", nameBn: "চুয়াডাঙ্গা", division: "Khulna", lat: 23.640, lng: 88.841 },
  { name: "Jashore", nameBn: "যশোর", division: "Khulna", lat: 23.166, lng: 89.213 },
  { name: "Jhenaidah", nameBn: "ঝিনাইদহ", division: "Khulna", lat: 23.545, lng: 89.154 },
  { name: "Khulna", nameBn: "খুলনা", division: "Khulna", lat: 22.845, lng: 89.540 },
  { name: "Kushtia", nameBn: "কুষ্টিয়া", division: "Khulna", lat: 23.901, lng: 89.120 },
  { name: "Magura", nameBn: "মাগুরা", division: "Khulna", lat: 23.487, lng: 89.419 },
  { name: "Meherpur", nameBn: "মেহেরপুর", division: "Khulna", lat: 23.762, lng: 88.632 },
  { name: "Narail", nameBn: "নড়াইল", division: "Khulna", lat: 23.172, lng: 89.512 },
  { name: "Satkhira", nameBn: "সাতক্ষীরা", division: "Khulna", lat: 22.718, lng: 89.071 },

  // Barishal Division (6)
  { name: "Barguna", nameBn: "বরগুনা", division: "Barishal", lat: 22.159, lng: 90.113 },
  { name: "Barishal", nameBn: "বরিশাল", division: "Barishal", lat: 22.701, lng: 90.353 },
  { name: "Bhola", nameBn: "ভোলা", division: "Barishal", lat: 22.685, lng: 90.648 },
  { name: "Jhalokati", nameBn: "ঝালকাঠি", division: "Barishal", lat: 22.641, lng: 90.199 },
  { name: "Patuakhali", nameBn: "পটুয়াখালী", division: "Barishal", lat: 22.359, lng: 90.329 },
  { name: "Pirojpur", nameBn: "পিরোজপুর", division: "Barishal", lat: 22.579, lng: 89.972 },

  // Sylhet Division (4)
  { name: "Habiganj", nameBn: "হবিগঞ্জ", division: "Sylhet", lat: 24.375, lng: 91.416 },
  { name: "Moulvibazar", nameBn: "মৌলভীবাজার", division: "Sylhet", lat: 24.482, lng: 91.777 },
  { name: "Sunamganj", nameBn: "সুনামগঞ্জ", division: "Sylhet", lat: 25.066, lng: 91.395 },
  { name: "Sylhet", nameBn: "সিলেট", division: "Sylhet", lat: 24.894, lng: 91.868 },

  // Rangpur Division (8)
  { name: "Dinajpur", nameBn: "দিনাজপুর", division: "Rangpur", lat: 25.628, lng: 88.638 },
  { name: "Gaibandha", nameBn: "গাইবান্ধা", division: "Rangpur", lat: 25.328, lng: 89.528 },
  { name: "Kurigram", nameBn: "কুড়িগ্রাম", division: "Rangpur", lat: 25.807, lng: 89.636 },
  { name: "Lalmonirhat", nameBn: "লালমনিরহাট", division: "Rangpur", lat: 25.992, lng: 89.275 },
  { name: "Nilphamari", nameBn: "নীলফামারী", division: "Rangpur", lat: 25.931, lng: 88.856 },
  { name: "Panchagarh", nameBn: "পঞ্চগড়", division: "Rangpur", lat: 26.341, lng: 88.556 },
  { name: "Rangpur", nameBn: "রংপুর", division: "Rangpur", lat: 25.746, lng: 89.251 },
  { name: "Thakurgaon", nameBn: "ঠাকুরগাঁও", division: "Rangpur", lat: 26.034, lng: 88.461 },

  // Mymensingh Division (4)
  { name: "Jamalpur", nameBn: "জামালপুর", division: "Mymensingh", lat: 24.937, lng: 89.937 },
  { name: "Mymensingh", nameBn: "ময়মনসিংহ", division: "Mymensingh", lat: 24.747, lng: 90.408 },
  { name: "Netrokona", nameBn: "নেত্রকোনা", division: "Mymensingh", lat: 24.870, lng: 90.727 },
  { name: "Sherpur", nameBn: "শেরপুর", division: "Mymensingh", lat: 25.020, lng: 90.015 },
];

export const DISEASES = [
  "Dengue",
  "COVID-19",
  "Tuberculosis",
  "Diabetes",
  "Hypertension",
  "Cancer",
  "Maternal Health",
  "Child Health",
] as const;

export type DiseaseName = (typeof DISEASES)[number];
