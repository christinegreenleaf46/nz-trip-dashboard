import Hero from "./sections/Hero";
import RatesSection from "./sections/RatesSection";
import FlightsSection from "./sections/FlightsSection";
import AdviceSection from "./sections/AdviceSection";
import AirlinesSection from "./sections/AirlinesSection";
import SiteFooter from "./sections/SiteFooter";
import { useJson } from "./lib/data";
import type { RatesData, FlightsData } from "./lib/types";

export default function App() {
  const { data: rates } = useJson<RatesData>("rates.json");
  const { data: flights } = useJson<FlightsData>("flights.json");

  return (
    <div className="min-h-screen" style={{ background: "#0a1611" }}>
      <Hero />
      <main>
        <RatesSection rates={rates} />
        <FlightsSection flights={flights} />
        <AdviceSection rates={rates} flights={flights} />
        <AirlinesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
