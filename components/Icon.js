const paths = {
  arrow: <path d="M5 19 19 5M7 5h12v12" />,
  up: <path d="M12 20V4m-6 6 6-6 6 6" />,
  down: <path d="M12 4v16m-6-6 6 6 6-6" />,
  star: <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="m12 8 3.5 2.5-1.3 4H9.8l-1.3-4L12 8Zm0 0V3m-3.5 7.5L4 9m5.8 5.5-2.7 4m7.1-4 2.7 4m-1.4-8L20 9" /></>,
  overview: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M12 3v18M3 11h9" /></>,
  bookings: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 8h8M8 12h8M8 16h6" /></>,
  flag: <path d="M5 21V4m0 1c5-3 9 3 14 0v9c-5 3-9-3-14 0" />,
  plus: <path d="M12 5v14M5 12h14" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  team: <><circle cx="12" cy="8" r="3" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></>,
  check: <path d="m4 12 5 5L20 6" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></>,
  rupee: <path d="M6 4h12M6 8h12M6 4c7 0 8 10 0 10l8 6" />,
};

export default function Icon({ name }) {
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
