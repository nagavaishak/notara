"use client";

import SpatialJourney from "@/components/SpatialJourney";
import Navigation from "@/components/Navigation";
import SectionRecord from "@/components/SectionRecord";
import SectionFailure from "@/components/SectionFailure";
import SectionTamper from "@/components/SectionTamper";
import SectionBimLink from "@/components/SectionBimLink";
import SectionImmutable from "@/components/SectionImmutable";
import SectionStakeholders from "@/components/SectionStakeholders";
import SectionProtocol from "@/components/SectionProtocol";
import SectionClose from "@/components/SectionClose";

export default function Home() {
  return (
    <main className="relative">
      {/* Cinematic spatial journey → flows directly into Record */}
      <SpatialJourney />

      {/* UI returns after the journey */}
      <div className="relative z-10">
        <Navigation />

        <SectionRecord />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <SectionFailure />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <SectionTamper />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <SectionBimLink />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <SectionImmutable />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <SectionStakeholders />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <SectionProtocol />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <SectionClose />
      </div>
    </main>
  );
}
