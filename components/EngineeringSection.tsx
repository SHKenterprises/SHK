import React from "react";
import { Icon } from "./SvgSprite";

export function EngineeringSection() {
  return (
    <section className="engineering-section" id="engineering">
      <div className="container">
        <div className="section-header">
          <span className="pill-tag dark">Inside The Power Cell</span>
          <h2 className="section-title">Anatomy of Battery Reliability</h2>
          <p className="section-desc">
            Why professional mechanics choose Nexcolle™ VRLA AGM over conventional market batteries.
          </p>
        </div>

        <div className="eng-grid">
          <div className="eng-image-card">
            <img
              src="/images/battery.jpg"
              alt="Nexcolle AGM Battery Internal Anatomy"
            />
          </div>

          <div className="eng-features-list">
            <div className="eng-feature-box">
              <div className="eng-icon-circle">
                <Icon name="bolt" />
              </div>
              <div>
                <h4>High Cold Cranking Amperage (CCA)</h4>
                <p>
                  Ultra-dense calcium alloy lead grids deliver immediate high-amperage
                  power to spin starter motors instantly even on cold winter mornings.
                </p>
              </div>
            </div>

            <div className="eng-feature-box">
              <div className="eng-icon-circle">
                <Icon name="shield-check" />
              </div>
              <div>
                <h4>Spill-Proof VRLA-AGM Construction</h4>
                <p>
                  Hermetically factory-sealed with micro-porous glass mat separators.
                  Zero acid leaks, zero electrolyte evaporation, and 100% maintenance-free.
                </p>
              </div>
            </div>

            <div className="eng-feature-box">
              <div className="eng-icon-circle">
                <Icon name="check" />
              </div>
              <div>
                <h4>Heavy Vibration &amp; Pothole Resistance</h4>
                <p>
                  Reinforced polypropylene casing and anchored plate groups built
                  to absorb harsh Indian road shocks without internal cell failure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

