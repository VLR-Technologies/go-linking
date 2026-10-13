import { AnimatedWords } from './AnimatedWords';
import { ConnectionNetwork } from './ConnectionNetwork';
import { DirectoryMotion } from './DirectoryMotion';

export function ConnectedHero() {
  return (
    <section className="connected-hero" aria-labelledby="directory-title">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">
          <span aria-hidden="true" />
          CONNECTING PEOPLE, BRANDS & POSSIBILITIES
        </p>
        <h1 id="directory-title">
          GO-LINKING<span>.</span>
        </h1>
        <AnimatedWords />
        <p className="hero-description">
          Bringing people closer to the brands, experiences, and digital
          destinations that matter.
        </p>
        <div className="hero-actions">
          <a className="connection-cta" href="#connections">
            Explore connections <span aria-hidden="true">↗</span>
          </a>
          <a className="connection-about" href="https://vlrtechnologies.net/">
            About VLR Technologies <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="hero-signoff">
          <span aria-hidden="true">↳</span> One Link. Infinite Connections.
        </p>
      </div>
      <div className="hero-network-wrap">
        <ConnectionNetwork />
        <DirectoryMotion />
      </div>
    </section>
  );
}
