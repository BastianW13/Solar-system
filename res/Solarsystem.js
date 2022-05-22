class Solarsystem
{
  static init()
  {
    this.center = null;
    this.objects = new Map();
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
        this.objects.set(s.name, obj);
      });
      // Planets
      objects.planets.forEach(p => {
        let s = this.objects.get(p.star)
        obj = new Planet(s, p.radiusRot, p.radiusSize, p.rotationTime, p.color || undefined, p.retrograde || undefined);
        this.objects.set(p.name, obj);
      });
      // Moons
      objects.moons.forEach(m => {
        let p = this.objects.get(m.planet);
        obj = new Moon(p, m.radiusRot, m.radiusSize, m.rotationTime, m.color || undefined, m.retrograde || undefined);
        this.objects.set(m.name, obj);
      })
    });
  }

  static update(deltaTime)
  {
    this.objects.forEach(object => {
      object.update(deltaTime);
    })
  }

  static output()
  {
    // Focus
    let focus = this.objects.get(settings.focus);
    settings.offsetX = focus? (focus.pos.x - CVS_MAIN.width/2) : settings.offsetX;
    settings.offsetY = focus? (focus.pos.y - CVS_MAIN.height/2) : settings.offsetY;
    // Clear canvas
    CTX_MAIN.clearRect(0, 0, CVS_MAIN.width, CVS_MAIN.height);
    // Output objects
    this.objects.forEach((object) => {
      object.output(settings.offsetX, settings.offsetY);
    })
  }

  static findObject(posX, posY)
  {
    let object = 0;

    this.objects.forEach((planet, name) => {
      if (posX < planet.pos.x + planet.radiusSize() && posX > planet.pos.x - planet.radiusSize() &&
          posY < planet.pos.y + planet.radiusSize() && posY > planet.pos.y - planet.radiusSize())
      {
        object = name;
      }
    })
    return object;
  }
}
