/**
 * Antigravity Premium Calendar
 * Core Application Script Engine
 */

// ==========================================
// 1. STATE STORE & GLOBALS
// ==========================================
let events = new Map();         // Maps 'YYYY-MM-DD' keys to lists of CalendarEvent pointers
let currentView = 'month';      // Active View State: 'day' | 'week' | 'month'
let currentDate = new Date();    // Active date context pointer

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ==========================================
// 2. DATE CONVERSION HELPERS
// ==========================================

// Formats a Date object to local YYYY-MM-DD natively using English-Canada standard
const formatDateKey = d => d.toLocaleDateString('en-CA');

// Formats a Date object to local ISO (YYYY-MM-DDTHH:MM) using timezone offset math
function formatDateIso(d) {
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localTime = new Date(d.getTime() - tzOffset);
    return localTime.toISOString().slice(0, 16);
}

// Gathers dates keys between start and end date inclusive
function getEventDays(startIso, endIso) {
    const curr = new Date(startIso);
    const end = new Date(endIso);
    curr.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const days = [];
    while (curr <= end) {
        days.push(formatDateKey(curr));
        curr.setDate(curr.getDate() + 1);
    }
    return days;
}

// Searches the events map to find an event object matching the given ID
function findEventById(id) {
    for (const dayList of events.values()) {
        const found = dayList.find(e => e.id === id);
        if (found) {
            return found;
        }
    }
    return null;
}

// ==========================================
// 3. PERSISTENCE & DATA MANAGEMENT (CRUD)
// ==========================================

function addEventToStore(event) {
    const startKey = event.startIso.split('T')[0];
    const endKey = event.endIso.split('T')[0];
    event.isMultiDay = (startKey !== endKey);

    const days = getEventDays(event.startIso, event.endIso);
    days.forEach(d => {
        if (!events.has(d)) {
            events.set(d, []);
        }
        const dayList = events.get(d);
        if (!dayList.find(e => e.id === event.id)) {
            dayList.push(event); // Pointer duplication
        }
    });
}

function removeEventFromStore(id) {
    for (const [day, dayList] of events.entries()) {
        const filtered = dayList.filter(e => e.id !== id);
        if (filtered.length === 0) {
            events.delete(day);
        } else {
            events.set(day, filtered);
        }
    }
}

function saveEvents() {
    localStorage.setItem('calendar_events_simplified_v4', JSON.stringify(Array.from(events.entries())));
}

function loadEvents() {
    const stored = localStorage.getItem('calendar_events_simplified_v4');
    if (stored) {
        try {
            events = new Map(JSON.parse(stored));
            return;
        } catch (e) {
            console.error("Failed parsing localStorage", e);
        }
    }

    // Seed default mock events
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    const mockSeed = [
        {
            id: '1',
            title: 'Sprint Planning Meeting',
            description: 'Align product roadmaps, review backlogs, and size pending tasks.',
            startIso: formatDateIso(new Date(y, m, d, 10, 0)),
            endIso: formatDateIso(new Date(y, m, d, 11, 30)),
            color: 'blue'
        },
        {
            id: '2',
            title: 'UX/UI Architecture Review',
            description: 'Evaluate overlapping layout coordinates and view grid parameters.',
            startIso: formatDateIso(new Date(y, m, d, 11, 0)),
            endIso: formatDateIso(new Date(y, m, d, 12, 30)),
            color: 'purple'
        },
        {
            id: '3',
            title: 'Lunch with Tech Leads',
            description: 'Informal sync gathering at the street cafe.',
            startIso: formatDateIso(new Date(y, m, d, 12, 0)),
            endIso: formatDateIso(new Date(y, m, d, 13, 15)),
            color: 'green'
        },
        {
            id: '4',
            title: 'Creative Coding Hackathon',
            description: 'Spanning multiple days to build lightweight web interfaces.',
            startIso: formatDateIso(new Date(y, m, d - 1, 9, 0)),
            endIso: formatDateIso(new Date(y, m, d + 1, 18, 0)),
            color: 'orange'
        },
        {
            id: '5',
            title: 'Retro & Future Roadmap Planning',
            description: 'Reflect on operational learnings and workflow blocks.',
            startIso: formatDateIso(new Date(y, m, d + 1, 14, 0)),
            endIso: formatDateIso(new Date(y, m, d + 1, 15, 30)),
            color: 'pink'
        }
    ];

    mockSeed.forEach(addEventToStore);
    saveEvents();
}

// ==========================================
// 4. SHARED TRACK PACKER (All-Day & Month Rows)
// ==========================================
function packSegments(segments, totalCols, startRowOffset) {
    const tracks = [];

    segments.forEach(seg => {
        // Find first track (row) where columns from seg.sc to seg.ec are free
        let trackIdx = tracks.findIndex(tr => !tr.slice(seg.sc, seg.ec + 1).some(Boolean));

        // If no track is free, add a new one
        if (trackIdx === -1) {
            trackIdx = tracks.push(new Array(totalCols + 1).fill(false)) - 1;
        }

        // Mark columns as occupied in the chosen track
        for (let c = seg.sc; c <= seg.ec; c++) {
            tracks[trackIdx][c] = true;
        }

        seg.row = trackIdx + startRowOffset;
    });
}

// ==========================================
// 5. OVERLAP COLUMN PACKING ALGORITHM
// ==========================================
function computeLayoutCoordinates(dayEvents) {
    const singleDay = dayEvents.filter(e => !e.isMultiDay);

    // Parse start/end times to minutes past midnight
    const parsed = singleDay.map(e => {
        const startD = new Date(e.startIso);
        const endD = new Date(e.endIso);
        const startMins = startD.getHours() * 60 + startD.getMinutes();
        const endMins = endD.getHours() * 60 + endD.getMinutes();
        const duration = Math.max(15, endMins - startMins);

        return {
            event: e,
            start: startMins,
            end: startMins + duration,
            duration
        };
    });

    // Sort: start ascending, duration descending
    parsed.sort((a, b) => a.start - b.start || b.duration - a.duration);

    // Group overlapping cards into concurrent clusters
    const clusters = [];
    for (const item of parsed) {
        const last = clusters[clusters.length - 1];
        if (last && item.start < last.maxEnd) {
            last.items.push(item);
            last.maxEnd = Math.max(last.maxEnd, item.end);
        } else {
            clusters.push({
                items: [item],
                maxEnd: item.end
            });
        }
    }

    // Assign column tracks (Greedy Interval Coloring) within each cluster
    const resultList = [];
    for (const cluster of clusters) {
        const columns = [];
        for (const item of cluster.items) {
            let col = columns.findIndex(endTime => item.start >= endTime);
            if (col === -1) {
                col = columns.push(item.end) - 1;
            } else {
                columns[col] = item.end;
            }
            item.col = col;
        }

        const N = columns.length;
        cluster.items.forEach(item => {
            item.widthPct = 100 / N;
            item.leftPct = item.col * item.widthPct;
            resultList.push(item);
        });
    }

    return resultList.sort((a, b) => a.start - b.start);
}

// ==========================================
// 6. RENDER ENGINE (Day, Week, Month Views)
// ==========================================
const workspace = document.getElementById('viewWorkspace');
const currentRangeText = document.getElementById('currentRangeText');

function renderActiveView() {
    workspace.innerHTML = '';
    workspace.className = 'view-workspace fade-in';

    if (currentView === 'day') {
        renderTimelineView([currentDate]);
    } else if (currentView === 'week') {
        const sun = new Date(currentDate);
        sun.setDate(currentDate.getDate() - currentDate.getDay());

        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sun);
            d.setDate(sun.getDate() + i);
            return d;
        });
        renderTimelineView(weekDays);
    } else {
        renderMonthView();
    }
    updateHeaderText();
}

function updateHeaderText() {
    if (currentView === 'day') {
        currentRangeText.innerText = currentDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    } else if (currentView === 'week') {
        const sun = new Date(currentDate);
        sun.setDate(currentDate.getDate() - currentDate.getDay());
        const sat = new Date(sun);
        sat.setDate(sun.getDate() + 6);
        currentRangeText.innerText = `${sun.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        })} – ${sat.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })}`;
    } else {
        currentRangeText.innerText = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
}

// 6.a. Unified Timeline View Renderer (Handles both Day & Week Layouts)
function renderTimelineView(days) {
    const todayKey = formatDateKey(new Date());
    const isWeek = days.length > 1;

    // Gather all events overlapping with days list
    const daysKeys = days.map(formatDateKey);
    const dayEventsMap = new Map();
    daysKeys.forEach(k => {
        (events.get(k) || []).forEach(e => dayEventsMap.set(e.id, e));
    });

    const allEvents = Array.from(dayEventsMap.values());
    const multiDay = allEvents.filter(e => e.isMultiDay);

    // 1. Compile All-Day Pocket
    let pocketHtml = '';
    if (multiDay.length > 0) {
        // Map spans relative to columns
        const segments = multiDay.map(evt => {
            let sc = days.findIndex(d => formatDateKey(d) === evt.startIso.split('T')[0]) + 1;
            if (sc === 0) sc = 1;
            let ec = days.findIndex(d => formatDateKey(d) === evt.endIso.split('T')[0]) + 1;
            if (ec === 0) ec = days.length;

            return {
                event: evt,
                sc,
                ec,
                span: ec - sc + 1
            };
        });
        segments.sort((a, b) => a.sc - b.sc || b.span - a.span);

        // Track rows packing
        packSegments(segments, days.length, 1);

        pocketHtml = `
            <div class="allday-pocket">
                <div class="allday-label">All-Day</div>
                <div class="allday-content" style="grid-template-columns: repeat(${days.length}, 1fr);">
                    ${segments.map(s => `
                        <div class="multiday-pill color-${s.event.color}" data-id="${s.event.id}" tabindex="0"
                             style="grid-column: ${s.sc} / span ${s.span}; grid-row: ${s.row};">
                            ${s.event.title}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 2. Compile Headers
    const headersHtml = `
        <div class="column-headers">
            <div class="column-header-spacer"></div>
            <div class="column-header-grid" style="grid-template-columns: repeat(${days.length}, 1fr);">
                ${days.map(d => {
        const isToday = formatDateKey(d) === todayKey;
        return `
                        <div class="column-header-item ${isToday ? 'today' : ''}">
                            <span class="weekday-name">${WEEKDAYS[d.getDay()].substring(0, 3)}</span>
                            <span class="day-number">${d.getDate()}</span>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    // 3. Compile Time Labels and Days Columns
    const hourHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height')) || 60;
    const timeLabelsHtml = Array.from({ length: 23 }, (_, i) => {
        const hNum = i + 1;
        const displayHour = hNum > 12 ? hNum - 12 : hNum;
        const ampm = hNum >= 12 ? 'PM' : 'AM';
        return `<div class="time-label" style="top: calc(${hNum} * var(--hour-height))">${displayHour} ${ampm}</div>`;
    }).join('');

    const daysHtml = days.map(d => {
        const dKey = formatDateKey(d);
        const isToday = dKey === todayKey;
        const dayEvts = events.get(dKey) || [];
        const packed = computeLayoutCoordinates(dayEvts);

        return `
            <div class="timeline-day-col" data-date="${d.toISOString()}">
                ${isToday ? `<div class="current-time-line"><div class="current-time-dot"></div></div>` : ''}
                ${packed.map(p => `
                    <div class="event-card color-${p.event.color}" data-id="${p.event.id}" tabindex="0"
                         style="--event-start-mins: ${p.start}; --event-duration-mins: ${p.duration}; width: calc(${p.widthPct}% - 2px); left: ${p.leftPct}%;">
                        <div class="event-card-title">${p.event.title}</div>
                        <div class="event-card-time">${p.event.startIso.split('T')[1]} ${isWeek ? '' : `- ${p.event.endIso.split('T')[1]}`}</div>
                        ${!isWeek && p.duration > 40 && p.event.description ? `<div class="event-card-desc">${p.event.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');

    workspace.innerHTML = `
        <div class="timeline-view-container">
            ${pocketHtml}
            ${headersHtml}
            <div class="timeline-scroll-canvas" id="timelineScroll">
                <div class="timeline-grid-wrapper">
                    <div class="time-labels-col">${timeLabelsHtml}</div>
                    <div class="timeline-days-wrapper" style="grid-template-columns: repeat(${days.length}, 1fr);">
                        ${daysHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('timelineScroll').scrollTop = hourHeight * 8;
}

// 6.b. Render Month View
function renderMonthView() {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const startD = new Date(y, m, 1);
    startD.setDate(1 - startD.getDay());

    let currentD = new Date(startD);
    const weeksList = Array.from({ length: 6 }, () =>
        Array.from({ length: 7 }, () => {
            const d = new Date(currentD);
            currentD.setDate(currentD.getDate() + 1);
            return d;
        })
    );

    const todayKey = formatDateKey(new Date());

    const weekRowsHtml = weeksList.map(weekDays => {
        const weekEventsMap = new Map();
        weekDays.forEach(d => {
            (events.get(formatDateKey(d)) || []).forEach(e => weekEventsMap.set(e.id, e));
        });
        const weekEvents = Array.from(weekEventsMap.values());

        const segments = weekEvents.map(evt => {
            let sc = weekDays.findIndex(d => formatDateKey(d) === evt.startIso.split('T')[0]) + 1;
            if (sc === 0) sc = 1;
            let ec = weekDays.findIndex(d => formatDateKey(d) === evt.endIso.split('T')[0]) + 1;
            if (ec === 0) ec = 7;

            return {
                event: evt,
                sc,
                ec,
                span: ec - sc + 1
            };
        });
        segments.sort((a, b) => a.sc - b.sc || (b.ec - b.sc) - (a.ec - a.sc));

        // Pack month view row tracks starting at row offset 2 (row 1 is spacer for day numbers)
        packSegments(segments, 7, 2);

        return `
            <div class="month-week-row">
                ${weekDays.map((d, colIdx) => `
                    <div class="month-day-bg ${formatDateKey(d) === todayKey ? 'today' : ''} ${d.getMonth() !== m ? 'other-month' : ''}"
                         style="left: calc(${colIdx} * 14.2857%); width: 14.2857%;" data-date="${d.toISOString()}">
                        <span class="month-day-number">${d.getDate()}</span>
                    </div>
                `).join('')}
                ${segments.map(s => `
                    <div class="month-event-pill color-${s.event.color}" data-id="${s.event.id}" tabindex="0"
                         style="grid-column: ${s.sc} / span ${s.ec - s.sc + 1}; grid-row: ${s.row};">
                        ${s.event.title}
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');

    workspace.innerHTML = `
        <div class="month-view-container">
            <div class="month-weekday-header">
                ${WEEKDAYS.map(day => `<div class="month-weekday-item">${day.substring(0, 3)}</div>`).join('')}
            </div>
            <div class="month-grid">${weekRowsHtml}</div>
        </div>
    `;
}

// ==========================================
// 7. UI HANDLERS & MODAL MANAGEMENT (Event Delegation)
// ==========================================
const eventModal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
const fId = document.getElementById('eventId');
const fTitle = document.getElementById('eventTitle');
const fStart = document.getElementById('eventStart');
const fEnd = document.getElementById('eventEnd');
const fDesc = document.getElementById('eventDescription');
const btnDelete = document.getElementById('btnModalDelete');

function openCreateModal(start, end) {
    fId.value = '';
    fTitle.value = '';
    fDesc.value = '';
    fStart.value = formatDateIso(start);
    fEnd.value = formatDateIso(end);
    document.querySelector('input[name="eventColor"][value="blue"]').checked = true;
    document.getElementById('modalTitle').innerText = 'Create Event';
    btnDelete.classList.add('hidden');
    eventModal.showModal();
}

function openEditModal(event) {
    fId.value = event.id;
    fTitle.value = event.title;
    fDesc.value = event.description || '';
    fStart.value = event.startIso;
    fEnd.value = event.endIso;
    document.querySelector(`input[name="eventColor"][value="${event.color}"]`).checked = true;
    document.getElementById('modalTitle').innerText = 'Edit Event';
    btnDelete.classList.remove('hidden');
    eventModal.showModal();
}

const closeModal = () => {
    eventModal.close();
    eventForm.reset();
};

// Centralized Click Event Delegation
workspace.addEventListener('click', (e) => {
    // 1. Clicked an event pill or card
    const card = e.target.closest('.event-card, .month-event-pill, .multiday-pill');
    if (card) {
        e.stopPropagation();
        const event = findEventById(card.dataset.id);
        if (event) {
            openEditModal(event);
        }
        return;
    }

    // 2. Clicked empty space on timeline columns
    const dayCol = e.target.closest('.timeline-day-col');
    if (dayCol) {
        const rect = dayCol.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const hourH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height')) || 60;
        const totalMinutes = (clickY / hourH) * 60;

        const start = new Date(dayCol.dataset.date);
        start.setHours(Math.floor(totalMinutes / 60), Math.floor((totalMinutes % 60) / 15) * 15, 0, 0);
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + 60);
        openCreateModal(start, end);
        return;
    }

    // 3. Clicked empty month day square
    const monthBg = e.target.closest('.month-day-bg');
    if (monthBg) {
        const start = new Date(monthBg.dataset.date);
        start.setHours(9, 0, 0, 0);
        const end = new Date(start);
        end.setHours(10, 0, 0, 0);
        openCreateModal(start, end);
        return;
    }
});

// ==========================================
// 8. INITIALIZATION & LISTENER BINDINGS
// ==========================================
function initApp() {
    // Prev/Next & Today arrow navigation
    document.getElementById('btnPrev').addEventListener('click', () => {
        if (currentView === 'day') {
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
        } else if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        renderActiveView();
    });

    document.getElementById('btnNext').addEventListener('click', () => {
        if (currentView === 'day') {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        renderActiveView();
    });

    document.getElementById('btnToday').addEventListener('click', () => {
        currentDate = new Date();
        renderActiveView();
    });

    document.getElementById('btnNewEvent').addEventListener('click', () => {
        const start = new Date();
        start.setMinutes(0, 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);
        openCreateModal(start, end);
    });

    // Toggle segmented button controls
    const segs = document.querySelectorAll('.segment');
    segs.forEach(btn => {
        btn.addEventListener('click', () => {
            segs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderActiveView();
        });
    });

    // Zoom slider handler
    document.getElementById('zoomSlider').addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--hour-height', `${e.target.value}px`);
    });

    // Modal button control binds
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);
    document.getElementById('btnModalClose').addEventListener('click', closeModal);

    btnDelete.addEventListener('click', () => {
        if (fId.value) {
            removeEventFromStore(fId.value);
            saveEvents();
            renderActiveView();
            closeModal();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (new Date(fEnd.value) <= new Date(fStart.value)) {
            alert("Error: End time must be after start time.");
            return;
        }

        const data = {
            id: fId.value || String(Date.now()),
            title: fTitle.value.trim(),
            startIso: fStart.value,
            endIso: fEnd.value,
            description: fDesc.value.trim(),
            color: document.querySelector('input[name="eventColor"]:checked').value
        };

        if (fId.value) {
            removeEventFromStore(data.id);
        }
        addEventToStore(data);
        saveEvents();
        renderActiveView();
        closeModal();
    });

    // Today clock timeline line position updates
    function updateTicks() {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        document.documentElement.style.setProperty('--current-time-mins', minutes);

        document.querySelectorAll('.current-time-line').forEach(l => {
            l.style.top = `calc(var(--current-time-mins) * (var(--hour-height) / 60))`;
        });

        setTimeout(updateTicks, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()));
    }

    loadEvents();
    renderActiveView();
    updateTicks();
}

document.addEventListener('DOMContentLoaded', initApp);
