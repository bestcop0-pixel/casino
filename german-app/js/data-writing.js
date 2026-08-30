// data-writing.js — задания на письмо (Schreiben) в формате экзаменов Goethe/telc B1
const WRITING_TASKS = [
  {
    id: 'write-b1-1',
    level: 'B1',
    type: 'informell',
    title: 'Einladung zum Geburtstag',
    prompt: 'Sie feiern bald Ihren Geburtstag und möchten einen Freund / eine Freundin einladen. Schreiben Sie eine E-Mail.',
    points: [
      'Wann und wo die Feier stattfindet',
      'Wen Sie noch eingeladen haben',
      'Bitten Sie um Hilfe bei der Vorbereitung (z. B. Kuchen, Musik)',
    ],
    minWords: 80,
    usefulPhrases: [
      { de: 'Liebe/r ..., ich hoffe, es geht dir gut.', ru: 'Дорогой/ая ..., надеюсь, у тебя всё хорошо.' },
      { de: 'Ich schreibe dir, weil ich am ... meinen Geburtstag feiere.', ru: 'Пишу тебе, потому что ... числа у меня день рождения.' },
      { de: 'Es wäre toll, wenn du kommen könntest.', ru: 'Было бы здорово, если бы ты смог(ла) прийти.' },
      { de: 'Könntest du vielleicht ... mitbringen?', ru: 'Не мог(ла) бы ты принести с собой ...?' },
      { de: 'Ich freue mich schon sehr auf dich!', ru: 'Уже очень жду встречи с тобой!' },
      { de: 'Liebe Grüße, ...', ru: 'С наилучшими пожеланиями, ...' },
    ],
    modelAnswer: `Liebe Anna,

ich hoffe, es geht dir gut! Ich schreibe dir, weil ich am 15. Juni meinen 25. Geburtstag feiere. Die Feier findet bei mir zu Hause statt, ab 18 Uhr. Ich habe schon ein paar Freunde aus der Uni eingeladen, und meine Schwester kommt auch mit ihrem Freund.

Könntest du vielleicht einen Kuchen mitbringen? Du backst doch so gerne, und dein Schokoladenkuchen ist immer der beste! Außerdem wäre es super, wenn du ein bisschen Musik für uns vorbereiten könntest, damit wir später tanzen können.

Ich freue mich schon sehr auf dich! Bitte sag mir bis Freitag Bescheid, ob du kommen kannst.

Liebe Grüße,
Marie`,
  },
  {
    id: 'write-b1-2',
    level: 'B1',
    type: 'formell',
    title: 'Beschwerde wegen Flugverspätung',
    prompt: 'Ihr Flug hatte 6 Stunden Verspätung, und Sie haben dadurch einen wichtigen Termin verpasst. Schreiben Sie eine Beschwerde-E-Mail an die Fluggesellschaft.',
    points: [
      'Beschreiben Sie das Problem genau (Flugnummer, Datum, Verspätung)',
      'Erklären Sie, welche Folgen die Verspätung für Sie hatte',
      'Fordern Sie eine Entschädigung oder Erklärung',
    ],
    minWords: 100,
    usefulPhrases: [
      { de: 'Sehr geehrte Damen und Herren,', ru: 'Уважаемые дамы и господа,' },
      { de: 'ich schreibe Ihnen bezüglich meines Fluges am ...', ru: 'Я пишу вам по поводу моего рейса ...' },
      { de: 'Der Flug hatte eine Verspätung von ... Stunden.', ru: 'Рейс задержался на ... часов.' },
      { de: 'Aus diesem Grund konnte ich ... nicht wahrnehmen.', ru: 'По этой причине я не смог(ла) ...' },
      { de: 'Ich bitte Sie um eine Erklärung und eine angemessene Entschädigung.', ru: 'Прошу предоставить объяснение и соответствующую компенсацию.' },
      { de: 'Ich erwarte Ihre Rückmeldung bis zum ...', ru: 'Жду вашего ответа до ...' },
      { de: 'Mit freundlichen Grüßen,', ru: 'С уважением,' },
    ],
    modelAnswer: `Sehr geehrte Damen und Herren,

ich schreibe Ihnen bezüglich meines Fluges LH 1234 am 3. März von Berlin nach Madrid. Der Flug hatte eine Verspätung von sechs Stunden, ohne dass Passagiere rechtzeitig informiert wurden.

Aus diesem Grund konnte ich einen wichtigen Geschäftstermin in Madrid nicht wahrnehmen, was mir finanziellen Schaden verursacht hat. Außerdem gab es am Flughafen keine klaren Informationen, und wir haben lange ohne Erklärung gewartet.

Ich bitte Sie um eine Erklärung für diese Verspätung sowie um eine angemessene Entschädigung gemäß den Fluggastrechten. Ich erwarte Ihre Rückmeldung bis zum 20. März.

Mit freundlichen Grüßen,
Peter Schmidt`,
  },
  {
    id: 'write-b1-3',
    level: 'B1',
    type: 'meinung',
    title: 'Handys in der Schule',
    prompt: 'In einem Online-Forum wird diskutiert: „Sollte man Handys in der Schule verbieten?“ Schreiben Sie Ihre Meinung dazu.',
    points: [
      'Ihre persönliche Meinung zum Thema',
      'Zwei Argumente, die Ihre Meinung unterstützen',
      'Ein Beispiel aus Ihrer eigenen Erfahrung',
    ],
    minWords: 100,
    usefulPhrases: [
      { de: 'Meiner Meinung nach ...', ru: 'По моему мнению, ...' },
      { de: 'Ich bin der Ansicht, dass ...', ru: 'Я считаю, что ...' },
      { de: 'Ein wichtiges Argument dafür ist, dass ...', ru: 'Важный аргумент в пользу этого — то, что ...' },
      { de: 'Außerdem ...', ru: 'Кроме того, ...' },
      { de: 'Zum Beispiel habe ich selbst erlebt, dass ...', ru: 'Например, я сам(а) на опыте убедился(лась), что ...' },
      { de: 'Zusammenfassend lässt sich sagen, dass ...', ru: 'В заключение можно сказать, что ...' },
    ],
    modelAnswer: `Meiner Meinung nach sollten Handys während des Unterrichts verboten sein, aber nicht komplett von der Schule.

Ein wichtiges Argument dafür ist, dass Handys die Konzentration der Schüler stark stören. Wenn ständig Nachrichten kommen, ist es schwer, dem Unterricht zu folgen. Außerdem führen Handys oft zu Konflikten zwischen Schülern, zum Beispiel wegen sozialer Medien.

Zum Beispiel habe ich selbst erlebt, dass ein Mitschüler während einer wichtigen Prüfung durch sein Handy abgelenkt wurde und dadurch eine schlechte Note bekommen hat.

Trotzdem finde ich, dass Handys in den Pausen erlaubt sein sollten, weil sie auch nützlich sein können, zum Beispiel um mit den Eltern zu kommunizieren. Zusammenfassend lässt sich sagen, dass ein Kompromiss die beste Lösung ist.`,
  },
  {
    id: 'write-b1-4',
    level: 'B1',
    type: 'informell',
    title: 'Absage mit Alternative',
    prompt: 'Ein Freund / Eine Freundin hat Sie zu einer Feier eingeladen, aber Sie können nicht kommen. Schreiben Sie eine Antwort-E-Mail.',
    points: [
      'Bedanken Sie sich für die Einladung',
      'Erklären Sie, warum Sie nicht kommen können',
      'Schlagen Sie eine Alternative vor (z. B. ein anderes Treffen)',
    ],
    minWords: 80,
    usefulPhrases: [
      { de: 'Vielen Dank für deine Einladung zu ...', ru: 'Большое спасибо за приглашение на ...' },
      { de: 'Leider kann ich nicht kommen, weil ...', ru: 'К сожалению, я не смогу прийти, потому что ...' },
      { de: 'Es tut mir wirklich leid, dass ich absagen muss.', ru: 'Мне действительно жаль, что приходится отказаться.' },
      { de: 'Wie wäre es, wenn wir uns stattdessen ... treffen?', ru: 'Как насчёт того, чтобы встретиться вместо этого ...?' },
      { de: 'Ich hoffe, du hast trotzdem eine schöne Feier!', ru: 'Надеюсь, у тебя всё равно будет отличный праздник!' },
    ],
    modelAnswer: `Liebe Julia,

vielen Dank für deine Einladung zu deiner Geburtstagsfeier am Samstag! Ich habe mich sehr darüber gefreut.

Leider kann ich nicht kommen, weil ich an diesem Wochenende schon einen Termin bei meinen Eltern habe, den ich nicht verschieben kann. Es tut mir wirklich leid, dass ich absagen muss.

Wie wäre es, wenn wir uns stattdessen nächste Woche zum Kaffee treffen? Dann können wir in Ruhe reden, und ich bringe dir ein kleines Geschenk mit.

Ich hoffe, du hast trotzdem eine schöne Feier!

Liebe Grüße,
Sofia`,
  },
  {
    id: 'write-b2-1',
    level: 'B2',
    type: 'meinung',
    title: 'Leserbrief: Homeoffice und Karriere',
    prompt: 'Sie haben den Artikel „Homeoffice: Fluch oder Segen für die Karriere?" gelesen und möchten einen Leserbrief an die Redaktion schreiben. Nehmen Sie Stellung zum Thema.',
    points: [
      'Fassen Sie kurz zusammen, worum es im Artikel geht',
      'Nehmen Sie klar Stellung (Zustimmung oder Widerspruch) und begründen Sie dies mit mindestens zwei Argumenten',
      'Beziehen Sie eigene Erfahrungen oder Beispiele aus Ihrem Umfeld ein',
      'Formulieren Sie einen abschließenden Gedanken oder Vorschlag',
    ],
    minWords: 150,
    usefulPhrases: [
      { de: 'In dem Artikel geht es um ...', ru: 'В статье речь идёт о ...' },
      { de: 'Ich stimme der These zu / widerspreche der These, dass ...', ru: 'Я согласен с тезисом / не согласен с тезисом, что ...' },
      { de: 'Ein weiteres Argument dafür/dagegen ist, dass ...', ru: 'Ещё один аргумент за/против — то, что ...' },
      { de: 'Aus eigener Erfahrung kann ich sagen, dass ...', ru: 'Из собственного опыта могу сказать, что ...' },
      { de: 'Abschließend lässt sich festhalten, dass ...', ru: 'В заключение можно отметить, что ...' },
      { de: 'Mit freundlichen Grüßen', ru: 'С уважением' },
    ],
    modelAnswer: `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihren Artikel über Homeoffice und dessen Auswirkungen auf die Karriere gelesen. Der Artikel beschreibt, wie sich die Arbeitswelt seit der Pandemie verändert hat und wägt Vor- und Nachteile des Homeoffice ab.

Ich stimme der im Artikel dargestellten These grundsätzlich zu, dass ein hybrides Modell die beste Lösung darstellt. Zum einen bestätigt meine eigene Erfahrung, dass ich zu Hause konzentrierter arbeiten kann als im lauten Großraumbüro. Zum anderen habe ich aber auch gemerkt, wie wichtig der persönliche Austausch mit Kollegen für neue Ideen und Karrierechancen ist.

Ein Kollege von mir arbeitet seit drei Jahren fast ausschließlich im Homeoffice und wurde tatsächlich seltener für Projekte berücksichtigt als seine Kollegen im Büro – dies deckt sich mit der im Artikel erwähnten Studie.

Abschließend denke ich, dass Unternehmen klare Regeln für hybrides Arbeiten schaffen sollten, damit niemand aufgrund seines Arbeitsortes benachteiligt wird.

Mit freundlichen Grüßen,
Anna Weber`,
  },
  {
    id: 'write-b2-2',
    level: 'B2',
    type: 'formell',
    title: 'Offizielle Beschwerde: Mängel in der Nachbarschaft',
    prompt: 'Seit Wochen gibt es in Ihrer Straße Probleme mit nächtlichem Baulärm, der offiziell nicht genehmigt ist. Schreiben Sie eine formelle Beschwerde an das zuständige Ordnungsamt.',
    points: [
      'Beschreiben Sie das Problem präzise (Art des Lärms, Uhrzeiten, Dauer)',
      'Erklären Sie, welche Auswirkungen dies auf Sie und Ihre Nachbarn hat',
      'Verweisen Sie auf geltende Vorschriften, falls bekannt (Ruhezeiten)',
      'Fordern Sie konkrete Maßnahmen und eine Rückmeldung innerhalb einer bestimmten Frist',
    ],
    minWords: 150,
    usefulPhrases: [
      { de: 'Hiermit möchte ich mich offiziell beschweren über ...', ru: 'Настоящим хочу официально пожаловаться на ...' },
      { de: 'Seit einigen Wochen kommt es regelmäßig zu ...', ru: 'В течение нескольких недель регулярно происходит ...' },
      { de: 'Dies verstößt gegen die geltenden Ruhezeiten.', ru: 'Это нарушает действующие часы тишины.' },
      { de: 'Ich bitte Sie, geeignete Maßnahmen zu ergreifen.', ru: 'Прошу вас принять соответствующие меры.' },
      { de: 'Ich erwarte eine Rückmeldung bis spätestens ...', ru: 'Жду ответа не позднее ...' },
      { de: 'Hochachtungsvoll', ru: 'С глубоким уважением' },
    ],
    modelAnswer: `Sehr geehrte Damen und Herren,

hiermit möchte ich mich offiziell über den nächtlichen Baulärm in der Musterstraße beschweren. Seit etwa drei Wochen kommt es regelmäßig zwischen 22 und 24 Uhr zu lautem Baulärm, der offenbar von einer nahegelegenen Baustelle ausgeht.

Dieser Lärm verstößt eindeutig gegen die in unserer Stadt geltenden Ruhezeiten und beeinträchtigt sowohl meinen Schlaf als auch den mehrerer Nachbarn erheblich. Besonders betroffen sind Familien mit kleinen Kindern, die frühmorgens zur Schule müssen.

Ich bitte Sie höflich, den Sachverhalt zu prüfen und geeignete Maßnahmen zu ergreifen, damit die gesetzlichen Ruhezeiten künftig eingehalten werden. Über eine Rückmeldung innerhalb der nächsten zwei Wochen würde ich mich sehr freuen.

Für Rückfragen stehe ich Ihnen selbstverständlich zur Verfügung.

Hochachtungsvoll,
Michael Schmidt`,
  },
];
