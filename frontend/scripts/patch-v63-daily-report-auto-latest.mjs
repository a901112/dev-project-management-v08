import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function replaceRequired(source, pattern, replacement, label) {
  const next = source.replace(pattern, replacement);
  if (next === source) throw new Error(`patch-v63 marker not found: ${label}`);
  return next;
}

if (!app.includes('hasPickedDateRef')) {
  app = app.replace(
    "import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';",
    "import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';"
  );

  const availableDatesStatePattern =
    /  const availableDates = useMemo\(\(\) => Array\.from\(new Set\(reports\.map\(\(report\) => report\.ReportDate\)\.filter\(Boolean\)\)\)\.sort\(\(a, b\) => String\(b\)\.localeCompare\(String\(a\)\)\), \[reports\]\);\r?\n  const \[selectedDate, setSelectedDate\] = useState\(''\);\r?\n  const \[selectedPerson, setSelectedPerson\] = useState\(''\);\r?\n  const activeDate = selectedDate \|\| availableDates\[0\] \|\| formatLocalDate\(new Date\(\)\);\r?\n\r?\n  useEffect\(\(\) => \{\r?\n    (?:if \(selectedDate && !availableDates\.includes\(selectedDate\)\) setSelectedDate\(''\);|if \(!selectedDate && availableDates\[0\]\) setSelectedDate\(availableDates\[0\]\);)\r?\n  \}, \[availableDates, selectedDate\]\);/;

  if (availableDatesStatePattern.test(app)) {
    app = replaceRequired(
      app,
      availableDatesStatePattern,
      `  const availableDates = useMemo(() => Array.from(new Set(reports.map((report) => report.ReportDate).filter(Boolean))).sort((a, b) => String(b).localeCompare(String(a))), [reports]);
  const latestAvailableDate = availableDates[0] || '';
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const hasPickedDateRef = useRef(false);
  const activeDate = selectedDate || latestAvailableDate || formatLocalDate(new Date());

  useEffect(() => {
    if (availableDates.length === 0) {
      hasPickedDateRef.current = false;
      if (selectedDate) setSelectedDate('');
      return;
    }
    if (!selectedDate || !availableDates.includes(selectedDate)) {
      hasPickedDateRef.current = false;
      setSelectedDate(latestAvailableDate);
      return;
    }
    if (!hasPickedDateRef.current && selectedDate !== latestAvailableDate) {
      setSelectedDate(latestAvailableDate);
    }
  }, [availableDates, latestAvailableDate, selectedDate]);`,
      'availableDates daily report state'
    );
  } else {
    app = replaceRequired(
      app,
      /  const dates = useMemo\(\(\) => Array\.from\(new Set\(reports\.map\(\(report\) => report\.ReportDate\)\.filter\(Boolean\)\)\)\.sort\(\(a, b\) => String\(b\)\.localeCompare\(String\(a\)\)\), \[reports\]\);\r?\n  const \[selectedDate, setSelectedDate\] = useState\(''\);\r?\n  const \[selectedPerson, setSelectedPerson\] = useState\(''\);\r?\n  const activeDate = selectedDate \|\| dates\[0\] \|\| formatLocalDate\(new Date\(\)\);\r?\n\r?\n  useEffect\(\(\) => \{\r?\n    if \(!selectedDate && dates\[0\]\) setSelectedDate\(dates\[0\]\);\r?\n  \}, \[dates, selectedDate\]\);/,
      `  const dates = useMemo(() => Array.from(new Set(reports.map((report) => report.ReportDate).filter(Boolean))).sort((a, b) => String(b).localeCompare(String(a))), [reports]);
  const latestReportDate = dates[0] || '';
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const hasPickedDateRef = useRef(false);
  const activeDate = selectedDate || latestReportDate || formatLocalDate(new Date());

  useEffect(() => {
    if (dates.length === 0) {
      hasPickedDateRef.current = false;
      if (selectedDate) setSelectedDate('');
      return;
    }
    if (!selectedDate || !dates.includes(selectedDate)) {
      hasPickedDateRef.current = false;
      setSelectedDate(latestReportDate);
      return;
    }
    if (!hasPickedDateRef.current && selectedDate !== latestReportDate) {
      setSelectedDate(latestReportDate);
    }
  }, [dates, latestReportDate, selectedDate]);`,
      'dates daily report state'
    );
  }

  const latestDateVariable = app.includes('latestAvailableDate') ? 'latestAvailableDate' : 'latestReportDate';
  app = replaceRequired(
    app,
    `<select value={activeDate} onChange={(event) => setSelectedDate(event.target.value)}>`,
    `<select value={activeDate} onChange={(event) => {
            hasPickedDateRef.current = event.target.value !== ${latestDateVariable};
            setSelectedDate(event.target.value);
          }}>`,
    'daily report date select onChange'
  );
}

fs.writeFileSync(appPath, app, 'utf8');
