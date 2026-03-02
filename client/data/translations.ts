/**
 * Translation data structure for multilingual support
 * Each page/component should have its own translation object
 */

export type Language = "en" | "ar";

export interface NavbarTranslations {
  home: string;
  about: string;
  visa: string;
  destinations: string;
  flight: string;
  egypt: string;
  albania: string;
  cars: string;
  hotel: string;  
}

export interface HomePageTranslations {
  heading: string;
  paragraph: string;
}

export interface AboutPageTranslations {
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  missionText: string;
  vision: string;
  visionText: string;
  values: string;
  value1: string;
  value1Text: string;
  value2: string;
  value2Text: string;
  value3: string;
  value3Text: string;
}

export interface Translations {
  navbar: NavbarTranslations;
  home: HomePageTranslations;
  about: AboutPageTranslations;
}

export const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      home: "Home",
      about: "About",
      visa: "Visa",
      destinations: "Destinations",
      flight: "Flight",
      egypt: "Egypt",
      albania: "Albania",
      cars: "Cars",
      hotel: "Hotel",
    },
    home: {
      heading: "Let the Journey Begin",
      paragraph:
        "Explore the world with us. Discover exciting destinations and unique experiences that will create memories to last a lifetime.",
    },
    about: {
      title: "About Us",
      subtitle: "Your Trusted Travel Partner",
      description:
        "We are passionate about creating unforgettable travel experiences. With years of expertise in the tourism industry, we bring you closer to the world's most beautiful destinations.",
      mission: "Our Mission",
      missionText:
        "To inspire and enable travelers to discover the world through authentic, sustainable, and memorable experiences.",
      vision: "Our Vision",
      visionText:
        "To become the leading travel platform that connects people with extraordinary destinations and cultures worldwide.",
      values: "Our Values",
      value1: "Authenticity",
      value1Text: "We believe in genuine experiences that reflect the true essence of each destination.",
      value2: "Sustainability",
      value2Text: "We are committed to responsible tourism that preserves cultures and environments.",
      value3: "Excellence",
      value3Text: "We strive for excellence in every aspect of your journey, from planning to execution.",
    },
  },
  ar: {
    navbar: {
      home: "الصفحة الرئيسية",
      about: "حول",
      visa: "تأشيرة",
      destinations: "الوجهات",
      flight: "الرحلات الجوية",
      egypt: "مصر",
      albania: "ألبانيا",
      cars: "سيارات",
      hotel: "فنادق",
    },
    home: {
      heading: "لتبدأ الرحلة",
      paragraph:
        "استكشف العالم معنا. اكتشف وجهات مثيرة وتجارب فريدة ستخلق ذكريات تدوم مدى الحياة.",
    },
    about: {
      title: "من نحن",
      subtitle: "شريكك الموثوق في السفر",
      description:
        "نحن شغوفون بإنشاء تجارب سفر لا تُنسى. مع سنوات من الخبرة في صناعة السياحة، نقرّبك من أجمل الوجهات في العالم.",
      mission: "مهمتنا",
      missionText:
        "إلهام وتمكين المسافرين لاكتشاف العالم من خلال تجارب أصيلة ومستدامة ولا تُنسى.",
      vision: "رؤيتنا",
      visionText:
        "أن نصبح المنصة الرائدة للسفر التي تربط الناس بوجهات وثقافات استثنائية حول العالم.",
      values: "قيمنا",
      value1: "الأصالة",
      value1Text: "نؤمن بالتجارب الأصيلة التي تعكس الجوهر الحقيقي لكل وجهة.",
      value2: "الاستدامة",
      value2Text: "نلتزم بالسياحة المسؤولة التي تحافظ على الثقافات والبيئات.",
      value3: "التميز",
      value3Text: "نسعى للتميز في كل جانب من جوانب رحلتك، من التخطيط إلى التنفيذ.",
    },
  },
};

