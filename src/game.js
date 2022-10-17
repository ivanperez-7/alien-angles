/*****************************************
 * Alien angles!!!                       *
 * Jueguito chido con Phaser             *
 *                                       *
 * Autor: Iván Alberto Pérez Maldonado   *
 * Facultad de Matemáticas, UADY, 2022   *
 *****************************************/

// Resolución del juego
const w = 960, h = 720;

// clase de un nivel del juego
const Nivel = (titulo, fondo, planeta, alien, angulosBase, introduccion, ayuda) => ({
    titulo: titulo,
    fondo: fondo,
    planeta: planeta,
    alien: alien,
    angulosBase: angulosBase,
    introduccion: introduccion,
    ayuda: ayuda
});

// clase de un alien
const Alien = (nombre, particles, side1, side2, angle) => ({
    nombre: nombre,
    particles: particles,
    side1: side1,
    side2: side2,
    angle: angle
});

const alien1 = Alien('alien1', 'blue', 0xAA00AA, 0x00AA00, 0x84D9FF),
      alien2 = Alien('alien2', 'green', 0xAA00AA, 0x00AA00, 0xFF8B3D),
      alien3 = Alien('alien3', 'red', 0xAA00AA, 0x00AA00, 0xFFD580),
      alien4 = Alien('alien4', 'blue', 0xAA00AA, 0x00AA00, 0xD8B9FF);

const listaNiveles = [
    Nivel ('agudos', 'sky', 'tierra', alien1, Phaser.Utils.Array.NumberArray(15/5, 80/5), [
        '¡Este alien está de visita por el planeta! Hará muchos recorridos a distintos lugares, ¡y necesita de tu ayuda!',
        'Debes medir el ángulo formado por el recorrido del alien, ¡presta atención!'
    ], "Recuerda que los ángulos agudos miden menos de 90°, ¡tú puedes!"),

    Nivel ('obtusos', 'space', 'venus', alien2, Phaser.Utils.Array.NumberArray(95/5, 175/5), [
        'Ahora que estás familiarizado con los ángulos agudos, ¡es hora de trabajar con los obtusos!',
        'El alien ahora hará recorridos más amplios por el planeta, ¡presta atención!'
    ], "Recuerda que los ángulos obtusos miden más de 90° pero menos de 180°, ¡tú puedes!"),

    Nivel ('cóncavos', 'space2', 'mars', alien3, Phaser.Utils.Array.NumberArray(185/5, 345/5), [
        '¡Wow! Hasta ahora has ayudado demasiado a nuestros dos amigos aliens, ¡muchas gracias!',
        'Conoce ahora a nuestro tercer amigo, quien realizará recorridos mucho más amplios que los demás.'
    ], "Recuerda que los ángulos cóncavos miden más de 180° pero menos de 360°, ¡tú puedes!"),

    Nivel ('por doquier', 'night', 'moon', alien4, Phaser.Utils.Array.NumberArray(15/5, 345/5), [
        '¡Impresionante! Tienes un don para medir ángulos. Has sido de mucha ayuda para nuestros amigos aliens.',
        '¡Nuestro cuarto y último amigo hará recorridos por el planeta entero! ¿Crees poder ayudarlo?'
    ], "Debes recordar cada uno de los tres tipos importantes de ángulos para esta misión.")
];

const frases = [
    '¡Excelente!',
    '¡Maravilloso!',
    '¡Lo lograste!',
    '¡Perfecto!',
    '¡Lo hiciste muy bien!',
    '¡Pero qué habilidades!',
    '¡Pan comido!'
];

var progreso, lastLevel, bgm;

// Pantalla para cargar recursos y mostrar progreso de carga
class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('boot');
    }

    preload ()
    {
        this.load.setPath('assets/');

        ['agudosPreview', 'alien1', 'alien2', 'alien3', 'alien4', 'arrowWhite', 'blue', 'btAgudo', 'btAyuda', 'btCasa', 'btConcavo',
        'btJugar', 'btJugar2', 'btListo', 'btNiveles', 'btObtuso', 'btRepaso', 'btTransportador', 'candado', 'completoPreview', 'concavosPreview',
        'cross', 'green', 'hideButton', 'HUD', 'HUD2', 'logo', 'mars', 'moon', 'night', 'obtusosPreview', 'protact', 'red', 'sky', 'space',
        'space2', 'star', 'textBox', 'tick', 'tierra', 'venus'].forEach(i => this.load.image(i));

        ['finger_snap', 'explain', 'win', 'complete', 'whoosh', 'music3'].forEach(i => this.load.audio(i, [`sounds/${i}.ogg`, `sounds/${i}.mp3`]));

        if (!localStorage.getItem('progreso') || !localStorage.getItem('lastLevel')) {
            localStorage.setItem('progreso', '0');
            localStorage.setItem('lastLevel', '0');
        }
        progreso = parseInt(localStorage.getItem('progreso'));
        lastLevel = listaNiveles[parseInt(localStorage.getItem('lastLevel'))];

        var p = this.add.text(w/2, h/2, 'Cargando... 0%', {fontFamily: 'Showcard', fontSize: 30}).setOrigin(0.5, 0.5);
        this.load.on('progress', value => p.setText(`Cargando... ${Math.floor(value*100)}%`));
        this.load.on('complete', () => this.scene.start('menu'));
    }
}

// Menú principal
class Menu extends Phaser.Scene 
{
    constructor ()
    {
        super('menu');
    }

    create ()
    {
        this.input.setDefaultCursor('url(assets/blue.cur), pointer');
        this.add.image(w/2, h/2, lastLevel.fondo);
        this.sound.pauseOnBlur = false;

        if(!bgm) { bgm = this.sound.add('music3', {volume: 0.7, loop: true}).play() }
        
        var logo = this.add.image(w/2, 180, 'logo');
        this.alien = this.add.image(-60, 645, lastLevel.alien.nombre).setScale(0.55);

        var btJugar = this.add.image(w/2, 378, 'btJugar').setData('escena', 'instrucciones');
        var btNiveles = this.add.image(w/2, 502, 'btNiveles').setData('escena', 'niveles');
        var btRepaso = this.add.image(w/2, 626, 'btRepaso').setData('escena', 'repaso');
        var candado = progreso < 4? (btRepaso.setTint(0x1F1F1F).setData('bloqueado', true), this.add.image(w/2, 622, 'candado').setScale(0.45)) : this.make.text();
        var candado2 = progreso == 0? (btNiveles.setTint(0x1F1F1F).setData('bloqueado', true), this.add.image(w/2, 498, 'candado').setScale(0.45)) : this.make.text();

        this.animables = [logo, btJugar, btNiveles, btRepaso, candado, candado2];
        this.interactive = [btJugar, btNiveles, btRepaso]

        this.input.on('gameobjectover', (p, gameObject, e) => gameObject.setScale(0.35))
        .on('gameobjectout', (p, gameObject, e) => gameObject.setScale(0.3))
        .on('gameobjectdown', (p, gameObject, e) => { if(!gameObject.data.values.bloqueado) this.clearScreen(gameObject.data.values.escena) });

        this.tweens.add({
            targets: this.animables,
            scale: {from: 0, to: 0.3},
            ease: 'Back',
            duration: 0.9e3,
            onComplete: () => [btJugar,btNiveles,btRepaso].forEach(i => i.setInteractive())
        });

        this.tweens.add({
            targets: [candado, candado2],
            scale: {from: 0, to: 0.45},
            ease: 'Back',
            duration: 0.9e3
        });

        this.tweens.add({
            targets: this.alien,
            x: 90,
            ease: 'Power2',
            duration: 0.7e3,
            delay: 0.5e3
        });
    }

    // quita todos los elementos y llama a una función
    clearScreen (sc)
    {
        this.interactive.forEach(i => i.disableInteractive().setScale(0.3));

        this.tweens.add({
            targets: this.animables,
            scale: 0,
            ease: 'Back.easeIn',
            duration: 0.9e3,
            onComplete: () => this.scene.start(sc)
        });

        this.tweens.add({
            targets: this.alien,
            x: -70,
            ease: 'Power2',
            duration: 0.7e3
        });
    }
}

class Instrucciones extends Phaser.Scene
{
    constructor ()
    {
        super('instrucciones');
    }

    create ()
    {
        this.add.image(w/2, h/2, lastLevel.fondo);
        var btCasa = this.add.image(58, 65, 'btCasa').setScale(0).on('pointerdown', () => this.clearScreen('menu'));
        var btJugar = this.add.image(863, 640, 'btJugar2').setScale(0).on('pointerdown', () => this.clearScreen('juego'));
        var titulo = this.add.text(w/2, 65, "Instrucciones", {fontFamily: 'Showcard', fontSize: 38, stroke: '#40bad2', strokeThickness: 3}).setOrigin(0.5,0.5).setScale(0);

        var instr = this.add.text(-470, h/2-35, 
        '¡Bienvenido a Alien Angles! Nuestros amigos aliens están de visita por la galaxia y realizarán muchos recorridos en distintos planetas.\n\nNecesitan de tu ayuda para medir los ángulos de sus recorridos. ¿te crees capaz? ¡Vamos a averiguarlo!', 
        {fontFamily: 'Showcard', fontSize: 26, align: 'center', stroke: '#000000', strokeThickness: 3}).setOrigin(0.5,0.5).setScale(0).setWordWrapWidth(w-100,false).setLineSpacing(25);

        this.tweens.add({
            targets: [btCasa, btJugar],
            scale: 0.3,
            ease: 'Back',
            duration: 0.9e3
        });
        this.tweens.add({
            targets: [titulo, instr],
            scale: 1,
            ease: 'Back',
            duration: 0.9e3
        });

        var aliens = [...['alien1','alien2','alien3','alien4'].entries()].map(a => this.add.image(270+140*a[0], 900, a[1]).setScale(0.5));
        this.tweens.add({
            targets: aliens,
            y: 660,
            ease: 'Sine.easeOut',
            delay: (e, t, a, targetIndex, s, i) => targetIndex*100 + 700
        });

        this.tweens.add({
            targets: instr,
            x: w/2,
            ease: 'Bounce',
            delay: 2000,
            onComplete: () => [btCasa, btJugar].forEach(i => i.setInteractive())
        });

        this.input.on('gameobjectover', (p, gameObject, e) => gameObject.setScale(0.35))
        .on('gameobjectout', (p, gameObject, e) => gameObject.setScale(0.3))
        .on('gameobjectdown', (p, gameObject, e) => gameObject.setScale(0.3));

        this.animables = [btCasa, btJugar, titulo, instr, ...aliens];
    }

    clearScreen (sc)
    {
        this.animables.forEach(i => i.disableInteractive());

        this.tweens.add({
            targets: this.animables.slice(0,3),
            scale: 0,
            ease: 'Back.easeIn',
            duration: 0.9e3,
            onComplete: () => this.scene.start(sc, {})
        });
        this.tweens.add({
            targets: this.animables.slice(4),
            y: 900,
            ease: 'Sine.easeOut',
            duration: 0.8e3,
        });
        this.tweens.add({
            targets: this.animables[3],
            scale: 0,
            ease: 'Sine.easeOut',
            duration: 0.4e3,
        });
    }
}

class Juego extends Phaser.Scene
{
    constructor ()
    {
        super('juego');
    }

    init (data)                              // parámetro `data` debe ser uno de los prefabs, por defecto es el nivel de los ángulos agudos
    {
        this.nivel = data.alien? data : listaNiveles[0];
        this.respuesta = '0';
        this.angulos = Phaser.Utils.Array.Shuffle(this.nivel.angulosBase);
        
        this.data.set({estado: "inicio", nivActual: 1});
        
        this.helpDisplay = [      // instrucciones, no cambian
            'El alien ha terminado su recorrido por el planeta. ¡Ayúdalo a medir el ángulo formado!',
            'Utiliza el transportador para medir el ángulo, y escribe tu respuesta con el teclado.'
        ];

        localStorage.setItem('lastLevel', listaNiveles.indexOf(this.nivel));
        lastLevel = this.nivel;
    }

    create ()
    {
        this.add.image(w/2, h/2, this.nivel.fondo);
        var tierra = this.add.image(w/2, h/2-30, this.nivel.planeta);
        var mask = this.make.graphics({x: w/2, y: h/2-30}).beginPath().fillCircle(0, 0, 423/2).createGeometryMask();

        var titulo = this.add.text(w/2, 65, `Ángulos ${this.nivel.titulo}`, {fontFamily: 'Showcard', fontSize: 38, stroke: '#40bad2', strokeThickness: 3}).setOrigin(0.5,0.5);
        var particles = this.add.particles(this.nivel.alien.particles);
        var finger_snap = this.sound.add('finger_snap');

        this.angleGraph = this.add.graphics({x: tierra.x, y: tierra.y});
        this.delineado = this.add.graphics({x: tierra.x, y: tierra.y}).setMask(mask);
        this.side1 = this.add.graphics({x: tierra.x, y: tierra.y}).setMask(mask);
        this.side2 = this.add.graphics({x: tierra.x, y: tierra.y}).setMask(mask);

        this.alien = this.add.image(w+60, h/2-30, this.nivel.alien.nombre)
        .setScale(0.4)
        .setFlipX(true);

        var protact = this.protact = this.add.image(w/2, h/2, 'protact')
        .setVisible(false)
        .setInteractive()
        .on('drag', (_, dragX, dragY) => {
            protact.x = dragX;
            protact.y = dragY;
        });

        this.input.setDraggable(protact);

        var HUD = this.add.image(0, 0, 'HUD');
        this.nivDisplay = this.add.text(0, 20, '1/5', {fontFamily: 'Showcard', fontSize: 80}).setOrigin(0.5,0.5);
        this.answDisplay = this.add.text(600, 20, `${this.respuesta}°`, {fontFamily: 'Showcard', fontSize: 80}).setOrigin(0.5,0.5);
        var HUDContainer = this.HUD = this.add.container(w/2, 630, [HUD, this.nivDisplay, this.answDisplay]);

        var btCasa = this.add.image(58, 65, 'btCasa').on('pointerdown', this.showConfirmScreen, this);
        var btAyuda = this.add.image(140, 65, 'btAyuda').on('pointerdown', () => this.showHelp(this.helpDisplay));

        var btTransportador = this.add.image(900, 65, 'btTransportador')
        .on('pointerdown', () => {
            protact.x = 734;
            protact.y = 301;

            protact.setVisible(!protact.visible);
            finger_snap.play();
        });

        var btListo = this.add.image(863, 640, 'btListo').on('pointerdown', this.checkWon, this);

        this.interactive = [btCasa, btAyuda, btTransportador, btListo, protact];
        this.animables = [tierra, titulo, HUDContainer, this.alien, ...this.interactive];

        // Comienzan las animaciones y el resto del juego
        var i = 0.9e3;

        this.tweens.add({
            targets: [btCasa, btAyuda, btTransportador, btListo, HUDContainer],
            scale: {from: 0, to: 0.3},
            ease: 'Back',
            duration: i
        });
        this.tweens.add({
            targets: [tierra, titulo],
            scale: {from: 0, to: 1},
            ease: 'Back',
            duration: i,
            onComplete: () => { 
                this.emitter = particles.createEmitter({
                    speed: 100,
                    scale: { start: 0.5, end: 0 },
                    blendMode: 'ADD'
                }).startFollow(this.alien)
            }
        });
        this.tweens.add({
            targets: this.alien,
            x: 726,
            ease: 'Power3',
            duration: 1e3,
            delay: i,
            onComplete: () => this.showHelp(this.nivel.introduccion)
        });
    }
    
    checkWon ()
    {
        if( this.respuesta !== '0' && Phaser.Math.Within(parseInt(this.respuesta), this.angulo, 5) ){
            if (this.data.values.nivActual == 5) {
                this.data.values.estado = "levelCleared";
                
                if (listaNiveles.indexOf(this.nivel)+1 > progreso) {
                    progreso = Phaser.Math.Clamp(++progreso, 0, 4);
                    localStorage.setItem('progreso', progreso);
                }

                this.sound.add('complete').play();
                this.showHelp(['¡Genial, has adivinado todos los ángulos! Gracias por ayudar a nuestro amigo alien.', 'Su misión en este planeta ha terminado, ¡pero espera! Conozcamos a uno de sus amigos.'], 'Sine.easeOut', h/2, 720, 0);
            }
            else {
                this.data.values.estado = "done";
                this.sound.add('win').play();

                this.showHelp([Phaser.Utils.Array.GetRandom(frases)+"\nHas logrado medir el ángulo formado por el alien.", 'Te has ganado una estrella :) ¡Sigue así para ganar más!'], 'Back', h/2, 0, 0);
            }

            this.tweens.add({
                targets: [this.protact, this.side1, this.side2, this.delineado, this.angleGraph],
                scale: 0,
                ease: 'Lineal',
                duration: 0.2e3,
                onComplete: () => {
                    this.protact.setVisible(false).setScale(1);
                    this.side1.clear().setScale(1);
                    this.side2.clear().setScale(1);
                    this.angleGraph.clear().setScale(1);
                    this.delineado.clear().setScale(1);
                }
            });

            var star = this.add.image(w/2, h/2+68, 'star').setScale(0);
            this.tweens.timeline({
                targets: star,
                tweens: [
                    {
                        scale: {from: 0, to: 0.63},
                        ease: 'Elastic',
                        duration: 1e3,
                        delay: 1.2e3
                    },
                    {
                        x: w/2-265 + 30*this.data.values.nivActual,
                        y: 636,
                        scale: 0.28,
                        ease: 'Power2',
                        duration: 0.9e3,
                        delay: 0.1e3
                    }
                ],
                onComplete: () => this.HUD.add(star).getAt(this.HUD.getAll().length-1).setX((star.x-this.HUD.x)/0.3).setY(6/0.3).setScale(0.28/0.3)
            });
        }
        else {
            this.sound.add('explain').play();
            this.showHelp(['¡Ups! Parece que el ángulo es incorrecto, ¡pero sigue intentando!', this.nivel.ayuda, 'Asegúrate de usar el transportador para encontrar la respuesta.'], 'Back', h/2, 0, 0);
        }
    }

    // Muestra un cuadro de texto con varias cadenas de texto (parámetro instrucciones).
    // Para el texto introductorio o explicarle al chamaco qué debe hacer.
    showHelp (instrucciones, easing = 'Bounce', startY = -300, _angle = 0, _startScale = 1)
    {
        this.disableInputs();
        
        var idx = 0;
        var textBox = this.add.image(0, 0, 'textBox').setScale(0.29);
        var display = this.add.text(0, -33, instrucciones[idx], {fontFamily: 'Showcard', fontSize: 28, align: 'center', stroke: 0x000000, strokeThickness: 5}).setOrigin(0.5, 0.5).setWordWrapWidth(textBox.width*0.27, true);

        var hideButton = this.add.image(265, -110, 'hideButton')
        .setScale(0.09)
        .on('pointerdown', () => {                  // dependiendo del estado del juego, se hacen distintas cosas al cerrar el cuadro de texto
            this.sound.add('finger_snap').play();

            switch (this.data.values.estado) {
                case "inicio":
                    this.angulo = this.angulos[this.data.values.nivActual-1] * 5;
                    this.doPath(this.angulo);
                    break;
                   
                case "waiting":
                    this.enableInputs();
                    break;
                    
                case "done":
                    this.nextPath();
                    break;
                   
                case "levelCleared":
                    var idx = listaNiveles.indexOf(this.nivel);
                    if(idx != 3)
                        this.goToScene('juego', listaNiveles[idx+1]);
                    else
                        this.goToScene('repaso');
                    break;
            }
            instruccionesContainer.destroy();
        });

        var arrowLeft = this.add.image(-170, 69, 'arrowWhite')
        .setFlipX(true)
        .setVisible(false)
        .on('pointerdown', () => {
            if(idx == instrucciones.length-1) arrowRight.setVisible(true).setInteractive();
            display.setText(instrucciones[--idx]);
            if(idx == 0) arrowLeft.setVisible(false).disableInteractive();
        });

        var arrowRight = this.add.image(170, 69, 'arrowWhite')
        .on('pointerdown', () => {
            if(idx == 0) arrowLeft.setVisible(true).setInteractive();
            display.setText(instrucciones[++idx]);
            if(idx == instrucciones.length-1) arrowRight.setVisible(false).disableInteractive();
        });

        this.tweens.add({
            targets: arrowRight,
            x: 190,
            ease: 'Lineal',
            yoyo: true,
            loop: -1,
            duration: 0.5e3
        });

        this.tweens.add({
            targets: arrowLeft,
            x: -190,
            ease: 'Lineal',
            yoyo: true,
            loop: -1,
            duration: 0.5e3
        });

        var instruccionesContainer = this.add.container(w/2, startY, [textBox, display, arrowLeft, arrowRight, hideButton]).setScale(_startScale);

        this.tweens.add({
            targets: instruccionesContainer,
            y: h/2,
            angle: _angle,
            scale: 1,
            ease: easing,
            duration: 1e3,
            onComplete: () => { arrowRight.setInteractive(), hideButton.setInteractive() }
        });
    }

    // mueve el alien sobre el planeta, dado un ángulo.
    doPath (angulo)
    {
        this.data.values.estado = "waiting";
        var whoosh = this.sound.add('whoosh', {volume: 0.8});

        var p, t = this.tweens.timeline({
            targets: this.alien,
            ease: 'Sine.easeInOut',
            duration: 1.5e3,
            tweens:[
                {
                    x: w/2,
                    delay: 0.2e3,
                    onStart: () => whoosh.play(),
                    onUpdate: () => {
                        p = [{x: 215, y: 0}, {x: this.alien.x-w/2, y: this.alien.y-h/2+30}];
                        this.side1.clear().lineStyle(10, this.nivel.alien.side1).strokePoints(p);
                        this.delineado.clear().lineStyle(17, 0x000000, 1).strokePoints(p);
                    },
                    onComplete: () => this.alien.setFlipX(false)
                },
                {
                    x: w/2 + 212*Math.cos(Phaser.Math.DegToRad(angulo)),
                    y: h/2-30 - 212*Math.sin(Phaser.Math.DegToRad(angulo)),
                    onStart: () => whoosh.play(),
                    onUpdate: () => {
                        p = [{x: 215, y: 0}, {x: 0, y: 0}, {x: this.alien.x-w/2, y: this.alien.y-h/2+30}];
                        this.side2.clear().lineStyle(10, this.nivel.alien.side2).strokePoints([{x: 2, y: 0}, ...p.slice(1)]);
                        this.delineado.clear().lineStyle(18, 0x000000, 1).strokePoints(p);
                    }
                }
            ]
        });
        t.calcDuration();

        this.tweens.addCounter({
            from: 0,
            to: angulo,
            ease: 'Cubic.easeOut',
            delay: t.duration,
            duration: 1.2e3,
            onUpdate: tween => this.angleGraph.clear().lineStyle(4, 0x000000).fillStyle(this.nivel.alien.angle, 0.7).slice(0, 0, 100, Phaser.Math.DegToRad(-tween.getValue()), 0).fillPath().strokePath(),
            onComplete: () => this.showHelp(this.helpDisplay)
        });
    }

    nextPath ()
    {
        this.disableInputs();
        this.alien.setFlipX(true);
        
        this.data.values.nivActual += 1;
        this.data.values.estado = "inicio";
        this.nivDisplay.setText(`${this.data.values.nivActual}/5`);
        this.respuesta = '0';

        this.tweens.add({
            targets: this.alien,
            x: 726,
            y: h/2-30,
            ease: 'Sine.easeInOut',
            duration: 1.3e3,
            onComplete: () => this.showHelp(['En busca de explorar más lugares, nuestro amigo realizará otro recorrido por el planeta.', 'Mide bien el siguiente ángulo y ganarás otra estrellita. ¡Presta atención!']),
            completeDelay: 0.1e3
        });
    }

    // para regresar al menú principal
    showConfirmScreen ()
    {
        this.disableInputs();

        var textBox = this.add.image(0, 0, 'textBox').setScale(0.29);
        var display = this.add.text(0, -43, '¿Seguro que deseas salir del juego? ¡Deberás empezar desde el principio!', {fontFamily: 'Showcard', fontSize: 28, align: 'center', stroke: 0x000000, strokeThickness: 5}).setOrigin(0.5, 0.5).setWordWrapWidth(textBox.width*0.27, true);

        var tick = this.add.image(-120, 55, 'tick')
        .setScale(0.04)
        .on('pointerdown', () =>{
            menuContainer.destroy();
            this.goToScene('menu');
        });

        var cross = this.add.image(120, 55, 'cross')
        .setScale(0.04)
        .on('pointerdown', () => {
            this.enableInputs();
            menuContainer.destroy();
        });

        var menuContainer = this.add.container(w/2, h/2, [textBox, display, tick, cross]);

        this.tweens.add({
            targets: menuContainer,
            scale: {from: 0, to: 1},
            ease: 'Power3',
            duration: 0.8e3,
            onComplete: () => { 
                tick.setInteractive();
                cross.setInteractive();
            }
        });
    }

    // quita todo de la pantalla e inicia la escena 'sc' con data adicional
    goToScene (sc, data = {})
    {
        this.emitter.stop();

        this.tweens.add({
            targets: this.animables,
            scale: 0.0,
            ease: 'Back.easeIn',
            duration: 0.9e3,
            onComplete: () => this.scene.start(sc, data)
        });
        this.tweens.add({
            targets: [this.protact, this.side1, this.side2, this.delineado, this.angleGraph],
            scale: 0,
            ease: 'Lineal',
            duration: 0.2e3,
            onComplete: () => this.protact.destroy()
        });
    }

    // listener para el teclado, modifica la respuesta actual
    listenKeys (event)
    {
        if(event.key == 'Backspace'){
            this.respuesta = parseInt(this.respuesta/10) + [];
        }
        else if(!isNaN(parseInt(event.key)) && this.respuesta.length <= 2){
            this.respuesta = this.respuesta == 0? event.key : this.respuesta + event.key;
        }
        else if(event.key == 'Enter'){
            this.checkWon();
        }
    }
    
    enableInputs ()
    {
        this.interactive.forEach(i => i.setInteractive());
        this.input.keyboard.on('keydown', this.listenKeys, this);
    }

    disableInputs ()
    {
        this.interactive.forEach(i => i.disableInteractive());
        this.input.keyboard.off('keydown');
    }

    update ()
    {
        this.answDisplay.setText(`${this.respuesta}°`);
    }
}

// Parte del juego que consiste en arrastrar imágenes al ángulo que estas representan.
class Repaso extends Phaser.Scene
{
    constructor ()
    {
        super('repaso');
    }

    init ()
    {
        this.clicked = false;
        this.niveles = function* () { for (const i of Phaser.Utils.Array.Shuffle([0,1,2,0,1,2,0,1,2,0,1,2])) yield i } ();

        this.data.set({estado: 'waiting', nivActual: 1});
    }

    create ()
    {
        this.add.image(480, 360, lastLevel.fondo);

        var btCasa = this.add.image(58, 65, 'btCasa').setScale(0.3).on('pointerdown', this.showConfirmScreen, this);
        var btAyuda = this.add.image(140, 65, 'btAyuda').setScale(0.3).on('pointerdown', () => this.showHelp(["Debes unir cada planeta con el ángulo que representa, ¡pan comido para ti!", "Recuerda que cada tipo de ángulo depende de qué tan abierto o cerrado esté."]));
        var btListo = this.add.image(863, 640, 'btListo').on('pointerdown', this.checkWon, this);
        var titulo = this.add.text(w/2, 65, "Repaso", {fontFamily: 'Showcard', fontSize: 38, stroke: '#40bad2', strokeThickness: 3}).setOrigin(0.5,0.5);

        var btAgudo = this.add.image(w/2, 240, 'btAgudo').setScale(0.3).setData('valor', 'agudos');
        var btObtuso = this.add.image(w/2, 360, 'btObtuso').setScale(0.3).setData('valor', 'obtusos');
        var btConcavo = this.add.image(w/2, 480, 'btConcavo').setScale(0.3).setData('valor', 'cóncavos');

        this.nivDisplay = this.add.text(277, 30, '1/3', {fontFamily: 'Showcard', fontSize: 80}).setOrigin(0.5,0.5);
        var HUDcont = this.HUD = this.add.container(w/2, 630, [this.add.image(0, 0, 'HUD2'), this.nivDisplay]);

        [this.planetas, this.lineas] = this.crearPlanetasLineas();

        [btAgudo, btConcavo, btObtuso].forEach(i => i.on('pointerdown', () => {
            if (this.clicked) {
                this.clicked = false;
                [...this.planetas, btAgudo, btConcavo, btObtuso].forEach(i => this.children.bringToTop(i));

                this.planetas[this.lineas.indexOf(this.drag)].data.values.correcto = this.drag.getData('respuesta') == i.getData('valor');
            }
        }));

        this.animables = [btAyuda, btCasa, btListo, btAgudo, btObtuso, btConcavo, titulo, HUDcont];
        this.interactive = [btCasa, btAyuda, btListo, btAgudo, btConcavo, btObtuso];

        this.tweens.add({
            targets: [btCasa, btAyuda, btAgudo, btObtuso, btConcavo, btListo, HUDcont],
            scale: {from: 0, to: 0.3},
            ease: 'Back',
            duration: 0.9e3,
        });
        this.tweens.add({
            targets: titulo,
            scale: {from: 0, to: 1},
            ease: 'Back',
            duration: 0.9e3
        });
        this.tweens.add({
            targets: this.planetas,
            scale: {from: 0, to: 0.38},
            ease: 'Back',
            duration: 0.9e3,
            onComplete: () => this.showHelp(["¡Has demostrado ser un maestro de los ángulos! ¿Crees poder con el reto final?", "Debes unir cada planeta con el ángulo que representa, ¡pan comido para ti! Buena suerte :)"]),
            completeDelay: 0.1e3
        });
    }
    
    generarPlaneta (x,y)
    {
        var nivel = listaNiveles[this.niveles.next().value];
        var angulo = Phaser.Utils.Array.GetRandom(nivel.angulosBase)*5;
        var alien = Phaser.Utils.Array.GetRandom([alien1, alien2, alien3, alien4]);

        return this.add.container(x,y,[
            this.add.image(0, 0, Phaser.Utils.Array.GetRandom(['tierra', 'venus', 'mars', 'moon'])),
            this.add.graphics().lineStyle(4, 0x000000).fillStyle(alien.angle, 0.7).slice(0, 0, 100, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(-angulo), true).fillPath().strokePath(),
            this.add.graphics().lineStyle(18, 0x000000).beginPath().moveTo(211,0).lineTo(0,0).lineTo(211*Math.cos(Phaser.Math.DegToRad(angulo)), 211*Math.sin(Phaser.Math.DegToRad(-angulo))).strokePath(),
            this.add.graphics().lineStyle(10, alien.side1).beginPath().moveTo(0,0).lineTo(211,0).strokePath(),
            this.add.graphics().lineStyle(10, alien.side2).beginPath().moveTo(0,0).lineTo(211*Math.cos(Phaser.Math.DegToRad(angulo)), 211*Math.sin(Phaser.Math.DegToRad(-angulo))).strokePath(),
            this.add.image(211*Math.cos(Phaser.Math.DegToRad(angulo)), 211*Math.sin(Phaser.Math.DegToRad(-angulo)), alien.nombre).setScale(0.4)
        ]).setSize(423,423).setData('respuesta',nivel.titulo);
    }

    crearPlanetasLineas ()
    {
        var planetas = [], lineas = [];

        for (const [idx, pos] of [[180,240], [180,480], [780,240], [780,480]].entries()) {
            planetas.push(this.generarPlaneta(...pos)
            .setScale(0)
            .setData('correcto', false)
            .on('pointerdown', () => {
                if (!this.clicked) {
                    this.clicked = true;
                    this.drag = lineas[idx];
                    this.children.bringToTop(this.drag);
                }
            }));
            lineas.push( this.add.graphics({x: pos[0], y: pos[1]}).lineStyle(10, 0xAA00AA).setData('respuesta', planetas[idx].getData('respuesta')) );
        }

        return [planetas, lineas];
    }

    showHelp (instrucciones, easing = 'Bounce', startY = -300, _angle = 0, _startScale = 1)
    {
        this.disableInputs();
        
        var idx = 0;
        var textBox = this.add.image(0, 0, 'textBox').setScale(0.29);
        var display = this.add.text(0, -33, instrucciones[idx], {fontFamily: 'Showcard', fontSize: 28, align: 'center', stroke: 0x000000, strokeThickness: 5}).setOrigin(0.5, 0.5).setWordWrapWidth(textBox.width*0.27, true);

        var hideButton = this.add.image(265, -110, 'hideButton')
        .setScale(0.09)
        .on('pointerdown', () => {                  // dependiendo del estado del juego, se hacen distintas cosas al cerrar el cuadro de texto
            this.sound.add('finger_snap').play();
            
            switch (this.data.values.estado) {
                case "waiting":
                    this.enableInputs();
                    break;
                    
                case "done":
                    this.nextLevel();
                    break;
                   
                case "levelCleared":
                    this.goToMenu();
                    break;
            }
            instruccionesContainer.destroy();
        });

        var arrowLeft = this.add.image(-170, 69, 'arrowWhite')
        .setFlipX(true)
        .setVisible(false)
        .on('pointerdown', () => {
            if(idx == instrucciones.length-1) arrowRight.setVisible(true).setInteractive();
            idx--;
            display.setText(instrucciones[idx]);
            if(idx == 0) arrowLeft.setVisible(false).disableInteractive();
        });

        var arrowRight = this.add.image(170, 69, 'arrowWhite')
        .on('pointerdown', () => {
            if(idx == 0) arrowLeft.setVisible(true).setInteractive();
            idx++;
            display.setText(instrucciones[idx]);
            if(idx == instrucciones.length-1) arrowRight.setVisible(false).disableInteractive();
        });

        this.tweens.add({
            targets: arrowRight,
            x: 190,
            ease: 'Lineal',
            yoyo: true,
            loop: -1,
            duration: 0.5e3
        });

        this.tweens.add({
            targets: arrowLeft,
            x: -190,
            ease: 'Lineal',
            yoyo: true,
            loop: -1,
            duration: 0.5e3
        });

        var instruccionesContainer = this.add.container(w/2, startY, [textBox, display, arrowLeft, arrowRight, hideButton]);

        this.tweens.add({
            targets: instruccionesContainer,
            y: h/2,
            angle: _angle,
            scale: {from: _startScale, to: 1},
            ease: easing,
            duration: 1e3,
            onComplete: () => { arrowRight.setInteractive(), hideButton.setInteractive() }
        });

        if(instrucciones.length <= 1) { arrowLeft.destroy(), arrowRight.destroy() }
    }

    checkWon ()
    {
        if (this.planetas.filter(p => p.data.values.correcto).length == 4) {
            if (this.data.values.nivActual == 3) {
                this.data.values.estado = "levelCleared";
                this.sound.add('complete').play();
                this.showHelp(['¡Impresionante, has logrado reconocer todos los ángulos! Eres un experto, ¡felicidades!', 'Gracias por jugar a Alien Angles :) ¡nuestros amigos aliens te esperarán para la próxima!'], 'Sine.easeOut', h/2, 720, 0);
            }
            else {
                this.data.values.estado = "done";
                this.sound.add('win').play();
                this.showHelp([Phaser.Utils.Array.GetRandom(frases)+"\nHas reconocido bien todos estos ángulos.", 'Te has ganado una  estrella :) ¡Sigue así para ganar más!'], 'Back', h/2, 0, 0);
            }

            var star = this.add.image(w/2, h/2+68, 'star').setScale(0);
            this.tweens.timeline({
                targets: star,
                tweens: [
                    {
                        scale: {from: 0, to: 0.63},
                        ease: 'Elastic',
                        duration: 1e3,
                        delay: 1.2e3
                    },
                    {
                        x: w/2-160 + 35*this.data.values.nivActual,
                        y: 636,
                        scale: 0.28,
                        ease: 'Power2',
                        duration: 0.9e3,
                        delay: 0.1e3
                    }
                ],
                onComplete: () => this.HUD.add(star).getAt(this.HUD.getAll().length-1).setX((star.x-this.HUD.x)/0.3).setY(6/0.3).setScale(0.28/0.3)
            });
        }
        else {
            this.sound.add('explain').play();
            this.showHelp(['¡Ups! Parece que una de tus respuestas es incorrecta, ¡pero sigue intentando!', 'Recuerda que cada tipo de ángulo depende de qué tan abierto o cerrado esté.'], 'Back', h/2, 0, 0);
        }
    }

    nextLevel ()
    {
        this.data.values.nivActual += 1;
        this.data.values.estado = "waiting";
        this.nivDisplay.setText(`${this.data.values.nivActual}/3`);

        var [tmp1, tmp2] = this.crearPlanetasLineas();

        this.tweens.add({
            targets: [...this.lineas, ...this.planetas],
            scale: 0,
            ease: 'Power3',
            duration: 0.9e3,
            onComplete: () => [...this.lineas, ...this.planetas].forEach(p => p.destroy())
        });

        this.tweens.add({
            targets: tmp1,
            scale: 0.38,
            ease: 'Back',
            duration: 0.9e3,
            delay: 1e3,
            onComplete: () => ([this.planetas, this.lineas] = [tmp1, tmp2], this.enableInputs())
        });
    }

    showConfirmScreen ()
    {
        this.disableInputs();

        var textBox = this.add.image(0, 0, 'textBox').setScale(0.29);
        var display = this.add.text(0, -43, '¿Seguro que deseas salir? ¡Deberás empezar desde el principio!', {fontFamily: 'Showcard', fontSize: 28, align: 'center', stroke: 0x000000, strokeThickness: 5}).setOrigin(0.5, 0.5).setWordWrapWidth(textBox.width*0.27, true);

        var tick = this.add.image(-120, 55, 'tick')
        .setScale(0.04)
        .on('pointerdown', () =>{
            menuContainer.destroy();
            this.goToMenu();
        });

        var cross = this.add.image(120, 55, 'cross')
        .setScale(0.04)
        .on('pointerdown', () => {
            this.enableInputs();
            menuContainer.destroy();
        });

        var menuContainer = this.add.container(w/2, h/2, [textBox, display, tick, cross]);

        this.tweens.add({
            targets: menuContainer,
            scale: {from: 0, to: 1},
            ease: 'Power3',
            duration: 0.8e3,
            onComplete: () => { 
                tick.setInteractive();
                cross.setInteractive();
            }
        });
    }

    goToMenu ()
    {
        this.interactive.forEach(i => i.disableInteractive());
        
        this.tweens.add({
            targets: this.animables.concat(this.planetas, this.lineas),
            scale: 0.0,
            ease: 'Power3',
            duration: 0.8e3,
            onComplete: () => this.scene.start('menu')
        });
    }

    enableInputs ()
    {
        this.interactive.concat(this.planetas, this.lineas).forEach(i => i.setInteractive());
    }

    disableInputs ()
    {
        this.interactive.concat(this.planetas, this.lineas).forEach(i => i.disableInteractive());
    }

    update ()
    {
        if (this.clicked) {
            this.drag.clear().lineStyle(10, 0xFF0000);
            this.drag.beginPath().moveTo(0,0).lineTo(this.input.activePointer.x-this.drag.x, this.input.activePointer.y-this.drag.y).strokePath();
        }
    }
}

class Niveles extends Phaser.Scene
{
    constructor ()
    {
        super('niveles');
    }

    create ()
    {
        this.add.image(480, 360, lastLevel.fondo);
        var txtConf = {fontFamily: 'Showcard', fontSize: 26, stroke: 0x000000, strokeThickness: 5};

        this.interactive = [
            this.add.image(58, 65,'btCasa').setData({escena: 'menu', nivel: {}}),
            this.add.image(250, 225, 'agudosPreview').setScale(0.3).setData({escena: 'juego', nivel: listaNiveles[0]}),
            this.add.image(710, 225, 'obtusosPreview').setScale(0.3).setData({escena: 'juego', nivel: listaNiveles[1]}),
            this.add.image(250, 540, 'concavosPreview').setScale(0.3).setData({escena: 'juego', nivel: listaNiveles[2]}),
            this.add.image(710, 540, 'completoPreview').setScale(0.3).setData({escena: 'juego', nivel: listaNiveles[3]})
        ];

        this.animables = [
            this.add.text(w/2, 65, 'Niveles', {fontFamily: 'Showcard', fontSize: 38, stroke: '#40bad2', strokeThickness: 3}).setOrigin(0.5,0.5),
            this.add.text(250, 352, 'Ángulos agudos', txtConf).setOrigin(0.5,0.5),
            this.add.text(710, 352, 'Ángulos obtusos', txtConf).setOrigin(0.5,0.5),
            this.add.text(250, 667, 'Ángulos cóncavos', txtConf).setOrigin(0.5,0.5),
            this.add.text(710, 667, 'Ángulos por doquier', txtConf).setOrigin(0.5,0.5),
            ...this.interactive
        ];

        var bloqueados = this.interactive.slice(progreso+2);
        bloqueados.forEach(k => {
            k.setTint(0x1F1F1F).setData('bloqueado', true);
            this.animables.push( this.add.image(k.x, k.y-10, 'candado') );
        });

        // animaciones
        this.tweens.add({
            targets: this.interactive,
            scale: {from: 0, to: 0.3},
            ease: 'Back',
            duration: 0.9e3
        });

        this.tweens.add({
            targets: this.animables.slice(0,5),
            scale: {from: 0, to: 1},
            ease: 'Back',
            duration: 0.9e3,
            onComplete: () => this.interactive.forEach(i => i.setInteractive())
        });

        this.tweens.add({
            targets: this.animables.slice(10, 10+bloqueados.length),
            scale: {from: 0, to: 0.9},
            ease: 'Back',
            duration: 0.9e3,
            onComplete: () => this.input.on('gameobjectdown', (p, gameObject, e) => { if (!gameObject.data.values.bloqueado) this.goToScene(gameObject.data.values.escena, gameObject.data.values.nivel); })
        });
    }

    // quita todo de la pantalla e inicia la escena 'sc' con data adicional
    goToScene (sc, data = {})
    {
        this.interactive.forEach(i => i.disableInteractive());

        this.tweens.add({
            targets: this.animables,
            scale: 0,
            ease: 'Back.easeIn',
            duration: 0.9e3,
            onComplete: () => this.scene.start(sc, data)
        });
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: w,
        height: h
    },
    title: 'Alien angles!',
    url: 'https://github.com/ivanperez-7/alien-angles',
    version: '1.2',
    banner: {
        text: '#ffffff',
        background: ['#fff200', '#38f0e8', '#00bff3', '#ec008c']
    },
    scene: [Boot, Menu, Instrucciones, Juego, Niveles, Repaso]
};

// primero se carga la fuente y luego se crea el juego.
document.fonts.load('10pt Showcard').then(() => new Phaser.Game(config));