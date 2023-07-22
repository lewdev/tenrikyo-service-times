const DAY_MS = 60000 * 60 * 24;

const serviceTimes = [
  {"asa1":"7:00","yuz1":"17:00","asa2":"7:00","yuz2":"17:15"},
  {"asa1":"7:00","yuz1":"17:30","asa2":"6:45","yuz2":"17:45"},
  {"asa1":"6:30","yuz1":"18:00","asa2":"6:15","yuz2":"18:30"},
  {"asa1":"6:00","yuz1":"18:30","asa2":"5:45","yuz2":"18:45"},
  {"asa1":"5:30","yuz1":"19:00","asa2":"5:15","yuz2":"19:15"},
  {"asa1":"5:00","yuz1":"19:30","asa2":"5:00","yuz2":"19:30"},
  {"asa1":"5:00","yuz1":"19:30","asa2":"5:15","yuz2":"19:30"},
  {"asa1":"5:30","yuz1":"19:15","asa2":"5:30","yuz2":"19:00"},
  {"asa1":"5:45","yuz1":"18:45","asa2":"6:00","yuz2":"18:30"},
  {"asa1":"6:00","yuz1":"18:00","asa2":"6:15","yuz2":"17:45"},
  {"asa1":"6:30","yuz1":"17:30","asa2":"6:45","yuz2":"17:15"},
  {"asa1":"7:00","yuz1":"17:00","asa2":"7:00","yuz2":"17:00"}
];

const transIndex = {
  "ja": {
    "Tenrikyo Service Times": "天理教本部のおつとめ時刻表",
    "(Today)": "日",
    "Date": "日",
    "day": "日",
    "Event": "祭典",
    "Morning": "朝",
    "Evening": "夜",
    "Service": "勤め",
    "Month": "月",
    "Time": "時間",
    "Current": "現在",
    "Next": "次",
    "⏲️ Service Times Chart": "⏲️ おつとめ時刻表",
    "🗓️ Events Chart": "🗓️ イベント",
    "🕑 Japan Time": "🕑 日本の時間",
    "in": "あと",
    "Until": "あと",
    //events
    "New Year's Service":"元旦祭",
    "Spring Grand Service":"春季大祭",
    "Spring Memorial Service":"春季霊祭",
    "Autumn Grand Service":"秋季大祭",
    "Autumn Memorial Service":"秋季霊祭",
    "Monthly Service":"月次祭",
    "Oyasama's Birthday":"教祖の誕生祭",
    "Children's Pilgrimage":"こどもおぢばがえり",
    "Tenrikyo HQ Service Times":"天理教本部おつとめ時間",
  },
};

//Every 26th is Monthly Service from 9am
let annualEvents = [
  {"date":"1/1","event":"New Year's Service","time":"5:00"},
  {"date":"1/26","event":"Spring Grand Service","time":"11:30"},
  {"date":"3/27","event":"Spring Memorial Service","time":"9:00"},//
  {"date":"4/18","event":"Oyasama's Birthday","time":"10:00"},
  {"date":"7/27","event":"Children's Pilgrimage","time":"8:00","endDate":"8/5"},
  {"date":"9/27","event":"Autumn Memorial Service","time":"9:00"},
  {"date":"10/26","event":"Autumn Grand Service","time":"8:00"},
];

const getDaysUntil = (date, d = new Date().getTime()) => {
  const diffMs = date - d;
  return ~~(diffMs / DAY_MS);
};

const now = new Date();
const year = now.getFullYear();
for (let i = 2; i <= 12; i++) {
  if (i !== 10) annualEvents.push(
    { date: i + "/26", event: "Monthly Service", time: "9:00"}
  );
}
annualEvents = annualEvents.map(event => {
  const { date } = event;
  let dateObj = new Date(`${date}/${year} 23:59:999`);
  if (dateObj < now) {
    dateObj = new Date(`${date}/${year + 1}`);
  }
  return {...event, dateObj, daysUntil: getDaysUntil(dateObj, now) };
});
annualEvents.sort((a, b) => a.dateObj - b.dateObj);
