/**
 * EXPEDITIONS DATA & CONFIGURATION · V2
 * ------------------------------------------------------------
 * Единый файл данных, переводов (RU / UA / DE / EN),
 * двухслойной карты (Земли Германии -> Центр города),
 * расписания и конфигурации Telegram-бота.
 */

window.EXPEDITIONS_DATA = {
  meta: {
    brand: {
      ru: 'Философские Экспедиции',
      ua: 'Філософські Експедиції',
      de: 'Philosophische Expeditionen',
      en: 'Philosophical Expeditions'
    },
    author: {
      ru: 'Сергей Григоришин',
      ua: 'Сергій Григоришин',
      de: 'Sergei Grygoryshyn',
      en: 'Sergei Grygoryshyn'
    },
    telegramBot: {
      token: '9118738949:AAEiKLUZjjLCCMDyEySb5XwY22QHyoh-1hM',
      admins: ['gryd_me', 'Grygoryshyn'],
      knownChatIds: [496101883, 6289254421],
      fallbackHandle: 'gryd_me'
    },
    publicationsUrl: 'https://grygoryshyn.com/publications',
    groupSize: '4–10'
  },

  i18n: {
    ru: {
      topStrip: 'СЕРГЕЙ ГРИГОРИШИН · ФИЛОСОФСКИЕ ЭКСПЕДИЦИИ · ГЕРМАНИЯ · 2027',
      topStripRight: 'ГРУППА 4–10 ЧЕЛ. · ЕДИНЫЙ ОТЕЛЬ · ТОЛЬКО ПРЕДЗАПИСЬ',
      nav: {
        map: 'Карта и зум',
        dossier: 'Программа',
        compare: '1840 ↔ 1843',
        how: 'Формат',
        speaker: 'О ведущем',
        ticket: 'Предзапись'
      },
      hero: {
        eyebrow: 'КАТАЛОГ ЭКСПЕДИЦИЙ · ВЫПУСК №01 · 2027',
        storyHook: '«В 1840 году они позировали в мастерской, уверенные, что их мир вечен. Через два года город сгорел — а выживших запечатлела уже не кисть, а серебряная пластина дагеротипа».',
        title: 'Камерные философские экспедиции по Германии',
        subtitle: 'Неделимые 4-дневные интеллектуальные погружения по личному графику к.ф.н. Сергея Григоришина. Единый отель для всей группы, лекции в арендованном конференц-зале и организованные визиты в музеи (группа 4–10 человек).',
        ctaPrimary: 'Карта земель и городов 2027',
        ctaSecondary: 'Открыть маршрут №1: Гамбург (28–31 янв)',
        badgeTitle: 'БЛИЖАЙШИЙ СТАРТ · ГАМБУРГ',
        badgeDates: '28–31 ЯНВАРЯ 2027',
        badgeStatus: 'Идёт предзапись в первую группу (от 4 до 10 участников · единый отель)',
        triptych: ['Кисть · Уют', 'Огонь · Слом', 'Серебро · Документ']
      },
      principles: {
        eyebrow: 'АРХИТЕКТУРА ЭКСПЕДИЦИИ · 4 ОПОРЫ',
        title: 'Цельный 4-дневный формат без суеты',
        items: [
          {
            num: '01',
            head: 'Неделимый 4-дневный продукт',
            body: 'Участие возможно только на все 4 дня целиком. Философский сюжет выстроен как единая драма от вводного вечера до финального итога — его нельзя дробить на фрагменты.'
          },
          {
            num: '02',
            head: 'Единый отель и конференц-зал',
            body: 'Мы берём на себя расселение всей группы в один общий отель и арендуем в нём отдельный конференц-зал для утренних установочных сессий и вечерних лекций.'
          },
          {
            num: '03',
            head: 'Группа 4–10 чел. и письма в музеи',
            body: 'Формат расширяется до полноценной камерной группы от 4 до 10 участников с официальным направлением писем и аккредитацией экскурсии в музеях.'
          },
          {
            num: '04',
            head: 'Предварительная запись без оплаты',
            body: 'Сейчас открыт сбор предварительных заявок. Оплата не взимается на сайте: бюджет отеля, зала и программы согласуется после набора минимальной четвёрки.'
          }
        ],
        smallFormatNote: '* Примечание: если в одном из городов вместо минимальной группы 4–10 человек соберутся только 1–2 участника, визит Сергея по его личному графику не отменяется — мы сможем предложить камерную 3-часовую музейную встречу и разговор за кофе.'
      },
      hub: {
        eyebrow: 'КАРТОГРАФИЯ МАРШРУТОВ · 2027',
        title: 'Земли Германии и план ключевых точек',
        lead: 'Нажмите на любой город на карте федеральных земель или в табло справа — карта приблизится в исторический центр, чтобы показать точки концепции экспедиции.',
        filters: {
          all: 'Все города (5)',
          active: 'Открыт набор',
          lab: 'В разработке'
        },
        months: [
          { id: 'jan27', label: 'ЯНВ', year: '2027', cityId: 'hamburg' },
          { id: 'feb27', label: 'ФЕВ', year: '2027', cityId: 'dresden' },
          { id: 'mar27', label: 'МАР', year: '2027', cityId: 'berlin' },
          { id: 'apr27', label: 'АПР', year: '2027', cityId: 'frankfurt' },
          { id: 'may27', label: 'МАЙ', year: '2027', cityId: 'munich' },
          { id: 'jun27', label: 'ИЮН', year: '2027', cityId: null },
          { id: 'jul27', label: 'ИЮЛ', year: '2027', cityId: null },
          { id: 'aug27', label: 'АВГ', year: '2027', cityId: null },
          { id: 'sep27', label: 'СЕН', year: '2027', cityId: null },
          { id: 'oct27', label: 'ОКТ', year: '2027', cityId: null },
          { id: 'nov27', label: 'НОЯ', year: '2027', cityId: null },
          { id: 'dec27', label: 'ДЕК', year: '2027', cityId: null }
        ],
        mapMetaCountry: 'ФЕДЕРАЛЬНЫЕ ЗЕМЛИ ГЕРМАНИИ',
        mapMetaCity: 'ЗУМ ЦЕНТРА ГОРОДА · КОНЦЕПТУАЛЬНЫЕ ТОЧКИ',
        backToCountry: '← Ко всей карте земель Германии',
        zoomToCity: 'Приблизить карту центра →',
        boardTitle: 'ABFAHRTSTAFEL · ГРАФИК ПОЕЗДОК НА 2027',
        boardThreshold: 'ГРУППА: 4–10 ЧЕЛ.',
        legend: ['Идёт предзапись (январь)', 'Формирование группы', 'Лист ожидания (Пт–Пн)'],
        landmarkHint: 'Нажмите на любую цифровую точку на карте города, чтобы прочесть её роль в экспедиции.',
        reserveBtn: 'Записаться предварительно'
      },
      dossier: {
        tabs: {
          story: 'Сюжет: 4 акта от света к серебру',
          schedule: 'План на 4 дня (Отель + Музеи)',
          archive: 'Архив артефактов (15 работ)'
        },
        scheduleNotice: 'Единый неделимый цикл (4 дня / 3 ночи): общее заселение в отель, завтраки, лекции в арендованном конференц-зале при отеле, совместные обеды и аккредитованные походы в музеи.',
        blocks: {
          morning: 'УТРО · ЗАВТРАК И КОНФЕРЕНЦ-ЗАЛ',
          afternoon: 'ДЕНЬ · ПРОГУЛКА, ОБЕД И МУЗЕЙ',
          evening: 'ВЕЧЕР · КОНФЕРЕНЦ-ЗАЛ И СИМПОЗИУМ'
        },
        archiveFilters: {
          all: 'Все экспонаты (15)',
          pre: 'До пожара (до 1842)',
          fire: 'Великий пожар (май 1842)',
          daguerre: 'Дагеротипы (1842–1843)'
        },
        labLabel: 'ЛАБОРАТОРИЯ МАРШРУТА · В ПРОРАБОТКЕ',
        labCluesTitle: 'Ключевые концептуальные точки будущего маршрута',
        labAction: 'Оставить предзаявку на этот город'
      },
      compare: {
        eyebrow: 'TRIAL-ВЕРСИЯ ЭКСКУРСИИ · 1808–1843',
        title: 'Герои, их полотна и живой кино-разбор: 1840 против 1843',
        lead: 'Почувствуйте формат лекции Сергея на практике: нажмите на любого из художников (метки вынесены ниже лиц на лацканы, чтобы не закрывать черты), изучите их главные работы или запустите плавный видео-обход камеры по лицам.',
        modePins: 'Интерактив: Личности и работы (6 героев)',
        modeCinema: '🎥 Кино-камера: Живой зум по лицам',
        plateButtons: {
          plate1843a: 'Дагеротип Штельцнера I (13 мастеров, 6 мая 1843)',
          plate1843b: 'Дагеротип Штельцнера II (19 мастеров, 6 мая 1843)',
          plate1842ruins: 'Дагеротип руин Биова (май 1842)'
        },
        caption1840: '1840 · Масло, холст · «Члены Гамбургского общества художников» (Гюнтер Генслер, Kunsthalle)',
        caption1843: '6 мая 1843 · Дагеротип · «Гамбургский союз художников в саду» (Карл Фердинанд Штельцнер)',
        disclaimer: 'Точки на груди (01–05) лишь указывают фигуру, а тонкая рамка выделяет лицо — портреты остаются полностью открытыми. Полное картографирование всех 19 участников дагеротипа готовится к основному туру.',
        cinema: {
          play: '▶ Запустить обход камеры',
          pause: '⏸ Пауза',
          next: 'Следующее лицо →',
          plate1840: 'Холст 1840',
          plate1843: 'Серебро 1843',
          plateAuto: 'Авто 1840 → 1843',
          hint: 'Камера плавно приближает лица участников союза художников и синхронно показывает тезисы из лекции Сергея.'
        }
      },
      speaker: {
        eyebrow: 'АВТОР И ВЕДУЩИЙ ЭКСПЕДИЦИЙ',
        name: 'Сергей Григоришин',
        role: 'Кандидат философских наук · историк философии · исследователь визуальной культуры',
        portraitCap: 'СЕРГЕЙ ГРИГОРИШИН · К.Ф.Н.',
        bio: [
          'Специалист по истории европейской философии, феноменологии образа, библейской герменевтике и методологии гуманитарных наук. Автор научных публикаций в международных и академических журналах, создатель авторских курсов о визуальном мышлении, кино и искусстве.',
          'Метод экспедиции превращает город в открытый читальный зал: утренние тезисы в конференц-зале при отеле сразу проверяются днём перед оригиналами полотен в музее и закрепляются вечерней дискуссией.'
        ],
        facts: [
          { label: 'Степень', val: 'Кандидат философских наук' },
          { label: 'Языки ведения', val: 'RU / UA / EN / DE (в зависимости от состава группы)' },
          { label: 'Масштаб группы', val: '4–10 участников · официальная заявка в музеи · единый отель' }
        ],
        pubBtn: 'Список научных публикаций (grygoryshyn.com)',
        videoTitle: 'Видео-приглашение Сергея Григоришина',
        videoStatus: 'Слот подготовлен под видео-обращение (01:15) · запишем перед релизом',
        lectureCaption: 'Временные кадры с живых камерных чтений (будут заменены профессиональной съёмкой)'
      },
      tariffs: {
        eyebrow: 'ПРЕДВАРИТЕЛЬНАЯ ЗАПИСЬ · БЕЗ ОПЛАТЫ НА САЙТЕ',
        title: 'Единый формат и запись через Telegram-бот',
        cards: [
          {
            id: 'full',
            tag: 'ЕДИНЫЙ ФОРМАТ · 4 ДНЯ / 3 НОЧИ',
            name: 'Полная 4-дневная экспедиция (Гамбург · 28–31 янв)',
            priceMain: 'Предзапись',
            priceNote: 'Группа от 4 до 10 чел. · стоимость утверждается после сбора состава',
            features: [
              'Централизованное заселение всей группы в один общий отель',
              'Завтраки, совместные обеды и арендованный конференц-зал при отеле',
              'Утренние установочные сессии и вечерние философские лекции',
              'Официальная экскурсионная группа в Kunsthalle и Музее истории Гамбурга'
            ],
            cta: 'Записаться предварительно (Гамбург)'
          },
          {
            id: 'waitlist',
            tag: 'СЛЕДУЮЩИЕ ГОРОДА · ПТ–ПН · 2027',
            name: 'Ранний список: Дрезден, Берлин, Франкфурт, Мюнхен',
            priceMain: 'Без оплаты',
            priceNote: 'Последние выходные месяца (Пт–Пн) · февраль – май 2027',
            features: [
              'Фиксация вашего интереса к одному или нескольким городам маршрута',
              'Первое персональное уведомление, когда откроется бронирование отеля',
              'Возможность указать желаемый язык группы (RU / UA / DE / EN)',
              'Приоритетное место в десятке участников'
            ],
            cta: 'Выбрать город в форме ниже'
          }
        ],
        includedNote: 'На этапе прототипа оплата на сайте отключена. Когда соберётся минимальная группа от 4 человек, организаторы (@gryd_me и Сергей Григоришин) свяжутся с вами с точной сметой отеля, конференц-зала, питания и программы.',
        ticketTitle: 'Предварительная заявка-билет (Fahrkarte)',
        ticketSubtitle: 'Заполните поля — заявка напрямую уйдёт в Telegram-бот организаторов (@gryd_me и @Grygoryshyn) для фиксации вашего места.',
        badgeText: 'ПРЕДЗАПИСЬ · ОПЛАТА НЕ ТРЕБУЕТСЯ',
        form: {
          cityLabel: 'Город и даты из графика (2027)',
          seatsLabel: 'Количество мест',
          langLabel: 'Удобный язык группы',
          nameLabel: 'Ваше имя',
          namePlaceholder: 'Например, Алексей',
          contactLabel: 'Ваш Telegram (@username) или телефон',
          contactPlaceholder: '@username',
          commentLabel: 'Комментарий (отель, пожелания, вопросы)',
          commentPlaceholder: 'Например: хочу в Гамбург на январь, 1 место в одноместном номере',
          sendBotBtn: 'Отправить заявку в Telegram-бот',
          openDirectBtn: 'Написать напрямую (@gryd_me)',
          copyBtn: 'Скопировать текст',
          copied: 'Текст заявки скопирован в буфер!',
          sending: 'Отправка заявки в Telegram-бот...',
          sentOk: '✓ Заявка доставлена в Telegram-бот организаторам!',
          sentWarn: 'Бот пока не получил /start от администраторов. Откройте диалог по кнопке «Написать напрямую», текст уже подставлен.'
        },
        ticketLabels: {
          route: 'НАПРАВЛЕНИЕ',
          format: 'ФОРМАТ',
          formatValue: '4 дня / 3 ночи · единый отель',
          status: 'СТАТУС ЗАЯВКИ',
          statusValue: 'ПРЕДВАРИТЕЛЬНАЯ ЗАПИСЬ',
          group: 'РАЗМЕР ГРУППЫ',
          groupValue: '4–10 участников',
          person: 'УЧАСТНИК / МЕСТ / ЯЗЫК',
          msg: 'ТЕКСТ ДЛЯ TELEGRAM-БОТА'
        }
      },
      faq: {
        eyebrow: 'ЧАСТЫЕ ВОПРОСЫ',
        title: 'Что важно знать об обновлённом формате',
        items: [
          {
            q: 'Почему убрали участие только на 2 выходных дня?',
            a: 'Экспедиция задумана как цельное драматургическое и философское высказывание. Без дня знакомства (День 1), утренней установки и контекста в зале (День 2) финал теряет половину смысла, а группа теряет единую динамику.'
          },
          {
            q: 'Как организовано проживание в одном отеле и питание?',
            a: 'Мы заранее подбираем единый отель с хорошим конференц-залом в центре города. Это позволяет всей группе (4–10 человек) завтракать вместе, сразу переходить в зал на утреннюю лекцию и проводить вечерние обсуждения без разъездов по разным концам города.'
          },
          {
            q: 'Что происходит после отправки предварительной заявки?',
            a: 'Заявка мгновенно поступает в наш Telegram-бот к Сергею (@Grygoryshyn) и организатору (@gryd_me). Как только формируется ядро от 4 человек, мы связываемся с вами, утверждаем точный бюджет отеля и программы и выставляем финальное приглашение.'
          },
          {
            q: 'Нужно ли специальное философское образование?',
            a: 'Нет. Весь материал построен как живой рассказ-расследование. Попробуйте наш интерактив «1840 ↔ 1843» выше — именно в таком ключе, только глубже и у оригинальных полотен в музее, проходят все 4 дня.'
          }
        ]
      },
      footer: {
        legalNotice: 'Предварительная информационная платформа проекта философских экспедиций (прототип v2). Окончательные условия бронирования отеля и участия направляются после подтверждения группы.',
        impressum: 'Контакты организаторов в Telegram: @Grygoryshyn и @gryd_me · Интеграция с приёмом заявок активна.',
        archiveCredit: 'Исторические полотна, литографии и дагеротипы XIX века (Ф. О. Рунге, братья Генслер, Г. Биов, К. Ф. Штельцнер, П. Зур) относятся к общественному достоянию (Public Domain).'
      }
    },

    ua: {
      topStrip: 'СЕРГІЙ ГРИГОРИШИН · ФІЛОСОФСЬКІ ЕКСПЕДИЦІЇ · НІМЕЧЧИНА · 2027',
      topStripRight: 'ГРУПА 4–10 ОСІБ · ЄДИНИЙ ГОТЕЛЬ · ЛИШЕ ПОПЕРЕДНІЙ ЗАПИС',
      nav: {
        map: 'Карта і зум',
        dossier: 'Програма',
        compare: '1840 ↔ 1843',
        how: 'Формат',
        speaker: 'Про ведучого',
        ticket: 'Передзапис'
      },
      hero: {
        eyebrow: 'КАТАЛОГ ЕКСПЕДИЦІЙ · ВИПУСК №01 · 2027',
        storyHook: '«У 1840 році вони позували в майстерні, впевнені, що їхній світ вічний. За два роки місто згоріло — а вцілілих зафіксував уже не пензель, а срібна пластина дагеротипа».',
        title: 'Камерні філософські експедиції Німеччиною',
        subtitle: 'Неподільні 4-денні інтелектуальні занурення за особистим графіком к.ф.н. Сергія Григоришина. Єдиний готель для всієї групи, лекції в орендованому конференц-залі та організовані візити до музеїв (група 4–10 осіб).',
        ctaPrimary: 'Карта земель і міст 2027',
        ctaSecondary: 'Відкрити маршрут №1: Гамбург (28–31 січ)',
        badgeTitle: 'НАЙБЛИЖЧИЙ СТАРТ · ГАМБУРГ',
        badgeDates: '28–31 СІЧНЯ 2027',
        badgeStatus: 'Триває попередній запис до першої групи (4–10 учасників · єдиний готель)',
        triptych: ['Пензель · Затишок', 'Вогонь · Злам', 'Срібло · Документ']
      },
      principles: {
        eyebrow: 'АРХІТЕКТУРА ЕКСПЕДИЦІЇ · 4 ОПОРИ',
        title: 'Цілісний 4-денний формат без метушні',
        items: [
          {
            num: '01',
            head: 'Неподільний 4-денний продукт',
            body: 'Участь можлива лише на всі 4 дні разом. Філософський сюжет вибудуваний як цілісна драма від вступного вечора до фінального підсумку — його не можна дробити.'
          },
          {
            num: '02',
            head: 'Єдиний готель і конференц-зал',
            body: 'Ми беремо на себе поселення всієї групи в один спільний готель та орендуємо у ньому конференц-зал для ранкових установчих сесій і вечірніх лекцій.'
          },
          {
            num: '03',
            head: 'Група 4–10 осіб і листи до музеїв',
            body: 'Формат розширюється до повноцінної камерної групи від 4 до 10 учасників із офіційним зверненням та акредитацією екскурсії в музеях.'
          },
          {
            num: '04',
            head: 'Попередній запис без оплати',
            body: 'Зараз відкрито збір попередніх заявок. Оплата на сайті не стягується: бюджет готелю, залу та програми узгоджується після формування мінімальної четвірки.'
          }
        ],
        smallFormatNote: '* Примітка: якщо у якомусь місті замість мінімальної групи 4–10 людей зберуться лише 1–2 учасники, візит Сергія за його графіком не скасовується — ми запропонуємо камерну 3-годинну музейну зустріч та бесіду за кавою.'
      },
      hub: {
        eyebrow: 'КАРТОГРАФІЯ МАРШРУТІВ · 2027',
        title: 'Землі Німеччини та план ключових точок',
        lead: 'Натисніть на будь-яке місто на карті федеральних земель або у табло праворуч — карта наблизиться до історичного центру, щоб показати концептуальні локації експедиції.',
        filters: {
          all: 'Усі міста (5)',
          active: 'Відкрито набір',
          lab: 'У розробці'
        },
        months: [
          { id: 'jan27', label: 'СІЧ', year: '2027', cityId: 'hamburg' },
          { id: 'feb27', label: 'ЛЮТ', year: '2027', cityId: 'dresden' },
          { id: 'mar27', label: 'БЕР', year: '2027', cityId: 'berlin' },
          { id: 'apr27', label: 'КВІ', year: '2027', cityId: 'frankfurt' },
          { id: 'may27', label: 'ТРА', year: '2027', cityId: 'munich' },
          { id: 'jun27', label: 'ЧЕР', year: '2027', cityId: null },
          { id: 'jul27', label: 'ЛИП', year: '2027', cityId: null },
          { id: 'aug27', label: 'СЕР', year: '2027', cityId: null },
          { id: 'sep27', label: 'ВЕР', year: '2027', cityId: null },
          { id: 'oct27', label: 'ЖОВ', year: '2027', cityId: null },
          { id: 'nov27', label: 'ЛИС', year: '2027', cityId: null },
          { id: 'dec27', label: 'ГРУ', year: '2027', cityId: null }
        ],
        mapMetaCountry: 'ФЕДЕРАЛЬНІ ЗЕМЛІ НІМЕЧЧИНИ',
        mapMetaCity: 'ЗУМ ЦЕНТРУ МІСТА · КОНЦЕПТУАЛЬНІ ТОЧКИ',
        backToCountry: '← До всієї карти земель Німеччини',
        zoomToCity: 'Наблизити карту центру →',
        boardTitle: 'ABFAHRTSTAFEL · ГРАФІК ПОЇЗДОК НА 2027',
        boardThreshold: 'ГРУПА: 4–10 ОСІБ',
        legend: ['Триває передзапис (січень)', 'Формування групи', 'Лист очікування (Пт–Пн)'],
        landmarkHint: 'Натисніть на будь-яку цифрову точку на карті міста, щоб прочитати її роль в експедиції.',
        reserveBtn: 'Записатися попередньо'
      },
      dossier: {
        tabs: {
          story: 'Сюжет: 4 акти від світла до срібла',
          schedule: 'План на 4 дні (Готель + Музеї)',
          archive: 'Архів артефактів (15 робіт)'
        },
        scheduleNotice: 'Єдиний неподільний цикл (4 дні / 3 ночі): спільне поселення в готель, сніданки, лекції в орендованому конференц-залі при готелі, спільні обіди та акредитовані походи в музеї.',
        blocks: {
          morning: 'РАНОК · СНІДАНОК І КОНФЕРЕНЦ-ЗАЛ',
          afternoon: 'ДЕНЬ · ПРОГУЛЯНКА, ОБІД І МУЗЕЙ',
          evening: 'ВЕЧІР · КОНФЕРЕНЦ-ЗАЛ І СИМПОЗІУМ'
        },
        archiveFilters: {
          all: 'Усі експонати (15)',
          pre: 'До пожежі (до 1842)',
          fire: 'Велика пожежа (травень 1842)',
          daguerre: 'Дагеротипи (1842–1843)'
        },
        labLabel: 'ЛАБОРАТОРІЯ МАРШРУТУ · У РОЗРОБЦІ',
        labCluesTitle: 'Ключові концептуальні точки майбутнього маршруту',
        labAction: 'Залишити передзаявку на це місто'
      },
      compare: {
        eyebrow: 'TRIAL-ВЕРСІЯ ЕКСКУРСІЇ · 1808–1843',
        title: 'Герої, їхні полотна та живий кіно-розбір: 1840 проти 1843',
        lead: 'Відчуйте формат лекції Сергія на практиці: натисніть на будь-якого з художників (позначки винесено нижче облич на лацкани, щоб не закривати риси), вивчіть їхні головні роботи або запустіть плавний відео-обхід камери по обличчях.',
        modePins: 'Інтерактив: Постаті й роботи (6 героїв)',
        modeCinema: '🎥 Кіно-камера: Живий зум по обличчях',
        plateButtons: {
          plate1843a: 'Дагеротип Штельцнера I (13 майстрів, 6 травня 1843)',
          plate1843b: 'Дагеротип Штельцнера II (19 майстрів, 6 травня 1843)',
          plate1842ruins: 'Дагеротип руїн Біова (травень 1842)'
        },
        caption1840: '1840 · Олія, полотно · «Члени Гамбурзького товариства художників» (Гюнтер Генслер, Kunsthalle)',
        caption1843: '6 травня 1843 · Дагеротип · «Гамбурзька спілка художників у саду» (Карл Фердинанд Штельцнер)',
        disclaimer: 'Точки на грудях (01–05) лише вказують постать, а тонка рамка виділяє обличчя — портрети залишаються відкритими. Повна ідентифікація всіх 19 учасників дагеротипа готується до основного туру.',
        cinema: {
          play: '▶ Запустити обхід камери',
          pause: '⏸ Пауза',
          next: 'Наступне обличчя →',
          plate1840: 'Полотно 1840',
          plate1843: 'Срібло 1843',
          plateAuto: 'Авто 1840 → 1843',
          hint: 'Камера плавно наближає обличчя учасників спілки художників і синхронно показує тези з лекції Сергія.'
        }
      },
      speaker: {
        eyebrow: 'АВТОР І ВЕДУЧИЙ ЕКСПЕДИЦІЙ',
        name: 'Сергій Григоришин',
        role: 'Кандидат філософських наук · історик філософії · дослідник візуальної культури',
        portraitCap: 'СЕРГІЙ ГРИГОРИШИН · К.Ф.Н.',
        bio: [
          'Фахівець з історії європейської філософії, феноменології образу, біблійної герменевтики та методології гуманітарних наук. Автор наукових публікацій у міжнародних та академічних виданнях, творець авторських курсів про візуальне мислення, кіно та мистецтво.',
          'Метод експедиції перетворює місто на відкритий читальний зал: ранкові тези в конференц-залі при готелі одразу перевіряються вдень перед оригіналами полотен у музеї та закріплюються вечірньою дискусією.'
        ],
        facts: [
          { label: 'Ступінь', val: 'Кандидат філософських наук' },
          { label: 'Мови ведення', val: 'UA / RU / EN / DE (залежно від складу групи)' },
          { label: 'Масштаб групи', val: '4–10 учасників · офіційна заявка до музеїв · єдиний готель' }
        ],
        pubBtn: 'Список наукових публікацій (grygoryshyn.com)',
        videoTitle: 'Відео-запрошення Сергія Григоришина',
        videoStatus: 'Слот підготовлено під відео-звернення (01:15) · з’явиться перед релізом',
        lectureCaption: 'Тимчасові кадри з живих камерних читань (будуть замінені професійною зйомкою)'
      },
      tariffs: {
        eyebrow: 'ПОПЕРЕДНІЙ ЗАПИС · БЕЗ ОПЛАТИ НА САЙТІ',
        title: 'Єдиний формат і запис через Telegram-бота',
        cards: [
          {
            id: 'full',
            tag: 'ЄДИНИЙ ФОРМАТ · 4 ДНІ / 3 НОЧІ',
            name: 'Повна 4-денна експедиція (Гамбург · 28–31 січ)',
            priceMain: 'Передзапис',
            priceNote: 'Група від 4 до 10 осіб · вартість затверджується після збору складу',
            features: [
              'Централізоване поселення всієї групи в один спільний готель',
              'Сніданки, спільні обіди та орендований конференц-зал при готелі',
              'Ранкові установчі сесії та вечірні філософські лекції',
              'Офіційна екскурсійна група в Kunsthalle та Музеї історії Гамбурга'
            ],
            cta: 'Записатися попередньо (Гамбург)'
          },
          {
            id: 'waitlist',
            tag: 'НАСТУПНІ МІСТА · ПТ–ПН · 2027',
            name: 'Ранній список: Дрезден, Берлін, Франкфурт, Мюнхен',
            priceMain: 'Без оплати',
            priceNote: 'Останні вихідні місяця (Пт–Пн) · лютий – травень 2027',
            features: [
              'Фіксація вашого інтересу до одного або кількох міст маршруту',
              'Перше персональне сповіщення, коли відкриється бронювання готелю',
              'Можливість вказати бажану мову групи (UA / RU / DE / EN)',
              'Пріоритетне місце в десятці учасників'
            ],
            cta: 'Обрати місто у формі нижче'
          }
        ],
        includedNote: 'На етапі прототипу оплату на сайті вимкнено. Коли збереться мінімальна група від 4 осіб, організатори (@gryd_me та Сергій Григоришин) зв’яжуться з вами з точним кошторисом готелю, конференц-залу, харчування і програми.',
        ticketTitle: 'Попередня заявка-квиток (Fahrkarte)',
        ticketSubtitle: 'Заповніть поля — заявка напряму надійде у Telegram-бота організаторів (@gryd_me та @Grygoryshyn) для фіксації вашого місця.',
        badgeText: 'ПЕРЕДЗАПИС · ОПЛАТА НЕ ПОТРІБНА',
        form: {
          cityLabel: 'Місто та дати з графіка (2027)',
          seatsLabel: 'Кількість місць',
          langLabel: 'Зручна мова групи',
          nameLabel: 'Ваше ім’я',
          namePlaceholder: 'Наприклад, Олексій',
          contactLabel: 'Ваш Telegram (@username) або телефон',
          contactPlaceholder: '@username',
          commentLabel: 'Коментар (готель, побажання, запитання)',
          commentPlaceholder: 'Наприклад: хочу в Гамбург на січень, 1 місце в одномісному номері',
          sendBotBtn: 'Надіслати заявку в Telegram-бот',
          openDirectBtn: 'Написати напряму (@gryd_me)',
          copyBtn: 'Скопіювати текст',
          copied: 'Текст заявки скопійовано!',
          sending: 'Надсилання заявки у Telegram-бот...',
          sentOk: '✓ Заявку доставлено в Telegram-бот організаторам!',
          sentWarn: 'Бот ще не отримав /start від адміністраторів. Відкрийте діалог кнопкою «Написати напряму», текст уже підставлено.'
        },
        ticketLabels: {
          route: 'НАПРЯМОК',
          format: 'ФОРМАТ',
          formatValue: '4 дні / 3 ночі · єдиний готель',
          status: 'СТАТУС ЗАЯВКИ',
          statusValue: 'ПОПЕРЕДНІЙ ЗАПИС',
          group: 'РОЗМІР ГРУПИ',
          groupValue: '4–10 учасників',
          person: 'УЧАСНИК / МІСЦЬ / МОВА',
          msg: 'ТЕКСТ ДЛЯ TELEGRAM-БОТА'
        }
      },
      faq: {
        eyebrow: 'ЧАСТІ ЗАПИТАННЯ',
        title: 'Що важливо знати про оновлений формат',
        items: [
          {
            q: 'Чому прибрали участь лише на 2 вихідних дні?',
            a: 'Експедиція задумана як цілісне драматургічне й філософське висловлювання. Без дня знайомства (День 1), ранкової настанови й контексту в залі (День 2) фінал втрачає половину сенсу.'
          },
          {
            q: 'Як організоване проживання в одному готелі та харчування?',
            a: 'Ми заздалегідь підбираємо спільний готель із комфортним конференц-залом у центрі міста. Це дозволяє всій групі (4–10 осіб) снідати разом, одразу переходити на ранкову лекцію й вести вечірні бесіди без роз’їздів.'
          },
          {
            q: 'Що відбувається після надсилання попередньої заявки?',
            a: 'Заявка миттєво надходить у наш Telegram-бот до Сергія (@Grygoryshyn) і організатора (@gryd_me). Щойно формується ядро від 4 осіб, ми зв’язуємося з вами, погоджуємо бюджет і надсилаємо фінальне запрошення.'
          },
          {
            q: 'Чи потрібна спеціальна філософська освіта?',
            a: 'Ні. Увесь матеріал побудовано як живу оповідь-розслідування. Спробуйте наш інтерактив «1840 ↔ 1843» вище — саме у такому ключі проходять усі 4 дні.'
          }
        ]
      },
      footer: {
        legalNotice: 'Попередня інформаційна платформа проєкту філософських експедицій (прототип v2). Остаточні умови бронювання готелю та участі надсилаються після підтвердження групи.',
        impressum: 'Контакти організаторів у Telegram: @Grygoryshyn та @gryd_me · Інтеграція прийому заявок активна.',
        archiveCredit: 'Історичні полотна, літографії та дагеротипи XIX століття належать до суспільного надбання (Public Domain).'
      }
    },

    de: {
      topStrip: 'SERGEI GRYGORYSHYN · PHILOSOPHISCHE EXPEDITIONEN · DEUTSCHLAND · 2027',
      topStripRight: 'GRUPPE 4–10 PERS. · EIN GEMEINSAMES HOTEL · VORANMELDUNG',
      nav: {
        map: 'Karte & Zoom',
        dossier: 'Programm',
        compare: '1840 ↔ 1843',
        how: 'Format',
        speaker: 'Dozent',
        ticket: 'Voranmeldung'
      },
      hero: {
        eyebrow: 'EXPEDITIONSKATALOG · AUSGABE №01 · 2027',
        storyHook: '„1840 posierten sie im Atelier, überzeugt von der Ewigkeit ihrer bürgerlichen Welt. Zwei Jahre später brannte die Stadt nieder — und die Überlebenden hielt kein Pinsel mehr fest, sondern die Silberplatte des Daguerreotyps.“',
        title: 'Kuratierte Philosophie-Expeditionen in Deutschland',
        subtitle: 'Ein unteilbares 4-Tage-Studium nach dem persönlichen Forschungsplan von Dr. Sergei Grygoryshyn. Gemeinsame Unterbringung in einem Hotel, Seminare im angemieteten Konferenzraum und angemeldete Museumsbesuche (4–10 Gäste).',
        ctaPrimary: 'Länderkarte & Termine 2027',
        ctaSecondary: 'Route №1: Hamburg (28.–31. Jan)',
        badgeTitle: 'NÄCHSTER START · HAMBURG',
        badgeDates: '28.–31. JANUAR 2027',
        badgeStatus: 'Unverbindliche Voranmeldung geöffnet (4–10 Teilnehmende · gemeinsames Hotel)',
        triptych: ['Pinsel · Idylle', 'Feuer · Bruch', 'Silber · Dokument']
      },
      principles: {
        eyebrow: 'KONZEPT & STRUKTUR · 4 SÄULEN',
        title: 'Ein geschlossener 4-tägiger Denkraum',
        items: [
          {
            num: '01',
            head: 'Unteilbares 4-Tage-Format',
            body: 'Die Teilnahme gilt ausschließlich für alle vier Tage. Die Dramaturgie spannt sich vom Anreisedialog über zwei intensive Museumstage bis zur Schlussreflexion.'
          },
          {
            num: '02',
            head: 'Gemeinsames Hotel & Konferenzraum',
            body: 'Wir organisieren die Unterbringung der gesamten Gruppe in einem Hotel und mieten dort einen eigenen Konferenzraum für Morgen- und Abendvorträge an.'
          },
          {
            num: '03',
            head: '4–10 Gäste & Museumsanmeldung',
            body: 'Die Gruppengröße liegt zwischen 4 und 10 Personen — klein genug für echte Gespräche, offiziell angemeldet bei den jeweiligen Museen.'
          },
          {
            num: '04',
            head: 'Unverbindliche Voranmeldung',
            body: 'Auf dieser Prototyp-Seite erfolgt noch keine Bezahlung. Nach Erreichen der Mindestgruppe werden Hotel- und Programmkosten transparent abgestimmt.'
          }
        ],
        smallFormatNote: '* Hinweis: Sollten in einer Stadt nur 1–2 Interessierte zusammenkommen, fällt die Reise von Sergei nicht aus — wir bieten ein kompaktes 3-stündiges Museumsgespräch an.'
      },
      hub: {
        eyebrow: 'ROUTEN-KARTOGRAPHIE · 2027',
        title: 'Deutsche Bundesländer & Detailplan des Zentrums',
        lead: 'Klicken Sie auf eine Stadt in der Länderkarte oder rechts in der Übersicht — die Karte zoomt ins Stadtzentrum und zeigt alle Stationen unserer philosophischen Route.',
        filters: {
          all: 'Alle Städte (5)',
          active: 'Voranmeldung offen',
          lab: 'In Vorbereitung'
        },
        months: [
          { id: 'jan27', label: 'JAN', year: '2027', cityId: 'hamburg' },
          { id: 'feb27', label: 'FEB', year: '2027', cityId: 'dresden' },
          { id: 'mar27', label: 'MÄR', year: '2027', cityId: 'berlin' },
          { id: 'apr27', label: 'APR', year: '2027', cityId: 'frankfurt' },
          { id: 'may27', label: 'MAI', year: '2027', cityId: 'munich' },
          { id: 'jun27', label: 'JUN', year: '2027', cityId: null },
          { id: 'jul27', label: 'JUL', year: '2027', cityId: null },
          { id: 'aug27', label: 'AUG', year: '2027', cityId: null },
          { id: 'sep27', label: 'SEP', year: '2027', cityId: null },
          { id: 'oct27', label: 'OKT', year: '2027', cityId: null },
          { id: 'nov27', label: 'NOV', year: '2027', cityId: null },
          { id: 'dec27', label: 'DEZ', year: '2027', cityId: null }
        ],
        mapMetaCountry: 'BUNDESLÄNDER DEUTSCHLANDS',
        mapMetaCity: 'STADTZENTRUM-ZOOM · KONZEPTSTATIONEN',
        backToCountry: '← Zurück zur Übersichtskarte',
        zoomToCity: 'Stadtzentrum heranzoomen →',
        boardTitle: 'ABFAHRTSTAFEL · JAHRESPLAN 2027',
        boardThreshold: 'GRUPPE: 4–10 PERS.',
        legend: ['Voranmeldung (Januar)', 'Gruppenbildung', 'Warteliste (Fr–Mo)'],
        landmarkHint: 'Wählen Sie einen nummerierten Ort auf dem Stadtplan, um seine Rolle im Gedankengang der Expedition zu sehen.',
        reserveBtn: 'Unverbindlich vormerken'
      },
      dossier: {
        tabs: {
          story: 'Die Erzählung: 4 Akte vom Licht zum Silber',
          schedule: '4-Tage-Tagesplan (Hotel & Museen)',
          archive: 'Bildarchiv (15 Exponate)'
        },
        scheduleNotice: 'Geschlossener 4-Tage-Zyklus (3 Nächte): gemeinsames Hotel, Frühstück, Vorträge im Hotel-Konferenzraum, gemeinsames Mittagessen und geführte Museumsstudien.',
        blocks: {
          morning: 'MORGEN · FRÜHSTÜCK & KONFERENZRAUM',
          afternoon: 'TAG · STADTGANG, MITTAGESSEN & MUSEUM',
          evening: 'ABEND · ABENDVORTRAG & DISKUSSION'
        },
        archiveFilters: {
          all: 'Alle Exponate (15)',
          pre: 'Vor dem Brand (bis 1842)',
          fire: 'Der Große Brand (Mai 1842)',
          daguerre: 'Daguerreotypien (1842–1843)'
        },
        labLabel: 'ROUTEN-LABOR · IN AUSARBEITUNG',
        labCluesTitle: 'Konzeptionelle Schwerpunkte der geplanten Route',
        labAction: 'Vormerkung für diese Stadt senden'
      },
      compare: {
        eyebrow: 'TRIAL-FÜHRUNG · 1808–1843',
        title: 'Pinsel gegen Silberplatte: Dieselben Künstler vor und nach dem Brand',
        lead: 'Erleben Sie eine Kostprobe der Expedition: Klicken Sie auf die Künstler (Nummern bewusst am Revers unterhalb der Gesichter) oder starten Sie den Kamera-Schwenk über die Porträts.',
        modePins: 'Interaktiv: Künstler & Hauptwerke (6)',
        modeCinema: '🎥 Kamera-Tour: Zoom über die Porträts',
        plateButtons: {
          plate1843a: 'Stelzner Daguerreotypie I (13 Künstler, 6. Mai 1843)',
          plate1843b: 'Stelzner Daguerreotypie II (19 Künstler, 6. Mai 1843)',
          plate1842ruins: 'Biow Ruinen-Daguerreotypie (Mai 1842)'
        },
        caption1840: '1840 · Öl auf Leinwand · „Die Mitglieder des Hamburgischen Künstlervereins“ (Günther Gensler, Kunsthalle)',
        caption1843: '6. Mai 1843 · Daguerreotypie · „Hamburger Künstlerverein im Garten“ (Carl Ferdinand Stelzner)',
        disclaimer: 'Die Nummern sitzen am Revers unterhalb der Gesichter, während ein feiner Rahmen das Porträt markiert. Eine vollständige Zuordnung aller 19 Personen wird für die Expedition vorbereitet.',
        cinema: {
          play: '▶ Kamera-Schwenk starten',
          pause: '⏸ Pause',
          next: 'Nächstes Porträt →',
          plate1840: 'Gemälde 1840',
          plate1843: 'Silberplatte 1843',
          plateAuto: 'Auto 1840 → 1843',
          hint: 'Die virtuelle Kamera fährt ruhig über die Gesichter des Künstlervereins und blendet Thesen aus Sergeis Vortrag ein.'
        }
      },
      speaker: {
        eyebrow: 'DOZENT & EXPEDITIONSLEITER',
        name: 'Dr. Sergei Grygoryshyn',
        role: 'Kandidat der philosophischen Wissenschaften · Philosophiehistoriker · Bildwissenschaftler',
        portraitCap: 'SERGEI GRYGORYSHYN · PH.D.',
        bio: [
          'Seine Forschungsschwerpunkte liegen in der europäischen Philosophiegeschichte, der Phänomenologie des Bildes, biblischen Hermeneutik und den Digital Humanities.',
          'Die Stadt wird zum offenen Lesesaal: Was morgens im Konferenzraum des Hotels begrifflich entfaltet wird, prüfen wir nachmittags direkt vor den Originalen in den Museen.'
        ],
        facts: [
          { label: 'Akademischer Grad', val: 'Dr. phil. (Kandidat der philosophischen Wissenschaften)' },
          { label: 'Sprachen', val: 'DE / EN / RU / UA (je nach Gruppenzusammensetzung)' },
          { label: 'Gruppenformat', val: '4–10 Gäste · offiziell angemeldete Museumsführung · ein Hotel' }
        ],
        pubBtn: 'Publikationsverzeichnis (grygoryshyn.com)',
        videoTitle: 'Video-Einladung von Sergei Grygoryshyn',
        videoStatus: 'Platzhalter für kurzes Einführungsvideo (01:15)',
        lectureCaption: 'Dokumentarische Vorab-Aufnahmen aus früheren Lesekreisen'
      },
      tariffs: {
        eyebrow: 'VORANMELDUNG · OHNE ONLINE-ZAHLUNG',
        title: 'Einheitsformat & Anmeldung über den Telegram-Bot',
        cards: [
          {
            id: 'full',
            tag: 'EINHEITSFORMAT · 4 TAGE / 3 NÄCHTE',
            name: 'Komplette 4-Tage-Expedition (Hamburg · 28.–31. Jan)',
            priceMain: 'Voranmeldung',
            priceNote: '4–10 Gäste · Gesamtkosten werden nach Gruppenbildung abgestimmt',
            features: [
              'Gemeinsame Hotelunterbringung für alle Teilnehmenden',
              'Frühstück, gemeinsame Mittagessen & angemieteter Konferenzraum',
              'Morgendliche Einführungsvorträge & abendliche Seminare',
              'Angemeldete Studienbesuche in Kunsthalle & Museum für Hamburgische Geschichte'
            ],
            cta: 'Unverbindlich für Hamburg vormerken'
          },
          {
            id: 'waitlist',
            tag: 'WEITERE STÄDTE · FR–MO · 2027',
            name: 'Interessentenliste: Dresden, Berlin, Frankfurt, München',
            priceMain: 'Ohne Gebühr',
            priceNote: 'Letzte Monatstage (Fr–Mo) · Februar bis Mai 2027',
            features: [
              'Unverbindliche Interessenbekundung für Wunschstädte',
              'Erste Benachrichtigung vor der Hotelreservierung',
              'Wunschsprache der Gruppe wählbar (DE / EN / RU / UA)',
              'Priorität innerhalb der 10 Plätze'
            ],
            cta: 'Stadt im Formular wählen'
          }
        ],
        includedNote: 'In dieser Prototyp-Phase ist keine Bezahlung aktiv. Sobald mindestens 4 Personen vorgemerkt sind, erhalten Sie eine transparente Aufstellung für Hotel, Tagungsraum, Verpflegung und Seminarprogramm.',
        ticketTitle: 'Voranmelde-Ticket (Fahrkarte)',
        ticketSubtitle: 'Senden Sie Ihre unverbindliche Anfrage direkt an unseren Telegram-Bot (@gryd_me & @Grygoryshyn).',
        badgeText: 'VORANMELDUNG · KEINE ZAHLUNG',
        form: {
          cityLabel: 'Stadt & Termin (2027)',
          seatsLabel: 'Anzahl Plätze',
          langLabel: 'Bevorzugte Gruppensprache',
          nameLabel: 'Ihr Name',
          namePlaceholder: 'z. B. Lukas',
          contactLabel: 'Telegram (@username) oder Telefon',
          contactPlaceholder: '@username',
          commentLabel: 'Anmerkung (optional)',
          commentPlaceholder: 'z. B. Einzelzimmer gewünscht',
          sendBotBtn: 'Anfrage an Telegram-Bot senden',
          openDirectBtn: 'Direkt schreiben (@gryd_me)',
          copyBtn: 'Text kopieren',
          copied: 'Anfragetext kopiert!',
          sending: 'Wird an Telegram-Bot gesendet...',
          sentOk: '✓ Anfrage wurde an die Organisatoren im Telegram-Bot übermittelt!',
          sentWarn: 'Bot-Chat noch nicht per /start aktiviert. Bitte nutzen Sie den Direkt-Button.'
        },
        ticketLabels: {
          route: 'ZIELORT',
          format: 'FORMAT',
          formatValue: '4 Tage / 3 Nächte · ein Hotel',
          status: 'STATUS',
          statusValue: 'UNVERBINDLICHE VORANMELDUNG',
          group: 'GRUPPENGRÖSSE',
          groupValue: '4–10 Teilnehmende',
          person: 'GAST / PLÄTZE / SPRACHE',
          msg: 'NACHRICHT FÜR TELEGRAM-BOT'
        }
      },
      faq: {
        eyebrow: 'HÄUFIGE FRAGEN',
        title: 'Wichtige Hinweise zum aktualisierten Format',
        items: [
          {
            q: 'Warum gibt es kein 2-Tage-Wochenendticket mehr?',
            a: 'Die Expedition ist als geschlossener geistiger Bogen konzipiert. Ohne den Anreisetag und das erste Museumskapitel verliert das Finale am dritten Tag seine gedankliche Tiefe.'
          },
          {
            q: 'Wie funktionieren Hotel und Verpflegung?',
            a: 'Wir buchen für alle 4–10 Gäste dasselbe Hotel inklusive Tagungsraum. So beginnen wir gemeinsam beim Frühstück und wechseln nahtlos in die Morgensitzung.'
          },
          {
            q: 'Was passiert nach der Voranmeldung?',
            a: 'Ihre Nachricht landet direkt bei @Grygoryshyn und @gryd_me im Telegram-Bot. Bei Erreichen von 4 Personen besprechen wir gemeinsam Hoteldetails und Endpreis.'
          },
          {
            q: 'Braucht man philosophische Vorkenntnisse?',
            a: 'Nein. Testen Sie oben die interaktive Sektion „1840 ↔ 1843“ — genau so lebendig und bildnah arbeiten wir vier Tage lang.'
          }
        ]
      },
      footer: {
        legalNotice: 'Vorläufige Informationsplattform (Prototyp v2). Verbindliche Hotel- und Teilnahmebedingungen folgen nach Gruppenbestätigung.',
        impressum: 'Organisation in Telegram: @Grygoryshyn & @gryd_me · Bot-Übermittlung aktiv.',
        archiveCredit: 'Historische Gemälde, Lithografien und Daguerreotypien des 19. Jh. sind gemeinfrei (Public Domain).'
      }
    },

    en: {
      topStrip: 'SERGEI GRYGORYSHYN · PHILOSOPHICAL EXPEDITIONS · GERMANY · 2027',
      topStripRight: 'GROUP 4–10 GUESTS · SHARED HOTEL · PRE-REGISTRATION ONLY',
      nav: {
        map: 'Map & Zoom',
        dossier: 'Program',
        compare: '1840 ↔ 1843',
        how: 'Format',
        speaker: 'Scholar',
        ticket: 'Pre-Register'
      },
      hero: {
        eyebrow: 'EXPEDITION CATALOGUE · ISSUE №01 · 2027',
        storyHook: '“In 1840 they posed in their studio, certain that their cozy world would endure forever. Two years later the city burned—and the survivors were captured not by brush, but on a silver daguerreotype plate.”',
        title: 'Intimate Philosophical Expeditions in Germany',
        subtitle: 'An indivisible 4-day intellectual journey led by PhD philosopher Sergei Grygoryshyn. Unified hotel accommodation for the whole group, lectures in a private hotel conference hall, and registered museum visits (4–10 participants).',
        ctaPrimary: 'Explore Map of German States & 2027 Dates',
        ctaSecondary: 'Explore Route №1: Hamburg (Jan 28–31)',
        badgeTitle: 'FIRST DEPARTURE · HAMBURG',
        badgeDates: 'JANUARY 28–31, 2027',
        badgeStatus: 'Pre-registration open (4–10 participants · unified hotel & conference room)',
        triptych: ['Brush · Comfort', 'Fire · Rupture', 'Silver · Witness']
      },
      principles: {
        eyebrow: 'EXPEDITION ARCHITECTURE · 4 PILLARS',
        title: 'An indivisible 4-day intellectual immersion',
        items: [
          {
            num: '01',
            head: 'Indivisible 4-Day Product',
            body: 'Participation covers all 4 days as one continuous philosophical narrative from opening dinner to closing synthesis—no partial weekend split.'
          },
          {
            num: '02',
            head: 'Unified Hotel & Conference Hall',
            body: 'We arrange accommodation for the entire group in a single hotel and book a private conference room on site for morning and evening lectures.'
          },
          {
            num: '03',
            head: 'Group of 4–10 & Museum Letters',
            body: 'Groups range from 4 to 10 participants, with formal museum excursion notifications sent ahead to ensure seamless gallery access.'
          },
          {
            num: '04',
            head: 'Pre-Registration Without Payment',
            body: 'No payment is collected on this prototype. Once at least 4 guests express interest, full hotel, dining, and seminar pricing is finalized together.'
          }
        ],
        smallFormatNote: '* Note: If only 1–2 participants sign up in a city instead of 4–10, Sergei’s scheduled research trip still takes place and we can offer a compact 3-hour private museum walk and coffee discussion.'
      },
      hub: {
        eyebrow: 'ROUTE CARTOGRAPHY · 2027',
        title: 'German Federal States & City Center Zoom',
        lead: 'Click any city on the German Länder map or in the board on the right to zoom straight into the city center and explore the conceptual landmarks of our retreat.',
        filters: {
          all: 'All Cities (5)',
          active: 'Pre-Reg Open',
          lab: 'In Development'
        },
        months: [
          { id: 'jan27', label: 'JAN', year: '2027', cityId: 'hamburg' },
          { id: 'feb27', label: 'FEB', year: '2027', cityId: 'dresden' },
          { id: 'mar27', label: 'MAR', year: '2027', cityId: 'berlin' },
          { id: 'apr27', label: 'APR', year: '2027', cityId: 'frankfurt' },
          { id: 'may27', label: 'MAY', year: '2027', cityId: 'munich' },
          { id: 'jun27', label: 'JUN', year: '2027', cityId: null },
          { id: 'jul27', label: 'JUL', year: '2027', cityId: null },
          { id: 'aug27', label: 'AUG', year: '2027', cityId: null },
          { id: 'sep27', label: 'SEP', year: '2027', cityId: null },
          { id: 'oct27', label: 'OCT', year: '2027', cityId: null },
          { id: 'nov27', label: 'NOV', year: '2027', cityId: null },
          { id: 'dec27', label: 'DEC', year: '2027', cityId: null }
        ],
        mapMetaCountry: 'GERMAN FEDERAL STATES (BUNDESLÄNDER)',
        mapMetaCity: 'CITY CENTER ZOOM · CONCEPTUAL LANDMARKS',
        backToCountry: '← Back to Germany States Map',
        zoomToCity: 'Zoom into City Center →',
        boardTitle: 'ABFAHRTSTAFEL · 2027 EXPEDITION SCHEDULE',
        boardThreshold: 'GROUP: 4–10 GUESTS',
        legend: ['Pre-Reg Open (Jan)', 'Forming Group', 'Waitlist (Fri–Mon)'],
        landmarkHint: 'Click any numbered marker on the zoomed city map to inspect its conceptual role in the retreat.',
        reserveBtn: 'Pre-Register Interest'
      },
      dossier: {
        tabs: {
          story: 'The Story: 4 Acts from Light to Silver',
          schedule: '4-Day Schedule (Hotel & Museums)',
          archive: 'Artifact Archive (15 Works)'
        },
        scheduleNotice: 'Unified 4-day / 3-night immersion: shared hotel check-in, breakfast, lectures in the rented hotel conference room, group lunches, and museum studies.',
        blocks: {
          morning: 'MORNING · BREAKFAST & CONFERENCE HALL',
          afternoon: 'AFTERNOON · WALK, LUNCH & MUSEUM',
          evening: 'EVENING · LECTURE & SYMPOSIUM'
        },
        archiveFilters: {
          all: 'All Plates (15)',
          pre: 'Before the Fire (pre-1842)',
          fire: 'The Great Fire (May 1842)',
          daguerre: 'Daguerreotypes (1842–1843)'
        },
        labLabel: 'ROUTE LABORATORY · IN PREPARATION',
        labCluesTitle: 'Key conceptual anchors of the upcoming route',
        labAction: 'Pre-register interest for this city'
      },
      compare: {
        eyebrow: 'INTERACTIVE TRIAL TOUR · 1808–1843',
        title: 'Brush vs. Silver Plate: The Same Artists Before and After the Fire',
        lead: 'Experience a live trial of Sergei’s seminar: click any artist below (badges sit neatly on their lapels so faces stay unobstructed) to read their biography and major works, or run the smooth Cinema Camera face tour.',
        modePins: 'Interactive: Artists & Major Works (6)',
        modeCinema: '🎥 Cinema Camera: Guided Face Pan',
        plateButtons: {
          plate1843a: 'Stelzner Daguerreotype I (13 artists, May 6, 1843)',
          plate1843b: 'Stelzner Daguerreotype II (19 artists, May 6, 1843)',
          plate1842ruins: 'Biow Ruins Daguerreotype (May 1842)'
        },
        caption1840: '1840 · Oil on canvas · “Members of the Hamburg Artists’ Association” (Günther Gensler, Kunsthalle)',
        caption1843: 'May 6, 1843 · Daguerreotype · “Hamburg Artists’ Association in the Garden” (Carl Ferdinand Stelzner)',
        disclaimer: 'Markers (01–05) are placed below the chin on coats/lapels while a light frame outlines each face so portraits remain visible. Full mapping of all 19 figures is prepared for the live tour.',
        cinema: {
          play: '▶ Start Camera Pan',
          pause: '⏸ Pause',
          next: 'Next Face →',
          plate1840: '1840 Painting',
          plate1843: '1843 Silver',
          plateAuto: 'Auto 1840 → 1843',
          hint: 'The virtual camera smoothly zooms across the artists’ faces while displaying live lecture excerpts.'
        }
      },
      speaker: {
        eyebrow: 'SCHOLAR & EXPEDITION LEADER',
        name: 'Sergei Grygoryshyn, Ph.D.',
        role: 'Philosopher · Historian of Ideas · Visual Culture Researcher',
        portraitCap: 'SERGEI GRYGORYSHYN · PH.D.',
        bio: [
          'Specializes in European philosophy, phenomenology of the image, biblical hermeneutics, and methodology of the humanities. Author of international academic publications and lecture series on visual thinking, cinema, and art.',
          'Each expedition turns the city into a living seminar room: morning theses in the hotel conference hall are immediately tested in front of original artworks in museums and deepened in evening dialogues.'
        ],
        facts: [
          { label: 'Degree', val: 'Ph.D. in Philosophy (Candidate of Philosophical Sciences)' },
          { label: 'Working Languages', val: 'EN / DE / RU / UA (matched to each group)' },
          { label: 'Group Scale', val: '4–10 participants · formal museum group registration · unified hotel' }
        ],
        pubBtn: 'Academic Publications (grygoryshyn.com)',
        videoTitle: 'Video Invitation by Sergei Grygoryshyn',
        videoStatus: 'Placeholder ready for 01:15 video introduction',
        lectureCaption: 'Temporary documentary shots from live reading circles (to be updated)'
      },
      tariffs: {
        eyebrow: 'PRE-REGISTRATION · NO ONLINE PAYMENT',
        title: 'Unified Format & Telegram Bot Registration',
        cards: [
          {
            id: 'full',
            tag: 'SINGLE FORMAT · 4 DAYS / 3 NIGHTS',
            name: 'Full 4-Day Expedition (Hamburg · Jan 28–31)',
            priceMain: 'Pre-Register',
            priceNote: '4–10 guests · final hotel & program quote confirmed once group forms',
            features: [
              'Centralized accommodation for the entire group in one shared hotel',
              'Daily breakfast, group lunches & private hotel conference room',
              'Morning introductory lectures & evening philosophical seminars',
              'Officially registered museum study visits at Kunsthalle & History Museum'
            ],
            cta: 'Pre-Register for Hamburg'
          },
          {
            id: 'waitlist',
            tag: 'UPCOMING CITIES · FRI–MON · 2027',
            name: 'Early List: Dresden, Berlin, Frankfurt, Munich',
            priceMain: 'Free Sign-Up',
            priceNote: 'Last weekend of each month (Fri–Mon) · Feb–May 2027',
            features: [
              'Register your interest in one or more cities on the 2027 route',
              'Priority notification before hotel room blocks are finalized',
              'Select preferred group language (EN / DE / RU / UA)',
              'Priority spot among the 4–10 participants'
            ],
            cta: 'Select City Below'
          }
        ],
        includedNote: 'No payment is charged on this prototype. Once a group of 4+ forms, organizers (@gryd_me & @Grygoryshyn) will reach out with the confirmed hotel, conference hall, dining, and seminar quote.',
        ticketTitle: 'Pre-Registration Ticket (Fahrkarte)',
        ticketSubtitle: 'Fill out the form below — your request goes directly to our Telegram bot (@gryd_me & @Grygoryshyn) to reserve your place in the pre-registration list.',
        badgeText: 'PRE-REG · NO PAYMENT NOW',
        form: {
          cityLabel: 'City & Dates (2027)',
          seatsLabel: 'Number of Seats',
          langLabel: 'Preferred Group Language',
          nameLabel: 'Your Name',
          namePlaceholder: 'e.g. Alex',
          contactLabel: 'Telegram (@username) or Phone',
          contactPlaceholder: '@username',
          commentLabel: 'Note (optional)',
          commentPlaceholder: 'e.g. single room preference or questions',
          sendBotBtn: 'Send Request to Telegram Bot',
          openDirectBtn: 'Message Directly (@gryd_me)',
          copyBtn: 'Copy Text',
          copied: 'Request text copied!',
          sending: 'Sending to Telegram bot...',
          sentOk: '✓ Delivered to the organizers’ Telegram bot!',
          sentWarn: 'Bot admins have not clicked /start yet. Please use the direct message button—your text is prefilled.'
        },
        ticketLabels: {
          route: 'DESTINATION',
          format: 'FORMAT',
          formatValue: '4 Days / 3 Nights · Shared Hotel',
          status: 'STATUS',
          statusValue: 'PRE-REGISTRATION ONLY',
          group: 'GROUP SIZE',
          groupValue: '4–10 Participants',
          person: 'GUEST / SEATS / LANG',
          msg: 'TELEGRAM BOT PAYLOAD'
        }
      },
      faq: {
        eyebrow: 'FREQUENTLY ASKED QUESTIONS',
        title: 'Key Details About the Updated Format',
        items: [
          {
            q: 'Why is there no 2-day weekend-only option?',
            a: 'The expedition is designed as one indivisible philosophical narrative. Skipping Day 1 arrival context and Day 2 morning foundations breaks the arc of the finale.'
          },
          {
            q: 'How do hotel accommodation and meals work?',
            a: 'We book one central hotel with a dedicated conference room for all 4–10 guests, enabling shared breakfasts, seamless morning seminars, and evening discussions under one roof.'
          },
          {
            q: 'What happens after submitting pre-registration?',
            a: 'Your details are delivered via our Telegram bot to Sergei (@Grygoryshyn) and @gryd_me. Once 4+ guests are confirmed for a city, we confirm exact hotel and seminar logistics with you.'
          },
          {
            q: 'Do I need a background in philosophy or art history?',
            a: 'Not at all. Try the interactive “1840 ↔ 1843” section above for a live taste of how Sergei connects visual art, history, and philosophy.'
          }
        ]
      },
      footer: {
        legalNotice: 'Preliminary expedition prototype platform (v2). Final hotel booking terms and participation details are provided upon group confirmation.',
        impressum: 'Organizers on Telegram: @Grygoryshyn & @gryd_me · Telegram bot integration active.',
        archiveCredit: 'All 19th-century paintings, lithographs, and daguerreotypes shown belong to the Public Domain.'
      }
    }
  },

  cities: [
    {
      id: 'hamburg',
      issueNo: '01',
      nameRu: 'Гамбург',
      nameUa: 'Гамбург',
      nameDe: 'Hamburg',
      nameEn: 'Hamburg',
      regionRu: 'Вольный ганзейский город',
      regionUa: 'Вільне ганзейське місто',
      regionDe: 'Freie und Hansestadt Hamburg',
      regionEn: 'Free & Hanseatic City',
      coords: '53°33′N · 09°59′E',
      svgPos: { x: 268, y: 120 },
      monthId: 'jan27',
      datesRu: '28–31 января 2027 (Чт–Вс)',
      datesUa: '28–31 січня 2027 (Чт–Нд)',
      datesDe: '28.–31. Januar 2027 (Do–So)',
      datesEn: 'Jan 28–31, 2027 (Thu–Sun)',
      accentColor: '#C23B1A',
      status: 'active',
      statusLabelRu: 'ПРЕДЗАПИСЬ ОТКРЫТА · ГРУППА 4–10',
      statusLabelUa: 'ПЕРЕДЗАПИС ВІДКРИТО · ГРУПА 4–10',
      statusLabelDe: 'VORANMELDUNG OFFEN · 4–10 PERS.',
      statusLabelEn: 'PRE-REG OPEN · 4–10 GUESTS',
      titleRu: 'Огонь Рунге и руины старого Гамбурга',
      titleUa: 'Вогонь Рунге і руїни старого Гамбурга',
      titleDe: 'Runges Licht und die Ruinen des alten Hamburg',
      titleEn: 'Runge’s Light and the Ruins of Old Hamburg',
      subtitleRu: 'От световой мистики раннего романтизма через иллюзию бидермайера к Великому пожару 1842 года и первым дагеротипам на серебре',
      subtitleUa: 'Від світлової містики раннього романтизму через ілюзію бідермаєра до Великої пожежі 1842 року й перших дагеротипів на сріблі',
      subtitleDe: 'Von der Lichtmystik der Frühromantik über das Biedermeier bis zum Großen Brand 1842 und den ersten Daguerreotypien',
      subtitleEn: 'From early Romantic light mysticism through Biedermeier calm to the Great Fire of 1842 and silver daguerreotypes',
      isLabStub: false,

      /* 3D-карта Гамбурга: 7 концептуальных точек с глубоким погружением (открываются поверх карты) */
      cityMap: {
        waterLabel: 'Binnenalster',
        riverLabel: 'Elbe',
        center: [9.9915, 53.5508],
        zoom: 14.7,
        pitch: 58,
        bearing: -18,
        landmarks: [
          {
            id: 'hm-1',
            num: '01',
            lngLat: [9.9937, 53.5538],
            zoom: 16.2,
            pitch: 62,
            bearing: -15,
            modelType: 'hotel',
            address: 'Jungfernstieg / Alsterufer · 53°33′14″N 09°59′37″E',
            dayRu: 'Дни 1–4 · Базовый штаб экспедиции',
            dayUa: 'Дні 1–4 · Базовий штаб експедиції',
            dayDe: 'Tage 1–4 · Basis-Hotel & Tagungsort',
            dayEn: 'Days 1–4 · Base Hotel & Conference Hall',
            nameRu: 'Отель группы и конференц-зал у Бинненальстера',
            nameUa: 'Готель групи і конференц-зал біля Бінненальстера',
            nameDe: 'Gruppenhotel & Konferenzraum an der Binnenalster',
            nameEn: 'Group Hotel & Conference Hall by the Binnenalster',
            conceptRu: 'Единое заселение всей группы (4–10 человек), утренние завтраки, установочные сессии и вечерние философские лекции в арендованном конференц-зале.',
            conceptUa: 'Спільне поселення всієї групи (4–10 осіб), ранкові сніданки, установчі сесії та вечірні філософські лекції в орендованому конференц-залі.',
            conceptDe: 'Gemeinsame Unterbringung (4–10 Gäste), Frühstück, Morgen- und Abendvorträge im eigenen Konferenzraum.',
            conceptEn: 'Unified hotel stay for all 4–10 guests, breakfasts, morning orientation sessions, and evening philosophy lectures.',
            historyRu: 'Набережная Юнгфернштиг (Jungfernstieg) у внутреннего озера Бинненальстер с конца XVIII века была главной витриной купеческого Гамбурга. В мае 1842 года именно здесь пролегала драматическая линия обороны от огня: отели и павильоны у самой воды вспыхивали один за другим, пока горожане спасали архивы и картины на лодках по глади Альстера.',
            historyUa: 'Набережна Юнгфернштіг біля озера Бінненальстер із кінця XVIII століття була головною вітриною купецького Гамбурга. У травні 1842 року саме тут проходила лінія оборони від великого вогню.',
            historyDe: 'Der Jungfernstieg an der Binnenalster war seit dem 18. Jahrhundert das repräsentative Herz des bürgerlichen Hamburg und im Mai 1842 die dramatische Verteidigungslinie gegen das Feuer.',
            historyEn: 'Since the late 18th century, Jungfernstieg along the Binnenalster served as the grand promenade of merchant Hamburg—and in May 1842 became the dramatic waterfront line against the Great Fire.',
            practiceRu: 'Что происходит здесь в экспедиции: В День 1 вся группа (4–10 человек) заселяется в этот отель и собирается на вводный вечер. В Дни 2, 3 и 4 каждое утро после завтрака мы спускаемся в арендованный конференц-зал отеля на 2-часовую установочную сессию с первоисточниками, а вечером возвращаемся сюда же для философского симпозиума по итогам музейного дня.',
            practiceUa: 'Що відбувається тут: У День 1 вся група поселяється в готель. У Дні 2–4 щоранку після сніданку ми працюємо в орендованому конференц-залі готелю, а ввечері проводимо підсумковий симпозіум.',
            practiceDe: 'Vor Ort: Am Tag 1 Check-in der gesamten Gruppe. An den Tagen 2–4 finden hier im Konferenzraum die morgendlichen Einführungsvorträge und abendlichen Symposien statt.',
            practiceEn: 'On site: Unified check-in on Day 1. On Days 2–4 our rented hotel conference hall hosts morning conceptual lectures after breakfast and evening Socratic discussions.',
            artifactsRu: 'Рабочая тетрадь экспедиции · Гравюра «Гамбург с башни Св. Георга» · Карты пожара 1842 г.',
            artifactsUa: 'Робочий зошит експедиції · Гравюра старого Гамбурга · Карти пожежі 1842 р.',
            artifactsDe: 'Arbeitsbuch der Expedition · Historischer Stadtplan 1840/1842',
            artifactsEn: 'Expedition workbook · Pre-1842 engraving of the Alster basin',
            img: 'фото и картины/photo_1_2026-11-18_13-34-16.jpg'
          },
          {
            id: 'hm-2',
            num: '02',
            lngLat: [10.0064, 53.5553],
            zoom: 16.4,
            pitch: 64,
            bearing: 24,
            modelType: 'kunsthalle',
            address: 'Glockengießerwall 5 · 53°33′19″N 10°00′23″E',
            dayRu: 'День 2 · Дневной музейный практикум',
            dayUa: 'День 2 · Денний музейний практикум',
            dayDe: 'Tag 2 · Nachmittags-Studie im Museum',
            dayEn: 'Day 2 · Afternoon Museum Seminar',
            nameRu: 'Hamburger Kunsthalle (Залы Ф. О. Рунге и Г. Генслера)',
            nameUa: 'Hamburger Kunsthalle (Зали Ф. О. Рунге і Г. Генслера)',
            nameDe: 'Hamburger Kunsthalle (Säle Runge & Gensler)',
            nameEn: 'Hamburger Kunsthalle (Runge & Gensler Galleries)',
            conceptRu: 'Официальный групповой визит: изучение «Утра» (1808) Филиппа Отто Рунге и разбор парадного полотна Гюнтера Генслера «Гамбургское общество художников» (1840).',
            conceptUa: 'Офіційний груповий візит: вивчення «Ранку» (1808) Філіпа Отто Рунге і розбір полотна Гюнтера Генслера 1840 року.',
            conceptDe: 'Angemeldete Gruppenstudie: Runges „Der Morgen“ (1808) und Günther Genslers „Künstlerverein“ (1840).',
            conceptEn: 'Registered group study: Philipp Otto Runge’s “Morning” (1808) and Günther Gensler’s 1840 “Artists’ Association”.',
            historyRu: 'Гамбургский Кунстхалле вырос напрямую из деятельности того самого Гамбургского союза художников (Hamburger Künstlerverein), основанного братьями Генслер в 1832 году. Историческое кирпичное здание на бастионе Глокенгиссервалль (1863–1869) стало главным хранилищем работ Филиппа Отто Рунге, которые в конце XIX века заново открыл миру первый директор музея Альфред Лихтварк.',
            historyUa: 'Гамбурзький Кунстхалле виріс безпосередньо з діяльності Гамбурзької спілки художників, заснованої братами Генслер у 1832 році. Тут зберігається головне зібрання Філіпа Отто Рунге та майстрів гамбурзького бідермаєра.',
            historyDe: 'Die Hamburger Kunsthalle ging unmittelbar aus dem 1832 von den Brüdern Gensler mitbegründeten Künstlerverein hervor und bewahrt heute den weltweit wichtigsten Bestand zu Philipp Otto Runge.',
            historyEn: 'Growing directly out of the Hamburg Artists’ Association founded in 1832 by the Gensler brothers, the Kunsthalle houses the world’s premier collection of Philipp Otto Runge and Hamburg Biedermeier.',
            practiceRu: 'Что происходит здесь в экспедиции: Мы заходим заранее аккредитованной группой (4–10 чел.) и проводим 2,5 часа в двух ключевых залах. Сначала стоим перед «Утром» (1808) и «Детьми Хюльзенбек» Рунге, разбирая его мистику света и «Цветовой шар». Затем переходим к полотну Гюнтера Генслера «Члены Гамбургского общества художников» (1840) и вживую изучаем лица тех, кого через день увидим на серебряном дагеротипе 1843 года.',
            practiceUa: 'Що відбувається тут: Ми працюємо 2,5 години у двох ключових залах — біля циклу «Пори дня» («Ранок», 1808) Рунге та перед оригіналом картини Гюнтера Генслера 1840 року.',
            practiceDe: 'Vor Ort: Zweieinhalbstündige Werkbetrachtung vor den Originalen von Runges „Der Morgen“ (1808) und Günther Genslers Gruppenporträt von 1840.',
            practiceEn: 'On site: A 2.5-hour close reading in front of Runge’s original “Morning” (1808) and Günther Gensler’s 1840 group portrait of the Hamburg artists.',
            artifactsRu: 'Ф. О. Рунге «Утро» (1808) · «Дети Хюльзенбек» (1806) · Г. Генслер «Гамбургское общество художников» (1840)',
            artifactsUa: 'Ф. О. Рунге «Ранок» (1808) · «Діти Гюльзенбек» · Г. Генслер «Гамбурзьке товариство художників» (1840)',
            artifactsDe: 'P. O. Runge „Der Morgen“ (1808) · G. Gensler „Künstlerverein“ (1840)',
            artifactsEn: 'P. O. Runge “Morning” (1808) · G. Gensler “Artists’ Association” (1840)',
            img: 'фото и картины/photo_6_2026-11-18_13-34-16.jpg'
          },
          {
            id: 'hm-3',
            num: '03',
            lngLat: [9.9866, 53.5458],
            zoom: 16.5,
            pitch: 64,
            bearing: -35,
            modelType: 'deichstrasse',
            address: 'Deichstraße 37–42 (Nikolaifleet) · 53°32′45″N 09°59′12″E',
            dayRu: 'День 2 · Перипатетическая прогулка',
            dayUa: 'День 2 · Перипатетична прогулянка',
            dayDe: 'Tag 2 · Peripatetischer Stadtgang',
            dayEn: 'Day 2 · Peripatetic Architectural Walk',
            nameRu: 'Дайхштрассе (Deichstraße) и канал Николаифлит',
            nameUa: 'Дайхштрассе (Deichstraße) і канал Ніколаїфліт',
            nameDe: 'Deichstraße & Nikolaifleet (Brandherd 1842)',
            nameEn: 'Deichstraße & Nikolaifleet (1842 Fire Origin)',
            conceptRu: 'Единственная сохранившаяся улица старинных фахверковых домов XVII–XIX вв. — именно здесь в ночь на 5 мая 1842 года вспыхнул Великий пожар.',
            conceptUa: 'Єдина вціліла вулиця старовинних фахверкових будинків — саме тут у ніч на 5 травня 1842 року спалахнула Велика пожежа.',
            conceptDe: 'Die letzte erhaltene althamburgische Kaufmannsgasse — hier brach am 5. Mai 1842 der Große Brand aus.',
            conceptEn: 'The last surviving row of 17th–19th century merchant houses where the Great Fire broke out on May 5, 1842.',
            historyRu: 'Узкая купеческая улица Дайхштрассе вдоль канала Николаифлит объединяла под одной крышей жилые гостиные бюргеров, конторы и многоэтажные склады-пакгаузы, набитые табаком, шеллаком, спиртом и тканями. В час ночи 5 мая 1842 года на складе дома № 42 (склад сигар Эдуарда Коэна) начался пожар, который из-за ветра и горючих товаров за три дня уничтожил 1 700 домов и 4 000 квартир.',
            historyUa: 'Вузька купецька вулиця вздовж каналу Ніколаїфліт поєднувала житлові вітальні та склади. У ніч на 5 травня 1842 року в будинку № 42 спалахнув вогонь, що за три дні знищив третину Гамбурга.',
            historyDe: 'In der Nacht zum 5. Mai 1842 brach im Speicher Deichstraße Nr. 42 das Feuer aus, das durch Wind und Lagerwaren binnen drei Tagen ein Drittel der Stadt vernichtete.',
            historyEn: 'At 1:00 a.m. on May 5, 1842, fire broke out in warehouse No. 42 on Deichstraße. Fed by stored spirits, shellac, and timber, it consumed a third of Hamburg over the next 79 hours.',
            practiceRu: 'Что происходит здесь в экспедиции: Мы проходим вдоль воды Николаифлита и уцелевших домов № 27–42. Разбираем феноменологию бюргерского пространства бидермайера, которое так любовно выписывал Якоб Генслер: почему плотность и замкнутость купеческого уюта несла внутри себя материальную предпосылку собственной гибели.',
            practiceUa: 'Що відбувається тут: Ми йдемо вздовж Ніколаїфліту біля будинків № 27–42 і розбираємо феноменологію простору бідермаєра, який малював Якоб Генслер.',
            practiceDe: 'Vor Ort: Gang entlang des Nikolaifleets zu Haus Nr. 42; Analyse der Biedermeier-Raumästhetik vor der Katastrophe.',
            practiceEn: 'On site: Walking the canal facades of Nos. 27–42, we examine the spatial world of Hamburg Biedermeier right at the threshold of its destruction.',
            artifactsRu: 'Литография «Пожар у Старого крана и эвакуация по флитам» (1842) · Жанровые этюды Якоба Генслера',
            artifactsUa: 'Літографія «Пожежа біля Старого крана» (1842) · Етюди Якоба Генслера',
            artifactsDe: 'Lithografie „Brand beim Alten Kran“ (1842) · Studien von Jacob Gensler',
            artifactsEn: 'Lithograph “Fire at the Old Crane” (1842) · Jacob Gensler’s canal studies',
            img: 'фото и картины/photo_9_2026-11-18_13-34-16.jpg'
          },
          {
            id: 'hm-4',
            num: '04',
            lngLat: [9.9906, 53.5475],
            zoom: 16.5,
            pitch: 66,
            bearing: 18,
            modelType: 'nikolai',
            address: 'Willy-Brandt-Straße 60 / Hopfenmarkt · 53°32′51″N 09°59′26″E',
            dayRu: 'День 3 · Прогулка по линии огня',
            dayUa: 'День 3 · Прогулянка лінією вогню',
            dayDe: 'Tag 3 · Gang entlang der Brandlinie',
            dayEn: 'Day 3 · Walking the 1842 Fire Line',
            nameRu: 'Мемориал церкви Св. Николая (St. Nikolai) и Старая Ратуша',
            nameUa: 'Меморіал церкви Св. Миколая (St. Nikolai) і Стара Ратуша',
            nameDe: 'Mahnmal St. Nikolai & Standort des Alten Rathauses',
            nameEn: 'St. Nikolai Memorial Spire & Old Town Hall Site',
            conceptRu: 'Эпицентр майской катастрофы 1842 года: место, которое братья Генслеры зарисовывали в дыму и которое первым снял на дагеротип Герман Биов.',
            conceptUa: 'Епіцентр травневої катастрофи 1842 року: місце, яке брати Генслери замальовували в диму й першим зняв на дагеротип Герман Біов.',
            conceptDe: 'Epizentrum von 1842 — gezeichnet von den Brüdern Gensler und daguerreotypiert von Hermann Biow.',
            conceptEn: 'Epicenter of the May 1842 catastrophe sketched by the Gensler brothers and photographed by Hermann Biow.',
            historyRu: 'Средневековая церковь Св. Николая и стоявшая в ста метрах от неё Старая Ратуша (у моста Тростбрюке) стали главным театром трагедии 5–6 мая 1842 года. Когда расплавился свинец на шпиле Св. Николая и рухнула колокольня, сенат приказал взорвать Старую Ратушу порохом, чтобы остановить вал огня — но взрыв лишь разбросал горящие балки дальше к Альстеру.',
            historyUa: 'Середньовічна церква Св. Миколая та Стара Ратуша стали головним епіцентром трагедії 5–6 травня 1842 року. Саме тут обвалилася дзвіниця Св. Миколая і була підірвана Ратуша.',
            historyDe: 'Am 5. und 6. Mai 1842 stürzte hier der mittelalterliche Turm von St. Nikolai ein; kurz darauf wurde das Alte Rathaus an der Trostbrücke gesprengt.',
            historyEn: 'On May 5–6, 1842, the medieval spire of St. Nikolai collapsed in flames here, while the nearby Old Town Hall at Trostbrücke was blown up with gunpowder in a desperate attempt to halt the fire.',
            practiceRu: 'Что происходит здесь в экспедиции: Мы поднимаемся к 147-метровой башне Св. Николая и выходим к Тростбрюке, где стояла Старая Ратуша. Прямо на месте сопоставляем три слоя свидетельств: до-пожарную гравюру Ратуши, литографию горящих сводов и репортажные зарисовки Мартина Генслера, сделанные среди ещё горячего кирпича.',
            practiceUa: 'Що відбувається тут: Біля вежі Св. Миколая та мосту Тростбрюке ми зіставляємо три шари свідчень: гравюру старої Ратуші, хроніку пожежі та малюнки Мартіна Генслера.',
            practiceDe: 'Vor Ort: Vergleich der historischen Stiche des Alten Rathauses mit den Brandzeichnungen von Martin Gensler direkt am Hopfenmarkt und der Trostbrücke.',
            practiceEn: 'On site: Standing between St. Nikolai and Trostbrücke, we compare pre-fire engravings of the Old Town Hall with Martin Gensler’s eyewitness sketches of the ruins.',
            artifactsRu: 'Гравюра «Пожар башни Св. Николая» (1842) · Литография Зуров «Старая Ратуша в огне» · Дагеротип руин Г. Биова',
            artifactsUa: 'Гравюра «Пожежа вежі Св. Миколая» (1842) · Літографія «Стара Ратуша у вогні»',
            artifactsDe: 'Stich „Brand von St. Nikolai“ (1842) · P. Suhr „Das alte Rathaus in Flammen“',
            artifactsEn: 'Engraving “Burning of St. Nikolai” (1842) · Suhr lithograph “Old Town Hall in Flames”',
            img: 'фото и картины/photo_14_2026-11-18_13-34-16.jpg'
          },
          {
            id: 'hm-5',
            num: '05',
            lngLat: [9.9734, 53.5503],
            zoom: 16.3,
            pitch: 62,
            bearing: -28,
            modelType: 'museum',
            address: 'Holstenwall 24 · 53°33′01″N 09°58′24″E',
            dayRu: 'День 3 · Музейный архив катастрофы',
            dayUa: 'День 3 · Музейний архів катастрофи',
            dayDe: 'Tag 3 · Museumsstudie der Brandchronik',
            dayEn: 'Day 3 · Museum Study of the 1842 Archive',
            nameRu: 'Museum für Hamburgische Geschichte (Holstenwall)',
            nameUa: 'Museum für Hamburgische Geschichte (Holstenwall)',
            nameDe: 'Museum für Hamburgische Geschichte (Holstenwall)',
            nameEn: 'Museum of Hamburg History (Holstenwall)',
            conceptRu: 'Исследование залов, посвящённых Великому пожару 1842 года: драматическая графика Кауффмана и братьев Генслер, хроники разрушения бюргерского быта.',
            conceptUa: 'Дослідження залів Великої пожежі 1842 року: драматична графіка Кауффмана та братів Генслер.',
            conceptDe: 'Studium der Brandchroniken von 1842: Zeichnungen von Kauffmann sowie Martin und Jacob Gensler.',
            conceptEn: 'Studying the Great Fire archives: dramatic drawings by Hermann Kauffmann and the Gensler brothers.',
            historyRu: 'Монументальное здание музея на бывшем бастионе Хольстенвалль (архитектор Фриц Шумахер, 1914–1922) вобрало в себя реликвии, спасённые из огня 1842 года: порталы сгоревшей Старой Ратуши, оплавленные церковные колокола, макеты до-пожарного Гамбурга, архив литографий братьев Зур и ранние серебряные пластины.',
            historyUa: 'Монументальна будівля музею на бастіоні Гольстенвалль зберігає врятовані з вогню 1842 року портали Старої Ратуші, оплавлені реліквії, макети міста та архів графіки й дагеротипів.',
            historyDe: 'Das von Fritz Schumacher erbaute Museum am Holstenwall bewahrt die aus dem Brand von 1842 geretteten Portale, Stadtmodelle, Gemälde und frühen Daguerreotypien.',
            historyEn: 'Built on the old Holstenwall bastion, the museum preserves architectural fragments rescued from the 1842 fire, scale models of pre-fire Hamburg, eyewitness paintings, and early daguerreotypes.',
            practiceRu: 'Что происходит здесь в экспедиции: В залах XIX века мы разбираем, как за 79 часов пожара в искусстве Гамбурга произошёл метафизический переворот. Сравниваем тихие интерьеры 1830-х с апокалиптическими полотнами Германа Кауффмана и первыми документальными дагеротипами руин Германа Биова (май 1842 г.).',
            practiceUa: 'Що відбувається тут: У залах XIX століття ми розбираємо, як за 79 годин пожежі відбувся переворот від затишного живопису бідермаєра до документальної фотографії руїн.',
            practiceDe: 'Vor Ort: Analyse des Übergangs von der Biedermeier-Malerei zur Katastrophengrafik Kauffmanns und den ersten Ruinen-Daguerreotypien Hermann Biows.',
            practiceEn: 'On site: In the 19th-century galleries we trace the sudden shift from Biedermeier genre painting to Hermann Kauffmann’s fire canvases and Hermann Biow’s pioneering 1842 ruin daguerreotypes.',
            artifactsRu: 'Г. Кауффман «Великий пожар» (1842) · Литографии П. Зура · Дагеротипы руин Г. Биова (май 1842)',
            artifactsUa: 'Г. Кауффман «Велика пожежа» (1842) · Літографії П. Зура · Дагеротипи Г. Біова',
            artifactsDe: 'H. Kauffmann „Der Große Brand“ · P. Suhr Lithografien · H. Biow Daguerreotypien',
            artifactsEn: 'H. Kauffmann “The Great Fire” · P. Suhr lithographs · H. Biow 1842 ruin plates',
            img: 'фото и картины/photo_10_2026-11-18_13-34-16.jpg'
          },
          {
            id: 'hm-6',
            num: '06',
            lngLat: [9.9838, 53.5546],
            zoom: 16.5,
            pitch: 64,
            bearing: 12,
            modelType: 'garden',
            address: 'Caffamacherreihe · 53°33′17″N 09°59′02″E',
            dayRu: 'День 3 · Точка съёмки дагеротипа 1843 г.',
            dayUa: 'День 3 · Точка зйомки дагеротипа 1843 р.',
            dayDe: 'Tag 3 · Aufnahmeort der Daguerreotypie 1843',
            dayEn: 'Day 3 · Site of the May 6, 1843 Daguerreotype',
            nameRu: 'Caffamacherreihe (Сад Союза художников, 6 мая 1843)',
            nameUa: 'Caffamacherreihe (Сад Спілки художників, 6 травня 1843)',
            nameDe: 'Caffamacherreihe (Sommerlokal des Künstlervereins, 1843)',
            nameEn: 'Caffamacherreihe (Artists’ Association Garden, May 6, 1843)',
            conceptRu: 'Место встречи 6 мая 1843 года: ровно через год после пожара выжившие художники вновь собрались в саду перед камерой Карла Фердинанда Штельцнера.',
            conceptUa: 'Місце зустрічі 6 травня 1843 року: рівно за рік після пожежі митці зібралися в саду перед камерою Карла Фердинанда Штельцнера.',
            conceptDe: 'Genau ein Jahr nach dem Brand versammelten sich die Künstler hier am 6. Mai 1843 vor Stelzners Kamera.',
            conceptEn: 'Site of the May 6, 1843 gathering—one year after the fire—captured on silver plates by C. F. Stelzner.',
            historyRu: 'Улица Каффамахеррайе (названная по цеху ткачей бархата-каффы) лежала чуть западнее границы пожара и потому уцелела. Именно здесь в 1843 году находился летний садовый павильон Гамбургского союза художников, куда 6 мая 1843 года — день в день в первую годовщину катастрофы — Карл Фердинанд Штельцнер принёс свою громоздкую камеру и посеребрённые пластины.',
            historyUa: 'Вулиця Каффамахеррайє лежала трохи західніше межі вогню й уціліла. Саме тут у саду літнього локалу Спілки художників 6 травня 1843 року Карл Фердинанд Штельцнер зробив два історичні групові дагеротипи.',
            historyDe: 'Die Caffamacherreihe blieb vom Feuer verschont. Im Garten des dortigen Sommerlokals nahm Carl Ferdinand Stelzner am 6. Mai 1843 die beiden berühmten Gruppen-Daguerreotypien des Künstlervereins auf.',
            historyEn: 'Spared by the flames just west of the fire line, Caffamacherreihe hosted the Artists’ Association summer garden where C. F. Stelzner exposed two historic group daguerreotypes on May 6, 1843.',
            practiceRu: 'Что происходит здесь в экспедиции: На месте бывшего сада союза мы говорим о философском смысле ранней фотографии. Чтобы серебряная пластина запечатлела 19 человек на открытом воздухе, им пришлось замереть в полной тишине на долгие секунды выдержки — превратив годовщину пожара в ритуал оптического бессмертия.',
            practiceUa: 'Що відбувається тут: На місці колишнього саду ми розбираємо філософський сенс ранньої фотографії — як довга витримка перетворила річницю пожежі на ритуал оптичної пам’яті.',
            practiceDe: 'Vor Ort: Reflexion über die Geburtsstunde der Gruppenfotografie und die lange Belichtungszeit als Akt des Innehaltens ein Jahr nach der Katastrophe.',
            practiceEn: 'On site: We reflect on the birth of outdoor group photography—how the long exposure forced the surviving painters into silent stillness one year after the fire.',
            artifactsRu: 'К. Ф. Штельцнер «Гамбургский союз художников в саду» — Дагеротип I (13 мастеров) и Дагеротип II (19 мастеров), 6 мая 1843 г.',
            artifactsUa: 'К. Ф. Штельцнер «Гамбурзька спілка художників у саду» — Дагеротипи I та II (6 травня 1843 р.)',
            artifactsDe: 'C. F. Stelzner: Gruppen-Daguerreotypien I (13 Künstler) & II (19 Künstler), 6. Mai 1843',
            artifactsEn: 'C. F. Stelzner: Group Daguerreotypes I (13 artists) & II (19 artists), May 6, 1843',
            img: 'фото и картины/photo_7_2026-11-18_13-34-16.jpg'
          },
          {
            id: 'hm-7',
            num: '07',
            lngLat: [10.0385, 53.6215],
            zoom: 15.8,
            pitch: 60,
            bearing: -10,
            modelType: 'ohlsdorf',
            address: 'Fuhlsbüttler Straße 756 (Ohlsdorf) · 53°37′17″N 10°02′19″E',
            dayRu: 'День 3 · Мемориальный финал маршрута',
            dayUa: 'День 3 · Меморіальний фінал маршруту',
            dayDe: 'Tag 3 · Memorialer Ausklang in Ohlsdorf',
            dayEn: 'Day 3 · Memorial Finale at Ohlsdorf',
            nameRu: 'Парк-некрополь Ольсдорф (Могилы Рунге и братьев Генслер)',
            nameUa: 'Парк-некрополь Ольсдорф (Могили Рунге і братів Генслер)',
            nameDe: 'Friedhof Ohlsdorf (Gräber Runge & Brüder Gensler)',
            nameEn: 'Ohlsdorf Park Cemetery (Graves of Runge & the Genslers)',
            conceptRu: 'Мемориальный участок Althamburgischer Gedächtnisfriedhof (могила Ф. О. Рунге) и музей надгробий Heckengarten (семейный памятник братьев Генслер).',
            conceptUa: 'Меморіальна ділянка Рунге та родинний пам’ятник братів Генслер у Гекенгартені.',
            conceptDe: 'Grabstätte Philipp Otto Runges (Gedächtnisfriedhof) und Familiengrab der Brüder Gensler (Heckengarten).',
            conceptEn: 'Resting places of Philipp Otto Runge (Gedächtnisfriedhof) and the Gensler brothers (Heckengarten).',
            historyRu: 'Крупнейший в мире парк-кладбище Ольсдорф (открыт в 1877 г.) стал главным ковчегом памяти старого Гамбурга. Когда в конце XIX – начале XX века застраивались старые городские кладбища у Дамтора, сюда на участок Althamburgischer Gedächtnisfriedhof бережно перенесли прах и памятник Филиппа Отто Рунге, а в секторе Heckengarten сохранили историческое семейное надгробие братьев Гюнтера, Якоба и Мартина Генслеров.',
            historyUa: 'Найбільший у світі парк-некрополь Ольсдорф став ковчегом пам’яті старого Гамбурга. Сюди зі старих кладовищ Дамтора перенесли прах Філіпа Отто Рунге та зберегли родинний меморіал братів Генслер.',
            historyDe: 'Auf dem 1877 eröffneten Parkfriedhof Ohlsdorf ruhen auf dem Althamburgischen Gedächtnisfriedhof Philipp Otto Runge und im Freilichtmuseum Heckengarten das historische Familiengrabmal der Brüder Gensler.',
            historyEn: 'Opened in 1877 as the world’s largest park cemetery, Ohlsdorf became the ark of old Hamburg’s memory, preserving Philipp Otto Runge’s grave at the Gedächtnisfriedhof and the Gensler brothers’ family monument in the Heckengarten.',
            practiceRu: 'Что происходит здесь в экспедиции: В тишине вековых аллей у стелы с бронзовым профилем Рунге и у камня братьев Генслер мы замыкаем сюжет всех четырёх актов: города и полотна могут сгореть, но свет мысли и оптическая память остаются.',
            practiceUa: 'Що відбувається тут: У тиші вікових алей біля стели Рунге та каменя братів Генслер ми замикаємо сюжет усіх чотирьох актів експедиції.',
            practiceDe: 'Vor Ort: Stiller Gang zu Runges Porträtstele und zum Grabmal der Familie Gensler als gedanklicher Abschluss der Hamburger Route.',
            practiceEn: 'On site: Among the quiet avenues at Runge’s portrait stele and the Gensler family stone, we bring together the philosophical arc of all four acts.',
            artifactsRu: 'Стела Ф. О. Рунге (участок P 6, № 15) · Семейное надгробие Гюнтера, Якоба и Мартина Генслеров (Heckengarten)',
            artifactsUa: 'Стела Ф. О. Рунге (ділянка P 6) · Родинний пам’ятник братів Генслер (Heckengarten)',
            artifactsDe: 'Grabstele P. O. Runge (Grablage P 6) · Familiengrabmal Gensler (Heckengarten)',
            artifactsEn: 'P. O. Runge portrait stele (Plot P 6) · Gensler family monument (Heckengarten)',
            img: 'фото и картины/photo_8_2026-11-18_13-34-16.jpg'
          }
        ]
      },

      acts: [
        {
          id: 'act-1',
          tone: 'dawn',
          num: 'ACT I · 1808',
          numRu: 'АКТ I · 1808',
          numUa: 'АКТ I · 1808',
          numDe: 'AKT I · 1808',
          numEn: 'ACT I · 1808',
          titleRu: 'Мистический свет и пророчество Филиппа Отто Рунге',
          titleUa: 'Містичне світло і пророцтво Філіпа Отто Рунге',
          titleDe: 'Runges mystisches Licht und die Prophezeiung der Elemente',
          titleEn: 'Runge’s Mystical Light and the Prophecy of Elements',
          image: 'фото и картины/photo_1_2026-11-18_13-34-16.jpg',
          imageCaptionRu: 'Панорама старого Гамбурга с башни Св. Георга до пожара 1842 г.',
          imageCaptionUa: 'Панорама старого Гамбурга з вежі Св. Георга до пожежі 1842 р.',
          imageCaptionDe: 'Panorama des alten Hamburg vom St. Georgs Turm vor 1842.',
          imageCaptionEn: 'Panorama of old Hamburg before the 1842 Great Fire.',
          museumPlateRu: 'Hamburger Kunsthalle: цикл «Времена дня» («Утро», 1808), «Дети Хюльзенбек»',
          museumPlateUa: 'Hamburger Kunsthalle: цикл «Пори дня» («Ранок», 1808), «Діти Гюльзенбек»',
          museumPlateDe: 'Hamburger Kunsthalle: Zyklus „Tageszeiten“ („Der Morgen“, 1808)',
          museumPlateEn: 'Hamburger Kunsthalle: “Times of Day” (“Morning”, 1808)',
          paragraphsRu: [
            'Рунге был романтиком-визионером, дерзнувшим искать в переливах утренней зари сакральные стихии мироздания. В его космогонии огонь не просто разрушает — он очищает пространство для нового рождения.',
            'В залах Гамбургского Кунстхалле становится ясно: его масштабный космический романтизм оказался слишком сложен для прагматичного купеческого Гамбурга. Город предпочёл тихий быт грандиозным прозрениям.'
          ],
          paragraphsUa: [
            'Рунге був романтиком-візіонером, що шукав у переливах ранкової зорі сакральні стихії світобудови. У його космогонії вогонь очищує простір для нового народження.',
            'У залах Гамбурзького Кунстхалле стає зрозуміло: його масштабний космічний романтизм виявився надто складним для прагматичного купецького міста.'
          ],
          paragraphsDe: [
            'Philipp Otto Runge suchte im Licht und in der Farbe nicht bloß Landschaft, sondern die sakrale Kosmogonie einer neuen Weltordnung.',
            'Für das pragmatische Kaufmanns-Hamburg war diese Vision zu groß — die Stadt wählte die stille Behaglichkeit.'
          ],
          paragraphsEn: [
            'Philipp Otto Runge saw light and color not as mere scenery, but as sacred elements of cosmic renewal.',
            'Pragmatic merchant Hamburg overlooked his grand vision, choosing quiet domestic comfort instead.'
          ]
        },
        {
          id: 'act-2',
          tone: 'biedermeier',
          num: 'ACT II · 1840',
          numRu: 'АКТ II · 1840',
          numUa: 'АКТ II · 1840',
          numDe: 'AKT II · 1840',
          numEn: 'ACT II · 1840',
          titleRu: 'Иллюзия вечного уюта и династия братьев Генслер',
          titleUa: 'Ілюзія вічного затишку й династія братів Генслер',
          titleDe: 'Die Illusion ewiger Geborgenheit: Die Brüder Gensler',
          titleEn: 'The Illusion of Eternal Comfort: The Gensler Brothers',
          image: 'фото и картины/photo_6_2026-11-18_13-34-16.jpg',
          imageCaptionRu: 'Гюнтер Генслер. «Члены Гамбургского общества художников», 1840. Hamburger Kunsthalle.',
          imageCaptionUa: 'Гюнтер Генслер. «Члени Гамбурзького товариства художників», 1840. Hamburger Kunsthalle.',
          imageCaptionDe: 'Günther Gensler: Die Mitglieder des Hamburgischen Künstlervereins, 1840.',
          imageCaptionEn: 'Günther Gensler: Members of the Hamburg Artists’ Association, 1840.',
          museumPlateRu: 'Круг мастеров: братья Гюнтер, Якоб и Мартин Генслеры, Герман Кауффман, Отто Спектер',
          museumPlateUa: 'Коло майстрів: брати Гюнтер, Якоб і Мартін Генслери, Герман Кауффман, Отто Спектер',
          museumPlateDe: 'Künstlerkreis: Günther, Jacob & Martin Gensler, Hermann Kauffmann, Otto Speckter',
          museumPlateEn: 'Artists’ Circle: Günther, Jacob & Martin Gensler, Kauffmann, Speckter',
          paragraphsRu: [
            'Мир, который Гамбург выбрал взамен космической мистики Рунге — тихая гавань бидермайера. На холсте Гюнтера Генслера 1840 года мастера союза позируют в мастерской среди папок и эскизов.',
            'В каждой складке сюртука и тёплом свете читается абсолютная уверенность: этот благоустроенный мир бюргеров будет стоять вечно. Вечером на улочках Дайхштрассе (Deichstraße) мы ощущаем этот ритм за два года до катастрофы.'
          ],
          paragraphsUa: [
            'Світ, який Гамбург обрав замість містики Рунге — тиха гавань бідермаєра. На полотні 1840 року майстри позують у майстерні серед папок і ескізів.',
            'У кожній складці сюртука читається непохитна впевненість у вічності затишку — всього за два роки до катастрофи на Дайхштрассе.'
          ],
          paragraphsDe: [
            'Auf Günther Genslers Hauptwerk von 1840 posieren die Künstler in ruhiger Sicherheit — zwei Jahre bevor ihre Werkstätten verbrennen.',
            'Beim Gang durch die Deichstraße wird dieser bürgerliche Rhythmus physisch greifbar.'
          ],
          paragraphsEn: [
            'In Günther Gensler’s 1840 canvas, the masters gather in unshakable confidence—just two years before their studios vanish in flames.',
            'Walking historic Deichstraße brings this quiet pre-fire world vividly to life.'
          ]
        },
        {
          id: 'act-3',
          tone: 'fire',
          num: 'ACT III · MAY 1842',
          numRu: 'АКТ III · МАЙ 1842',
          numUa: 'АКТ III · ТРАВЕНЬ 1842',
          numDe: 'AKT III · MAI 1842',
          numEn: 'ACT III · MAY 1842',
          titleRu: 'Пророчество сходит с холстов: Великий пожар',
          titleUa: 'Пророцтво сходить із полотен: Велика пожежа',
          titleDe: 'Der Große Brand von 1842: Die Elemente verlassen die Leinwand',
          titleEn: 'The Great Fire of 1842: Elements Leave the Canvas',
          image: 'фото и картины/photo_10_2026-11-18_13-34-16.jpg',
          imageCaptionRu: 'Великий пожар Гамбурга 5–8 мая 1842 г. Литография Петера Зура.',
          imageCaptionUa: 'Велика пожежа Гамбурга 5–8 травня 1842 р. Літографія Петера Зура.',
          imageCaptionDe: 'Der Große Brand Hamburgs im Mai 1842. Lithografie von Peter Suhr.',
          imageCaptionEn: 'The Great Fire of Hamburg, May 1842. Lithograph by Peter Suhr.',
          museumPlateRu: 'Museum für Hamburgische Geschichte: графика Мартина и Якоба Генслеров, полотна Кауффмана',
          museumPlateUa: 'Museum für Hamburgische Geschichte: графіка Мартіна та Якоба Генслерів, полотна Кауффмана',
          museumPlateDe: 'Museum für Hamburgische Geschichte: Grafik der Brüder Gensler & Kauffmann',
          museumPlateEn: 'Museum of Hamburg History: Drawings by the Genslers & Kauffmann',
          paragraphsRu: [
            'Точка слома: в мае 1842 года в Гамбурге вспыхивает трёхдневный Великий пожар. Огонь уничтожает треть города — старую Ратушу, церкви Св. Николая и Св. Петра, мастерские самих художников.',
            'В Музее истории Гамбурга мы видим, как катастрофа переписала само искусство: на эскизах тех же мастеров бидермайера вместо гостиных появляются пылающие шпили.'
          ],
          paragraphsUa: [
            'Точка зламу: у травні 1842 року триденна пожежа знищує третину міста — Ратушу, храми Св. Миколая й Св. Петра та майстерні художників.',
            'У Музеї історії Гамбурга ми бачимо, як катастрофа миттєво переписала оптику вчорашніх майстрів бідермаєра.'
          ],
          paragraphsDe: [
            'Vom 5. bis 8. Mai 1842 vernichtet das Feuer ein Drittel Hamburgs samt Kirchen, Rathaus und Ateliers.',
            'Im Museum für Hamburgische Geschichte zeigt sich der schlagartige Stilbruch vom Idyll zur Katastrophenchronik.'
          ],
          paragraphsEn: [
            'For three days in May 1842, fire consumed a third of Hamburg, destroying churches, Town Hall, and artists’ studios.',
            'At the Museum of Hamburg History, we witness how catastrophe immediately transformed their visual language.'
          ]
        },
        {
          id: 'act-4',
          tone: 'silver',
          num: 'ACT IV · 1842–1843',
          numRu: 'АКТ IV · 1842–1843',
          numUa: 'АКТ IV · 1842–1843',
          numDe: 'AKT IV · 1842–1843',
          numEn: 'ACT IV · 1842–1843',
          titleRu: 'Серебряная пластина и тишина Ольсдорфа',
          titleUa: 'Срібна пластина й тиша Ольсдорфа',
          titleDe: 'Die Silberplatte von 1843 & die Stille von Ohlsdorf',
          titleEn: 'Silver Plates of 1843 & the Quiet of Ohlsdorf',
          image: 'фото и картины/photo_7_2026-11-18_13-34-16.jpg',
          imageCaptionRu: 'Карл Фердинанд Штельцнер. Группа Гамбургского союза художников в саду, 6 мая 1843 г. (1-я годовщина пожара).',
          imageCaptionUa: 'Карл Фердинанд Штельцнер. Група Гамбурзької спілки художників у саду, 6 травня 1843 р. (1-ша річниця пожежі).',
          imageCaptionDe: 'Carl Ferdinand Stelzner: Hamburger Künstlerverein im Garten, 6. Mai 1843.',
          imageCaptionEn: 'Carl Ferdinand Stelzner: Hamburg Artists’ Association in the Garden, May 6, 1843.',
          museumPlateRu: 'Дагеротипы руин Г. Биова (май 1842) + групповые дагеротипы К. Ф. Штельцнера (6 мая 1843) + Ohlsdorf',
          museumPlateUa: 'Дагеротипи руїн Г. Біова (травень 1842) + групові дагеротипи К. Ф. Штельцнера (6 травня 1843) + Ohlsdorf',
          museumPlateDe: 'Biows Ruinen-Daguerreotypien (1842) + Stelzners Gruppenbild (6. Mai 1843) + Ohlsdorf',
          museumPlateEn: 'Biow’s Ruins (May 1842) + Stelzner’s Garden Plate (May 6, 1843) + Ohlsdorf',
          paragraphsRu: [
            'Пока Герман Биов в мае 1842 года снимал первые в истории репортажные дагеротипы дымящихся руин, ровно через год — 6 мая 1843 года — те же художники собрались вместе в саду на Caffamacherreihe перед объективом Штельцнера.',
            'На смену субъективной кисти бидермайера пришёл беспристрастный свет фотографии. Завершаем наш путь на кладбище Ольсдорф у могил Рунге и братьев Генслер и подводим финальный философский итог.'
          ],
          paragraphsUa: [
            'Доки Герман Біов у травні 1842-го фіксував димлячі руїни, рівно за рік — 6 травня 1843 року — ті самі митці зібралися в саду на Caffamacherreihe перед камерою Штельцнера.',
            'Завершуємо маршрут на кладовищі Ольсдорф біля могил Рунге й братів Генслер та підсумовуємо експедицію.'
          ],
          paragraphsDe: [
            'Während Hermann Biow 1842 die Trümmer festhielt, traten exakt ein Jahr später, am 6. Mai 1843, dieselben Künstler vor Stelzners Kamera.',
            'Vom subjektiven Pinsel zum objektiven Silberbild — der Kreis schließt sich an den Gräbern in Ohlsdorf.'
          ],
          paragraphsEn: [
            'After Hermann Biow photographed the smoking ruins in 1842, the surviving artists gathered one year to the day—May 6, 1843—before Stelzner’s lens.',
            'From painted idyll to optical witness, our journey culminates at the resting places of Runge and the Genslers in Ohlsdorf.'
          ]
        }
      ],

      /* Новая структура 4 дней (Пункт 5) */
      days: [
        {
          dayNum: 1,
          weekdayRu: 'Четверг · 28 янв · Заезд',
          weekdayUa: 'Четвер · 28 січ · Заїзд',
          weekdayDe: 'Donnerstag · 28. Jan · Anreise',
          weekdayEn: 'Thursday · Jan 28 · Arrival',
          titleRu: 'День 1. Логистика, заселение и вечернее знакомство',
          titleUa: 'День 1. Логістика, поселення та вечірнє знайомство',
          titleDe: 'Tag 1. Anreise, gemeinsames Hotel & Kennenlernen',
          titleEn: 'Day 1. Logistics, Hotel Check-In & Opening Evening',
          leadRu: 'Сбор группы (4–10 человек) в едином отеле и вхождение в контекст',
          leadUa: 'Збір групи (4–10 осіб) у спільному готелі та входження в контекст',
          leadDe: 'Zusammenkunft der Gruppe im gemeinsamen Hotel',
          leadEn: 'Gathering the group (4–10 guests) in a single shared hotel',
          morningRu: 'Прибытие участников в Гамбург (поезда ICE / региональные маршруты / перелёт). Индивидуальная логистика с поддержкой координатора.',
          morningUa: 'Прибуття учасників до Гамбурга. Індивідуальна логістика за підтримки координатора.',
          morningDe: 'Individuelle Anreise nach Hamburg (ICE / Flug) mit Unterstützung der Organisation.',
          morningEn: 'Individual arrival in Hamburg with coordinator support.',
          afternoonRu: 'Централизованное заселение всей группы в единый выбранный отель в центре города, размещение и отдых с дороги.',
          afternoonUa: 'Централізоване поселення всієї групи в єдиний готель у центрі міста, розміщення та відпочинок.',
          afternoonDe: 'Gemeinsamer Check-in im zentral gelegenen Expeditionshotel.',
          afternoonEn: 'Unified check-in at our centrally located expedition hotel.',
          eveningRu: '19:00 · Вечернее знакомство группы в отеле: совместный ужин, выдача архивных тетрадей маршрута и вводный разговор с Сергеем о сюжете предстоящих дней.',
          eveningUa: '19:00 · Вечірнє знайомство групи в готелі: спільна вечеря, видача архівних зошитів і вступна розмова із Сергієм.',
          eveningDe: '19:00 Uhr · Gemeinsames Kennenlern-Abendessen und Einführung in das Hamburger Thema.',
          eveningEn: '19:00 · Group welcome dinner, distribution of archival notebooks, and thematic orientation.'
        },
        {
          dayNum: 2,
          weekdayRu: 'Пятница · 29 янв · День I',
          weekdayUa: 'П’ятниця · 29 січ · День I',
          weekdayDe: 'Freitag · 29. Jan · Haupttag I',
          weekdayEn: 'Friday · Jan 29 · Full Day I',
          titleRu: 'День 2. Свет Рунге и мир бидермайера Генслеров',
          titleUa: 'День 2. Світло Рунге та світ бідермаєра Генслерів',
          titleDe: 'Tag 2. Runges Lichtmystik & die Welt der Brüder Gensler',
          titleEn: 'Day 2. Runge’s Light Mysticism & the Genslers’ World',
          leadRu: 'Завтрак → конференц-зал → прогулка → обед → Kunsthalle → вечерняя лекция',
          leadUa: 'Сніданок → конференц-зал → прогулянка → обід → Kunsthalle → вечірня лекція',
          leadDe: 'Frühstück → Konferenzraum → Stadtgang → Mittag → Kunsthalle → Abendvortrag',
          leadEn: 'Breakfast → Conference Hall → Walk → Lunch → Kunsthalle → Evening Lecture',
          morningRu: '08:30 Завтрак в отеле · 09:30–11:30 Утренняя установочная сессия в арендованном конференц-зале при отеле: «Световая мистика Ф. О. Рунге и оптика гамбургского бидермайера».',
          morningUa: '08:30 Сніданок у готелі · 09:30–11:30 Ранкова установча сесія в орендованому конференц-залі: «Світлова містика Ф. О. Рунге й оптика бідермаєра».',
          morningDe: '08:30 Frühstück · 09:30–11:30 Einführungsvorlesung im Hotel-Konferenzraum über Runge und das Biedermeier.',
          morningEn: '08:30 Breakfast · 09:30–11:30 Orientation session in the rented hotel conference hall on Runge & Biedermeier.',
          afternoonRu: '11:45 Прогулка по старому городу и Deichstraße · 13:15 Совместный обед · 14:30–17:00 Поход в Hamburger Kunsthalle (официальная группа): залы Рунге и полотно Гюнтера Генслера 1840 г.',
          afternoonUa: '11:45 Прогулянка старим містом і Deichstraße · 13:15 Спільний обід · 14:30–17:00 Похід до Hamburger Kunsthalle: зали Рунге та полотно 1840 р.',
          afternoonDe: '11:45 Stadtgang Deichstraße · 13:15 Mittagessen · 14:30–17:00 Hamburger Kunsthalle (Runge & Gensler 1840).',
          afternoonEn: '11:45 Walk through Deichstraße · 13:15 Group lunch · 14:30–17:00 Hamburger Kunsthalle (Runge & Gensler 1840).',
          eveningRu: '19:00–20:45 Вечерняя лекция и сократический разбор в конференц-зале при отеле: почему прагматичный город проглядел пророчество художника.',
          eveningUa: '19:00–20:45 Вечірня лекція та сократичний розбір у конференц-залі готелю.',
          eveningDe: '19:00–20:45 Abendvortrag und Diskussion im Hotel-Konferenzraum.',
          eveningEn: '19:00–20:45 Evening lecture and Socratic symposium in the hotel conference hall.'
        },
        {
          dayNum: 3,
          weekdayRu: 'Суббота · 30 янв · День II',
          weekdayUa: 'Субота · 30 січ · День II',
          weekdayDe: 'Samstag · 30. Jan · Haupttag II',
          weekdayEn: 'Saturday · Jan 30 · Full Day II',
          titleRu: 'День 3. Великий пожар 1842 года и рождение фотографии',
          titleUa: 'День 3. Велика пожежа 1842 року і народження фотографії',
          titleDe: 'Tag 3. Der Große Brand 1842 & die Geburt der Fotografie',
          titleEn: 'Day 3. The Great Fire of 1842 & the Birth of Photography',
          leadRu: 'Завтрак → конференц-зал → линия огня → обед → Музей истории Гамбурга + дагеротипы → вечерняя лекция',
          leadUa: 'Сніданок → конференц-зал → лінія вогню → обід → Музей історії + дагеротипи → вечірня лекція',
          leadDe: 'Frühstück → Konferenzraum → Stadtgang → Mittag → Historisches Museum → Abendvortrag',
          leadEn: 'Breakfast → Conference Hall → Fire Walk → Lunch → History Museum → Evening Lecture',
          morningRu: '08:30 Завтрак в отеле · 09:30–11:30 Лекция в конференц-зале: «Май 1842 года и перелом от ручной кисти к серебряной пластине Г. Биова и К. Ф. Штельцнера».',
          morningUa: '08:30 Сніданок у готелі · 09:30–11:30 Лекція в конференц-залі: «Травень 1842 року і перехід від пензля до срібної пластини».',
          morningDe: '08:30 Frühstück · 09:30–11:30 Vortrag im Konferenzraum: Mai 1842 und die ersten Daguerreotypisten.',
          morningEn: '08:30 Breakfast · 09:30–11:30 Lecture in the conference hall on May 1842 and early daguerreotypists.',
          afternoonRu: '11:45 Прогулка по линии пожара (St. Nikolai, Старая Ратуша, Caffamacherreihe) · 13:15 Обед · 14:30–17:30 Museum für Hamburgische Geschichte и выезд в мемориальный сектор кладбища Ohlsdorf (Рунге и Генслеры).',
          afternoonUa: '11:45 Прогулянка лінією пожежі · 13:15 Обід · 14:30–17:30 Museum für Hamburgische Geschichte та виїзд до некрополя Ohlsdorf.',
          afternoonDe: '11:45 Brandlinie (St. Nikolai & Caffamacherreihe) · 13:15 Mittag · 14:30–17:30 Geschichtsmuseum & Ohlsdorf.',
          afternoonEn: '11:45 Fire-line walk · 13:15 Lunch · 14:30–17:30 Hamburg History Museum & Ohlsdorf memorials.',
          eveningRu: '19:30–21:00 Вечерняя лекция в конференц-зале при отеле: сопоставление полотна 1840 г. и дагеротипов 1842–1843 гг. как оптический документ катастрофы.',
          eveningUa: '19:30–21:00 Вечірня лекція в конференц-залі: зіставлення полотна 1840 р. та дагеротипів 1842–1843 рр.',
          eveningDe: '19:30–21:00 Abendvorlesung im Konferenzraum: Bildvergleich 1840 vs. 1843.',
          eveningEn: '19:30–21:00 Evening lecture in the hotel conference hall comparing 1840 painting vs. 1843 plates.'
        },
        {
          dayNum: 4,
          weekdayRu: 'Воскресенье · 31 янв · Итог и отъезд',
          weekdayUa: 'Неділя · 31 січ · Підсумок і від’їзд',
          weekdayDe: 'Sonntag · 31. Jan · Abschluss & Abreise',
          weekdayEn: 'Sunday · Jan 31 · Synthesis & Departure',
          titleRu: 'День 4. Финальная утренняя лекция по итогам и отъезд',
          titleUa: 'День 4. Фінальна ранкова лекція з підсумками та від’їзд',
          titleDe: 'Tag 4. Abschlussvorlesung, Resümee & Abreise',
          titleEn: 'Day 4. Morning Closing Synthesis & Departure',
          leadRu: 'Сборка всех философских линий экспедиции перед возвращением домой',
          leadUa: 'Збирання всіх філософських ліній експедиції перед поверненням додому',
          leadDe: 'Zusammenführung aller Denklinien vor der Heimreise',
          leadEn: 'Bringing together all philosophical threads before heading home',
          morningRu: '09:00 Завтрак и чек-аут в отеле · 10:00–12:30 Утренняя итоговая лекция и финальный круг в конференц-зале отеля: фиксация главных философских выводов экспедиции.',
          morningUa: '09:00 Сніданок і чек-аут · 10:00–12:30 Ранкова підсумкова лекція та фінальне коло у конференц-залі готелю.',
          morningDe: '09:00 Frühstück & Check-out · 10:00–12:30 Abschließende Zusammenfassung im Konferenzraum.',
          morningEn: '09:00 Breakfast & check-out · 10:00–12:30 Closing synthesis lecture in the hotel conference hall.',
          afternoonRu: '12:30 Свободное время, прощальный кофе у Альстера и разъезд участников по городам.',
          afternoonUa: '12:30 Вільний час, прощальна кава біля Альстера та від’їзд учасників.',
          afternoonDe: '12:30 Ausklang an der Alster und individuelle Rückreise.',
          afternoonEn: '12:30 Farewell coffee by the Alster and individual departures.',
          eveningRu: 'Обмен фотографиями, списком рекомендованных первоисточников и библиографией от Сергея в общем чате группы.',
          eveningUa: 'Обмін фотографіями та списком літератури в спільному чаті групи.',
          eveningDe: 'Austausch von Literaturtipps und Notizen in der Gruppennachlese.',
          eveningEn: 'Sharing bibliography and archival notes in the group channel.'
        }
      ],

      artifacts: [
        {
          id: 'art-1',
          category: 'pre',
          dayRef: 'День 1–2',
          year: 'ок. 1830-х',
          src: 'фото и картины/photo_1_2026-11-18_13-34-16.jpg',
          titleRu: 'Панорама Гамбурга с башни Св. Георга (Hamburg v. St. Georg’s Thurm)',
          titleUa: 'Панорама Гамбурга з вежі Св. Георга',
          titleDe: 'Hamburg vom St. Georgs Turm',
          titleEn: 'Hamburg from St. Georg’s Tower',
          authorRu: 'Гравюра на стали XIX века',
          authorUa: 'Гравюра на сталі XIX ст.',
          authorDe: 'Stahlstich des 19. Jh.',
          authorEn: '19th-century steel engraving',
          noteRu: 'Мирный силуэт вольного купеческого города со шпилями старых церквей и гладью Альстера до великого слома 1842 года.',
          noteUa: 'Мирний силует купецького міста до великого зламу 1842 року.',
          noteDe: 'Friedliche Ansicht der Hansestadt vor dem Brand von 1842.',
          noteEn: 'Peaceful pre-1842 skyline of the merchant city and Alster basin.'
        },
        {
          id: 'art-6',
          category: 'pre',
          dayRef: 'День 2',
          year: '1840',
          src: 'фото и картины/photo_6_2026-11-18_13-34-16.jpg',
          titleRu: 'Члены Гамбургского общества художников (Die Mitglieder des Hamburgischen Künstlervereins)',
          titleUa: 'Члени Гамбурзького товариства художників',
          titleDe: 'Die Mitglieder des Hamburgischen Künstlervereins',
          titleEn: 'Members of the Hamburg Artists’ Association',
          authorRu: 'Гюнтер Генслер · Hamburger Kunsthalle',
          authorUa: 'Гюнтер Генслер · Hamburger Kunsthalle',
          authorDe: 'Günther Gensler · Hamburger Kunsthalle',
          authorEn: 'Günther Gensler · Hamburger Kunsthalle',
          noteRu: 'Центральное полотно Дня 2: мастера союза в своей мастерской на пике бюргерского покоя за два года до пожара.',
          noteUa: 'Центральне полотно Дня 2 за два роки до пожежі.',
          noteDe: 'Schlüsselwerk von Tag 2 — zwei Jahre vor der Katastrophe.',
          noteEn: 'Key painting of Day 2, painted two years before the Great Fire.'
        },
        {
          id: 'art-13',
          category: 'pre',
          dayRef: 'День 2',
          year: 'до 1842',
          src: 'фото и картины/photo_13_2026-11-18_13-34-16.jpg',
          titleRu: 'Старая Ратуша и Нижний суд (Das Raht Hauß / Das Niedern Gericht)',
          titleUa: 'Стара Ратуша і Нижній суд',
          titleDe: 'Das Alte Rathaus und Niedergericht',
          titleEn: 'Old Town Hall & Lower Court',
          authorRu: 'Архивная гравюра',
          authorUa: 'Архівна гравюра',
          authorDe: 'Historischer Stich',
          authorEn: 'Archival engraving',
          noteRu: 'Сердце институционального Гамбурга: в мае 1842 года это здание будет взорвано и поглощено огнём.',
          noteUa: 'Серце старого Гамбурга, знищене вогнем у травні 1842 року.',
          noteDe: 'Das alte Rathaus, das im Mai 1842 zerstört wurde.',
          noteEn: 'Historic civic heart of Hamburg destroyed in May 1842.'
        },
        {
          id: 'art-10',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_10_2026-11-18_13-34-16.jpg',
          titleRu: 'Великий пожар Гамбурга: вид со стороны Альстера и моста',
          titleUa: 'Велика пожежа Гамбурга: вид з боку Альстера',
          titleDe: 'Der Große Brand über der Binnenalster',
          titleEn: 'Great Fire across the Binnenalster',
          authorRu: 'Петер Зур (литография, 1842)',
          authorUa: 'Петер Зур (літографія, 1842)',
          authorDe: 'Peter Suhr (Lithografie, 1842)',
          authorEn: 'Peter Suhr (lithograph, 1842)',
          noteRu: 'Огненная стена над деловым центром и рушащейся башней Св. Петра.',
          noteUa: 'Вогняна стіна над діловим центром та шпилем Св. Петра.',
          noteDe: 'Flammenwand über dem Zentrum und dem Turm von St. Petri.',
          noteEn: 'Wall of flame engulfing the inner city and St. Petri spire.'
        },
        {
          id: 'art-2',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_2_2026-11-18_13-34-16.jpg',
          titleRu: 'Старая Ратуша и Лотерейное бюро в огне',
          titleUa: 'Стара Ратуша і Лотерейне бюро у вогні',
          titleDe: 'Das alte Rathaus in Flammen',
          titleEn: 'Old Town Hall in Flames',
          authorRu: 'Кристоф и Петер Зур (1842)',
          authorUa: 'Крістоф і Петер Зур (1842)',
          authorDe: 'Chr. & P. Suhr (1842)',
          authorEn: 'Chr. & P. Suhr (1842)',
          noteRu: 'То же здание Ратуши в охвате пламени среди спасаемых повозок.',
          noteUa: 'Та сама Ратуша в обіймах полум’я.',
          noteDe: 'Dasselbe Rathausgebäude während der Brandkatastrophe.',
          noteEn: 'The same Town Hall seen earlier, now engulfed in fire.'
        },
        {
          id: 'art-9',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_9_2026-11-18_13-34-16.jpg',
          titleRu: 'Пожар у Старого крана (Beim Alten Kran) и эвакуация по каналам',
          titleUa: 'Пожежа біля Старого крана та евакуація каналами',
          titleDe: 'Brand beim Alten Kran & Evakuierung auf den Fleeten',
          titleEn: 'Fire near the Old Crane & Canal Evacuation',
          authorRu: 'Раскрашенная литография 1842 г.',
          authorUa: 'Розфарбована літографія 1842 р.',
          authorDe: 'Kolorierte Lithografie, 1842',
          authorEn: 'Hand-colored lithograph, 1842',
          noteRu: 'Гамбуржцы вывозят пожитки на баржах по каналам-флитам.',
          noteUa: 'Гамбуржці вивозять майно баржами каналами-флітами.',
          noteDe: 'Rettung von Hab und Gut über die Hamburger Fleete.',
          noteEn: 'Citizens evacuating belongings by barge through the canals.'
        },
        {
          id: 'art-4',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_4_2026-11-18_13-34-16.jpg',
          titleRu: 'Панорама набережной у Старого крана в разгар огня',
          titleUa: 'Панорама набережної біля Старого крана',
          titleDe: 'Panorama beim Alten Kran',
          titleEn: 'Wide View near the Old Crane',
          authorRu: 'Архивный оттиск (1842)',
          authorUa: 'Архівний відбиток (1842)',
          authorDe: 'Archivdruck (1842)',
          authorEn: 'Archival print (1842)',
          noteRu: 'Широкоформатный вариант сцены эвакуации у каналов.',
          noteUa: 'Широкоформатний варіант сцени евакуації.',
          noteDe: 'Breitformat-Ansicht der Rettungsboote im Kanal.',
          noteEn: 'Widescreen variant showing the advancing firefront.'
        },
        {
          id: 'art-5',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_5_2026-11-18_13-34-16.jpg',
          titleRu: 'Эвакуация имущества у деревянного крана (фрагмент)',
          titleUa: 'Евакуація майна біля дерев’яного крана (фрагмент)',
          titleDe: 'Detailansicht am Alten Kran',
          titleEn: 'Evacuation at the Wooden Crane (Detail)',
          authorRu: 'Цветная литография 1842 г.',
          authorUa: 'Кольорова літографія 1842 р.',
          authorDe: 'Farblithografie 1842',
          authorEn: 'Color lithograph, 1842',
          noteRu: 'Детальный ракурс на границе между уцелевшими складами и огнём.',
          noteUa: 'Детальний ракурс на межі між складами та вогнем.',
          noteDe: 'Detail an der Grenze zwischen noch stehenden Häusern und Flammen.',
          noteEn: 'Close view on the boundary between standing houses and flames.'
        },
        {
          id: 'art-11',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_11_2026-11-18_13-34-16.jpg',
          titleRu: 'Горящий шпиль церкви Св. Петра (St. Petri)',
          titleUa: 'Палаючий шпиль церкви Св. Петра',
          titleDe: 'Der brennende Turm von St. Petri',
          titleEn: 'Burning Spire of St. Petri',
          authorRu: 'Литография мая 1842 г.',
          authorUa: 'Літографія травня 1842 р.',
          authorDe: 'Lithografie Mai 1842',
          authorEn: 'Lithograph, May 1842',
          noteRu: 'Символический кадр гибели вертикали старого города.',
          noteUa: 'Символічний кадр загибелі вертикалі старого міста.',
          noteDe: 'Symbolischer Einsturz des alten Wahrzeichens.',
          noteEn: 'Symbolic collapse of old Hamburg’s central spire.'
        },
        {
          id: 'art-14',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_14_2026-11-18_13-34-16.jpg',
          titleRu: 'Пожар башни церкви Св. Николая (St. Nikolai)',
          titleUa: 'Пожежа вежі церкви Св. Миколая',
          titleDe: 'Brand der St. Nikolaikirche',
          titleEn: 'St. Nikolai Tower on Fire',
          authorRu: 'Графическая хроника 1842 г.',
          authorUa: 'Графічна хроніка 1842 р.',
          authorDe: 'Grafische Chronik 1842',
          authorEn: 'Graphic chronicle, 1842',
          noteRu: 'Узкая перспектива улицы и факел шпиля Св. Николая — ныне главный мемориал катастрофы.',
          noteUa: 'Перспектива вулиці та шпиль Св. Миколая — нині головний меморіал.',
          noteDe: 'Das brennende St. Nikolai — heute zentrales Mahnmal.',
          noteEn: 'Burning St. Nikolai tower—today Hamburg’s central fire memorial.'
        },
        {
          id: 'art-12',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_12_2026-11-18_13-34-16.jpg',
          titleRu: 'View of the Conflagration of the City of Hamburgh',
          titleUa: 'View of the Conflagration of the City of Hamburgh',
          titleDe: 'View of the Conflagration of the City of Hamburgh',
          titleEn: 'View of the Conflagration of the City of Hamburgh',
          authorRu: 'Английская книжная гравюра (1842)',
          authorUa: 'Англійська книжкова гравюра (1842)',
          authorDe: 'Englischer Buchstich (1842)',
          authorEn: 'English book engraving (1842)',
          noteRu: 'Горожане в лодках наблюдают за пожаром с противоположного берега Альстера.',
          noteUa: 'Містяни у човнах спостерігають за пожежею з іншого берега.',
          noteDe: 'Bewohner beobachten den Brand vom Alsterufer aus.',
          noteEn: 'Residents watching the conflagration across the Alster.'
        },
        {
          id: 'art-3',
          category: 'fire',
          dayRef: 'День 3',
          year: '1842',
          src: 'фото и картины/photo_3_2026-11-18_13-34-16.jpg',
          titleRu: 'Ночное зарево Великого пожара со стороны флита',
          titleUa: 'Нічна заграва Великої пожежі з боку фліту',
          titleDe: 'Nächtlicher Feuerschein über dem Fleet',
          titleEn: 'Night Glow of the Fire from the Canal',
          authorRu: 'Раскрашенный эстамп (1842)',
          authorUa: 'Розфарбований естамп (1842)',
          authorDe: 'Kolorierter Stich (1842)',
          authorEn: 'Hand-colored print (1842)',
          noteRu: 'Отражение багрового дыма в тёмной воде ночного канала.',
          noteUa: 'Відбиття багрового диму у темній воді.',
          noteDe: 'Reflexion des Feuerhimmels im dunklen Kanal.',
          noteEn: 'Crimson smoke reflected in the dark night canal.'
        },
        {
          id: 'art-8',
          category: 'daguerre',
          dayRef: 'День 3',
          year: 'май 1842',
          src: 'фото и картины/photo_8_2026-11-18_13-34-16.jpg',
          titleRu: 'Руины Гамбурга со стороны Бинненальстера (один из первых фоторепортажей мира)',
          titleUa: 'Руїни Гамбурга з боку Бінненальстера',
          titleDe: 'Die Ruinen an der Binnenalster (erste Fotoreportage)',
          titleEn: 'Hamburg Ruins from the Binnenalster',
          authorRu: 'Герман Биов · Дагеротип, май 1842 г.',
          authorUa: 'Герман Біов · Дагеротип, травень 1842 р.',
          authorDe: 'Hermann Biow · Daguerreotypie, Mai 1842',
          authorEn: 'Hermann Biow · Daguerreotype, May 1842',
          noteRu: 'Скелеты обгоревших стен, запечатлённые на посеребрённой медной пластине сразу после пожара.',
          noteUa: 'Скелети обгорілих стін, зафіксовані одразу після пожежі.',
          noteDe: 'Unmittelbar nach dem Brand auf versilberter Platte festgehalten.',
          noteEn: 'Charred ruins captured on silvered copper immediately after the fire.'
        },
        {
          id: 'art-7',
          category: 'daguerre',
          dayRef: 'День 3',
          year: '6 мая 1843',
          src: 'фото и картины/photo_7_2026-11-18_13-34-16.jpg',
          titleRu: 'Гамбургское общество художников в саду (13 мастеров, 1-я годовщина пожара)',
          titleUa: 'Гамбурзьке товариство художників у саду (13 майстрів)',
          titleDe: 'Hamburger Künstlerverein im Garten (13 Künstler, 6. Mai 1843)',
          titleEn: 'Hamburg Artists’ Association in the Garden (13 artists, May 6, 1843)',
          authorRu: 'Карл Фердинанд Штельцнер · Дагеротип, 6 мая 1843 г.',
          authorUa: 'Карл Фердинанд Штельцнер · Дагеротип, 6 травня 1843 р.',
          authorDe: 'Carl Ferdinand Stelzner · Daguerreotypie, 6. Mai 1843',
          authorEn: 'Carl Ferdinand Stelzner · Daguerreotype, May 6, 1843',
          noteRu: 'Те же художники, что позировали Генслеру в 1840 г., собрались за столом на Caffamacherreihe ровно через год после пожара.',
          noteUa: 'Ті самі митці зібралися в саду рівно за рік після пожежі.',
          noteDe: 'Exakt ein Jahr nach dem Brand traten die Überlebenden vor die Kamera.',
          noteEn: 'Exactly one year after the fire, the same circle posed outdoors for Stelzner.'
        },
        {
          id: 'art-15',
          category: 'daguerre',
          dayRef: 'День 3',
          year: '6 мая 1843',
          src: 'фото и картины/photo_15_2026-11-18_13-34-16.jpg',
          titleRu: 'Гамбургское общество художников (второй дубль, 19 мастеров)',
          titleUa: 'Гамбурзьке товариство художників (другий дубль, 19 майстрів)',
          titleDe: 'Hamburger Künstlerverein (zweite Aufnahme, 19 Künstler)',
          titleEn: 'Hamburg Artists’ Association (Extended Group of 19)',
          authorRu: 'Карл Фердинанд Штельцнер · Дагеротип, 6 мая 1843 г.',
          authorUa: 'Карл Фердинанд Штельцнер · Дагеротип, 6 травня 1843 р.',
          authorDe: 'Carl Ferdinand Stelzner · Daguerreotypie, 6. Mai 1843',
          authorEn: 'Carl Ferdinand Stelzner · Daguerreotype, May 6, 1843',
          noteRu: 'Расширенный снимок той же встречи на пороге нового оптического века.',
          noteUa: 'Розширений знімок тієї ж зустрічі.',
          noteDe: 'Erweiterte Gruppenaufnahme desselben Tages.',
          noteEn: 'Extended group portrait from the same historic afternoon.'
        }
      ]
    },

    {
      id: 'dresden',
      issueNo: '02',
      nameRu: 'Дрезден',
      nameUa: 'Дрезден',
      nameDe: 'Dresden',
      nameEn: 'Dresden',
      regionRu: 'Саксония',
      regionUa: 'Саксонія',
      regionDe: 'Freistaat Sachsen',
      regionEn: 'Saxony',
      coords: '51°03′N · 13°44′E',
      svgPos: { x: 472, y: 344 },
      monthId: 'feb27',
      datesRu: '26 февраля – 1 марта 2027 (Пт–Пн)',
      datesUa: '26 лютого – 1 березня 2027 (Пт–Пн)',
      datesDe: '26. Feb – 1. März 2027 (Fr–Mo)',
      datesEn: 'Feb 26 – Mar 1, 2027 (Fri–Mon)',
      accentColor: '#3B5B6D',
      status: 'forming',
      statusLabelRu: 'ПРЕДЗАПИСЬ · ПТ–ПН · ФЕВ/МАР',
      statusLabelUa: 'ПЕРЕДЗАПИС · ПТ–ПН · ЛЮТ/БЕР',
      statusLabelDe: 'VORANMELDUNG · FR–MO',
      statusLabelEn: 'PRE-REG · FRI–MON',
      titleRu: 'Метафизика тумана и романтизм руин',
      titleUa: 'Метафізика туману і романтизм руїн',
      titleDe: 'Metaphysik des Nebels und Romantik der Ruine',
      titleEn: 'Metaphysics of Fog and the Romanticism of Ruins',
      subtitleRu: 'Каспар Давид Фридрих, дрезденская школа романтизма и феноменология разрушенного и заново сложенного камня',
      subtitleUa: 'Каспар Давид Фрідріх, дрезденська школа романтизму та феноменологія руїни',
      subtitleDe: 'Caspar David Friedrich, die Dresdner Romantik und das Gedächtnis des Steins',
      subtitleEn: 'Caspar David Friedrich, Dresden Romanticism, and the phenomenology of stone',
      isLabStub: true,
      labStageRu: 'Архивная проработка экспозиции Albertinum и логистики отеля в центре (4 дня, Пт–Пн)',
      labStageUa: 'Архівне опрацювання Albertinum і готелю в центрі (4 дні, Пт–Пн)',
      labStageDe: 'Ausarbeitung der Albertinum-Studien & Hotelauswahl (Fr–Mo)',
      labStageEn: 'Curating Albertinum itinerary & central hotel block (Fri–Mon)',
      cityMap: {
        waterLabel: 'Elbe',
        riverLabel: 'Elbe · Altstadt',
        landmarks: [
          {
            id: 'dr-1',
            num: '01',
            x: 360,
            y: 255,
            dayRu: 'Дни 1–4 · Отель и зал',
            dayUa: 'Дні 1–4 · Готель',
            dayDe: 'Tage 1–4 · Hotel',
            dayEn: 'Days 1–4 · Hotel',
            nameRu: 'Отель группы и Albertinum',
            nameUa: 'Готель групи й Albertinum',
            nameDe: 'Gruppenhotel & Albertinum',
            nameEn: 'Group Hotel & Albertinum',
            conceptRu: 'Каспар Давид Фридрих и романтизм взгляда «спиной к зрителю» — ключевые полотна в центре программы.',
            conceptUa: 'Каспар Давид Фрідріх і погляд «спиною до глядача».',
            conceptDe: 'Caspar David Friedrich und die Rückenfigur in der Galerie.',
            conceptEn: 'Caspar David Friedrich and the Rückenfigur perspective.'
          },
          {
            id: 'dr-2',
            num: '02',
            x: 268,
            y: 295,
            dayRu: 'День 2–3 · Центр',
            dayUa: 'День 2–3 · Центр',
            dayDe: 'Tag 2–3 · Altstadt',
            dayEn: 'Days 2–3 · Old Town',
            nameRu: 'Фрауэнкирхе (Frauenkirche)',
            nameUa: 'Фрауенкірхе (Frauenkirche)',
            nameDe: 'Frauenkirche',
            nameEn: 'Frauenkirche',
            conceptRu: 'Философский спор: должна ли руина оставаться открытым шрамом истории или быть воссозданной заново.',
            conceptUa: 'Філософська суперечка про руїну та реконструкцію.',
            conceptDe: 'Ruine als Wunde vs. rekonstruierter Stein.',
            conceptEn: 'The ruin as historical wound vs. reconstruction.'
          },
          {
            id: 'dr-3',
            num: '03',
            x: 505,
            y: 195,
            dayRu: 'День 3 · Некрополь',
            dayUa: 'День 3 · Некрополь',
            dayDe: 'Tag 3 · Friedhof',
            dayEn: 'Day 3 · Memorial',
            nameRu: 'Trinitatisfriedhof (Могила К. Д. Фридриха)',
            nameUa: 'Trinitatisfriedhof (Могила Фрідріха)',
            nameDe: 'Trinitatisfriedhof (Grab C. D. Friedrich)',
            nameEn: 'Trinitatisfriedhof (Friedrich’s Grave)',
            conceptRu: 'Тихая прогулка и беседа о конечности, пейзаже как молитве и немецком романтизме.',
            conceptUa: 'Прогулянка та бесіда про романтизм.',
            conceptDe: 'Spaziergang zum Grab von Caspar David Friedrich.',
            conceptEn: 'Closing reflection at the resting place of C. D. Friedrich.'
          }
        ]
      },
      labClues: [
        {
          code: 'ТОЧКА 01',
          titleRu: 'Albertinum & Kupferstich-Kabinett',
          titleUa: 'Albertinum & Kupferstich-Kabinett',
          titleDe: 'Albertinum & Kupferstich-Kabinett',
          titleEn: 'Albertinum & Print Room',
          descRu: 'Немецкий романтизм от ранних полотен Каспара Давида Фридриха до пейзажей Даля.',
          descUa: 'Німецький романтизм від Фрідріха до пейзажів Даля.',
          descDe: 'Werke von C. D. Friedrich und Johan Christian Dahl.',
          descEn: 'German Romanticism from C. D. Friedrich to Johan Christian Dahl.'
        },
        {
          code: 'ТОЧКА 02',
          titleRu: 'Философия руин: 1945 и Фрауэнкирхе',
          titleUa: 'Філософія руїн і Фрауенкірхе',
          titleDe: 'Philosophie der Ruine & Frauenkirche',
          titleEn: 'Philosophy of Ruins & Frauenkirche',
          descRu: 'Спор между руиной как раной памяти и реконструкцией.',
          descUa: 'Суперечка між руїною як раною та реконструкцією.',
          descDe: 'Zwischen Mahnmal und Wiederaufbau.',
          descEn: 'Between memorial ruin and architectural rebirth.'
        },
        {
          code: 'ТОЧКА 03',
          titleRu: 'Кладбище Trinitatisfriedhof',
          titleUa: 'Кладовище Trinitatisfriedhof',
          titleDe: 'Trinitatisfriedhof',
          titleEn: 'Trinitatisfriedhof Cemetery',
          descRu: 'Могилы Фридриха и Каруса: разговор о фигуре «спиной к зрителю».',
          descUa: 'Могили Фрідріха й Каруса.',
          descDe: 'Gespräch über die Rückenfigur.',
          descEn: 'Graves of Friedrich and Carus: dialogue on the hidden gaze.'
        }
      ]
    },

    {
      id: 'berlin',
      issueNo: '03',
      nameRu: 'Берлин',
      nameUa: 'Берлін',
      nameDe: 'Berlin',
      nameEn: 'Berlin',
      regionRu: 'Берлин',
      regionUa: 'Берлін',
      regionDe: 'Land Berlin',
      regionEn: 'Berlin',
      coords: '52°31′N · 13°24′E',
      svgPos: { x: 454, y: 208 },
      monthId: 'mar27',
      datesRu: '26–29 марта 2027 (Пт–Пн)',
      datesUa: '26–29 березня 2027 (Пт–Пн)',
      datesDe: '26.–29. März 2027 (Fr–Mo)',
      datesEn: 'Mar 26–29, 2027 (Fri–Mon)',
      accentColor: '#1D4E6B',
      status: 'waitlist',
      statusLabelRu: 'ПРЕДЗАПИСЬ · ПТ–ПН · МАРТ',
      statusLabelUa: 'ПЕРЕДЗАПИС · ПТ–ПН · БЕРЕЗЕНЬ',
      statusLabelDe: 'WARTELISTE · FR–MO',
      statusLabelEn: 'WAITLIST · FRI–MON',
      titleRu: 'Прусская лазурь, Гегель и архитектура памяти',
      titleUa: 'Прусська лазур, Гегель і архітектура пам’яті',
      titleDe: 'Preußischblau, Hegel und die Architektur des Gedächtnisses',
      titleEn: 'Prussian Blue, Hegel & the Architecture of Memory',
      subtitleRu: 'Музейный остров, Вальтер Беньямин и фланёрство по городу, где история написана слоями неоклассики и бетона',
      subtitleUa: 'Музейний острів, Вальтер Беньямін і фланерство містом, де історія записана в камені',
      subtitleDe: 'Museumsinsel, Walter Benjamin und die Schichten der Metropole',
      subtitleEn: 'Museum Island, Walter Benjamin, and urban phenomenology',
      isLabStub: true,
      labStageRu: 'Подготовка корпуса текстов и залов Alte Nationalgalerie на март 2027',
      labStageUa: 'Підготовка корпусу текстів та залів на березень 2027',
      labStageDe: 'Vorbereitung der Texte für März 2027',
      labStageEn: 'Preparing readings and museum slots for March 2027',
      cityMap: {
        waterLabel: 'Spree',
        riverLabel: 'Spree · Mitte',
        landmarks: [
          {
            id: 'be-1',
            num: '01',
            x: 315,
            y: 255,
            dayRu: 'Дни 1–4 · Штаб',
            dayUa: 'Дні 1–4 · Штаб',
            dayDe: 'Tage 1–4 · Hotel',
            dayEn: 'Days 1–4 · Hotel',
            nameRu: 'Отель в Митте и Alte Nationalgalerie',
            nameUa: 'Готель у Мітте й Alte Nationalgalerie',
            nameDe: 'Hotel in Mitte & Alte Nationalgalerie',
            nameEn: 'Mitte Hotel & Alte Nationalgalerie',
            conceptRu: 'Прусская эстетика, Шинкель и Менцель: как государство и искусство спорили о духе эпохи.',
            conceptUa: 'Прусська естетика, Шинкель і Менцель.',
            conceptDe: 'Schinkel und Adolph Menzel auf der Museumsinsel.',
            conceptEn: 'Schinkel and Adolph Menzel on Museum Island.'
          },
          {
            id: 'be-2',
            num: '02',
            x: 248,
            y: 204,
            dayRu: 'День 2–3 · Философия',
            dayUa: 'День 2–3 · Філософія',
            dayDe: 'Tag 2–3 · Philosophie',
            dayEn: 'Days 2–3 · Philosophy',
            nameRu: 'Доротеенштадтский некрополь (Могила Гегеля)',
            nameUa: 'Доротеєнштадтський некрополь (Могила Гегеля)',
            nameDe: 'Dorotheenstädtischer Friedhof (Hegel)',
            nameEn: 'Dorotheenstadt Cemetery (Hegel’s Grave)',
            conceptRu: 'У могил Гегеля, Фихте и Брехта: разговор о философии истории в XXI веке.',
            conceptUa: 'Біля могил Гегеля, Фіхте та Брехта.',
            conceptDe: 'An den Gräbern von Hegel, Fichte und Brecht.',
            conceptEn: 'At the graves of Hegel, Fichte, and Brecht.'
          },
          {
            id: 'be-3',
            num: '03',
            x: 158,
            y: 344,
            dayRu: 'День 3 · Модерн',
            dayUa: 'День 3 · Модерн',
            dayDe: 'Tag 3 · Moderne',
            dayEn: 'Day 3 · Modernism',
            nameRu: 'Neue Nationalgalerie (Тиргартен)',
            nameUa: 'Neue Nationalgalerie',
            nameDe: 'Neue Nationalgalerie',
            nameEn: 'Neue Nationalgalerie',
            conceptRu: 'Стекло Миса ван дер Роэ и слом фигуративного взгляда XX века.',
            conceptUa: 'Скло Міса ван дер Рое та злам XX століття.',
            conceptDe: 'Mies van der Rohes Glasbau und die Moderne.',
            conceptEn: 'Mies van der Rohe and 20th-century rupture.'
          }
        ]
      },
      labClues: [
        {
          code: 'ТОЧКА 01',
          titleRu: 'Alte Nationalgalerie · Шинкель и Менцель',
          titleUa: 'Alte Nationalgalerie · Шинкель і Менцель',
          titleDe: 'Alte Nationalgalerie',
          titleEn: 'Alte Nationalgalerie',
          descRu: 'От прусского классицизма к внутреннему надлому XIX века.',
          descUa: 'Від класицизму до надламу XIX століття.',
          descDe: 'Vom Klassizismus zur inneren Krise.',
          descEn: 'From Prussian order to inner tension.'
        },
        {
          code: 'ТОЧКА 02',
          titleRu: 'Тропы Беньямина и некрополь Гегеля',
          titleUa: 'Стежки Беньяміна і могила Гегеля',
          titleDe: 'Benjamin & Dorotheenstädtischer Friedhof',
          titleEn: 'Benjamin & Hegel’s Resting Place',
          descRu: '«Берлинское детство» и философия мегаполиса.',
          descUa: 'Філософія мегаполіса й історичного духу.',
          descDe: 'Philosophie der Großstadt.',
          descEn: 'Urban flânerie and philosophy of history.'
        },
        {
          code: 'ТОЧКА 03',
          titleRu: 'Neue Nationalgalerie',
          titleUa: 'Neue Nationalgalerie',
          titleDe: 'Neue Nationalgalerie',
          titleEn: 'Neue Nationalgalerie',
          descRu: 'Как XX век разрушил классическую раму.',
          descUa: 'Як XX століття зламало класичну раму.',
          descDe: 'Bruch der modernen Wahrnehmung.',
          descEn: 'Breaking the classical pictorial frame.'
        }
      ]
    },

    {
      id: 'frankfurt',
      issueNo: '04',
      nameRu: 'Франкфурт',
      nameUa: 'Франкфурт',
      nameDe: 'Frankfurt am Main',
      nameEn: 'Frankfurt',
      regionRu: 'Гессен',
      regionUa: 'Гессен',
      regionDe: 'Hessen',
      regionEn: 'Hesse',
      coords: '50°06′N · 08°41′E',
      svgPos: { x: 204, y: 382 },
      monthId: 'apr27',
      datesRu: '23–26 апреля 2027 (Пт–Пн)',
      datesUa: '23–26 квітня 2027 (Пт–Пн)',
      datesDe: '23.–26. April 2027 (Fr–Mo)',
      datesEn: 'Apr 23–26, 2027 (Fri–Mon)',
      accentColor: '#6E2B35',
      status: 'waitlist',
      statusLabelRu: 'ПРЕДЗАПИСЬ · ПТ–ПН · АПРЕЛЬ',
      statusLabelUa: 'ПЕРЕДЗАПИС · ПТ–ПН · КВІТЕНЬ',
      statusLabelDe: 'WARTELISTE · FR–MO',
      statusLabelEn: 'WAITLIST · FRI–MON',
      titleRu: 'Штедель, бюргеры и диалектика Просвещения',
      titleUa: 'Штедель, бюргери й діалектика Просвітництва',
      titleDe: 'Städel, Bürgertum und Dialektik der Aufklärung',
      titleEn: 'Städel Museum & the Dialectic of Enlightenment',
      subtitleRu: 'Как город банкиров породил критическую теорию XX века, и что прячет коллекция музея Штедель',
      subtitleUa: 'Як місто банкірів породило критичну філософію XX століття',
      subtitleDe: 'Wie die Bankenstadt zur Wiege der Kritischen Theorie wurde',
      subtitleEn: 'How a banking capital gave rise to Critical Theory',
      isLabStub: true,
      labStageRu: 'Выбор шедевров Städel Museum и текстов Теодора Адорно на апрель 2027',
      labStageUa: 'Вибір шедеврів Städel та текстів Адорно на квітень 2027',
      labStageDe: 'Auswahl der Städel-Werke & Adorno-Texte',
      labStageEn: 'Selecting Städel masterpieces & Adorno seminars',
      cityMap: {
        waterLabel: 'Main',
        riverLabel: 'Main · Museumsufer',
        landmarks: [
          {
            id: 'fr-1',
            num: '01',
            x: 245,
            y: 325,
            dayRu: 'Дни 2–3 · Музей',
            dayUa: 'Дні 2–3 · Музей',
            dayDe: 'Tag 2–3 · Museum',
            dayEn: 'Days 2–3 · Museum',
            nameRu: 'Städel Museum (Набережная музеев)',
            nameUa: 'Städel Museum',
            nameDe: 'Städel Museum',
            nameEn: 'Städel Museum',
            conceptRu: '«Гёте в Кампанье» Тишбейна — вершина немецкого классического идеала перед его кризисом.',
            conceptUa: '«Гете в Кампаньї» Тішбейна.',
            conceptDe: 'Tischbeins „Goethe in der Campagna“.',
            conceptEn: 'Tischbein’s “Goethe in the Roman Campagna”.'
          },
          {
            id: 'fr-2',
            num: '02',
            x: 292,
            y: 192,
            dayRu: 'День 2–3 · Штаб',
            dayUa: 'День 2–3 · Штаб',
            dayDe: 'Tag 2–3 · Theorie',
            dayEn: 'Days 2–3 · Theory',
            nameRu: 'Отель у центра и Институт социальных исследований',
            nameUa: 'Готель і Інститут соціальних досліджень',
            nameDe: 'Institut für Sozialforschung & Hotel',
            nameEn: 'Institute for Social Research & Hotel',
            conceptRu: 'Макс Хоркхаймер и Теодор Адорно: судьба искусства в эпоху культурной индустрии.',
            conceptUa: 'Хоркгаймер, Адорно і культурна індустрія.',
            conceptDe: 'Horkheimer & Adorno: Kulturindustrie.',
            conceptEn: 'Horkheimer & Adorno on the culture industry.'
          },
          {
            id: 'fr-3',
            num: '03',
            x: 392,
            y: 256,
            dayRu: 'День 3 · Знак',
            dayUa: 'День 3 · Знак',
            dayDe: 'Tag 3 · Medien',
            dayEn: 'Day 3 · Media',
            nameRu: 'Дом Гёте и старый Рёмерберг',
            nameUa: 'Дім Гете і Ремерберг',
            nameDe: 'Goethe-Haus & Römerberg',
            nameEn: 'Goethe House & Römerberg',
            conceptRu: 'От просвещенческого слова к финансовому мегаполису.',
            conceptUa: 'Від слова Просвітництва до фінансового міста.',
            conceptDe: 'Vom Wort der Aufklärung zur Finanzmetropole.',
            conceptEn: 'From Enlightenment letters to modern finance.'
          }
        ]
      },
      labClues: [
        {
          code: 'ТОЧКА 01',
          titleRu: 'Städel Museum · Тишбейн «Гёте в Кампанье»',
          titleUa: 'Städel Museum · «Гете в Кампаньї»',
          titleDe: 'Städel Museum',
          titleEn: 'Städel Museum',
          descRu: 'Идеал античной гармонии в немецкой культуре.',
          descUa: 'Ідеал античної гармонії.',
          descDe: 'Ideal der antiken Harmonie.',
          descEn: 'Classical German ideal of harmony.'
        },
        {
          code: 'ТОЧКА 02',
          titleRu: 'Франкфуртская школа · Адорно и Хоркхаймер',
          titleUa: 'Франкфуртська школа · Адорно',
          titleDe: 'Frankfurter Schule',
          titleEn: 'Frankfurt School',
          descRu: 'Разговор о массовой культуре и диалектике Просвещения.',
          descUa: 'Розмова про діалектику Просвітництва.',
          descDe: 'Kulturkritik nach 1945.',
          descEn: 'Critical Theory & the fate of art.'
        },
        {
          code: 'ТОЧКА 03',
          titleRu: 'Дом Гёте и набережная Майна',
          titleUa: 'Дім Гете та набережна Майна',
          titleDe: 'Goethe-Haus & Mainufer',
          titleEn: 'Goethe House & River Main',
          descRu: 'Истоки бюргерского самосознания.',
          descUa: 'Витоки бюргерської самосвідомості.',
          descDe: 'Wurzeln des Bildungsbürgertums.',
          descEn: 'Origins of German civic Bildung.'
        }
      ]
    },

    {
      id: 'munich',
      issueNo: '05',
      nameRu: 'Мюнхен',
      nameUa: 'Мюнхен',
      nameDe: 'München',
      nameEn: 'Munich',
      regionRu: 'Бавария',
      regionUa: 'Баварія',
      regionDe: 'Freistaat Bayern',
      regionEn: 'Bavaria',
      coords: '48°08′N · 11°34′E',
      svgPos: { x: 356, y: 556 },
      monthId: 'may27',
      datesRu: '28–31 мая 2027 (Пт–Пн)',
      datesUa: '28–31 травня 2027 (Пт–Пн)',
      datesDe: '28.–31. Mai 2027 (Fr–Mo)',
      datesEn: 'May 28–31, 2027 (Fri–Mon)',
      accentColor: '#9A6B26',
      status: 'waitlist',
      statusLabelRu: 'ПРЕДЗАПИСЬ · ПТ–ПН · МАЙ',
      statusLabelUa: 'ПЕРЕДЗАПИС · ПТ–ПН · ТРАВЕНЬ',
      statusLabelDe: 'WARTELISTE · FR–MO',
      statusLabelEn: 'WAITLIST · FRI–MON',
      titleRu: 'Алхимия Дюрера и тень «Синего всадника»',
      titleUa: 'Алхімія Дюрера й тінь «Синього вершника»',
      titleDe: 'Dürers Alchemie und der Blaue Reiter',
      titleEn: 'Dürer’s Alchemy & the Blue Rider',
      subtitleRu: 'Старая Пинакотека, Альтдорфер и переход от средневековой теологии взгляда к беспредметности Кандинского',
      subtitleUa: 'Стара Пінакотека, Альтдорфер і шлях до Кандинського',
      subtitleDe: 'Alte Pinakothek, Altdorfer und der Aufbruch der Abstraktion',
      subtitleEn: 'Alte Pinakothek, Altdorfer, and Kandinsky’s leap into abstraction',
      isLabStub: true,
      labStageRu: 'Формирование программы между Старой Пинакотекой и Lenbachhaus на май 2027',
      labStageUa: 'Формування програми на травень 2027',
      labStageDe: 'Planung für Mai 2027',
      labStageEn: 'Curating Munich itinerary for May 2027',
      cityMap: {
        waterLabel: 'Isar',
        riverLabel: 'Isar · Maxvorstadt',
        landmarks: [
          {
            id: 'mu-1',
            num: '01',
            x: 280,
            y: 225,
            dayRu: 'День 2 · Живопись',
            dayUa: 'День 2 · Живопис',
            dayDe: 'Tag 2 · Malerei',
            dayEn: 'Day 2 · Painting',
            nameRu: 'Alte Pinakothek (Дюрер и Альтдорфер)',
            nameUa: 'Alte Pinakothek',
            nameDe: 'Alte Pinakothek',
            nameEn: 'Alte Pinakothek',
            conceptRu: 'Автопортрет Дюрера 1500 года и «Битва Александра» — рождение ренессансного субъекта.',
            conceptUa: 'Автопортрет Дюрера 1500 року і «Битва Александра».',
            conceptDe: 'Dürers Selbstbildnis (1500) & Altdorfers Alexanderschlacht.',
            conceptEn: 'Dürer’s 1500 Self-Portrait & Altdorfer’s Battle of Alexander.'
          },
          {
            id: 'mu-2',
            num: '02',
            x: 215,
            y: 285,
            dayRu: 'День 3 · Авангард',
            dayUa: 'День 3 · Авангард',
            dayDe: 'Tag 3 · Avantgarde',
            dayEn: 'Day 3 · Avant-garde',
            nameRu: 'Lenbachhaus («Синий всадник»)',
            nameUa: 'Lenbachhaus («Синій вершник»)',
            nameDe: 'Lenbachhaus (Der Blaue Reiter)',
            nameEn: 'Lenbachhaus (Der Blaue Reiter)',
            conceptRu: 'Кандинский и Марк: момент, когда живопись отказывается от изображения предметного мира.',
            conceptUa: 'Кандинський і відмова від предметності.',
            conceptDe: 'Kandinsky & Marc: Geburt der reinen Farbe.',
            conceptEn: 'Kandinsky & Marc: the leap to pure abstraction.'
          },
          {
            id: 'mu-3',
            num: '03',
            x: 385,
            y: 295,
            dayRu: 'Дни 1–4 · Штаб',
            dayUa: 'Дні 1–4 · Штаб',
            dayDe: 'Tage 1–4 · Hotel',
            dayEn: 'Days 1–4 · Hotel',
            nameRu: 'Отель группы и район Швабинг',
            nameUa: 'Готель групи і Швабінг',
            nameDe: 'Gruppenhotel & Schwabing',
            nameEn: 'Group Hotel & Schwabing',
            conceptRu: 'Лекции в конференц-зале о Шеллинге и «расколдовывании мира» Макса Вебера.',
            conceptUa: 'Лекції про Шеллінга та Макса Вебера.',
            conceptDe: 'Vorträge über Schelling und Max Weber.',
            conceptEn: 'Lectures on Schelling & Max Weber.'
          }
        ]
      },
      labClues: [
        {
          code: 'ТОЧКА 01',
          titleRu: 'Alte Pinakothek · Дюрер и Альтдорфер',
          titleUa: 'Alte Pinakothek · Дюрер',
          titleDe: 'Alte Pinakothek',
          titleEn: 'Alte Pinakothek',
          descRu: 'Автопортрет 1500 года и ренессансная оптика творца.',
          descUa: 'Автопортрет 1500 року.',
          descDe: 'Die Geburt des neuzeitlichen Subjekts.',
          descEn: 'The birth of the Renaissance artist-subject.'
        },
        {
          code: 'ТОЧКА 02',
          titleRu: 'Lenbachhaus · Der Blaue Reiter',
          titleUa: 'Lenbachhaus · Der Blaue Reiter',
          titleDe: 'Lenbachhaus',
          titleEn: 'Lenbachhaus',
          descRu: 'Духовное в искусстве: Кандинский, Франц Марк и Пауль Клее.',
          descUa: 'Кандинський, Марк і Клеє.',
          descDe: 'Geistige Wende der Moderne.',
          descEn: 'Concerning the Spiritual in Art.'
        },
        {
          code: 'ТОЧКА 03',
          titleRu: 'Шеллинг и Макс Вебер',
          titleUa: 'Шеллінг і Макс Вебер',
          titleDe: 'Schelling & Max Weber',
          titleEn: 'Schelling & Max Weber',
          descRu: 'Вечерний симпозиум о поиске сакрального в современном мире.',
          descUa: 'Вечірній симпозіум про сакральне.',
          descDe: 'Entzauberung der Welt.',
          descEn: 'Evening seminar on disenchantment and the sacred.'
        }
      ]
    }
  ],

  /* Углублённая Trial-база личностей (Пункт 8):
     badge1840/1843 вынесены ниже подбородка (лацканы),
     а face1840/1843 используются для рамки вокруг лица и Кино-камеры! */
  faceComparison: {
    painting1840: 'фото и картины/photo_6_2026-11-18_13-34-16.jpg',
    daguerreotype1843a: 'фото и картины/photo_7_2026-11-18_13-34-16.jpg',
    daguerreotype1843b: 'фото и картины/photo_15_2026-11-18_13-34-16.jpg',
    daguerreotype1842ruins: 'фото и картины/photo_8_2026-11-18_13-34-16.jpg',
    persons: [
      {
        id: 'p0',
        num: '00',
        onCanvas: false,
        years: '1777–1810',
        nameRu: 'Филипп Отто Рунге',
        nameUa: 'Філіп Отто Рунге',
        nameDe: 'Philipp Otto Runge',
        nameEn: 'Philipp Otto Runge',
        roleRu: 'Пролог сюжета · Визионер раннего немецкого романтизма',
        roleUa: 'Пролог сюжету · Візіонер раннього романтизму',
        roleDe: 'Prolog · Visionär der Frühromantik',
        roleEn: 'Prologue · Early Romantic Visionary',
        face1840: null,
        face1843: null,
        badge1840: null,
        badge1843: null,
        bioRu: 'Умер за 32 года до Великого пожара, но именно его световая космогония открывает всю гамбургскую экспедицию. Дружил с Гёте, переписывался с философами и построил собственную теорию цвета («Farben-Kugel», 1810).',
        bioUa: 'Помер за 32 роки до Великої пожежі, але саме його світлова космогонія відкриває нашу експедицію.',
        bioDe: 'Starb 32 Jahre vor dem Brand — seine Lichtmetaphysik bildet den philosophischen Auftakt.',
        bioEn: 'Died 32 years before the fire, yet his mystical light metaphysics opens our entire Hamburg narrative.',
        trialExcerptRu: 'Фрагмент лекции Сергея: «Почему прагматичный Гамбург отвернулся от Рунге? Посмотрите на его "Утро" — там свет не освещает вещи, свет сам является стихией, сжигающей старую форму ради нового рождения космоса. Через три десятилетия этот метафизический огонь станет буквальным».',
        trialExcerptUa: 'Фрагмент лекції Сергія: «На полотні Рунге світло не просто освітлює предмети — воно спалює стару форму заради нового народження космосу».',
        trialExcerptDe: 'Aus Sergeis Vortrag: „Bei Runge beleuchtet das Licht nicht bloß Dinge — es ist ein kosmisches Feuer der Erneuerung.“',
        trialExcerptEn: 'From Sergei’s lecture: “In Runge’s Morning, light does not merely illuminate objects—it acts as a purifying fire.”',
        works: [
          { title: '«Утро» (Der Morgen), 1808', museum: 'Hamburger Kunsthalle', thumb: 'фото и картины/photo_1_2026-11-18_13-34-16.jpg' },
          { title: '«Дети Хюльзенбек» (Die Hülsenbeckschen Kinder), 1805–1806', museum: 'Hamburger Kunsthalle', thumb: 'фото и картины/photo_1_2026-11-18_13-34-16.jpg' },
          { title: 'Трактат «Цветовой шар» (Farben-Kugel), 1810', museum: 'Архив теории цвета', thumb: 'фото и картины/photo_6_2026-11-18_13-34-16.jpg' }
        ],
        desc1840Ru: 'Ушёл из жизни в 1810 г.; не изображён на картине Генслера 1840 г., но его духовное наследие — отправная точка Дня 2.',
        desc1840Ua: 'Пішов із життя у 1810 р.; відправна точка нашої програми.',
        desc1840De: '1810 verstorben — geistiger Ausgangspunkt der Expedition.',
        desc1840En: 'Died in 1810; invisible on the 1840 canvas yet central to Day 2.',
        desc1843Ru: 'Похоронен в Гамбурге; его останки перенесены на мемориальный участок Ольсдорфа, где завершается маршрут.',
        desc1843Ua: 'Похований у Гамбурзі; його могилу відвідуємо у Ольсдорфі.',
        desc1843De: 'Sein Grab besuchen wir auf dem Friedhof Ohlsdorf.',
        desc1843En: 'We visit his memorial grave in Ohlsdorf Cemetery.'
      },
      {
        id: 'p1',
        num: '01',
        onCanvas: true,
        years: '1803–1884',
        nameRu: 'Гюнтер Генслер',
        nameUa: 'Гюнтер Генслер',
        nameDe: 'Günther Gensler',
        nameEn: 'Günther Gensler',
        roleRu: 'Старший брат · Автор главного полотна 1840 г., идеолог союза',
        roleUa: 'Старший брат · Автор головного полотна 1840 р.',
        roleDe: 'Ältester Bruder · Schöpfer des Gemäldes von 1840',
        roleEn: 'Eldest Brother · Painter of the 1840 Masterpiece',
        face1840: { x: 48.5, y: 43 },
        face1843: { x: 39, y: 45 },
        badge1840: { x: 48.5, y: 58 },
        badge1843: { x: 39, y: 59 },
        bioRu: 'Портретист, теоретик и педагог (учил в Johanneum), основавший Гамбургский союз художников (1832). Запечатлел в 1840 году «золотой век» гармонии своих друзей и братьев.',
        bioUa: 'Портретист і педагог, засновник Гамбурзької спілки художників (1832).',
        bioDe: 'Porträtmaler, Lehrer am Johanneum und Mitbegründer des Künstlervereins (1832).',
        bioEn: 'Portraitist, educator, and co-founder of the Hamburg Artists’ Association (1832).',
        trialExcerptRu: 'Фрагмент лекции Сергея: «Посмотрите на его посадку в центре красного стола в 1840 году — это манифест спокойной власти мастера над временем. А теперь переведите взгляд на дагеротип 1843-го: поза почти та же, но за плечами уже рухнувший мир».',
        trialExcerptUa: 'Фрагмент лекції Сергія: «У 1840 році це маніфест спокійної влади майстра над часом. На дагеротипі 1843-го за плечима вже зруйнований світ».',
        trialExcerptDe: 'Aus Sergeis Vortrag: „1840 sitzt er wie ein ruhiger Chronist einer ewigen Welt — 1843 trägt sein Blick bereits die Erfahrung des Feuers.“',
        trialExcerptEn: 'From Sergei’s lecture: “In 1840 he commands the center table in serene poise; by 1843 his gaze carries the weight of a burned city.”',
        works: [
          { title: '«Члены Гамбургского общества художников» (1840)', museum: 'Hamburger Kunsthalle', thumb: 'фото и картины/photo_6_2026-11-18_13-34-16.jpg' },
          { title: 'Цикл портретов гамбургских сенаторов и меценатов', museum: 'Музей истории Гамбурга', thumb: 'фото и картины/photo_13_2026-11-18_13-34-16.jpg' }
        ],
        desc1840Ru: 'Центральная фигура в светлом сюртуке за красным столом: автор, вписавший сам себя внутрь братства.',
        desc1840Ua: 'Центральна постать у світлому сюртуку за червоним столом.',
        desc1840De: 'Zentrale Figur im hellen Rock am roten Tisch.',
        desc1840En: 'Central figure in light coat seated at the red table.',
        desc1843Ru: 'Снова за столом на первом групповом дагеротипе Штельцнера (6 мая 1843) — но кисть уже уступила первенство оптическому объективу.',
        desc1843Ua: 'Знову за столом на першому дагеротипі 6 травня 1843 року.',
        desc1843De: 'Am Tisch auf Stelzners Daguerreotypie vom 6. Mai 1843.',
        desc1843En: 'Seated at the garden table on May 6, 1843 before Stelzner’s camera.'
      },
      {
        id: 'p2',
        num: '02',
        onCanvas: true,
        years: '1808–1845',
        nameRu: 'Якоб Генслер',
        nameUa: 'Якоб Генслер',
        nameDe: 'Jacob Gensler',
        nameEn: 'Jacob Gensler',
        roleRu: 'Средний брат · Живописец уюта и хроникёр руин 1842 г.',
        roleUa: 'Середній брат · Живописець затишку та хронікер руїн',
        roleDe: 'Mittlerer Bruder · Genremaler & Brandchronist',
        roleEn: 'Middle Brother · Genre Painter & Fire Chronicler',
        face1840: { x: 30.5, y: 36 },
        face1843: { x: 52.5, y: 44 },
        badge1840: { x: 28, y: 50 },
        badge1843: { x: 52.5, y: 59 },
        bioRu: 'Мастер уединённых сцен гамбургской жизни, пейзажа и акварели. После мая 1842 года одним из первых вышел с этюдником на ещё дымящиеся улицы города. Умер молодым в 1845 году.',
        bioUa: 'Майстер сцен гамбурзького побуту. Після пожежі вийшов із етюдником на руїни. Помер у 1845 р.',
        bioDe: 'Meister der Biedermeier-Genremalerei und unmittelbarer Chronist der Brandruinen von 1842. Starb bereits 1845.',
        bioEn: 'Master of Biedermeier everyday life who sketched the smoking ruins immediately after May 1842. Died young in 1845.',
        trialExcerptRu: 'Фрагмент лекции Сергея: «Якоб — самая хрупкая фигура этой истории. В 1840-м он склоняется к столу полон жизни; в 1842-м рисует обугленный город, а через два года после дагеротипа 1843-го его уже не станет».',
        trialExcerptUa: 'Фрагмент лекції Сергія: «Якоб — найкрихкіша постать цієї історії: у 1842-му він малює руїни, а в 1845-му вже йде з життя».',
        trialExcerptDe: 'Aus Sergeis Vortrag: „Jacob ist die verletzlichste Gestalt: 1842 zeichnet er die Asche, 1845 stirbt er mit 36 Jahren.“',
        trialExcerptEn: 'From Sergei’s lecture: “Jacob is the story’s most fragile figure—sketching ashes in 1842 and gone by 1845.”',
        works: [
          { title: 'Акварели и эскизы руин церкви Св. Петра и Бёрзенбрике (1842)', museum: 'Museum für Hamburgische Geschichte', thumb: 'фото и картины/photo_11_2026-11-18_13-34-16.jpg' },
          { title: '«Праздник в Бланкенезе» и бытовые сценки бидермайера', museum: 'Hamburger Kunsthalle', thumb: 'фото и картины/photo_1_2026-11-18_13-34-16.jpg' }
        ],
        desc1840Ru: 'Стоит слева, упёршись рукой в спинку стула, всматриваясь в чертежи товарищей.',
        desc1840Ua: 'Стоїть ліворуч, спершись на спинку стільця.',
        desc1840De: 'Links stehend, auf die Stuhllehne gestützt.',
        desc1840En: 'Standing on the left leaning over the chair toward the sketches.',
        desc1843Ru: 'Сидит вполоборота за столом — за два года до смерти, на фоне живой зелени сада.',
        desc1843Ua: 'Сидить упівоберта за столом за два роки до смерті.',
        desc1843De: 'Im Profil am Tisch — zwei Jahre vor seinem frühen Tod.',
        desc1843En: 'Seated in three-quarter profile, two years before his early death.'
      },
      {
        id: 'p3',
        num: '03',
        onCanvas: true,
        years: '1811–1881',
        nameRu: 'Мартин Генслер',
        nameUa: 'Мартін Генслер',
        nameDe: 'Martin Gensler',
        nameEn: 'Martin Gensler',
        roleRu: 'Младший брат · Живописец архитектуры и средневековых древностей',
        roleUa: 'Молодший брат · Живописець архітектури',
        roleDe: 'Jüngster Bruder · Architekturmaler',
        roleEn: 'Youngest Brother · Architectural Painter',
        face1840: { x: 43, y: 27 },
        face1843: { x: 63.5, y: 47 },
        badge1840: { x: 41.5, y: 40 },
        badge1843: { x: 63.5, y: 61 },
        bioRu: 'Хранитель архитектурной памяти Гамбурга. Спас от забвения десятки готических фасадов и интерьеров ещё до пожара — а после 1842 г. создал документальный цикл погибших храмов.',
        bioUa: 'Охоронець архітектурної пам’яті Гамбурга, автор документального циклу загиблих храмів.',
        bioDe: 'Bewahrer der mittelalterlichen Architektur Hamburgs; schuf nach dem Brand Zyklen der zerstörten Kirchen.',
        bioEn: 'Preserver of Hamburg’s medieval architecture who documented the fallen churches after the 1842 fire.',
        trialExcerptRu: 'Фрагмент лекции Сергея: «Мартин всю жизнь писал камни соборов, уверенный, что камень долговечнее человека. Но в мае 1842 года расплавились даже колокола — и единственным хранилищем этих стен остались его рисунки».',
        trialExcerptUa: 'Фрагмент лекції Сергія: «Мартін писав каміння соборів, упевнений у його вічності, але в травні 1842-го єдиним сховищем стін стали його малюнки».',
        trialExcerptDe: 'Aus Sergeis Vortrag: „Martin malte die Steine der Dome, doch 1842 schmolzen selbst die Glocken — seine Zeichnungen überlebten.“',
        trialExcerptEn: 'From Sergei’s lecture: “Martin painted cathedral stone believing it eternal; in 1842 only his drawings outlived the walls.”',
        works: [
          { title: 'Графика разрушенной церкви Св. Николая (1842)', museum: 'Museum für Hamburgische Geschichte', thumb: 'фото и картины/photo_14_2026-11-18_13-34-16.jpg' },
          { title: 'Интерьеры старой Ратуши и монастыря Св. Иоанна', museum: 'Hamburger Kunsthalle', thumb: 'фото и картины/photo_13_2026-11-18_13-34-16.jpg' }
        ],
        desc1840Ru: 'В высокой мягкой шапочке за спиной Гюнтера — хранитель старинной архитектуры.',
        desc1840Ua: 'У високій шапці за спиною Гюнтера.',
        desc1840De: 'Mit roter Kappe hinter Günther stehend.',
        desc1840En: 'Standing behind Günther wearing a soft red cap.',
        desc1843Ru: 'На втором плане среди коллег, уже создавший серию зарисовок руин Николаикирхе.',
        desc1843Ua: 'Серед колег після створення серії малюнків руїн.',
        desc1843De: 'Unter den Kollegen nach seinen Ruinen-Studien.',
        desc1843En: 'Among his surviving peers after sketching the St. Nikolai ruins.'
      },
      {
        id: 'p4',
        num: '04',
        onCanvas: true,
        years: '1808–1889',
        nameRu: 'Герман Кауффман',
        nameUa: 'Герман Кауффман',
        nameDe: 'Hermann Kauffmann',
        nameEn: 'Hermann Kauffmann',
        roleRu: 'Живописец, главный баталист стихии в мае 1842 года',
        roleUa: 'Живописець і головний хронікер травневого вогню',
        roleDe: 'Landschaftsmaler & Chronist des Großen Brandes',
        roleEn: 'Landscape Painter & Chief Fire Chronicler',
        face1840: { x: 64, y: 29 },
        face1843: { x: 36, y: 25 },
        badge1840: { x: 66.5, y: 44 },
        badge1843: { x: 36, y: 38 },
        bioRu: 'Сначала прославился мирными зимними пейзажами и сценами охоты; в мае 1842 г. стал автором самых драматичных картин Великого пожара в Гамбурге.',
        bioUa: 'Прославився мирними пейзажами, а в травні 1842 р. створив найдраматичніші картини пожежі.',
        bioDe: 'Ursprünglich für ruhige Winterlandschaften bekannt, schuf er 1842 die dramatischsten Brandgemälde.',
        bioEn: 'Known for serene winter landscapes before creating the most dramatic canvases of the 1842 Great Fire.',
        trialExcerptRu: 'Фрагмент лекции Сергея: «Посмотрите на Кауффмана в чёрном цилиндре: в 1840-м он пишет сани и тихие деревенские дороги. Но огонь 1842 года заставляет его взять краски такой ярости, что картины кажутся написанными прямо с линии фронта».',
        trialExcerptUa: 'Фрагмент лекції Сергія: «Вогонь 1842 року змусив тихого пейзажиста взяти фарби такої люті, немов він писав із лінії фронту».',
        trialExcerptDe: 'Aus Sergeis Vortrag: „Das Feuer von 1842 zwang den ruhigen Landschaftsmaler zu Bildern von apokalyptischer Wucht.“',
        trialExcerptEn: 'From Sergei’s lecture: “The 1842 fire forced a tranquil landscape painter into canvases of apocalyptic fury.”',
        works: [
          { title: '«Великий пожар Гамбурга» (1842)', museum: 'Museum für Hamburgische Geschichte', thumb: 'фото и картины/photo_10_2026-11-18_13-34-16.jpg' },
          { title: '«Эвакуация у Старого крана / Пожар старой Ратуши»', museum: 'Архив 1842 г.', thumb: 'фото и картины/photo_2_2026-11-18_13-34-16.jpg' }
        ],
        desc1840Ru: 'Высокая уверенная фигура в чёрном цилиндре справа — столп и авторитет союза.',
        desc1840Ua: 'Висока постать у чорному циліндрі праворуч.',
        desc1840De: 'Hohe Figur mit schwarzem Zylinder rechts.',
        desc1840En: 'Commanding figure in black top hat on the right.',
        desc1843Ru: 'Стоит во втором ряду в цилиндре — один из самых узнаваемых участников дагеротипа.',
        desc1843Ua: 'Стоїть у другому ряду в циліндрі.',
        desc1843De: 'In der zweiten Reihe im Zylinder stehend.',
        desc1843En: 'Standing tall in the back row wearing his top hat.'
      },
      {
        id: 'p5',
        num: '05',
        onCanvas: true,
        years: '1807–1871',
        nameRu: 'Отто Спектер',
        nameUa: 'Отто Спектер',
        nameDe: 'Otto Speckter',
        nameEn: 'Otto Speckter',
        roleRu: 'График и мастер ранней гамбургской литографии',
        roleUa: 'Графік і майстер ранньої літографії',
        roleDe: 'Grafiker & Pionier der Hamburger Lithografie',
        roleEn: 'Graphic Artist & Lithography Pioneer',
        face1840: { x: 84, y: 55 },
        face1843: { x: 80.5, y: 55 },
        badge1840: { x: 82, y: 71 },
        badge1843: { x: 79.5, y: 71 },
        bioRu: 'Выдающийся иллюстратор и литограф (сын основателя гамбургской литографической мастерской). Работал на границе эпох между ручной графикой, книжной иллюстрацией и рождением фотографии.',
        bioUa: 'Видатний ілюстратор та літограф, що працював на межі ручної графіки й народження фотографії.',
        bioDe: 'Bedeutender Illustrator und Lithograf an der Schwelle zur Fotografie.',
        bioEn: 'Master illustrator and lithographer bridging hand-drawn printmaking and the dawn of photography.',
        trialExcerptRu: 'Фрагмент лекции Сергея: «Спектер держит в руках лист тиражной графики в 1840-м. Через три года он позирует уже новому средству воспроизведения — дагеротипу, который навсегда отнимет у литографии монополию на точность».',
        trialExcerptUa: 'Фрагмент лекції Сергія: «За три роки Спектер позує вже новому медіа — дагеротипу, що відбере у літографії монополію на точність».',
        trialExcerptDe: 'Aus Sergeis Vortrag: „Der Lithograf Speckter posiert 1843 für jenes neue Medium, das der Grafik bald das Dokumentarische abnehmen wird.“',
        trialExcerptEn: 'From Sergei’s lecture: “In 1843 the lithographer poses for the very medium that would soon replace printmaking’s claim to truth.”',
        works: [
          { title: 'Литографии и иллюстрации Гамбургского союза', museum: 'Hamburger Kunsthalle', thumb: 'фото и картины/photo_12_2026-11-18_13-34-16.jpg' },
          { title: '«Пожар у Старого крана» (тиражная графика эпохи)', museum: 'Архивная коллекция', thumb: 'фото и картины/photo_9_2026-11-18_13-34-16.jpg' }
        ],
        desc1840Ru: 'Справа с листом гравюры в руке — человек печатного цеха и визуального тиража.',
        desc1840Ua: 'Праворуч із аркушем гравюри в руках.',
        desc1840De: 'Vorne rechts mit einer Druckgrafik in der Hand.',
        desc1840En: 'Foreground right holding a sheet of printed graphics.',
        desc1843Ru: 'На правом фланге садовой группы на пластине Штельцнера.',
        desc1843Ua: 'На правому краю садової групи.',
        desc1843De: 'Am rechten Rand der Gartenaufnahme.',
        desc1843En: 'Seated on the right edge of the garden group.'
      }
    ]
  }
};
