// ============================================================
// EL MISTERIO DEL NIÑO ENVUELTO
// Murder mystery familiar para la fiesta de El Peps.
// Fiesta temática de los 70's · ~20-30 jugadores · ~40 min.
// ------------------------------------------------------------
// CÓMO FUNCIONA EL CONTENIDO (resumen para quien edite):
//  - Cada jugador elige su NOMBRE (dropdown) -> personaje y motivo.
//  - Cada jugador teclea un NÚMERO secreto (1-30) -> rol oculto.
//  - El rol sale de GAME_DATA.tablaRoles (número -> rol).
//  - El juego avanza por rondas; cada ronda se desbloquea con una CLAVE
//    que el anfitrión revela en la pantalla central.
// ============================================================

const GAME_DATA = {

  titulo: "El Misterio del Niño Envuelto",
  subtitulo: "El cumpleaños setentero de El Peps · ¿Quién se lo llevó?",

  // Nombre del cumpleañero / culpable real. Cámbialo si hace falta.
  peps: "El Peps",

  // ----------------------------------------------------------
  // TABLA SECRETA DE ROLES (número 1-30 -> rol)
  //   'peps'      = culpable real (dáselo a El Peps)
  //   'complice'  = cómplice (dáselo a quien tú elijas esa noche)
  //   'detective' = detective (hay 3)
  //   'sospechoso'= todos los demás
  // El anfitrión reparte los números EN VOZ ALTA. Para los jugadores
  // un número no significa nada; solo tú tienes la hoja de control.
  // ----------------------------------------------------------
  tablaRoles: {
    1: "sospechoso", 2: "sospechoso", 3: "sospechoso", 4: "detective",
    5: "sospechoso", 6: "sospechoso", 7: "peps", 8: "sospechoso",
    9: "sospechoso", 10: "sospechoso", 11: "sospechoso", 12: "sospechoso",
    13: "detective", 14: "sospechoso", 15: "sospechoso", 16: "sospechoso",
    17: "sospechoso", 18: "sospechoso", 19: "sospechoso", 20: "sospechoso",
    21: "complice", 22: "sospechoso", 23: "sospechoso", 24: "sospechoso",
    25: "sospechoso", 26: "detective", 27: "sospechoso", 28: "sospechoso",
    29: "sospechoso", 30: "sospechoso"
  },

  // ----------------------------------------------------------
  // INFO POR ROL (lo que ve cada quien en su carta, según su número)
  // ----------------------------------------------------------
  rolesInfo: {
    peps: {
      badge: "🎂 ERES EL PEPS",
      intro: "Es TU cumpleaños y, seamos honestos... TÚ te lo comiste. El legendario Niño Envuelto de tu mamá, la abuela Rosenda, entero, a escondidas. Nadie debe descubrirlo.",
      secreto: "Tenías un hambre histórica. Viste el Niño Envuelto solo en la cocina y 'solo una rebanadita' se convirtió en TODO el postre. Cuando Teté gritó que faltaba, ya era tarde. Por suerte tienes un CÓMPLICE en la fiesta que te ayudó a esconder la evidencia: protégelo con tu vida, porque toda la sospecha va a caer sobre esa persona... y mientras te cubran a ti, ganas.",
      comoActuar: "Quéjate de hambre, exige tu postre indignado ('¿cómo que no hay Niño Envuelto en MI cumpleaños?'), acusa a otros con drama y nunca, JAMÁS, admitas nada hasta el final."
    },
    complice: {
      badge: "🤝 ERES EL CÓMPLICE",
      intro: "Ayudaste a El Peps a esconder el Niño Envuelto. Lo sabes todo. El problema: todas las pistas de la investigación apuntan hacia TI.",
      secreto: "Tú tapaste la evidencia mientras El Peps se daba el festín. Si te descubren, caes tú (y de paso El Peps). Tu trabajo es despistar, sembrar sospechas en otros y sobrevivir a los detectives. Si nadie te señala al final, ganas en grande.",
      comoActuar: "Vas a tener indicios delatores que los detectives andan buscando (manos pegajosas, risa nerviosa). Tu misión es disimularlos y desviar la atención hacia cualquier otro. Hazte el ofendido si te acusan."
    },
    detective: {
      badge: "🕵️ ERES DETECTIVE",
      intro: "El Peps te nombró Detective Oficial de la fiesta. Tu misión: descubrir quién se llevó el Niño Envuelto y exponerlo ante todos.",
      secreto: "No tienes nada que esconder (manos limpias, por una vez). Recibirás pistas oficiales por ronda que nadie más tiene. Úsalas para interrogar al frente de todos.",
      comoActuar: "Llama sospechosos al frente, hazles preguntas incómodas, presume tu placa imaginaria y da tu veredicto con mucho drama antes de la votación."
    },
    sospechoso: {
      badge: "❓ ERES SOSPECHOSO/A",
      intro: "Eres uno de los invitados a la fiesta de El Peps. Tienes un motivo de rencor contra él (todos lo tienen) y eso te pone en la lista.",
      secreto: "Tú NO te llevaste el Niño Envuelto, pero tu motivo (o tu falta de motivo) te hace sospechoso. Investiga, intercambia pistas, defiéndete y trata de descubrir al culpable antes que los demás.",
      comoActuar: "Defiende tu inocencia con uñas y dientes, comparte (o esconde) tu pista según te convenga, y señala a alguien más para quitarte el reflector."
    }
  },

  // ----------------------------------------------------------
  // NARRACIÓN INICIAL (pantalla central, leída con mucho drama)
  // ----------------------------------------------------------
  narracion: [
    {
      titulo: "🪩 Bienvenidos a la fiesta de El Peps",
      texto: "Hoy es el cumpleaños de El Peps y la familia se botó la puntada: fiesta temática de los 70's. Pantalones acampanados, bola de espejos girando, vinilos, y el invitado de honor más insoportablemente querido de toda la familia."
    },
    {
      titulo: "🎂 La estrella de la noche",
      texto: "La abuela Rosenda, mamá de El Peps, preparó con sus propias manos su obra maestra: el legendario NIÑO ENVUELTO. Tres días de trabajo. El postre favorito de medio mundo. La corona de la fiesta."
    },
    {
      titulo: "🎶 9:14 de la noche",
      texto: "Suena 'Stayin' Alive' a todo volumen, las luces de colores giran y llega el momento sagrado: hora de servir el Niño Envuelto. Teté va a la cocina por él..."
    },
    {
      titulo: "😱 ¡El grito de Teté!",
      texto: "Teté regresa pálida: «¡NO ESTÁ! ¡El Niño Envuelto DESAPARECIÓ!». Solo quedan un platón vacío, unas migajas traicioneras y un tenedor con merengue tirado junto al estéreo."
    },
    {
      titulo: "🚪 Nadie entró, nadie salió",
      texto: "Estaba lloviendo y todas las puertas tenían seguro. NADIE salió de la casa. Eso solo significa una cosa: quien se llevó el Niño Envuelto... sigue aquí, bailando entre nosotros, con la boca llena de evidencias"
    },
    {
      titulo: "🔎 El detalle incómodo",
      texto: "Y hay otro problema: El Peps, a lo largo de los años, le ha hecho UNA pequeña maldad a casi cada quien en esta sala. Así que motivos... sobran. Detectives, tienen el caso. Que comience la investigación."
    }
  ],

  // ----------------------------------------------------------
  // RONDAS (cada una se desbloquea con su CLAVE)
  //   El anfitrión revela la clave en la pantalla central; los
  //   jugadores la teclean en su teléfono para desbloquear la
  //   ronda: ven una pista nueva y misiones nuevas.
  // ----------------------------------------------------------
  rondas: [
    {
      numero: 1,
      clave: "DISCO",
      duracionMin: 6,
      pistaGeneral: {
        titulo: "🍰 Pista para todos #1",
        texto: "Hay un rastro de migajas de Niño Envuelto que va de la cocina hacia la pista de baile. Quien se lo llevó, pasó por en medio de la fiesta con el botín."
      },
      pistaOficial: {
        titulo: "🕵️ Pista OFICIAL del detective #1",
        texto: "EL CULPABLE tiene un detalle delator: trae algo pegajoso o una mancha de merengue que intentó limpiarse a las prisas. Revisen manos y ropa."
      }
    },
    {
      numero: 2,
      clave: "VINILO",
      duracionMin: 6,
      pistaGeneral: {
        titulo: "🕯️ Pista para todos #2",
        texto: "El tenedor junto al estéreo tiene marcas de mordida nerviosa. Quien lo soltó ahí estaba apurado... o muy nervioso."
      },
      pistaOficial: {
        titulo: "🕵️ Pista OFICIAL del detective #2",
        texto: "EL CULPABLE se delata solo: le da una risita nerviosa cada vez que alguien menciona el Niño Envuelto. Menciónenlo seguido y observen quién se ríe raro."
      }
    },
    {
      numero: 3,
      clave: "FIEBRE",
      duracionMin: 6,
      pistaGeneral: {
        titulo: "📝 Pista para todos #3",
        texto: "Debajo de un cojín apareció una servilleta con betún y una frase a medio escribir: 'LO HICE POR HAMBRE, NO POR MALDAD'. La letra es de alguien... muy cercano a la familia."
      },
      pistaOficial: {
        titulo: "🕵️ Pista OFICIAL del detective #3",
        texto: "EL CULPABLE se delata por los nervios: desvía las sospechas hacia otros con DEMASIADO entusiasmo y cambia de tema cuando se habla del postre. Vigilen a quien más se esfuerza por señalar a los demás para salvarse."
      }
    }
  ],

  // Clave del HARD STOP: desbloquea el cálculo final de puntos.
  // El anfitrión la revela SOLO después de narrar el desenlace.
  claveRevelacion: "MERENGUE",

  // ----------------------------------------------------------
  // MISIONES POR ROL Y POR RONDA (checklist, +1 punto cada una)
  //   misionesPorRol[rol][numeroRonda-1] = [ misiones de esa ronda ]
  // ----------------------------------------------------------
  misionesPorRol: {
    sospechoso: [
      [
        "Pregúntale a 2 personas distintas dónde estaban cuando Teté gritó que faltaba el Niño Envuelto.",
        "Consigue que alguien te confiese su motivo de rencor contra El Peps.",
        "Suelta este rumor sin que se note que lo inventas: 'yo vi a alguien con merengue en la mano'."
      ],
      [
        "Acusa (en broma o en serio) a alguien al frente de otras 2 personas.",
        "Logra que alguien te enseñe sus manos o revise sus zapatos.",
        "Convence a dos personas de que sospechen de la MISMA persona."
      ],
      [
        "Arma tu teoría completa y convéncela a alguien en voz alta.",
        "Defiéndete públicamente de cualquier acusación, con drama setentero.",
        "Haz que alguien cambie de sospechoso justo antes de votar."
      ]
    ],
    detective: [
      [
        "Llama formalmente a un sospechoso al frente de todos y hazle 2 preguntas.",
        "Usa tu Pista Oficial #1: encuentra a alguien con manos o ropa sospechosamente pegajosa.",
        "Toma nota mental de 3 personas que actúen raras."
      ],
      [
        "Menciona el Niño Envuelto en voz alta frente a un grupo y observa quién se ríe nervioso (tu Pista Oficial #2).",
        "Señala a un sospechoso y exígele su coartada al frente de todos.",
        "Carea a dos sospechosos que se contradigan."
      ],
      [
        "Usa tu Pista Oficial #3: señala a quien desvía las sospechas con demasiado entusiasmo y evita hablar del postre.",
        "Da tu veredicto preliminar en voz alta y con mucho drama antes de votar.",
        "Convence a la sala de a quién deben votar."
      ]
    ],
    complice: [
      [
        "Encuentra a El Peps sin que se note y mándale una seña discreta de complicidad.",
        "Plántale a alguien una coartada falsa tuya ('yo estuve contigo todo el rato, ¿verdad?').",
        "Disimula tu 'mancha de merengue': si alguien te ve las manos, ten lista una excusa."
      ],
      [
        "Cuando alguien mencione el Niño Envuelto, ríete nervioso A PROPÓSITO y luego niégalo.",
        "Desvía una sospecha grande hacia otra persona inocente.",
        "Hazte la víctima si un detective se te acerca."
      ],
      [
        "Defiende a El Peps sin que se note que lo proteges.",
        "Convence a alguien de que el cómplice 'seguro es' otra persona.",
        "Sobrevive a la votación sin que la mayoría te señale."
      ]
    ],
    peps: [
      [
        "Quéjate en voz alta de tu hambre y exige indignado tu Niño Envuelto ('¡es MI cumpleaños!').",
        "Acusa sutilmente a alguien más de habérselo llevado.",
        "Si alguien te ve las manos, di que es 'crema para las manos, huele a vainilla'."
      ],
      [
        "Cuando mencionen el Niño Envuelto, cambia el tema con un chiste setentero.",
        "Echa a andar una teoría falsa muy convincente sobre otro sospechoso.",
        "Protege a tu cómplice si lo ves en aprietos, sin delatarte."
      ],
      [
        "Da un discurso conmovedor de '¿cómo creen que YO haría eso?'.",
        "Logra que al menos una persona te defienda públicamente.",
        "Aguanta hasta la revelación final sin confesar."
      ]
    ]
  },

  // ----------------------------------------------------------
  // BANCO DE PREGUNTAS PARA INTERROGATORIOS PÚBLICOS
  // ----------------------------------------------------------
  preguntasPublicas: [
    "¿Qué estabas haciendo EXACTAMENTE cuando Teté gritó? Sé específico.",
    "¿Cuál es tu rencor contra El Peps? Y no digas que ninguno, todos tienen uno.",
    "Muéstranos tus manos. ¿Tienen merengue, betún o azúcar?",
    "¿Cuándo fue la última vez que viste el Niño Envuelto entero?",
    "¿A quién señalas tú, y por qué?",
    "Si tuvieras que culparte a ti mismo, ¿cuál sería tu coartada?",
    "¿Estuviste en la cocina en algún momento de la noche? Piénsalo bien.",
    "¿Notaste a alguien riéndose nervioso cuando se mencionó el postre?",
    "Revisa tus zapatos: ¿pisaste alguna migaja sospechosa?",
    "¿A quién estás defendiendo con tanto cariño esta noche? ¿Por qué?"
  ],

  // ----------------------------------------------------------
  // REVELACIÓN FINAL (la narra el anfitrión, con todo el drama)
  // ----------------------------------------------------------
  revelacion: {
    titulo: "🎭 La verdad sale a la luz...",
    intro: "Todas las pistas apuntaban al cómplice... y sí, el cómplice ayudó a esconder la evidencia. Pero el cómplice no se comió nada. ¿Quién devoró el Niño Envuelto de la abuela Rosenda?",
    golpe: "Fue... EL PEPS. El mismísimo cumpleañero. Muerto de hambre, vio el postre solo en la cocina, 'solo una rebanadita' se volvió el postre completo, y su cómplice le ayudó a tapar el desastre mientras todos bailaban.",
    cierre: "Teté tenía razón en alarmarse: el ladrón estaba en la fiesta. Lo que nadie imaginó es que era el festejado. Pídanle a El Peps que se ponga de pie y haga su confesión (la tiene en su teléfono)."
  },

  // Confesión que lee El Peps al final (aparece en su carta).
  confesionPeps: "Está bien, ¡está bien! FUI YO. ¡Tenía mucha hambre y el Niño Envuelto de mi mamá es lo más rico del mundo! Solo iba a probar una rebanadita... y bueno... feliz cumpleaños a MÍ. 🎂",

  // ----------------------------------------------------------
  // CONFIGURACIÓN DE PUNTOS
  // ----------------------------------------------------------
  puntos: {
    porMision: 1,
    votoComplice: 5,     // tu voto fue el cómplice
    votoPeps: 8,         // tu voto fue El Peps (viste el giro)
    otroCulpable: 5,     // 2º paso: encontrar al cómplice (si tu voto NO fue el cómplice)
    evasionPeps: 5,      // El Peps si casi nadie lo señaló
    evasionComplice: 3,  // Cómplice si casi nadie lo señaló
    detectiveAcierto: 3, // Detective que atinó a cómplice o Peps
    umbralEvasion: 0.25  // "casi nadie" = menos del 25% lo señaló
  },

  // ----------------------------------------------------------
  // PERSONAJES (por NOMBRE). Cada quien elige el suyo del dropdown.
  //   El motivo viene de tu lista real. La "pista" es lo que cada
  //   personaje sabe (úsala o escóndela según te convenga).
  //   El ROL no depende del nombre, depende del número secreto.
  // ----------------------------------------------------------
  personajes: [
    {
      nombre: "El Peps",
      parentesco: "El cumpleañero",
      esPeps: true,
      motivo: "Eres la estrella de la fiesta... y el principal sospechoso de tu propio cumpleaños.",
      pista: "Tú sabes perfectamente qué pasó con el Niño Envuelto. (Spoiler: fuiste tú.) Revisa tu rol secreto."
    },
    {
      nombre: "Abuelo David",
      parentesco: "Suegro de El Peps",
      motivo: "El Peps dibujó una caricatura de tu político favorito para burlarse. Eso no te gustó.",
      pista: "Desde tu sillón de honor viste pasar a alguien rumbo a la cocina con cara de culpa justo antes del grito de Teté."
    },
    {
      nombre: "Teté",
      parentesco: "Esposa de El Peps",
      esTete: true,
      motivo: "El Peps se comió unos pingüinos que habías guardado con amor en el congelador. Reincidente del postre ajeno.",
      pista: "TÚ eres quien descubre que falta el Niño Envuelto y da la alarma. Cuando el anfitrión lo indique al inicio, suelta el grito con todo el drama. Conoces a El Peps mejor que nadie... ¿sospecharías de él?"
    },
    {
      nombre: "Jany",
      parentesco: "Cuñada de El Peps",
      motivo: "Sin motivo aparente... lo cual es justamente muy sospechoso.",
      pista: "Como nadie te tiene en la mira, viste más de lo que crees: alguien se limpiaba las manos a escondidas en el baño de visitas."
    },
    {
      nombre: "Quique",
      parentesco: "Cuñado de El Peps",
      motivo: "El Peps te descompuso la cafetera de tanto usarla para sus capuchinos. Pequeñas venganzas, grandes rencores.",
      pista: "Estabas cerca de la cocina arreglando (otra vez) algo eléctrico y escuchaste pasos apurados y una risita nerviosa."
    },
    {
      nombre: "Fernando",
      parentesco: "Cuñado de El Peps",
      motivo: "Estás sentido porque El Peps no te dejó hacerle 'ñik ñik' en público. Orgullo herido.",
      pista: "Andabas ofendido por los rincones y por eso viste a alguien escondiendo algo brillante (¿papel aluminio?) detrás de un mueble."
    },
    {
      nombre: "Claudia",
      parentesco: "Cuñada de El Peps",
      motivo: "El Peps te rompió tu tacón rojo favorito. Imperdonable.",
      pista: "Como andabas cuidándote de que el Peps no te volviera a romper tus zapatos, notaste que alguien cruzó la sala demasiado rápido, casi corriendo, en plena oscuridad de la bola disco."
    },
    {
      nombre: "Fer",
      parentesco: "Sobrina de El Peps",
      motivo: "Con su grito de '¡mamiiiita!' El Peps te dejó en ridículo frente a tus amigos. Trauma adolescente.",
      pista: "Estabas grabando un video para instagram y, sin querer, en el fondo se alcanza a ver a alguien saliendo de la cocina. (Puedes 'interpretar' lo que se ve para hacer drama.)"
    },
    {
      nombre: "Claudio “el chiquillo”",
      parentesco: "Sobrino de El Peps",
      motivo: "El Peps te obligó a comerte un gazpacho español que él preparó, con cara de asco.",
      pista: "Notaste que el platón del Niño Envuelto ya estaba raro (movido) ANTES del grito de Teté."
    },
    {
      nombre: "Alex",
      parentesco: "Sobrino de El Peps",
      motivo: "Tenías mucha hambre. Mucha. Tanta que cualquiera creería que fuiste tú.",
      pista: "Andabas rondando la comida toda la noche, así que sabes quién más estuvo MUY cerca de la cocina (aunque a ti te conviene no decirlo)."
    },
    {
      nombre: "Prici",
      parentesco: "Novia de Alex",
      motivo: "Alex tenía hambre y andabas buscándole algo de comer. Mala coincidencia, justo cerca del postre.",
      pista: "Mientras buscabas comida para Alex, viste el Niño Envuelto entero y a alguien parado junto a él, dándote la espalda. No recuerdas quién es."
    },
    {
      nombre: "Sandra",
      parentesco: "Prima de El Peps",
      motivo: "Le querías hacer una broma a El Peps por puro desmadre; eres la bromista oficial de la familia. Todos creen que fuiste tú.",
      pista: "Como te la pasas tramando bromas, reconoces a un culpable nervioso cuando lo ves: alguien se reía sin razón y se ponía raro cada vez que se mencionaba el postre."
    },
    {
      nombre: "Carlitos",
      parentesco: "Yerno de El Peps",
      motivo: "Tú JAMÁS harías algo que te haga quedar mal con tu suegro. Eres el yerno perfecto... sospechosamente perfecto.",
      pista: "Por andar de buena gente ayudando en la cocina, sabes que el Niño Envuelto seguía ahí 10 minutos antes del grito... y quién entró después."
    },
    {
      nombre: "Yuni",
      parentesco: "Amiga de Regina",
      motivo: "El Peps usó tu clarinete sin pedirlo prestado. Para un músico, eso es la guerra.",
      pista: "Saliste a guardar tu clarinete a salvo y, al volver, te cruzaste con alguien que escondía las manos detrás de la espalda."
    },
    {
      nombre: "Abuelo Marco",
      parentesco: "Papá de El Peps",
      motivo: "El Peps no te mandó a tiempo la caricatura de esta semana. Y, ojo: a TI te encantan los postres.",
      pista: "Como buen goloso, tenías el ojo puesto en el Niño Envuelto toda la noche, así que sabes exactamente a qué hora desapareció... y quién estaba más cerca."
    },
    {
      nombre: "Abuela Rosenda",
      parentesco: "Mamá de El Peps",
      motivo: "TÚ hiciste el Niño Envuelto. Y como tu otra hija, Rosenda, también quería uno, casi lo escondes para no provocar pleitos. Casi.",
      pista: "Eres la autora del postre: sabes que estaba perfecto y completo cuando lo dejaste en la cocina. Tienes un ojo clínico para ver quién miente sobre él. Pero pase lo que pase, siempre defenderás a tus hijos de cualquier acusación, principalmente al cumpleañero."
    },
    {
      nombre: "Rosenda",
      parentesco: "Hermana de El Peps",
      motivo: "El Niño Envuelto también es TU postre favorito. Y mamá hizo solo uno. Motivo de sobra.",
      pista: "Por estar rondando el postre que tanto querías, viste quién más le echaba ojitos al Niño Envuelto durante la fiesta."
    },
    {
      nombre: "Lisi",
      parentesco: "Hermana de El Peps",
      motivo: "Te encanta ser la consentida de mamá, y el Niño Envuelto era el detalle estrella de la noche. Celos dulces.",
      pista: "Andabas pegada a la abuela Rosenda, así que sabes que ella NO lo escondió. Eso descarta a una sospechosa importante."
    },
    {
      nombre: "Salvador",
      parentesco: "Cuñado de El Peps",
      motivo: "El Peps te hizo una caricatura burlándose de tus nuevas alianzas políticas. Honor manchado.",
      pista: "Andabas serio y observador (como buen ofendido) y notaste a alguien desviando sospechas con demasiado entusiasmo hacia gente inocente."
    },
    {
      nombre: "Ana",
      parentesco: "Sobrina de El Peps",
      motivo: "Quieres defender a Salvador, tu papá, a quien El Peps ofendió con la caricatura. Lealtad de hija.",
      pista: "Por andar cuidando la espalda de tu papá, te fijaste en quién se ponía más nervioso y evasivo cada vez que se mencionaba el Niño Envuelto."
    },
    {
      nombre: "Francesco",
      parentesco: "Ex cuñado de El Peps",
      motivo: "El Peps te dejó de invitar a sus salidas por capuchinos. Te dolió más de lo que admites.",
      pista: "Como llegaste resentido y observando todo desde fuera, captaste a alguien con una mancha de merengue intentando limpiarse a escondidas."
    },
    {
      nombre: "Mati",
      parentesco: "Sobrino de El Peps",
      motivo: "Te encanta hacer bromas, ¿y qué mejor broma que esconder un postre? Eres sospechoso natural.",
      pista: "Como tú sí piensas en bromas, sabes que el culpable se delata por los nervios: andas tras quien se ríe raro o esconde las manos cuando le preguntan."
    },
    {
      nombre: "Adam",
      parentesco: "Sobrino de El Peps",
      motivo: "El Peps te dobló tu cómic de Batman por descuido, aún cuando le dijiste que eso no se hace. Para un coleccionista, eso no se perdona.",
      pista: "Mientras 'restaurabas' tu pobre cómic en un cuarto, escuchaste pasos apurados y a alguien murmurando para sí mismo 'que no se note, que no se note' en el pasillo."
    },
    {
      nombre: "Vale",
      parentesco: "Amiga de Caro / hija adoptiva",
      motivo: "El Peps no te ha comprado las aceitunas que le pediste. Pequeño agravio, gran resentimiento.",
      pista: "Por andar buscando botana (las dichosas aceitunas), entraste y saliste de la cocina varias veces y sabes a qué hora exacta desapareció el postre."
    },
    {
      nombre: "Caro",
      parentesco: "Hija de El Peps",
      motivo: "El Peps se comió el último bolillo con cajeta en Las Pacanda sin darte ni una mordida. Traición de comida, la peor.",
      pista: "Conoces a tu papá: sabes que cuando se trata de postres, El Peps PIERDE el control. Esa información vale oro... si decides usarla."
    },
    {
      nombre: "Regina",
      parentesco: "Hija de El Peps",
      motivo: "El Peps no se acuerda de tu fecha de nacimiento. Cada año. Dolor de hija.",
      pista: "Andabas dolida y por eso observadora: viste a alguien reírse nervioso justo cuando se mencionó el Niño Envuelto. Te quedó grabado."
    },

    // -------- INVITADOS EXTRA (por si llega alguien de sorpresa) --------
    {
      nombre: "Invitado Extra 1 (Compadre)",
      parentesco: "Compadre de El Peps",
      motivo: "El Peps te ganó el último taco al pastor y nunca te lo repuso. Hambre histórica.",
      pista: "Llegaste tarde y al entrar te cruzaste con alguien que salía de la cocina demasiado rápido, escondiendo algo."
    },
    {
      nombre: "Invitado Extra 2 (Vecino)",
      parentesco: "Vecino de El Peps",
      motivo: "El Peps estaciona su coche tapándote la salida cada domingo. Rencor de banqueta.",
      pista: "Desde la ventana viste sombras moviéndose raro en la cocina mucho antes del grito de Teté."
    },
    {
      nombre: "Invitada Extra 3 (Comadre)",
      parentesco: "Comadre de El Peps",
      motivo: "El Peps prometió ir a tu posada y nunca llegó. Plantón imperdonable.",
      pista: "Eres muy chismosa (con cariño): escuchaste a alguien ensayando en voz baja, para sí mismo, 'y si preguntan, yo no sé nada, yo no vi nada'."
    },
    {
      nombre: "Invitado Extra 4 (Amigo del trabajo)",
      parentesco: "Amigo del trabajo de El Peps",
      motivo: "El Peps contó tu chiste como si fuera suyo en la oficina y se llevó las risas. Robo intelectual.",
      pista: "Andabas contando chistes cerca del estéreo y por eso viste quién dejó ahí tirado el tenedor con merengue."
    }
  ]
};

// Exportar para Node (verificación) sin romper el navegador.
if (typeof module !== "undefined" && module.exports) { module.exports = GAME_DATA; }
