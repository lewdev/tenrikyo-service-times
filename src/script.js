const app = (initialDate => {
  const JAPAN_OFFSET = +9;
  let date = initialDate || new Date();

  const upcomingEvent = document.getElementById`upcomingEvent`;

  const setDate = newDate => { date = newDate; render(); }

  const getDateInOffset = offset => {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * offset));
  };

  let d = getDateInOffset(JAPAN_OFFSET); //Japan Time
  const half = d.getDate() <= 15 ? 1 : 2;
  const month = d.getMonth();
  const year = d.getFullYear();
  const time = serviceTimes[month];

  const langMap = {
    en: "🇺🇸",
    ja: "🇯🇵",
  };

  const { languages, language } = navigator;
  let lang = ((languages && languages[0]) || language).split("-")[0];

  const trans = (s, num) => ((transIndex[lang] && transIndex[lang][s]) || s) + (lang !== "ja" ? typeof num === 'number' && num !== 1 ? "s" : "" : "");

  const formatTime = time => new Date(`1/1/${year} ${time}`).toLocaleTimeString([lang], {timeStyle: "short"});

  const formatDate = dateStr => (
    new Date(`${dateStr}/${year}`).toLocaleDateString([lang], {month: "short", day: "numeric"})
  );

  const changeLang = l => { lang = l; render(); };

  const cellClass = highlight => `class="border text-center align-middle${highlight ? " highlight" : ""}"`;

  const renderLangSelect = () => (
    langSelect.innerHTML = Object.keys(langMap).map(lg => (
      `<button class="btn btn-${lang === lg ? "primary" : "secondary"}" onclick="app.changeLang('${lg}')">${langMap[lg]}</button>`
    )).join("")
  );

  const renderEventsTable = () => {
    renderEventsTableSide(true);
    renderEventsTableSide();
  };

  const inDays = days => days ? `${trans("in")} ${days} ${trans("day", days)}` : `<span class="text-info d-inline">${trans("(Today)")}</span>`;

  const renderEventsTableSide = isLeft => {
    const className = isLeft ? "left" : "right";
    const parentDiv = document.getElementById("events");
    const div = parentDiv.getElementsByClassName(className)[0];
    div.innerHTML = (
      `<table class="table mx-auto"><thead>
        <tr>${["Date", "Time", "Event", "Until"].map(s =>`<th class="text-center">${trans(s)}</th>`).join("")}</tr>
      </thead>
      <tbody></tbody></table>`
    );
    const tbody = div.getElementsByTagName("tbody")[0];
    const half = Math.ceil(annualEvents.length / 2) - 1
    tbody.innerHTML = annualEvents.map((event, i) => (
      ((isLeft && i <= half) || (!isLeft && i > half)) ? (
        `<tr>
          <td class="border text-center align-middle text-nowrap">${formatDate(event.date)}</td>
          <td class="border text-center align-middle text-nowrap">${formatTime(event.time)}</td>
          <td class="border align-middle text-nowrap">${trans(event.event)}</td>
          <td class="border align-middle text-nowrap">
            ${inDays(event.daysUntil)}
          </td>
        </tr>`
      ) : ""
    )).join("");
  };

  const renderTimeTable = () => {
    renderTimeTableSide(true);
    renderTimeTableSide(false);
  };

  const renderTimeTableSide = isLeft => {
    const className = isLeft ? "left" : "right";
    const parentDiv = document.getElementById("serviceTimes");
    const div = parentDiv.getElementsByClassName(className)[0];
    div.innerHTML = `<table class="table mx-auto"><thead>
      <tr>
        ${["Month", "Morning", "Evening"].map(s =>(
          `<th class="text-center">${trans(s)}</th>`
        )).join("")}
      </tr>
    </thead>
    <tbody></tbody></table>`;
    const tbody = div.getElementsByTagName("tbody")[0];
    tbody.innerHTML = getHalfYear(isLeft);
  };

  const getHalfYear = showFirstHalf => serviceTimes.map((time, i) => {
    if ((!showFirstHalf && i < 6) || (showFirstHalf && i >= 6)) return;
    const { asa1, yuz1, asa2, yuz2 } = time;
    const asaIsSame = asa1 === asa2;
    const yuzIsSame = yuz1 === yuz2;
    const bothIsSame = asaIsSame && yuzIsSame;
    const isMonth = month === i;
    const isFirstHalf = isMonth && half === 1;
    const isSecondHalf = isMonth && half === 2;
    return (`
      <tr>
        <td rowspan="${bothIsSame ? 1 : 2}" ${cellClass(isMonth)}>${i + 1}</td>
        <td rowspan="${!bothIsSame && asaIsSame ? 2 : 1}" ${cellClass(isFirstHalf || (asaIsSame && isMonth))}>${formatTime(asa1)}</td>
        <td rowspan="${!bothIsSame && yuzIsSame ? 2 : 1}" ${cellClass(isFirstHalf || (yuzIsSame && isMonth))}>${formatTime(yuz1)}</td>
      </tr>
      ${bothIsSame ? '' : `<tr>
        ${asaIsSame ? '' : `<td ${cellClass(isSecondHalf)}>${formatTime(asa2)}</td>`}
        ${yuzIsSame ? '' : `<td ${cellClass(isSecondHalf)}>${formatTime(yuz2)}</td>`}
      </tr>
    `}`);
  }).join("");

  const getLastDayOfMonth = displayMonth => {
    displayMonth = displayMonth === 12 ? 1 : displayMonth + 1;
    const date = new Date(`${displayMonth}/1/${year}`);
    date.setDate(0);
    return date.getDate();
  };

  const renderTimes = (label, time, half) => {
    const displayMonth = ((month + (label === "Next" && half === 1 ? 1 : 0)) % 12) + 1;
    const lastDayOfMonth = getLastDayOfMonth(displayMonth);
    return time && (
    `<div class="col my-1">
      <strong class="text-primary">${trans(label)} </strong>
      (${formatDate(`${displayMonth}/${half === 1 ? 1 : 16}`)} - 
      ${formatDate(`${displayMonth}/${half === 1 ? 15 : lastDayOfMonth}`)})
      <div class="text-nowrap"><strong>${trans("Morning")} ${trans("Service")}:</strong> ${formatTime(time["asa" + half])}</div>
      <div class="text-nowrap"><strong>${trans("Evening")} ${trans("Service")}:</strong> ${formatTime(time["yuz" + half])}</div>
    </div>`
  )};

  const renderServiceTimes = () => currentTime.innerHTML = (
    `<div class="row">
      ${renderTimes("Current", time, half)}
      ${renderTimes("Next", half === 2 ? serviceTimes[(month + 1) % 12] : time, half === 2 ? 1 : 2)}
    </div>`
  );

  setInterval(() => {
    d = getDateInOffset(JAPAN_OFFSET);
    const japanClock = document.getElementById("japanClock");
    if (japanClock) japanClock.innerHTML = d.toLocaleString(lang);
  }, 1000);

  const renderUpcomingEvent = () => {
    const nextEvent = annualEvents[0];
    const { event, date, time, daysUntil } = nextEvent || {};
    upcomingEvent.innerHTML = (
      `<div>
        <b>${trans("Next")} ${trans("Event")}:</b>
        ${trans(event)}<br/>${formatDate(date)} ${formatTime(time)} ${inDays(daysUntil)}
      </div>`
    );
  };

  const findUpcomingEvent = () => {
    const month = d.getMonth();
    const day = d.getDate();
    const size = annualEvents.length;
    let lastEvent = false;
    for (let i = 0; i < size; i++) {
      if (lastEvent) continue;
      const [lastMonth, lastDay] = annualEvents[i].date.split("/");
      if (parseInt(lastMonth) > month && parseInt(lastDay) > day) lastEvent = annualEvents[i];
    }
    return lastEvent;
  };

  const render = () => {
    title.innerHTML = `⏲ ${trans("Tenrikyo Service Times")}`;
    document.title = trans("Tenrikyo Service Times");
    renderServiceTimes();
    renderUpcomingEvent();
    renderTimeTable();
    renderEventsTable();
    renderLangSelect();
    Array.from(document.getElementsByClassName("trans")).map(elem => elem.innerHTML = trans(elem.title));
  };

  render();

  return { changeLang, setDate };
})();

// let cd = new Date("8/28/2023");
// setInterval(() => { cd.setDate(cd.getDate() + 1); app(cd); }, 30);