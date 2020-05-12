class Loader
{
  // Initialization functions
  static async init()
  {
    await this.createGlobals();
    await Promise.all([
      this.addJS('./res/Objects.js'),
      this.addJS('./res/Solarsystem.js'),
      this.addJS('./res/Timer.js'),
    ]);
    Solarsystem.init();
    Timer.init();
  }

  static createGlobals()
  {
    return new Promise(resolve => {
      window.CVS_MAIN = document.getElementById('cvsMain');
      window.CTX_MAIN = CVS_MAIN.getContext('2d');
      window.settings = this.loadSettings();
      resolve();
    })
  }

  static loadSettings()
  {
    let settings = {};
    if (localStorage.getItem('settings'))
    {
      settings = JSON.parse(localStorage.getItem('settings'));
    }

    settings = {
      timeScaling: settings.timeScaling || 1,
      totalScaling: settings.totalScaling || 1,
      starSizeScaling: settings.starSizeScaling || 1,
      planetDistanceScaling: settings.planetDistanceScaling || 1,
      planetSizeScaling: settings.planetSizeScaling || 1,
      planetPaths: settings.planetPaths || true,
      moonDistanceScaling: settings.moonDistanceScaling || 1,
      moonSizeScaling: settings.moonSizeScaling || 1,
      moonPaths: settings.moonPaths || true,
      moonPathLength: settings.moonPathLength || 1,
      offsetX: settings.offsetX || 0,
      offsetY: settings.offsetY || 0,
      focus: settings.focus || '',
    };

    return settings;
  }

  static addJS(src, type = 'text/javascript')
  {
    return new Promise(resolve => {
      let script = document.createElement('script');
      script.src = src;
      script.type = type;
      script.onload = () => {resolve()};
      document.getElementsByTagName('head')[0].appendChild(script);
    })
  }

  // Setup functions
  static async setup()
  {
    this.setupCanvas();
    this.setupWindowEvents();
    this.setupMouseEvents();
    this.setupMenuEvents();
    Solarsystem.setup();
  }

  static setupCanvas()
  {
    CVS_MAIN.style.width = document.documentElement.clientWidth;
    CVS_MAIN.style.height = document.documentElement.clientHeight;
    CVS_MAIN.width = document.documentElement.clientWidth;
    CVS_MAIN.height = document.documentElement.clientHeight;
  }

  static setupWindowEvents()
  {
    let putLocalStorage = () => {
      localStorage.setItem('settings', JSON.stringify(settings));
    }

    window.onblur = putLocalStorage;
    window.onunload = putLocalStorage;

    window.onresize = () => {
      this.setupCanvas();
    }
  }

  static setupMouseEvents()
  {
    let xStart = 0;
    let yStart = 0;
    let dx = 0;
    let dy = 0;

    CVS_MAIN.onmousedown = (ev) => {
      ev.preventDefault();
      settings.focus = '';
      xStart = ev.clientX;
      yStart = ev.clientY;
    }

    CVS_MAIN.onmousemove = (ev) => {
      if (ev.buttons === 1)
      {
        ev.preventDefault();
        dx = ev.clientX - xStart;
        dy = ev.clientY - yStart;
        xStart = ev.clientX;
        yStart = ev.clientY;
        settings.offsetX -= dx;
        settings.offsetY -= dy;
      }
    }
  }

  // Setup menu functions
  // settings = {
    //   timeScaling: 1,
    //   planetPaths: true,
    //   moonPaths: true,
    //   moonPathLength: 1,
    //   offsetX: 0,
    //   offsetY: 0,
    //   focus: '',
    // };
  static setupMenuEvents()
  {
    let btnMenu = document.getElementById('btnMenu');
    let menuBar = document.getElementById('menuBar');
    let btnsBack = document.getElementsByClassName('btnBack');
    let btnMenuScaling = document.getElementById('btnMenuScaling');
    let btnMenuFocus = document.getElementById('btnMenuFocus');
    let inpScalingTime = document.getElementById('inpScalingTime');
    let btnResetSettings = document.getElementById('btnResetSettings');

    btnMenu.onmouseover = () => {
      btnMenu.style.display = 'none';
      menuBar.style.display = 'flex';
    }

    menuBar.onmouseleave = () => {
      btnMenu.style.display = 'block';
      menuBar.style.display = 'none';
    }

    for (let btn of btnsBack)
    {
      btn.onclick = (ev) => {
        this.showMenu(ev.target.parentNode.parentNode.id);
      }
    }

    btnMenuScaling.onclick = () => {
      this.showMenu('menuScaling');
    }
    this.setupMenuScaling();

    btnMenuFocus.onclick = () => {
      this.showMenu('menuFocus');
    }
    this.setupMenuFocus();

    inpScalingTime.oninput = (ev) => {
      settings.timeScaling = ev.target.value;
    }

    btnResetSettings.onclick = () => {
      settings = {
        totalScaling: 0.005,
        timeScaling: 1,
        starSizeScaling: 1,
        planetDistanceScaling: 1,
        planetSizeScaling: 1,
        planetPaths: true,
        moonDistanceScaling: 1,
        moonSizeScaling: 1,
        moonPaths: true,
        moonPathLength: 1,
        offsetX: 0,
        offsetY: 0,
        focus: '',
      };
      this.resetMenu();
    }

    // Initalize menu
    this.showMenu('menuMain');
    this.resetMenu();
  }

  static setupMenuScaling()
  {
    let inpScalingAll = document.getElementById('inpScalingAll');
    let inpScalingPlanetSize = document.getElementById('inpScalingPlanetSize');
    let inpScalingPlanetDistance = document.getElementById('inpScalingPlanetDistance');
    let inpScalingMoonSize = document.getElementById('inpScalingMoonSize');
    let inpScalingMoonDistance = document.getElementById('inpScalingMoonDistance');
    let inpScalingStarSize = document.getElementById('inpScalingStarSize');
    let btnResetScaling = document.getElementById('btnResetScaling');

    inpScalingAll.oninput = (ev) => {
      settings.totalScaling = Math.pow(1.5, ev.target.value);
    }

    inpScalingPlanetSize.oninput = (ev) => {
      settings.planetSizeScaling = Math.pow(1.5, ev.target.value);
    }

    inpScalingPlanetDistance.oninput = (ev) => {
      settings.planetDistanceScaling = Math.pow(1.5, ev.target.value);
    }

    inpScalingMoonSize.oninput = (ev) => {
      settings.moonSizeScaling = Math.pow(1.5, ev.target.value);
    }

    inpScalingMoonDistance.oninput = (ev) => {
      settings.moonDistanceScaling = Math.pow(1.5, ev.target.value);
    }

    inpScalingStarSize.oninput = (ev) => {
      settings.starSizeScaling = Math.pow(1.5, ev.target.value);
    }

    btnResetScaling.onclick = () => {
      settings.totalScaling = 0.005;
      settings.timeScaling = 1;
      settings.starSizeScaling = 1;
      settings.planetDistanceScaling = 1;
      settings.planetSizeScaling = 1;
      settings.moonDistanceScaling = 1;
      settings.moonSizeScaling = 1;
      this.resetMenu();
    }
  }

  static setupMenuFocus()
  {
    let createButton = (innerHTML) => {
      let btn = document.createElement('button');
      btn.className = 'cMenuButton';
      btn.innerHTML = innerHTML;
      btn.onclick = (ev) => {settings.focus = ev.target.innerHTML};
      return btn;
    }

    let menuFocus = document.getElementById('menuFocus');
    let btnBack = menuFocus.getElementsByClassName('btnBack')[0];

    fetch('./res/objects.json')
    .then(res => res.json())
    .then(objects => {
      objects.stars.forEach(star => {
        menuFocus.insertBefore(createButton(star.name), btnBack);
      });
      objects.planets.forEach(planet => {
        menuFocus.insertBefore(createButton(planet.name), btnBack);
      });
      objects.moons.forEach(moon => {
        menuFocus.insertBefore(createButton(moon.name), btnBack);
      })
    });
  }

  static showMenu(menuName)
  {
    menuName = (menuName === 'menuBar') ? 'menuMain' : menuName;
    let menuAll = document.getElementsByClassName('cMenu');
    let menuActive = document.getElementById(menuName);
    
    for (let menu of menuAll)
    {
      menu.style.display = 'none';
    }
    menuActive.style.display = 'flex';
  }


  static resetMenu()
  {
    let inpScalingTime = document.getElementById('inpScalingTime');
    inpScalingTime.value = settings.timeScaling;
    let inpScalingAll = document.getElementById('inpScalingAll');
    inpScalingAll.value = Math.log(settings.totalScaling) / Math.log(1.5);
    let inpScalingPlanetSize = document.getElementById('inpScalingPlanetSize');
    inpScalingPlanetSize.value = Math.log(settings.planetSizeScaling) / Math.log(1.5);
    let inpScalingPlanetDistance = document.getElementById('inpScalingPlanetDistance');
    inpScalingPlanetDistance.value = Math.log(settings.planetDistanceScaling) / Math.log(1.5);
    let inpScalingMoonSize = document.getElementById('inpScalingMoonSize');
    inpScalingMoonSize.value = Math.log(settings.moonSizeScaling) / Math.log(1.5);
    let inpScalingMoonDistance = document.getElementById('inpScalingMoonDistance');
    inpScalingMoonDistance.value = Math.log(settings.moonDistanceScaling) / Math.log(1.5);
  }

  // Start function
  static start()
  {
    Timer.start();
  }
}
