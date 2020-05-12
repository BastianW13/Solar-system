class Timer
{
  static init()
  {
    let deltaTime = 1/60;
    let accumulatedTime = 0;
    let lastTime = 0;

    this.update = (time) => {
      accumulatedTime += (time - lastTime)/1000;
      lastTime = time;

      if (accumulatedTime > 1)
      {
        accumulatedTime %= 1;
      }

      while (accumulatedTime > deltaTime)
      {
        Solarsystem.update(deltaTime);
        Solarsystem.output();
        accumulatedTime -= deltaTime;
      }

      requestAnimationFrame(this.update);
    }
  }

  static start()
  {
    requestAnimationFrame(this.update);
  }
}
