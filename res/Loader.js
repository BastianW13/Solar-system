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
    CVS_MAIN.ontouchstart = (ev) => {
      ev.preventDefault();
      settings.focus = '';
      touch = ev.changedTouches[0];
      xStart = touch.clientX;
      yStart = touch.clientY;
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
    CVS_MAIN.ontouchmove = (ev) => {
      ev.preventDefault();
      touch = ev.changedTouches[0];
      dx = touch.clientX - xStart;
      dy = touch.clientY - yStart;
      xStart = touch.clientX;
      yStart = touch.clientY;
      settings.offsetX -= dx;
      settings.offsetY -= dy;
    }

    let slider = document.getElementById('inpScalingAll');
    min = parseInt(slider.min);
    max = parseInt(slider.max);
    CVS_MAIN.onwheel = (ev) => {
      ev.preventDefault();
      current = parseFloat(slider.value);
      current -= ev.deltaY * 0.05;
      current = Math.max(Math.min(current, max), min);
      slider.value = current;
      settings.totalScaling = Math.pow(1.5, current);
    }
  }

  // Setup menu functions
  // settings = {
    //   planetPaths: true,
    //   moonPaths: true,
    //   moonPathLength: 1,
    //   offsetX: 0,
    //   offsetY: 0,
    //   focus: '',
    // };
  static setupMenuEvents()
  {
    // Showing/Hiding the menu bar
    let btnMenu = document.getElementById('btnMenu');
    let menuBar = document.getElementById('menuBar');

    btnMenu.onmouseover = () => {
      btnMenu.style.display = 'none';
      menuBar.style.display = 'flex';
    }
    menuBar.onmouseleave = () => {
      btnMenu.style.display = '';
      menuBar.style.display = '';
    }

    // Navigating the menu
    let btnsMenuChange = document.getElementsByClassName('btnMenuChange');
    let btnsBack = document.getElementsByClassName('btnBack');

    let inpScalingTime = document.getElementById('inpScalingTime');
    let btnResetSettings = document.getElementById('btnResetSettings');

    for (let btn of btnsMenuChange)
    {
      btn.onclick = (ev) => {
        let hide = ev.target.parentElement;
        let show = document.getElementById(ev.target.name);
        hide.style.display = '';
        show.style.display = 'flex';
        show.children[0].style.display = 'flex';
      }
    }

    for (let btn of btnsBack)
    {
      btn.onclick = (ev) => {
        let top = ev.target.parentElement.parentElement.parentElement;
        let current = ev.target.parentElement;
        top.children[0].style.display = 'flex';
        current.style.display = '';
        current.parentElement.style.display = '';
      }
    }

    // Setup main menu
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

    // Setup submenus
    this.setupMenuScaling();
    this.setupMenuFocus();


    // Initalize menu
    let menuMain = document.getElementById('menuMain');
    menuMain.style.display = 'flex';
    menuMain.children[0].style.display = 'flex';
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
    let createFocusButton = (innerHTML) => {
      let btn = document.createElement('button');
      btn.className = 'cMenuButton';
      btn.innerHTML = innerHTML;
      btn.onclick = (ev) => {settings.focus = ev.target.innerHTML};
      return btn;
    }

    let menuFocus_Stars_Control = document.getElementById('menuFocus_Stars').children[0];
    let menuFocus_Planets_Control = document.getElementById('menuFocus_Planets').children[0];
    let menuFocus_Moons_Control = document.getElementById('menuFocus_Moons').children[0];
    let btnBack;

    fetch('./res/objects.json')
    .then(res => res.json())
    .then(objects => {
      btnBack = menuFocus_Stars_Control.children[0];
      objects.stars.forEach(star => {
        menuFocus_Stars_Control.insertBefore(createFocusButton(star.name), btnBack);
      });
      btnBack = menuFocus_Planets_Control.children[0];
      objects.planets.forEach(planet => {
        menuFocus_Planets_Control.insertBefore(createFocusButton(planet.name), btnBack);
      });
      btnBack = menuFocus_Moons_Control.children[0];
      objects.moons.forEach(moon => {
        menuFocus_Moons_Control.insertBefore(createFocusButton(moon.name), btnBack);
      })
    });
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
