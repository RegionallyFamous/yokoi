const repoUrl = "https://github.com/RegionallyFamous/swansong-core";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Yokoi home">
          <span className="brand-glyph" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-word">YOKOI</span>
        </a>

        <span className="header-note">Tools for a strange little handheld</span>

        <nav aria-label="Main navigation">
          <a href="#projects">Projects</a>
          <a href="#downloads">Downloads</a>
          <a href="#about">About</a>
          <a href={repoUrl} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <div className="ticker" aria-hidden="true">
        <div>
          <span>BUILD STRANGE THINGS</span>
          <b>✦</b>
          <span>KEEP THE FILES OPEN</span>
          <b>●</b>
          <span>PLAY SIDEWAYS</span>
          <b>✦</b>
          <span>BUILD STRANGE THINGS</span>
          <b>●</b>
          <span>KEEP THE FILES OPEN</span>
        </div>
      </div>

      <section className="hero" id="top">
        <div className="hero-copy">
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
            <a className="button button-primary" href="#downloads">
              Browse the files <span aria-hidden="true">↓</span>
            </a>
            <a className="button button-ghost" href="#about">
              What is Yokoi?
            </a>
          </div>
          <div className="hero-fineprint">
            <span>OPEN FILES</span>
            <span>NO ROMS</span>
            <span>MADE WITH CARE</span>
          </div>
        </div>

        <figure className="hero-art">
          <div className="art-orbit art-orbit-one" aria-hidden="true" />
          <div className="art-orbit art-orbit-two" aria-hidden="true" />
          <img
            src="/art/yokoi-workbench-hero.png"
            alt="A surreal translucent handheld on an indigo electronics workbench, surrounded by ribbon cables, cartridges, and a floating paper swan"
          />
          <span className="sticker sticker-top">ODD HARDWARE INSIDE</span>
          <span className="sticker sticker-bottom">Y / SWAN LAB</span>
          <figcaption>
            <span>FIG. 001</span>
            <span>FICTIONAL WORKBENCH STUDY</span>
          </figcaption>
        </figure>
      </section>

      <section className="project-section" id="projects">
        <div className="section-heading">
          <div>
            <span className="section-kicker">THE USEFUL PILE</span>
            <h2 id="downloads">Downloads &amp; projects</h2>
          </div>
          <p>
            Small, documented things for playing, building, organizing, and
            preserving the weirdest handheld on your shelf.
          </p>
        </div>

        <div className="project-grid">
          <article className="project-card project-swan">
            <div className="card-topline">
              <span>01 / OPENFPGA</span>
              <span className="status status-dev">IN DEVELOPMENT</span>
            </div>
            <div className="card-visual swan-visual" aria-hidden="true">
              <div className="scanlines" />
              <img src="/favicon.png" alt="" />
              <span>SWAN<br />SONG</span>
            </div>
            <div className="card-copy">
              <h3>Swan Song</h3>
              <p>
                A WonderSwan and WonderSwan Color core built to feel at home on
                Analogue Pocket.
              </p>
              <ul className="chip-list" aria-label="Swan Song features">
                <li>VERTICAL PLAY</li>
                <li>PER-GAME SAVES</li>
                <li>DISPLAY MODES</li>
              </ul>
            </div>
            <div className="card-actions">
              <span>No verified public release yet</span>
              <a href={repoUrl} target="_blank" rel="noreferrer">
                Read field notes <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <article className="project-card project-controller">
            <div className="card-topline">
              <span>02 / HARDWARE</span>
              <span className="status">FAB FILES</span>
            </div>
            <div className="card-visual photo-visual">
              <img
                src="/art/swantroller-top.png"
                alt="Top-side rendering of the Swantroller RP2040 controller board"
              />
              <span className="visual-label">BOARD / REV. B</span>
            </div>
            <div className="card-copy">
              <h3>Swantroller RP2040</h3>
              <p>
                Fabrication files, assembly data, firmware, and careful order
                notes for a modern controller adapter.
              </p>
              <ul className="chip-list" aria-label="Swantroller files">
                <li>GERBERS</li>
                <li>BOM + CPL</li>
                <li>UF2</li>
              </ul>
            </div>
            <div className="card-actions card-actions-split">
              <a
                href="/downloads/swantroller-rp2040-order-package.zip"
                download
              >
                Order package <span aria-hidden="true">↓</span>
              </a>
              <a href="/downloads/swantroller-rp2040.uf2" download>
                Firmware <span aria-hidden="true">↓</span>
              </a>
            </div>
          </article>

          <article className="project-card project-organizer">
            <div className="card-topline">
              <span>03 / PRINTABLE</span>
              <span className="status">3 × 3</span>
            </div>
            <div className="card-visual photo-visual organizer-visual">
              <img
                src="/art/cartridge-organizer.png"
                alt="Rendered preview of a stepped nine-cartridge WonderSwan organizer"
              />
              <span className="visual-label">207.6 × 57.8 × 47 MM</span>
            </div>
            <div className="card-copy">
              <h3>Cartridge Organizer</h3>
              <p>
                A support-free, stepped display for nine standard cartridges,
                with an editable source and a tiny fit test.
              </p>
              <ul className="chip-list" aria-label="Cartridge organizer files">
                <li>STL</li>
                <li>OPENSCAD</li>
                <li>FIT TEST</li>
              </ul>
            </div>
            <div className="card-actions card-actions-triple">
              <a href="/downloads/wonderswan-organizer-3x3.stl" download>
                STL <span aria-hidden="true">↓</span>
              </a>
              <a href="/downloads/wonderswan-slot-clearance-test.stl" download>
                Fit test <span aria-hidden="true">↓</span>
              </a>
              <a href="/downloads/wonderswan-organizer.scad" download>
                Source <span aria-hidden="true">↓</span>
              </a>
            </div>
          </article>

          <article className="project-card project-patcher">
            <div className="card-topline">
              <span>04 / WORDPRESS</span>
              <span className="status">LOCAL ONLY</span>
            </div>
            <div className="card-visual patch-visual" aria-hidden="true">
              <span className="patch-file">.BPS</span>
              <span className="patch-plus">+</span>
              <span className="patch-file patch-file-two">.IPS</span>
              <span className="patch-result">VERIFIED OUTPUT ✓</span>
            </div>
            <div className="card-copy">
              <h3>Yokoi ROM Patcher</h3>
              <p>
                A WordPress block for publishing translation patches. ROMs are
                validated, patched, and verified entirely in the browser.
              </p>
              <ul className="chip-list" aria-label="ROM patcher features">
                <li>IPS + BPS</li>
                <li>SHA-256</li>
                <li>NO UPLOADS</li>
              </ul>
            </div>
            <div className="card-actions">
              <span>GPL-2.0-or-later · 26 KB</span>
              <a href="/downloads/yokoi-rom-patcher.zip" download>
                Plugin ZIP <span aria-hidden="true">↓</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-index" aria-hidden="true">
          <span>Y</span>
          <span>05</span>
        </div>
        <div className="about-copy">
          <span className="section-kicker">WHY YOKOI?</span>
          <h2>A workshop, not a storefront.</h2>
          <p>
            Yokoi is where WonderSwan side projects become usable things: tested
            files, readable notes, reproducible builds, and downloads that say
            exactly what they contain.
          </p>
        </div>
        <ol className="manifesto">
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

      <aside className="legal-note">
        <span className="legal-symbol" aria-hidden="true">!</span>
        <p>
          <strong>No ROMs. No BIOS files.</strong> Yokoi publishes original tools,
          hardware work, documentation, and patching software. Bring only game
          files and firmware you are legally entitled to use.
        </p>
      </aside>

      <footer>
        <div>
          <span className="footer-brand">YOKOI</span>
          <span>TOOLS FOR A STRANGE LITTLE HANDHELD</span>
        </div>
        <div className="footer-links">
          <a href="#top">Back to top ↑</a>
          <a href={repoUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </footer>
    </main>
  );
}
