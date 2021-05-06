class Solarsystem
{
  static init()
  {
    this.center = null;
    this.stars = new Map();
    this.planets = new Map();
    this.moons = new Map();
    this.rings = new Map();
  }

  static setup()
  {
    this.center = new Point(0, 0);
    let obj = null;
    fetch('./res/objects.json')
    .then(result => result.json())
    .then(objects => {
      // Stars
      objects.stars.forEach(s => {
        obj = new Star(s.center, s.radiusSize);
        this.stars.set(s.name, obj);
      });
      // Planets
      objects.planets.forEach(p => {
        let s = this.stars.get(p.star)
        obj = new Planet(s, p.radiusRot, p.radiusSize, p.rotationTime, p.color || undefined, p.retrograde || undefined);
        this.planets.set(p.name, obj);
      });
      // Moons
      objects.moons.forEach(m => {
        let p = this.planets.get(m.planet);
        obj = new Moon(p, m.radiusRot, m.radiusSize, m.rotationTime, m.color || undefined, m.retrograde || undefined);
        this.moons.set(m.name, obj);
      });
      // Rings
      objects.rings.forEach(r => {
        let p = this.planets.get(r.planet) || this.stars.get(r.star);
        obj = new PlanetRing(p, r.minRadius, r.maxRadius);
        this.rings.set(r.name, obj);
      });
    });
  }

  static update(deltaTime)
  {
    this.planets.forEach(planet => {
      planet.update(deltaTime);
    })
    this.moons.forEach(moon => {
      moon.update(deltaTime);
    })
  }

  static output()
  {
    // Focus
    let focus = this.stars.get(settings.focus) || this.planets.get(settings.focus) || this.moons.get(settings.focus);
    settings.offsetX = focus? (focus.pos.x - CVS_MAIN.width/2) : settings.offsetX;
    settings.offsetY = focus? (focus.pos.y - CVS_MAIN.height/2) : settings.offsetY;
    // Clear canvas
    CTX_MAIN.clearRect(0, 0, CVS_MAIN.width, CVS_MAIN.height);
    // Output stars
    this.stars.forEach((star) => {
      star.output(settings.offsetX, settings.offsetY);
    })
    // Output planets
    this.planets.forEach(planet => {
      planet.output(settings.offsetX, settings.offsetY);
    });
    // Output moons
    this.moons.forEach(moon => {
      moon.output(settings.offsetX, settings.offsetY);
    })
    // Output rings
    this.rings.forEach(ring => {
      ring.output(settings.offsetX, settings.offsetY);
    })
  }
}
