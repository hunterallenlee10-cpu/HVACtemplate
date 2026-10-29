import { config, faq, seo } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import { nav } from "@/content/site";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import Nav from "@/components/chrome/Nav";
import TempHUD from "@/components/chrome/TempHUD";
import ProgressRail from "@/components/chrome/ProgressRail";
import BookingBar from "@/components/chrome/BookingBar";
import Preloader from "@/components/chrome/Preloader";
import Grain from "@/components/chrome/Grain";
import StoryCanvas from "@/components/story/StoryCanvas";
import ThermostatDial from "@/components/tools/ThermostatDial";
import FilterCompare from "@/components/tools/FilterCompare";
import SystemPicker from "@/components/tools/SystemPicker";
import RepairReplaceCalc from "@/components/tools/RepairReplaceCalc";
import Plans from "@/components/sections/Plans";
import Reviews from "@/components/sections/Reviews";
import ServiceArea from "@/components/sections/ServiceArea";
import FAQ from "@/components/sections/FAQ";
import BookingForm from "@/components/sections/BookingForm";
import Footer from "@/components/sections/Footer";

function JsonLd() {
  const business = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": `${siteUrl}/#business`,
    name: config.businessName,
    url: siteUrl,
    telephone: config.phone,
    email: config.email,
    image: `${siteUrl}/opengraph-image`,
    description: seo.description,
    foundingDate: config.yearFounded,
    priceRange: config.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address.street,
      addressLocality: config.address.locality,
      addressRegion: config.address.region,
      postalCode: config.address.postalCode,
      addressCountry: config.address.country,
    },
    areaServed: config.serviceArea.map((t) => ({ "@type": "City", name: `${t.name}, ${config.region}` })),
    openingHours: config.openingHoursSpec,
    makesOffer: { "@type": "Offer", name: "HVAC tune-up", price: config.tuneupPrice, priceCurrency: "USD" },
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  );
}

export default function Page() {
  return (
    <>
      <a href="#main" className="skip">
        {nav.skipLink}
      </a>
      <SmoothScroll />
      <Preloader />
      <Nav />
      <TempHUD />
      <ProgressRail />
      <main id="main">
        <StoryCanvas />
        <div className="after">
          <ThermostatDial />
          <FilterCompare />
          <SystemPicker />
          <RepairReplaceCalc />
          <Plans />
          <Reviews />
          <ServiceArea />
          <FAQ />
          <BookingForm />
        </div>
      </main>
      <Footer />
      <BookingBar />
      <Grain />
      <JsonLd />
    </>
  );
}
