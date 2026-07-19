import RomPatcherEmbed from "./components/RomPatcherEmbed";
import MotionLab from "./components/MotionLab";
import CuelumeSoundscape from "./components/CuelumeSoundscape";
import TranslationLibrary from "./components/TranslationLibrary";
import { translationCatalog } from "./data/translationCatalog";

const githubOrgUrl = "https://github.com/RegionallyFamous";
const desktopRepoUrl = "https://github.com/RegionallyFamous/SwanSong-Desktop";
const coreRepoUrl = "https://github.com/RegionallyFamous/swansong-core";
const storyForgeRepoUrl = "https://github.com/RegionallyFamous/swansong-story-forge";
const homebrewReposUrl =
  "https://github.com/RegionallyFamous/SwanSong-Originals";

export default function Home() {
  return (
    <main>
      <MotionLab />
      <CuelumeSoundscape />
      <header className="site-header" data-reveal>
        <a
          className="header-logo"
          href="#top"
          aria-label="Yokoi home"
          data-burst
          data-cuelume-hover="sparkle"
          data-cuelume-press="press"
          data-cuelume-release="release"
        >
          <img src="/art/yokoi-logo.png" alt="Yokoi" />
        </a>
        <span className="header-tagline">Tools for a strange little handheld</span>
        <nav aria-label="Main navigation">
          <a href="#projects" data-cuelume-hover="tick">Projects</a>
          <a href="#translations" data-cuelume-hover="tick">Manual Library</a>
          <a href="#patcher" data-cuelume-hover="tick">Patcher</a>
          <a href="#about" data-cuelume-hover="tick">About</a>
          <a href={githubOrgUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((group) => (
            <div className="ticker-group" key={group}>
              <span>BUILD STRANGE THINGS</span>
              <b>✦</b>
              <span>KEEP THE FILES OPEN</span>
              <b>●</b>
              <span>PLAY SIDEWAYS</span>
              <b>✦</b>
              <span>MAKE TINY WORLDS</span>
              <b>●</b>
            </div>
          ))}
        </div>
      </div>

      <section className="hero" id="top">
        <div className="hero-copy" data-reveal>
          <div className="eyebrow">
            <span>WORKSHOP FILE</span>
            <strong>001</strong>
          </div>
          <h1>
            WonderSwan deserves more <em>weird little projects.</em>
          </h1>
          <p>
            Yokoi is a workshop for players, builders, and tinkerers—home to
            openFPGA work, odd hardware, printable objects, and useful downloads.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href="#projects"
              data-burst
              data-cuelume-hover="chime"
              data-cuelume-press="press"
              data-cuelume-release="release"
            >
              Browse the projects <span aria-hidden="true">↓</span>
            </a>
            <a
              className="button button-ghost"
              href="#translations"
              data-burst
              data-cuelume-hover="chime"
              data-cuelume-press="press"
              data-cuelume-release="release"
            >
              Read translations
            </a>
          </div>
          <div className="hero-fineprint">
            <span>OPEN FILES</span>
            <span>NO ROMS</span>
            <span>MADE WITH CARE</span>
          </div>
        </div>

        <figure className="hero-art" data-reveal data-tilt="5" data-burst>
          <div className="art-orbit art-orbit-one" aria-hidden="true" />
          <div className="art-orbit art-orbit-two" aria-hidden="true" />
          <img
            src="/art/yokoi-workbench-hero-v2.png"
            alt="A surreal translucent WonderSwan on an indigo electronics workbench, surrounded by ribbon cables, cartridges, and a floating paper swan"
          />
          <span className="sticker sticker-top">ODD HARDWARE INSIDE</span>
          <span className="sticker sticker-bottom">Y / SWAN LAB</span>
          <figcaption>
            <span>FIG. 001</span>
            <span>FICTIONAL WORKBENCH STUDY</span>
          </figcaption>
        </figure>
      </section>

      <section className="translation-section" id="translations">
        <div className="translation-heading" data-reveal>
          <div>
            <span className="section-kicker">THE TRANSLATED PAPER TRAIL</span>
            <h2>Translation archive.</h2>
          </div>
          <div className="translation-intro">
            <p>
              Read technical translations in your browser or keep a PDF copy.
              Search by title, topic, or system as the shelf grows.
            </p>
            <ul aria-label="PDF library features">
              <li>SEARCHABLE</li>
              <li>BROWSER READER</li>
              <li>DOWNLOADABLE</li>
            </ul>
          </div>
        </div>

        <div data-reveal>
          <TranslationLibrary documents={translationCatalog} />
        </div>

        <aside className="translation-note" data-reveal>
          <span aria-hidden="true">i</span>
          <p>
            <strong>A translation is a research aid, not a replacement for the source.</strong>{" "}
            Each edition keeps the original credits and calls out known conflicts or uncertain claims.
          </p>
        </aside>
      </section>

      <section className="project-section" id="projects">
        <div className="section-heading" data-reveal>
          <div>
            <span className="section-kicker">THE USEFUL PILE</span>
            <h2>Projects</h2>
          </div>
          <p>
            Three open workbenches for playing, building, and making strange
            new things for WonderSwan.
          </p>
        </div>

        <div className="project-grid">
          <article
            className="project-card project-desktop"
            data-reveal
            data-tilt="3.5"
          >
            <div className="card-topline">
              <span>01 / NATIVE PLAYER</span>
              <span className="status status-desktop">MACOS</span>
            </div>
            <a
              className="card-visual project-art"
              href={desktopRepoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the SwanSong Desktop repository"
              data-burst
              data-cuelume-hover="bloom"
              data-cuelume-press="press"
              data-cuelume-release="release"
            >
              <img
                src="/art/swansong-desktop.webp"
                alt="A hardware-faithful translucent blue WonderSwan Color displayed above a compact silver desktop computer in an indigo laboratory"
              />
            </a>
            <div className="card-copy">
              <h3>SwanSong Desktop</h3>
              <p>
                A private, native WonderSwan player and translation workbench
                designed for the Mac.
              </p>
              <ul className="chip-list" aria-label="SwanSong Desktop features">
                <li>NATIVE MACOS</li>
                <li>ARES ENGINE</li>
                <li>TRANSLATION LAB</li>
              </ul>
            </div>
            <div className="card-actions">
              <span>PUBLIC REPOSITORY</span>
              <a href={desktopRepoUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick">
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <article
            className="project-card project-core"
            data-reveal
            data-tilt="3.5"
          >
            <div className="card-topline">
              <span>02 / OPENFPGA</span>
              <span className="status status-core">ANALOGUE POCKET</span>
            </div>
            <a
              className="card-visual project-art"
              href={coreRepoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the SwanSong Core repository"
              data-burst
              data-cuelume-hover="bloom"
              data-cuelume-press="press"
              data-cuelume-release="release"
            >
              <img
                src="/art/swansong-core.webp"
                alt="A translucent blue WonderSwan Color hovering above a separate exposed FPGA development board on an acrylic platform"
              />
            </a>
            <div className="card-copy">
              <h3>SwanSong Core</h3>
              <p>
                WonderSwan and WonderSwan Color rebuilt for Analogue Pocket,
                with open source, documentation, and reproducible builds.
              </p>
              <ul className="chip-list" aria-label="SwanSong Core features">
                <li>OPENFPGA</li>
                <li>VERTICAL PLAY</li>
                <li>WS + WSC</li>
              </ul>
            </div>
            <div className="card-actions">
              <span>PUBLIC REPOSITORY</span>
              <a href={coreRepoUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick">
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <article
            className="project-card project-homebrew"
            data-reveal
            data-tilt="3.5"
          >
            <div className="card-topline">
              <span>03 / MAKE GAMES</span>
              <span className="status">HOMEBREW</span>
            </div>
            <a
              className="card-visual project-art"
              href={homebrewReposUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the SwanSong Originals WonderSwan homebrew repository"
              data-burst
              data-cuelume-hover="bloom"
              data-cuelume-press="press"
              data-cuelume-release="release"
            >
              <img
                src="/art/wonderswan-homebrew.webp"
                alt="A WonderSwan Color and thin black cartridges with exposed gold edge connectors surrounded by miniature original pixel-art worlds"
              />
            </a>
            <div className="card-copy">
              <h3>Homebrew Workshop</h3>
              <p>
                Tools, example games, and graphics-first workflows for building
                original WonderSwan Color projects.
              </p>
              <ul className="chip-list" aria-label="Homebrew workshop features">
                <li>STORY FORGE</li>
                <li>EXAMPLE GAMES</li>
                <li>WSC TOOLS</li>
              </ul>
            </div>
            <div className="card-actions card-actions-split">
              <a href={storyForgeRepoUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick">
                Story Forge <span aria-hidden="true">↗</span>
              </a>
              <a href={homebrewReposUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick">
                SwanSong Originals <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="patcher-section" id="patcher">
        <div className="patcher-heading" data-reveal>
          <div>
            <span className="section-kicker">PLAY IT IN ENGLISH</span>
            <h2>Patch a game.</h2>
          </div>
          <div className="patcher-intro">
            <p>
              Choose a verified translation and add your own legally dumped
              game file. The original and patched ROM stay entirely in your
              browser.
            </p>
            <ul aria-label="Patcher guarantees">
              <li>NO UPLOAD</li>
              <li>EXACT ROM CHECK</li>
              <li>VERIFIED OUTPUT</li>
            </ul>
          </div>
        </div>
        <div className="patcher-frame" data-reveal>
          <RomPatcherEmbed />
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-index" aria-hidden="true" data-reveal>
          <span>Y</span>
          <span>05</span>
        </div>
        <div className="about-copy" data-reveal>
          <span className="section-kicker">WHY YOKOI?</span>
          <h2>A workshop, not a storefront.</h2>
          <p>
            Yokoi is where WonderSwan side projects become usable things: tested
            files, readable notes, reproducible builds, and downloads that say
            exactly what they contain.
          </p>
        </div>
        <ol className="manifesto" data-reveal>
          <li>
            <span>01</span>
            <strong>Make the oddness useful.</strong>
          </li>
          <li>
            <span>02</span>
            <strong>Document the sharp edges.</strong>
          </li>
          <li>
            <span>03</span>
            <strong>Share files, not mysteries.</strong>
          </li>
        </ol>
      </section>

      <aside className="legal-note" data-reveal>
        <span className="legal-symbol" aria-hidden="true">!</span>
        <p>
          <strong>No ROMs. No BIOS files.</strong> Yokoi publishes original tools,
          hardware work, documentation, and patching software. Bring only game
          files and firmware you are legally entitled to use.
        </p>
      </aside>

      <footer data-reveal>
        <div>
          <span className="footer-brand">YOKOI</span>
          <span>TOOLS FOR A STRANGE LITTLE HANDHELD</span>
        </div>
        <div className="footer-links">
          <a href="#top" data-cuelume-hover="tick">Back to top ↑</a>
          <a href={githubOrgUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick">GitHub ↗</a>
        </div>
      </footer>
    </main>
  );
}
