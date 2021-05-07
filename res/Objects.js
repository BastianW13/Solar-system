class Point
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }
}

class Star
{
  constructor(pos, radiusSize, name = 'Sun', color = 'yellow')
  {
    this.name = name;
    this.pos = pos;
    this.color = color;
    this.radiusSize = () => {return radiusSize * settings.starSizeScaling * settings.totalScaling};
  }

  output(offsetX = 0, offsetY = 0)
  {
    CTX_MAIN.save();
    CTX_MAIN.translate(-offsetX, -offsetY);
    CTX_MAIN.fillStyle = this.color;
    CTX_MAIN.beginPath();
    CTX_MAIN.arc(this.pos.x, this.pos.y, this.radiusSize(), 0, 2*Math.PI)
    CTX_MAIN.fill();
    CTX_MAIN.restore();
  }
}


class Planet
{
  constructor(star, radiusRot, radiusSize, rotationTime, color='grey', retrograde = false)
  {
    this.star = star;
    this.color = color;
    this.radiusRot = () => {return radiusRot * settings.planetDistanceScaling * settings.totalScaling};
    this.radiusSize = () => {return radiusSize * settings.planetSizeScaling * settings.totalScaling};
    this.speed = () => {return 2*Math.PI/rotationTime * settings.timeScaling * (retrograde? -1 : 1)};

    this.center = new Point(star.pos.x, star.pos.y);
    this.pos = new Point(this.center.x + this.radiusRot(), this.center.y);
    this.angle = 0;
    this.active = () => {return (star.pos.x + star.radiusSize()) < (this.radiusRot() - this.radiusSize())};
  }

  update(deltaTime)
  {
    this.angle += this.speed() * deltaTime;
    this.pos.x = this.star.pos.x + this.radiusRot() * Math.cos(this.angle);
    this.pos.y = this.star.pos.y + this.radiusRot() * Math.sin(this.angle);
  }

  output(offsetX = 0, offsetY = 0)
  {
    if (!this.active()) return;
    if (settings.planetPaths) this.outputPath(offsetX, offsetY);
    CTX_MAIN.save();
    CTX_MAIN.translate(-offsetX, -offsetY);
    CTX_MAIN.fillStyle = this.color;
    CTX_MAIN.beginPath();
    CTX_MAIN.arc(this.pos.x, this.pos.y, this.radiusSize(), 0, 2*Math.PI)
    CTX_MAIN.fill();
    CTX_MAIN.restore();
  }

  outputPath(offsetX = 0, offsetY = 0)
  {
    CTX_MAIN.save();
    CTX_MAIN.translate(-offsetX, -offsetY);
    CTX_MAIN.strokeStyle = this.color;
    CTX_MAIN.beginPath();
    CTX_MAIN.arc(this.center.x, this.center.y, this.radiusRot(), 0, 2*Math.PI)
    CTX_MAIN.stroke();
    CTX_MAIN.restore();
  }
}


class Moon
{
  constructor(planet, radiusRot, radiusSize, rotationTime, color = 'grey', retrograde = false)
  {
    this.planet = planet;
    this.color = color;
    this.radiusRot = () => {return radiusRot * settings.moonDistanceScaling * settings.totalScaling};
    this.radiusSize = () => {return radiusSize * settings.moonSizeScaling * settings.totalScaling};
    this.speed = () => {return 2*Math.PI/rotationTime * settings.timeScaling * (retrograde? -1 : 1)};

    this.pos = new Point(planet.pos.x + this.radiusRot(), planet.pos.y);
    this.angle = 0;

    this.active = () => {return planet.radiusSize() < (this.radiusRot() - this.radiusSize())};
    this.path = new Array();
  }

  update(deltaTime)
  {
    this.angle += this.speed() * deltaTime;
    this.pos.x = this.planet.pos.x + this.radiusRot() * Math.cos(this.angle);
    this.pos.y = this.planet.pos.y + this.radiusRot() * Math.sin(this.angle);
  }

  output(offsetX = 0, offsetY = 0)
  {
    if (!this.active() || !this.planet.active()) return;
    if (settings.moonPaths) this.outputPath(offsetX, offsetY);
    CTX_MAIN.save();
    CTX_MAIN.translate(-offsetX, -offsetY);
    CTX_MAIN.fillStyle = this.color;
    CTX_MAIN.beginPath();
    CTX_MAIN.arc(this.pos.x, this.pos.y, this.radiusSize(), 0, 2*Math.PI)
    CTX_MAIN.fill();
    CTX_MAIN.restore();
  }

  outputPath(offsetX = 0, offsetY = 0)
  {
    this.calculatePath();
    let current, next;
    CTX_MAIN.save();
    CTX_MAIN.translate(-offsetX, -offsetY);
    CTX_MAIN.strokeStyle = this.color;
    CTX_MAIN.beginPath();
		current = this.path[0];
		for (let i = 1; i < this.path.length; i++)
		{
			next = this.path[i];
			CTX_MAIN.moveTo(current.x, current.y);
			CTX_MAIN.lineTo(next.x, next.y);
			current = next;
		}
		CTX_MAIN.stroke();
    CTX_MAIN.restore();
  }

  calculatePath()
  {
    this.path.length = 0;
    let pathLength = settings.moonPathLength;
    let anglePlanet = this.planet.angle - this.planet.speed() * pathLength;
    let angleMoon = this.angle - this.speed() * pathLength;
    let x, y;
    while (anglePlanet < this.planet.angle + this.planet.speed() * pathLength)
    {
      anglePlanet += this.planet.speed() * 1/60;
      angleMoon += this.speed() * 1/60;
      x = this.planet.center.x + this.planet.radiusRot() * Math.cos(anglePlanet) + this.radiusRot() * Math.cos(angleMoon);
      y = this.planet.center.y + this.planet.radiusRot() * Math.sin(anglePlanet) + this.radiusRot() * Math.sin(angleMoon);
      this.path.push(new Point(x, y));
    }
  }
}


class PlanetRing
{
  constructor(center, minRadius, maxRadius, color='grey')
  {
    this.center = center;
    this.color = color;
    this.radMin = () => {return minRadius * settings.planetSizeScaling * settings.totalScaling};
    this.radMax = () => {return maxRadius * settings.planetSizeScaling * settings.totalScaling};
  }

  update(deltaTime)
  {

  }

  output(offsetX = 0, offsetY = 0)
  {
    CTX_MAIN.save();
    CTX_MAIN.translate(-offsetX, -offsetY);
    CTX_MAIN.fillStyle = this.color;
    CTX_MAIN.globalAlpha = 0.5;
    CTX_MAIN.strokeStyle = this.color;
    CTX_MAIN.setLineDash([10, 3]);
    let r = this.radMin();
    let d = this.radMax() - this.radMin();
    while (r < this.radMax())
    {
    	CTX_MAIN.beginPath();
    	CTX_MAIN.arc(this.center.pos.x, this.center.pos.y, this.center.radiusSize() + r, 0 +r, 2*Math.PI+r);
    	CTX_MAIN.stroke();
    	r += d * 0.02;
    }
    CTX_MAIN.restore();
  }
}

class StarRing
{
  constructor(center, minRadius, maxRadius, color='grey')
  {
    this.center = center;
    this.color = color;
    this.radMin = () => {return minRadius * settings.planetDistanceScaling * settings.totalScaling};
    this.radMax = () => {return maxRadius * settings.planetDistanceScaling * settings.totalScaling};
    // Define this.rads as list with radians for drawing multiple circles
    this.radSteps = [];
    let x = 0;
    while (x < 1)
    {
      x += Math.random() * 0.1;
      this.radSteps.push(x);
    }
  }

  // Create Update function counting up and defining this.rads new after a certain amount of time, so it doesnt flash as wildly
  update(deltaTime)
  {
  }

  output(offsetX = 0, offsetY = 0)
  {
    CTX_MAIN.save();
    CTX_MAIN.translate(-offsetX, -offsetY);
    CTX_MAIN.fillStyle = this.color;
    CTX_MAIN.globalAlpha = 0.5;

    CTX_MAIN.strokeStyle = this.color;

    let min = this.radMin();
    let d = this.radMax() - this.radMin();
    this.radSteps.forEach(r => {
      CTX_MAIN.beginPath();
      CTX_MAIN.arc(this.center.pos.x, this.center.pos.y, this.center.radiusSize() + min + r * d, 0, 2*Math.PI);
      CTX_MAIN.stroke();
    })

    CTX_MAIN.restore();
  }
}
