# Local demo hotel imagery

The six 960 × 640 WebP files are original geometric room illustrations generated
for this repository on 2026-10-27 with `generate.py`. They are project-owned demo
placeholders, not hotel photographs. No Ostrovok images, external media, stock
assets, logos, or third-party visual source material were used. The illustrations
may be used and modified as part of this project without third-party attribution.

Files: `city-grand.webp`, `river-view.webp`, `garden-house.webp`,
`modern-loft.webp`, `atrium.webp`, and `classic-suite.webp`.

Reproduce with Python 3 and Pillow: `python3 src/assets/hotels/generate.py`.
The palette and scene geometry are kept in the generator. Outputs use WebP quality
82 and encoder method 6. Each image carries an embedded demo illustration label.

The mock server serves these files at `/api/assets/hotels/:filename.webp`; JSON
catalog responses contain those URLs. The browser consumes image URLs through
the catalog and does not import server fixtures.
