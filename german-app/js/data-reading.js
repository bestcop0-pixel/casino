// data-reading.js — тексты для чтения с вопросами на понимание (Leseverstehen), формат Goethe/telc
const READING_TEXTS = [
  {
    id: 'read-a2-1',
    level: 'A2',
    title: 'Ein Wochenende in Hamburg',
    text: `Letztes Wochenende bin ich mit meiner Freundin Lisa nach Hamburg gefahren. Wir sind am Freitagabend mit dem Zug angekommen und haben ein kleines Hotel in der Nähe des Hafens gefunden. Am Samstagmorgen sind wir zuerst zum Fischmarkt gegangen. Dort gibt es viele Stände mit frischem Fisch, Obst und Blumen. Die Verkäufer rufen laut und machen viele Witze, das war sehr lustig.

Am Nachmittag haben wir eine Hafenrundfahrt gemacht. Das Wetter war leider nicht so gut, es hat ein bisschen geregnet, aber wir hatten Regenschirme dabei. Von dem Boot aus konnten wir die großen Schiffe und die berühmte Elbphilharmonie sehen. Am Abend sind wir in ein kleines Restaurant gegangen und haben typisch norddeutsches Essen probiert: Fischbrötchen und Labskaus.

Am Sonntag hatten wir nur noch Zeit für einen kurzen Spaziergang durch die Speicherstadt, bevor unser Zug zurück nach München fuhr. Es war eine kurze, aber sehr schöne Reise. Ich möchte auf jeden Fall wieder nach Hamburg fahren, denn wir haben noch nicht alles gesehen.`,
    text_ru: `В прошлые выходные мы с подругой Лизой съездили в Гамбург. Приехали в пятницу вечером на поезде и нашли маленький отель рядом с портом. В субботу утром сначала пошли на рыбный рынок, где много прилавков со свежей рыбой, фруктами и цветами, а продавцы громко зазывают и шутят. Днём прокатились на кораблике по гавани — погода была не очень, но у нас были зонты, и с воды было видно большие корабли и Эльбскую филармонию. Вечером поужинали типичной северогерманской едой. В воскресенье успели только на короткую прогулку по Шпайхерштадту перед поездом обратно в Мюнхен. Поездка была короткой, но очень приятной.`,
    questions: [
      { q: 'Wie sind Lisa und ihre Freundin nach Hamburg gefahren?', options: ['Mit dem Auto', 'Mit dem Zug', 'Mit dem Flugzeug', 'Mit dem Bus'], correct: 1 },
      { q: 'Was haben sie am Samstagmorgen gemacht?', options: ['Sie haben geschlafen', 'Sie waren auf dem Fischmarkt', 'Sie waren im Museum', 'Sie sind geschwommen'], correct: 1 },
      { q: 'Wie war das Wetter bei der Hafenrundfahrt?', options: ['Sehr sonnig', 'Sehr kalt und schneereich', 'Es hat geregnet', 'Sehr windig, aber trocken'], correct: 2 },
      { q: 'Was haben sie am Abend gegessen?', options: ['Pizza', 'Norddeutsches Essen', 'Chinesisches Essen', 'Nichts, sie waren zu müde'], correct: 1 },
      { q: 'Wie fand die Autorin die Reise?', options: ['Langweilig', 'Zu teuer', 'Schön, sie möchte wiederkommen', 'Zu kurz, um etwas zu sehen'], correct: 2 },
    ],
  },
  {
    id: 'read-a2-2',
    level: 'A2',
    title: 'Mein Arztbesuch',
    text: `Letzte Woche hatte ich starke Kopfschmerzen und ein bisschen Fieber, deshalb bin ich zum Arzt gegangen. Ich musste zuerst im Wartezimmer sitzen, es waren viele Patienten da, also habe ich fast eine Stunde gewartet. Endlich hat mich die Sprechstundenhilfe aufgerufen.

Die Ärztin hat mich gefragt, seit wann ich die Schmerzen habe und ob ich auch andere Symptome habe, zum Beispiel Husten oder Halsschmerzen. Ich habe gesagt, dass ich mich seit drei Tagen müde fühle und schlecht schlafe. Die Ärztin hat mein Fieber gemessen und meine Ohren und meinen Hals kontrolliert. Sie hat gesagt, dass ich wahrscheinlich eine leichte Erkältung habe, nichts Ernstes.

Sie hat mir ein Rezept für Tabletten gegen die Kopfschmerzen gegeben und gesagt, ich soll viel Wasser trinken und mich ausruhen. Wenn es nach fünf Tagen nicht besser wird, soll ich wiederkommen. Ich bin dann in die Apotheke gegangen und habe die Medikamente gekauft. Zum Glück habe ich mich nach zwei Tagen schon viel besser gefühlt.`,
    text_ru: `На прошлой неделе у меня сильно болела голова и была небольшая температура, поэтому я пошёл к врачу. Пришлось почти час просидеть в приёмной — было много пациентов. Врач спросила, как давно у меня симптомы и есть ли ещё что-то (кашель, боль в горле). Я сказал, что уже три дня чувствую усталость и плохо сплю. Врач измерила температуру, осмотрела уши и горло и сказала, что это, скорее всего, лёгкая простуда, ничего серьёзного. Она выписала таблетки от головной боли и посоветовала пить больше воды и отдыхать, а если через пять дней не станет лучше — прийти снова. Я купил лекарства в аптеке, и уже через два дня почувствовал себя намного лучше.`,
    questions: [
      { q: 'Warum ist die Person zum Arzt gegangen?', options: ['Wegen eines gebrochenen Arms', 'Wegen Kopfschmerzen und Fieber', 'Für eine normale Kontrolle', 'Wegen Zahnschmerzen'], correct: 1 },
      { q: 'Wie lange musste sie im Wartezimmer warten?', options: ['Fünf Minuten', 'Fast eine Stunde', 'Drei Stunden', 'Sie musste nicht warten'], correct: 1 },
      { q: 'Was hat die Ärztin diagnostiziert?', options: ['Eine schwere Grippe', 'Eine leichte Erkältung', 'Eine Allergie', 'Nichts, alles war normal'], correct: 1 },
      { q: 'Was hat die Ärztin der Person geraten?', options: ['Sofort ins Krankenhaus zu gehen', 'Viel Wasser zu trinken und sich auszuruhen', 'Viel Sport zu machen', 'Nichts zu essen'], correct: 1 },
      { q: 'Wie hat sich die Person nach zwei Tagen gefühlt?', options: ['Viel schlechter', 'Genauso schlecht', 'Viel besser', 'Sie ist wieder zum Arzt gegangen'], correct: 2 },
    ],
  },
  {
    id: 'read-a2-3',
    level: 'A2',
    title: 'Ein ungewöhnlicher Tag',
    text: `Normalerweise stehe ich um sieben Uhr auf, aber gestern hat mein Wecker nicht geklingelt, weil der Akku leer war. Ich bin um Viertel nach acht aufgewacht und habe sofort gemerkt, dass ich viel zu spät dran war. Ich musste um neun Uhr im Büro sein!

Ich bin schnell aus dem Bett gesprungen, habe mich geduscht und angezogen, aber ich hatte keine Zeit für Frühstück. Als ich aus dem Haus gelaufen bin, hat es stark geregnet, und ich hatte meinen Regenschirm vergessen. An der Bushaltestelle habe ich dann erfahren, dass der Bus wegen einer Baustelle Verspätung hatte. Ich war schon sehr nervös.

Schließlich bin ich um halb zehn im Büro angekommen, komplett nass und ohne Frühstück. Mein Chef war zum Glück nicht böse, weil er wusste, dass es an diesem Tag viele Verkehrsprobleme in der Stadt gab. Trotzdem war es für mich ein sehr stressiger Start in den Tag. Am Abend habe ich als Erstes eine neue Batterie für meinen Wecker gekauft!`,
    text_ru: `Обычно я встаю в семь утра, но вчера будильник не сработал — сел заряд. Я проснулся в 8:15 и понял, что сильно опаздываю: на работе нужно быть в 9. Быстро вскочил, принял душ, оделся, но времени на завтрак не было. Когда вышел из дома, шёл сильный дождь, а зонт я забыл. На остановке узнал, что автобус задерживается из-за ремонтных работ, и сильно занервничал. В итоге добрался до офиса только в 9:30 — весь мокрый и голодный. К счастью, начальник не рассердился, так как знал, что в тот день в городе были проблемы с движением. Но утро всё равно получилось очень нервным. Вечером первым делом купил новую батарейку для будильника!`,
    questions: [
      { q: 'Warum hat der Wecker nicht geklingelt?', options: ['Er war kaputt', 'Der Akku war leer', 'Die Person hat ihn ausgeschaltet', 'Es gab Stromausfall'], correct: 1 },
      { q: 'Was hatte die Person keine Zeit zu tun?', options: ['Zu duschen', 'Zu frühstücken', 'Sich anzuziehen', 'Den Bus zu nehmen'], correct: 1 },
      { q: 'Was ist an der Bushaltestelle passiert?', options: ['Der Bus kam pünktlich', 'Der Bus hatte Verspätung', 'Es gab keinen Bus mehr', 'Der Bus war voll'], correct: 1 },
      { q: 'Wie war die Reaktion des Chefs?', options: ['Er war sehr böse', 'Er hat nichts gemerkt', 'Er war nicht böse', 'Er hat die Person nach Hause geschickt'], correct: 2 },
      { q: 'Was hat die Person am Abend gemacht?', options: ['Sie ist früh schlafen gegangen', 'Sie hat eine neue Batterie gekauft', 'Sie hat den Wecker weggeworfen', 'Sie hat sich beim Chef beschwert'], correct: 1 },
    ],
  },
  {
    id: 'read-b1-1',
    level: 'B1',
    title: 'Homeoffice oder Büro?',
    text: `Seit einigen Jahren wird viel darüber diskutiert, ob Homeoffice oder die Arbeit im Büro besser ist. Beide Modelle haben ihre Vor- und Nachteile, und die Meinungen der Arbeitnehmer gehen dabei stark auseinander.

Befürworter des Homeoffice betonen vor allem die Flexibilität: Man spart Zeit und Geld, weil der tägliche Weg zur Arbeit wegfällt. Außerdem können viele Menschen zu Hause konzentrierter arbeiten, weil es weniger Ablenkungen durch Kollegen gibt. Für Eltern mit kleinen Kindern ist es zudem einfacher, Beruf und Familie zu vereinbaren, wenn sie nicht ins Büro fahren müssen.

Auf der anderen Seite gibt es auch klare Nachteile. Viele Arbeitnehmer fühlen sich im Homeoffice isoliert, weil der direkte Kontakt zu Kollegen fehlt. Spontane Gespräche in der Kaffeeküche, die oft zu guten Ideen führen, finden nicht mehr statt. Außerdem berichten manche Menschen, dass es ihnen schwerfällt, nach Feierabend wirklich abzuschalten, weil Arbeit und Privatleben zu Hause ineinander übergehen.

Viele Experten sind sich mittlerweile einig, dass ein hybrides Modell die beste Lösung sein könnte: An manchen Tagen arbeitet man im Büro und pflegt den persönlichen Kontakt, an anderen Tagen im Homeoffice und profitiert von der Ruhe und Flexibilität. So können die Vorteile beider Modelle kombiniert werden.`,
    text_ru: `Уже несколько лет активно обсуждают, что лучше — работа из дома или в офисе. У обеих моделей есть плюсы и минусы, и мнения сотрудников сильно расходятся. Сторонники удалёнки отмечают гибкость: экономию времени и денег на дорогу, меньше отвлекающих факторов, удобство для родителей маленьких детей. С другой стороны, многие чувствуют изоляцию из-за отсутствия живого общения с коллегами, пропадают спонтанные разговоры, которые часто рождают хорошие идеи, а также сложнее «отключиться» от работы вечером, когда дом становится офисом. Многие эксперты сходятся во мнении, что лучшее решение — гибридная модель: несколько дней в офисе для общения, несколько дней дома ради спокойствия и гибкости.`,
    questions: [
      { q: 'Was ist laut Text ein Vorteil des Homeoffice?', options: ['Mehr Kontakt zu Kollegen', 'Man spart Zeit und Geld', 'Weniger Verantwortung', 'Höheres Gehalt'], correct: 1 },
      { q: 'Welches Problem wird bei spontanen Gesprächen erwähnt?', options: ['Sie finden im Homeoffice nicht mehr statt', 'Sie sind im Büro verboten', 'Sie dauern zu lange', 'Sie sind nur online möglich'], correct: 0 },
      { q: 'Was fällt manchen Menschen im Homeoffice schwer?', options: ['Früh aufzustehen', 'Nach der Arbeit abzuschalten', 'Genug zu essen', 'Öffentliche Verkehrsmittel zu benutzen'], correct: 1 },
      { q: 'Was schlagen viele Experten als Lösung vor?', options: ['Nur noch im Büro zu arbeiten', 'Nur noch im Homeoffice zu arbeiten', 'Ein hybrides Modell', 'Die Arbeitszeit zu verkürzen'], correct: 2 },
      { q: 'Was ist die Hauptidee des Textes?', options: ['Homeoffice ist immer schlechter als Büroarbeit', 'Beide Modelle haben Vor- und Nachteile, eine Kombination kann sinnvoll sein', 'Nur junge Menschen sollten im Homeoffice arbeiten', 'Firmen sollten Homeoffice verbieten'], correct: 1 },
    ],
  },
  {
    id: 'read-b1-2',
    level: 'B1',
    title: 'Plastik vermeiden im Alltag',
    text: `Plastikmüll ist eines der größten Umweltprobleme unserer Zeit. Jedes Jahr landen Millionen Tonnen Plastik in den Weltmeeren und schaden dort Tieren und Ökosystemen. Viele Menschen fragen sich deshalb, wie sie im Alltag weniger Plastik verwenden können.

Ein einfacher erster Schritt ist der Einkauf: Statt Plastiktüten kann man Stoffbeutel oder Körbe verwenden, die man mehrmals benutzen kann. Auch beim Gemüse- und Obstkauf lohnt es sich, lose Ware ohne Plastikverpackung zu wählen, zum Beispiel auf dem Wochenmarkt. Immer mehr Städte haben zudem sogenannte Unverpackt-Läden, in denen man Lebensmittel in eigene Behälter abfüllen kann.

Auch im Badezimmer gibt es viele Alternativen: feste Seife statt Duschgel in Plastikflaschen, eine Zahnbürste aus Bambus statt aus Plastik, oder wiederverwendbare Wattepads. Diese kleinen Veränderungen erscheinen zunächst unbedeutend, aber wenn viele Menschen mitmachen, können sie einen großen Unterschied machen.

Natürlich ist es nicht immer einfach, komplett auf Plastik zu verzichten, besonders weil viele Produkte im Supermarkt automatisch verpackt sind. Kritiker meinen deshalb, dass nicht nur die Verbraucher, sondern vor allem die Industrie und die Politik handeln müssen, zum Beispiel durch strengere Gesetze gegen unnötige Verpackungen.`,
    text_ru: `Пластиковый мусор — одна из главных экологических проблем нашего времени: миллионы тонн пластика ежегодно попадают в океаны и вредят животным и экосистемам. Первый простой шаг — покупки: вместо пластиковых пакетов использовать тканевые сумки, покупать овощи и фрукты без упаковки (например, на рынке), пользоваться магазинами «без упаковки», где продукты насыпают в свою тару. В ванной тоже есть альтернативы: твёрдое мыло вместо геля в пластиковой бутылке, бамбуковая зубная щётка, многоразовые ватные диски. Такие мелочи кажутся незначительными, но если их придерживаются многие, эффект существенный. Полностью отказаться от пластика непросто, так как многие товары в супермаркете уже упакованы, поэтому критики считают, что действовать должны не только потребители, но и промышленность с властями — например, ужесточая законы против лишней упаковки.`,
    questions: [
      { q: 'Was ist laut Text ein großes Umweltproblem?', options: ['Zu viel Regen', 'Plastikmüll in den Weltmeeren', 'Zu wenig Plastik in der Industrie', 'Zu viele Wochenmärkte'], correct: 1 },
      { q: 'Was wird als Alternative zu Plastiktüten genannt?', options: ['Papierboxen', 'Stoffbeutel', 'Metallkisten', 'Gar nichts'], correct: 1 },
      { q: 'Was kann man in Unverpackt-Läden machen?', options: ['Nur Plastikprodukte kaufen', 'Lebensmittel in eigene Behälter abfüllen', 'Kostenlos einkaufen', 'Nur online bestellen'], correct: 1 },
      { q: 'Welches Beispiel für das Badezimmer wird genannt?', options: ['Feste Seife statt Duschgel', 'Mehr Duschgel kaufen', 'Plastikzahnbürsten verwenden', 'Weniger duschen'], correct: 0 },
      { q: 'Was meinen Kritiker zum Thema Verantwortung?', options: ['Nur die Verbraucher sind verantwortlich', 'Industrie und Politik müssen auch handeln', 'Niemand kann etwas ändern', 'Das Problem ist übertrieben'], correct: 1 },
    ],
  },
  {
    id: 'read-b1-3',
    level: 'B1',
    title: 'Die Zukunft der Künstlichen Intelligenz',
    text: `Künstliche Intelligenz (KI) verändert bereits heute viele Bereiche unseres Lebens, von der Medizin über die Industrie bis hin zum Alltag zu Hause. Doch wie wird sich diese Technologie in Zukunft weiterentwickeln, und welche Chancen und Risiken bringt sie mit sich?

Auf der positiven Seite kann KI Ärzten helfen, Krankheiten schneller und genauer zu erkennen, indem sie riesige Mengen an medizinischen Daten analysiert. In der Industrie übernehmen intelligente Maschinen gefährliche oder monotone Aufgaben, wodurch Arbeiter entlastet werden. Auch im Alltag profitieren wir bereits von KI, zum Beispiel durch Sprachassistenten oder personalisierte Empfehlungen beim Online-Shopping.

Gleichzeitig gibt es berechtigte Sorgen. Viele Menschen fürchten, dass Maschinen in Zukunft ihre Arbeitsplätze übernehmen könnten, besonders in Berufen mit vielen wiederholenden Aufgaben. Auch Fragen zum Datenschutz sind wichtig: Wer speichert unsere Daten, und wie werden sie verwendet? Ein weiteres Problem ist, dass KI-Systeme manchmal Vorurteile aus den Trainingsdaten übernehmen und dadurch unfaire Entscheidungen treffen können.

Experten sind sich einig, dass eine verantwortungsvolle Entwicklung von KI notwendig ist. Das bedeutet klare gesetzliche Regeln, Transparenz bei Entscheidungen der Algorithmen und eine gute Ausbildung, damit Menschen mit den neuen Technologien Schritt halten können. Nur so kann die Gesellschaft von den Vorteilen der KI profitieren, ohne die Risiken zu ignorieren.`,
    text_ru: `Искусственный интеллект уже меняет многие сферы жизни — от медицины до промышленности и повседневности. С одной стороны, ИИ помогает врачам быстрее и точнее выявлять болезни, анализируя огромные объёмы медицинских данных, берёт на себя опасные и монотонные задачи на производстве, а в быту помогает через голосовых помощников и персональные рекомендации. С другой стороны, есть обоснованные опасения: страх потери рабочих мест (особенно в профессиях с повторяющимися задачами), вопросы защиты персональных данных, а также риск того, что системы ИИ перенимают предвзятости из обучающих данных и принимают несправедливые решения. Эксперты сходятся во мнении, что нужно ответственное развитие ИИ: чёткие законы, прозрачность алгоритмов и качественное образование, чтобы общество могло пользоваться преимуществами технологии, не игнорируя риски.`,
    questions: [
      { q: 'Wie hilft KI laut Text in der Medizin?', options: ['Sie ersetzt alle Ärzte', 'Sie hilft, Krankheiten schneller zu erkennen', 'Sie macht Operationen billiger', 'Sie hat keinen Nutzen'], correct: 1 },
      { q: 'Welche Sorge wird im Zusammenhang mit Arbeitsplätzen genannt?', options: ['Es gibt zu wenig Arbeit für Maschinen', 'Maschinen könnten Arbeitsplätze übernehmen', 'KI kann keine Aufgaben übernehmen', 'Es gibt keine Sorgen'], correct: 1 },
      { q: 'Was ist ein Problem bei KI-Trainingsdaten?', options: ['Sie sind zu teuer', 'Sie können Vorurteile enthalten', 'Es gibt zu viele Daten', 'Sie werden nie gespeichert'], correct: 1 },
      { q: 'Was fordern Experten für die Zukunft der KI?', options: ['Keine Regeln, völlige Freiheit', 'Klare gesetzliche Regeln und Transparenz', 'Ein komplettes Verbot von KI', 'Nur private Nutzung von KI'], correct: 1 },
      { q: 'Was ist die Hauptidee des Textes?', options: ['KI ist nur gefährlich', 'KI ist nur nützlich, ohne Risiken', 'KI bringt Chancen und Risiken, verantwortungsvolle Entwicklung ist wichtig', 'KI wird bald verboten'], correct: 2 },
    ],
  },
  {
    id: 'read-b2-1',
    level: 'B2',
    title: 'Der Wert der Nominalisierung',
    text: `In deutschen Zeitungsartikeln, wissenschaftlichen Texten und offiziellen Dokumenten fällt vielen Lernenden ein sprachliches Phänomen besonders schwer: die sogenannte Nominalisierung. Dabei wird ein Sachverhalt, der eigentlich mit einem Verb und einem Nebensatz ausgedrückt werden könnte, stattdessen durch ein Substantiv mit Präposition wiedergegeben. Aus "weil die Preise steigen" wird beispielsweise "wegen des Preisanstiegs".

Warum bevorzugt die deutsche Schriftsprache diesen komplizierteren Stil? Zum einen ermöglicht die Nominalisierung eine deutlich kompaktere Ausdrucksweise. Ein ganzer Nebensatz lässt sich auf ein einziges Substantiv reduzieren, was besonders in Überschriften und Zusammenfassungen von Vorteil ist. Zum anderen wirkt der nominale Stil formeller und distanzierter, was in offiziellen Kontexten oft erwünscht ist.

Für Deutschlernende bedeutet dies jedoch eine zusätzliche Herausforderung. Wer nur den mündlichen, verbalen Stil beherrscht, versteht Zeitungsartikel oft nur mit Mühe. Die gute Nachricht: Die Muster wiederholen sich. Substantive auf -ung, -heit, -keit, -tion oder -e stehen fast immer für ein "verstecktes" Verb. Wer diese Muster erkennt, kann nominale Sätze gedanklich schnell in verbale Sätze zurückverwandeln und so den Sinn erschließen.

Sprachwissenschaftler empfehlen Lernenden auf dem Niveau B2, aktiv beide Stile zu üben: den mündlichen, verbalen Stil für Gespräche und den nominalen Stil zum Verstehen und Verfassen offizieller Texte. Nur wer beide Register beherrscht, kann sich in unterschiedlichen Situationen angemessen ausdrücken – vom lockeren Gespräch mit Freunden bis zur formellen E-Mail an eine Behörde.`,
    text_ru: `В немецких газетных статьях, научных текстах и официальных документах многим изучающим особенно трудно даётся так называемая номинализация — превращение глагольной конструкции с придаточным предложением в существительное с предлогом («weil die Preise steigen» → «wegen des Preisanstiegs»). Такой стиль позволяет выражаться компактнее и звучит более формально и отстранённо, что уместно в официальном контексте. Для изучающих язык это создаёт трудность: тот, кто владеет только разговорным, глагольным стилем, с трудом понимает газетные статьи. Хорошая новость — паттерны повторяются: существительные на -ung, -heit, -keit, -tion или -e почти всегда скрывают за собой глагол. Лингвисты советуют изучающим B2 активно тренировать оба стиля — глагольный для разговоров и номинальный для понимания и написания официальных текстов.`,
    questions: [
      { q: 'Was ist Nominalisierung laut Text?', options: ['Ein Dialekt', 'Ein Sachverhalt wird durch ein Substantiv statt durch einen Nebensatz ausgedrückt', 'Eine Art von Perfekt', 'Ein Fehler in der Grammatik'], correct: 1 },
      { q: 'Warum bevorzugt die Schriftsprache den nominalen Stil?', options: ['Er ist einfacher zu lernen', 'Er ist kompakter und wirkt formeller', 'Er wird nur mündlich benutzt', 'Er hat keine Vorteile'], correct: 1 },
      { q: 'Woran erkennt man häufig ein "verstecktes" Verb im Substantiv?', options: ['An der Groß- und Kleinschreibung', 'An Suffixen wie -ung, -heit, -keit, -tion', 'An der Satzstellung', 'Am Artikel "das"'], correct: 1 },
      { q: 'Was empfehlen Sprachwissenschaftler Lernenden auf B2?', options: ['Nur den nominalen Stil zu lernen', 'Nur den verbalen Stil zu lernen', 'Beide Stile aktiv zu üben', 'Keinen der beiden Stile zu benutzen'], correct: 2 },
      { q: 'Was ist die Hauptaussage des Textes?', options: ['Nominalisierung ist nutzlos', 'Beide Sprachregister zu beherrschen ist wichtig für angemessenen Ausdruck', 'Nur Muttersprachler verstehen Nominalisierung', 'Zeitungsartikel sind immer einfach zu lesen'], correct: 1 },
    ],
  },
  {
    id: 'read-b2-2',
    level: 'B2',
    title: 'Homeoffice: Fluch oder Segen für die Karriere?',
    text: `Seit einigen Jahren hat sich die Arbeitswelt grundlegend verändert. Was während der Pandemie als vorübergehende Notlösung begann, ist für viele Beschäftigte mittlerweile fester Bestandteil des Berufsalltags geworden: das Arbeiten von zu Hause aus. Doch während sich die einen über mehr Flexibilität und Zeitersparnis freuen, warnen andere vor langfristigen negativen Folgen für die Karriereentwicklung.

Befürworter des Homeoffice führen vor allem die gewonnene Zeit an, die früher für den Arbeitsweg aufgewendet wurde. Diese lässt sich nun für die Familie, für Sport oder für Weiterbildung nutzen. Zudem berichten viele Arbeitnehmer von einer höheren Produktivität, da Ablenkungen durch Kollegen wegfallen und sich Aufgaben in Ruhe erledigen lassen.

Kritiker hingegen verweisen auf eine Studie, die zeigt, dass im Homeoffice arbeitende Angestellte seltener befördert werden als ihre Kollegen im Büro. Der Grund liegt vermutlich in der sogenannten "Sichtbarkeit": Wer regelmäßig im Büro präsent ist, wird von Vorgesetzten eher wahrgenommen und für Führungsaufgaben in Betracht gezogen. Zudem entfallen im Homeoffice die informellen Gespräche in der Kaffeeküche, aus denen häufig wichtige berufliche Kontakte und Chancen entstehen.

Experten empfehlen deshalb zunehmend ein hybrides Modell: einige Tage im Büro für Sichtbarkeit und Networking, andere Tage im Homeoffice für konzentriertes Arbeiten. So ließen sich die Vorteile beider Arbeitsformen miteinander verbinden, ohne die Nachteile in Kauf nehmen zu müssen. Ob sich dieses Modell langfristig durchsetzt, wird sich in den kommenden Jahren zeigen.`,
    text_ru: `Мир труда сильно изменился: то, что во время пандемии было временным решением, для многих стало постоянной частью рабочей жизни — работа из дома. Сторонники отмечают экономию времени (на дорогу) и рост продуктивности из-за отсутствия отвлекающих факторов. Критики же ссылаются на исследование, показывающее, что удалённые сотрудники реже получают повышение — из-за меньшей «видимости» для руководства и отсутствия неформального общения, из которого рождаются карьерные возможности. Эксперты всё чаще советуют гибридную модель: несколько дней в офисе для видимости и нетворкинга, несколько дней дома для сосредоточенной работы.`,
    questions: [
      { q: 'Was war Homeoffice ursprünglich während der Pandemie?', options: ['Eine dauerhafte Lösung', 'Eine vorübergehende Notlösung', 'Ein Gesetz', 'Eine Erfindung der Gewerkschaften'], correct: 1 },
      { q: 'Welchen Vorteil des Homeoffice nennt der Text?', options: ['Mehr Kontrolle durch den Chef', 'Gewonnene Zeit durch den Wegfall des Arbeitswegs', 'Höhere Gehälter', 'Weniger Verantwortung'], correct: 1 },
      { q: 'Was zeigt die im Text erwähnte Studie?', options: ['Homeoffice-Mitarbeiter werden seltener befördert', 'Homeoffice-Mitarbeiter sind unzufriedener', 'Homeoffice führt zu mehr Kündigungen', 'Homeoffice verbessert die Beförderungschancen'], correct: 0 },
      { q: 'Was bedeutet "Sichtbarkeit" im Kontext des Textes?', options: ['Gute Beleuchtung im Büro', 'Physische Präsenz, die von Vorgesetzten wahrgenommen wird', 'Ein Kamera-System', 'Transparente Bürowände'], correct: 1 },
      { q: 'Was empfehlen Experten laut Text?', options: ['Nur noch im Büro zu arbeiten', 'Nur noch im Homeoffice zu arbeiten', 'Ein hybrides Modell aus beidem', 'Die Vier-Tage-Woche'], correct: 2 },
    ],
  },
];
