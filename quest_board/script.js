const STORAGE_KEY = "quest-board-v1";

const questForm = document.querySelector("#quest-form");
const questType = document.querySelector("#quest-type");
const rewardField = document.querySelector("#reward-field");
const rewardInput = document.querySelector("#quest-reward");
const questList = document.querySelector("#quest-list");
const mainQuestList = document.querySelector("#main-quest-list");
const dailyQuestList = document.querySelector("#daily-quest-list");
const scheduleDialog = document.querySelector("#schedule-dialog");
const scheduleForm = document.querySelector("#schedule-form");
const scheduleQuest = document.querySelector("#schedule-quest");
const scheduleTime = document.querySelector("#schedule-time");
const scheduleHint = document.querySelector("#schedule-hint");
const statusMessage = document.querySelector("#status-message");
const rewardForm = document.querySelector("#reward-form");
const rewardList = document.querySelector("#reward-list");
const boardTab = document.querySelector("#board-tab");
const calendarTab = document.querySelector("#calendar-tab");
const completedTab = document.querySelector("#completed-tab");
const shopTab = document.querySelector("#shop-tab");
const boardView = document.querySelector("#board-view");
const calendarView = document.querySelector("#calendar-view");
const completedView = document.querySelector("#completed-view");
const shopView = document.querySelector("#shop-view");
const scheduleDate = document.querySelector("#schedule-date");
const calendarGrid = document.querySelector("#calendar-grid");
const calendarPeriod = document.querySelector("#calendar-period");
const selectedDayEvents = document.querySelector("#selected-day-events");
const calendarEventForm = document.querySelector("#calendar-event-form");
const recurringEventList = document.querySelector("#recurring-event-list");
const weekViewButton = document.querySelector("#week-view-button");
const monthViewButton = document.querySelector("#month-view-button");
const confettiLayer = document.querySelector("#confetti-layer");

const localDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

let state = {
    quests: [],
    plans: {},
    coins: 0,
    rewards: [],
    recurringEvents: []
};
let selectedCalendarDate = new Date();
let calendarMode = "week";

function announce(message) {
    statusMessage.textContent = "";
    window.setTimeout(() => {
        statusMessage.textContent = message;
    }, 20);
}

function celebrate() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const colors = ["#d3a958", "#73866b", "#334b3d", "#f4e8cb", "#ab6552"];
    confettiLayer.replaceChildren();
    for (let index = 0; index < 64; index += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.setProperty("--confetti-x", `${(Math.random() - 0.5) * window.innerWidth * 0.9}px`);
        piece.style.setProperty("--confetti-y", `${Math.random() * window.innerHeight * 0.65 + 80}px`);
        piece.style.setProperty("--confetti-rotation", `${Math.random() * 1080 - 540}deg`);
        piece.style.setProperty("--confetti-duration", `${1.1 + Math.random() * 0.7}s`);
        piece.style.setProperty("--confetti-delay", `${Math.random() * 0.18}s`);
        piece.addEventListener("animationend", () => piece.remove(), { once: true });
        confettiLayer.append(piece);
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) return;
        const parsed = JSON.parse(savedState);
        if (
            parsed &&
            Array.isArray(parsed.quests) &&
            parsed.plans &&
            typeof parsed.plans === "object" &&
            Number.isFinite(parsed.coins)
        ) {
            state = {
                ...parsed,
                rewards: Array.isArray(parsed.rewards) ? parsed.rewards : [],
                recurringEvents: Array.isArray(parsed.recurringEvents) ? parsed.recurringEvents : []
            };
        } else {
            announce("Saved quest data could not be read. Starting with an empty quest board.");
        }
    } catch (error) {
        console.error("Unable to load quest board data.", error);
        announce("Saved quest data could not be loaded. Changes may not be saved.");
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch (error) {
        console.error("Unable to save quest board data.", error);
        announce("Your change could not be saved in this browser.");
        return false;
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (!hours) return `${remainingMinutes} min`;
    if (!remainingMinutes) return `${hours} hr${hours === 1 ? "" : "s"}`;
    return `${hours} hr ${remainingMinutes} min`;
}

function formatTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function dateFromKey(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function addDays(date, amount) {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() + amount);
    return result;
}

function startOfWeek(date) {
    return addDays(date, -date.getDay());
}

function getPlansForDate(date) {
    const plans = state.plans[localDateKey(date)] ?? [];
    return plans
        .map((plan) => ({ ...plan, quest: state.quests.find((quest) => quest.id === plan.questId) }))
        .filter((plan) => plan.quest && !plan.quest.completed)
        .sort((first, second) => first.startTime.localeCompare(second.startTime));
}

function getRecurringEventsForDate(date) {
    return state.recurringEvents
        .filter((event) => event.weekdays.includes(date.getDay()))
        .sort((first, second) => first.startTime.localeCompare(second.startTime));
}

function getCalendarItemsForDate(date) {
    const events = getRecurringEventsForDate(date).map((event) => ({
        kind: "event",
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime
    }));
    const plans = getPlansForDate(date).map((plan) => ({
        kind: "quest",
        id: plan.questId,
        title: plan.quest.title,
        description: plan.quest.description,
        startTime: plan.startTime,
        endTime: formatClockTime(timeToMinutes(plan.startTime) + plan.quest.duration)
    }));
    return [...events, ...plans].sort((first, second) => first.startTime.localeCompare(second.startTime));
}

function formatClockTime(totalMinutes) {
    const minutesInDay = 24 * 60;
    const boundedMinutes = totalMinutes % minutesInDay;
    const hours = String(Math.floor(boundedMinutes / 60)).padStart(2, "0");
    const minutes = String(boundedMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function formatPeriodDate(date, options) {
    return date.toLocaleDateString([], options);
}

function displayCalendarDate(date) {
    return formatPeriodDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatCalendarTime(time) {
    return formatTime(time);
}

function renderCalendar() {
    const todayKey = localDateKey();
    const selectedKey = localDateKey(selectedCalendarDate);
    calendarGrid.innerHTML = "";
    calendarGrid.className = `calendar-grid ${calendarMode}-calendar`;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const dayName of dayNames) {
        const heading = document.createElement("div");
        heading.className = "calendar-weekday";
        heading.textContent = dayName;
        calendarGrid.append(heading);
    }

    let dates;
    if (calendarMode === "week") {
        const weekStart = startOfWeek(selectedCalendarDate);
        dates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
        const weekEnd = dates[6];
        const sameMonth = dates[0].getMonth() === weekEnd.getMonth() && dates[0].getFullYear() === weekEnd.getFullYear();
        const sameYear = dates[0].getFullYear() === weekEnd.getFullYear();
        calendarPeriod.textContent = sameMonth
            ? `${formatPeriodDate(dates[0], { month: "short" })} ${dates[0].getDate()} – ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
            : sameYear
                ? `${formatPeriodDate(dates[0], { month: "short", day: "numeric" })} – ${formatPeriodDate(weekEnd, { month: "short", day: "numeric", year: "numeric" })}`
                : `${formatPeriodDate(dates[0], { month: "short", day: "numeric", year: "numeric" })} – ${formatPeriodDate(weekEnd, { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
        const monthStart = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1);
        const gridStart = startOfWeek(monthStart);
        const daysInMonth = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() + 1, 0).getDate();
        const cellCount = Math.ceil((monthStart.getDay() + daysInMonth) / 7) * 7;
        dates = Array.from({ length: cellCount }, (_, index) => addDays(gridStart, index));
        calendarPeriod.textContent = formatPeriodDate(selectedCalendarDate, { month: "long", year: "numeric" });
    }

    for (const date of dates) {
        const dateKey = localDateKey(date);
        const items = getCalendarItemsForDate(date);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "calendar-day";
        if (dateKey === todayKey) cell.classList.add("is-today");
        if (dateKey === selectedKey) cell.classList.add("is-selected");
        if (calendarMode === "month" && date.getMonth() !== selectedCalendarDate.getMonth()) cell.classList.add("is-outside-month");
        cell.setAttribute("aria-pressed", String(dateKey === selectedKey));
        cell.setAttribute("aria-label", `${displayCalendarDate(date)}${items.length ? `, ${items.length} scheduled item${items.length === 1 ? "" : "s"}` : ""}`);
        const previews = items.slice(0, calendarMode === "month" ? 3 : 5).map((item) => `
            <span class="calendar-item ${item.kind}" title="${escapeHtml(formatCalendarTime(item.startTime))} · ${escapeHtml(item.title)}">
                <span class="calendar-item-time">${escapeHtml(formatCalendarTime(item.startTime))}</span>
                <span class="calendar-item-title">${escapeHtml(item.title)}</span>
            </span>
        `).join("");
        const overflow = items.length > (calendarMode === "month" ? 3 : 5)
            ? `<span class="calendar-more">+${items.length - (calendarMode === "month" ? 3 : 5)} more</span>`
            : "";
        cell.innerHTML = `
            <span class="calendar-day-number">${date.getDate()}</span>
            <span class="calendar-items">${previews}${overflow}</span>
        `;
        cell.addEventListener("click", () => {
            selectedCalendarDate = date;
            renderCalendar();
        });
        calendarGrid.append(cell);
    }

    const previousUnit = calendarMode === "week" ? "week" : "month";
    document.querySelector("#calendar-previous").setAttribute("aria-label", `Previous ${previousUnit}`);
    document.querySelector("#calendar-next").setAttribute("aria-label", `Next ${previousUnit}`);
    document.querySelector("#calendar-plan-quest").textContent = `＋ Plan a main quest on ${formatPeriodDate(selectedCalendarDate, { month: "short", day: "numeric" })}`;
    renderSelectedDay();
    renderRecurringEvents();
}

function renderSelectedDay() {
    const dateKey = localDateKey(selectedCalendarDate);
    const items = getCalendarItemsForDate(selectedCalendarDate);
    document.querySelector("#selected-day-heading").textContent = displayCalendarDate(selectedCalendarDate);
    selectedDayEvents.innerHTML = "";

    if (items.length === 0) {
        selectedDayEvents.innerHTML = '<div class="journal-empty">Nothing on the calendar yet. Add a recurring event or plan a main quest for this day.</div>';
        return;
    }

    for (const item of items) {
        const card = document.createElement("article");
        card.className = `calendar-agenda-item ${item.kind}`;
        card.innerHTML = `
            <span class="agenda-time">${formatCalendarTime(item.startTime)}<span>to ${formatCalendarTime(item.endTime)}</span></span>
            <span class="agenda-rule" aria-hidden="true"></span>
            <div class="quest-details">
                <div class="quest-title-row">
                    <strong>${escapeHtml(item.title)}</strong>
                    <span class="type-badge">${item.kind === "quest" ? "Main quest" : "Event"}</span>
                </div>
                ${item.description ? `<p class="quest-description">${escapeHtml(item.description)}</p>` : ""}
            </div>
            ${item.kind === "quest" ? `<button class="remove-plan" type="button" aria-label="Remove ${escapeHtml(item.title)} from ${escapeHtml(displayCalendarDate(selectedCalendarDate))}">Remove</button>` : ""}
        `;
        if (item.kind === "quest") card.querySelector(".remove-plan").addEventListener("click", () => removeFromPlan(item.id, dateKey));
        selectedDayEvents.append(card);
    }
}

function renderRecurringEvents() {
    recurringEventList.innerHTML = "";
    document.querySelector("#recurring-event-count").textContent = state.recurringEvents.length;
    if (state.recurringEvents.length === 0) {
        recurringEventList.innerHTML = '<div class="journal-empty">No recurring events yet.<br>Add a work shift, class, or other weekly commitment.</div>';
        return;
    }

    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const event of state.recurringEvents) {
        const card = document.createElement("article");
        card.className = "recurring-event-card";
        const days = [...event.weekdays].sort((first, second) => first - second).map((day) => weekdayNames[day]).join(", ");
        card.innerHTML = `
            <span class="event-color-mark" aria-hidden="true"></span>
            <div class="quest-details">
                <strong>${escapeHtml(event.title)}</strong>
                <p class="quest-description">${escapeHtml(days)} · ${formatCalendarTime(event.startTime)}–${formatCalendarTime(event.endTime)}${event.description ? ` · ${escapeHtml(event.description)}` : ""}</p>
            </div>
            <button class="remove-plan" type="button" aria-label="Delete recurring event ${escapeHtml(event.title)}">Delete</button>
        `;
        card.querySelector(".remove-plan").addEventListener("click", () => removeRecurringEvent(event.id));
        recurringEventList.append(card);
    }
}

function getTodayPlans() {
    return getPlansForDate(new Date());
}

function renderCoins() {
    document.querySelector("#coin-balance").textContent = state.coins.toLocaleString();
}

function renderRewards() {
    rewardList.innerHTML = "";
    document.querySelector("#reward-count").textContent = state.rewards.length;

    if (state.rewards.length === 0) {
        rewardList.innerHTML = '<div class="journal-empty">Your shop is waiting for its first reward.<br>Add something you would love to earn.</div>';
        return;
    }

    const rewardGroups = [
        { type: "one-time", title: "One-time rewards" },
        { type: "recurring", title: "Recurring rewards" }
    ];
    for (const group of rewardGroups) {
        const rewards = state.rewards.filter((reward) => (reward.type === "one-time" ? "one-time" : "recurring") === group.type);
        if (rewards.length === 0) continue;

        const section = document.createElement("section");
        section.className = "reward-group";
        const heading = document.createElement("h3");
        heading.className = "reward-group-heading";
        heading.textContent = group.title;
        section.append(heading);

        for (const reward of rewards) {
            const card = document.createElement("article");
            card.className = "reward-card";
            card.innerHTML = `
                <span class="reward-accent" aria-hidden="true">✦</span>
                <div class="quest-details">
                    <strong>${escapeHtml(reward.title)}</strong>
                    ${reward.description ? `<p class="quest-description">${escapeHtml(reward.description)}</p>` : ""}
                    <div class="quest-meta"><span>◉ ${reward.cost.toLocaleString()} coins</span></div>
                </div>
                <div class="reward-actions">
                    <button class="quest-action reward-buy" type="button" data-reward-id="${escapeHtml(reward.id)}">Redeem</button>
                    <button class="quest-action reward-delete" type="button" data-delete-reward-id="${escapeHtml(reward.id)}" aria-label="Delete reward: ${escapeHtml(reward.title)}">Delete</button>
                </div>
            `;
            card.querySelector(".reward-buy").addEventListener("click", () => purchaseReward(reward.id));
            card.querySelector(".reward-delete").addEventListener("click", () => deleteReward(reward.id));
            section.append(card);
        }
        rewardList.append(section);
    }
}

function renderQuestLog() {
    questList.innerHTML = "";
    const activeQuests = state.quests.filter((quest) => quest.type !== "daily" && !quest.completed);
    document.querySelector("#quest-count").textContent = activeQuests.length;

    if (activeQuests.length === 0) {
        questList.innerHTML = '<div class="journal-empty">Your quest log is waiting for its first adventure.<br>Create a quest to get started.</div>';
        return;
    }

    const sortedQuests = [...activeQuests].sort((first, second) => first.createdAt - second.createdAt);
    for (const quest of sortedQuests) {
        const card = document.createElement("article");
        card.className = `quest-card ${quest.type}`;
        const todayPlan = quest.type === "main"
            ? (state.plans[localDateKey()] ?? []).find((plan) => plan.questId === quest.id)
            : null;
        const scheduleAction = quest.type === "main"
            ? `<button class="quest-action" type="button" data-action="schedule"${todayPlan ? " disabled" : ""}>${todayPlan ? `Scheduled · ${formatTime(todayPlan.startTime)}` : "Add to today"}</button>`
            : "";
        const completeAction = quest.type === "main"
            ? `<button class="quest-action complete" type="button" data-action="complete">Complete${quest.reward ? ` · +${quest.reward} ◉` : ""}</button>`
            : `<button class="quest-action complete" type="button" data-action="complete">Complete · +${quest.reward} ◉</button>`;
        const actions = `<div class="quest-actions">${scheduleAction}${completeAction}<button class="quest-action" type="button" data-action="delete" aria-label="Delete quest: ${escapeHtml(quest.title)}">Delete</button></div>`;
        const description = quest.description
            ? `<p class="quest-description">${escapeHtml(quest.description)}</p>`
            : "";
        const rewardMeta = quest.reward ? `<span>◉ ${quest.reward} coins</span>` : "";

        card.innerHTML = `
            <span class="quest-accent" aria-hidden="true"></span>
            <div class="quest-details">
                <div class="quest-title-row">
                    <strong>${escapeHtml(quest.title)}</strong>
                    <span class="type-badge">${quest.type === "main" ? "Main" : quest.type === "daily" ? "Daily" : "Side"}</span>
                </div>
                ${description}
                <div class="quest-meta"><span>${formatDuration(quest.duration)}</span>${rewardMeta}</div>
            </div>
            ${actions}
        `;
        card.querySelector("[data-action='schedule']")?.addEventListener("click", () => openSchedule(quest.id));
        card.querySelector("[data-action='complete']")?.addEventListener("click", () => completeQuest(quest.id));
        card.querySelector("[data-action='delete']")?.addEventListener("click", () => deleteQuest(quest.id));
        questList.append(card);
    }
}

function renderCompletedQuests() {
    const completedQuests = state.quests
        .filter((quest) => quest.type !== "daily" && quest.completed)
        .sort((first, second) => (second.completedAt ?? 0) - (first.completedAt ?? 0));
    const completedList = document.querySelector("#completed-list");
    completedList.innerHTML = "";
    document.querySelector("#completed-count").textContent = completedQuests.length;

    if (completedQuests.length === 0) {
        completedList.innerHTML = '<div class="journal-empty">No finished main or side quests yet.<br>Completed quests will be saved here.</div>';
        return;
    }

    for (const quest of completedQuests) {
        const card = document.createElement("article");
        card.className = `quest-card is-complete ${quest.type}`;
        card.innerHTML = `
            <span class="quest-accent" aria-hidden="true"></span>
            <div class="quest-details">
                <div class="quest-title-row">
                    <strong>${escapeHtml(quest.title)}</strong>
                    <span class="type-badge">${quest.type === "main" ? "Main" : "Side"}</span>
                </div>
                ${quest.description ? `<p class="quest-description">${escapeHtml(quest.description)}</p>` : ""}
                <div class="quest-meta"><span>${formatDuration(quest.duration)}</span>${quest.reward ? `<span>◉ ${quest.reward} coins earned</span>` : ""}</div>
            </div>
            <span class="completion-mark" aria-label="Completed">✓</span>
        `;
        completedList.append(card);
    }
}

function renderDailyQuests() {
    const today = localDateKey();
    const dailyQuests = state.quests.filter((quest) => quest.type === "daily");
    dailyQuestList.innerHTML = "";
    document.querySelector("#daily-quest-count").textContent = dailyQuests.length;

    if (dailyQuests.length === 0) {
        dailyQuestList.innerHTML = `
            <div class="empty-state">
                <span class="empty-symbol" aria-hidden="true">↻</span>
                <div><strong>Build a daily rhythm.</strong><p>Add a daily quest to keep a small habit on your board every day.</p></div>
            </div>
        `;
        return;
    }

    for (const quest of dailyQuests) {
        const completedToday = quest.completedOn === today;
        const card = document.createElement("article");
        card.className = `quest-card daily${completedToday ? " is-complete" : ""}`;
        card.innerHTML = `
            <span class="quest-accent" aria-hidden="true"></span>
            <div class="quest-details">
                <div class="quest-title-row">
                    <strong>${escapeHtml(quest.title)}</strong>
                    <span class="type-badge">Daily</span>
                </div>
                ${quest.description ? `<p class="quest-description">${escapeHtml(quest.description)}</p>` : ""}
                <div class="quest-meta"><span>${formatDuration(quest.duration)}</span>${quest.reward ? `<span>◉ ${quest.reward} coins</span>` : ""}</div>
            </div>
            <div class="quest-actions">
                <button class="quest-action${completedToday ? " daily-complete" : ""}" type="button" data-action="complete-daily"${completedToday ? " disabled" : ""}>
                    ${completedToday ? "✓ Done today" : `Complete today${quest.reward ? ` · +${quest.reward} ◉` : ""}`}
                </button>
                <button class="quest-action" type="button" data-action="delete-daily" aria-label="Delete daily quest: ${escapeHtml(quest.title)}">Delete</button>
            </div>
        `;
        card.querySelector("[data-action='complete-daily']")?.addEventListener("click", () => completeDailyQuest(quest.id));
        card.querySelector("[data-action='delete-daily']")?.addEventListener("click", () => deleteDailyQuest(quest.id));
        dailyQuestList.append(card);
    }
}

function renderMainQuests() {
    const plans = getTodayPlans();
    mainQuestList.innerHTML = "";
    if (plans.length === 0) {
        mainQuestList.innerHTML = `
            <div class="empty-state">
                <span class="empty-symbol" aria-hidden="true">✧</span>
                <div><strong>Your day is a blank map.</strong><p>Choose a main quest and give it a time slot to get started.</p></div>
            </div>
        `;
        return;
    }

    for (const plan of plans) {
        const start = new Date();
        const [hours, minutes] = plan.startTime.split(":").map(Number);
        start.setHours(hours, minutes, 0, 0);
        const end = new Date(start.getTime() + plan.quest.duration * 60_000);
        const endTime = end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        const card = document.createElement("article");
        card.className = "timeline-card";
        card.innerHTML = `
            <div class="timeline-time"><span>${formatTime(plan.startTime)}</span><span>to ${endTime}</span></div>
            <span class="timeline-rule" aria-hidden="true"></span>
            <div class="timeline-content">
                <strong>${escapeHtml(plan.quest.title)}</strong>
                <p>${formatDuration(plan.quest.duration)}${plan.quest.description ? ` · ${escapeHtml(plan.quest.description)}` : ""}</p>
            </div>
            <button class="remove-plan" type="button" aria-label="Remove ${escapeHtml(plan.quest.title)} from today's plan">Remove</button>
        `;
        card.querySelector(".remove-plan").addEventListener("click", () => removeFromPlan(plan.questId));
        mainQuestList.append(card);
    }
}

function render() {
    renderCoins();
    renderQuestLog();
    renderCompletedQuests();
    renderMainQuests();
    renderDailyQuests();
    renderRewards();
    updateScheduleOptions();
    renderCalendar();
}

function updateScheduleOptions() {
    const targetDate = scheduleDate.value ? dateFromKey(scheduleDate.value) : new Date();
    const alreadyPlanned = new Set(getPlansForDate(targetDate).map((plan) => plan.questId));
    const available = state.quests.filter((quest) => quest.type === "main" && !quest.completed && !alreadyPlanned.has(quest.id));
    scheduleQuest.innerHTML = "";

    for (const quest of available) {
        const option = document.createElement("option");
        option.value = quest.id;
        option.textContent = `${quest.title} · ${formatDuration(quest.duration)}`;
        scheduleQuest.append(option);
    }

    const hasAvailable = available.length > 0;
    scheduleQuest.disabled = !hasAvailable;
    scheduleTime.disabled = !hasAvailable;
    scheduleForm.querySelector("[type='submit']").disabled = !hasAvailable;
    scheduleHint.textContent = hasAvailable
        ? "The end time will be calculated from the quest duration."
        : "Create a main quest in your quest log before planning your day.";
}

function openSchedule(questId) {
    openScheduleForDate(questId, localDateKey());
}

function openScheduleForDate(questId, dateKey) {
    scheduleDate.value = dateKey;
    updateScheduleOptions();
    if (questId && [...scheduleQuest.options].some((option) => option.value === questId)) {
        scheduleQuest.value = questId;
    }
    scheduleTime.value = "";
    if (typeof scheduleDialog.showModal === "function") {
        scheduleDialog.showModal();
    } else {
        announce("Scheduling requires a browser that supports dialog windows.");
    }
}

function closeSchedule() {
    scheduleDialog.close();
}

function completeQuest(questId) {
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest || !["main", "side"].includes(quest.type) || quest.completed) return;
    const previousPlans = Object.fromEntries(
        Object.entries(state.plans).map(([dateKey, plans]) => [dateKey, [...plans]])
    );
    quest.completed = true;
    quest.completedAt = Date.now();
    const reward = Number.isInteger(quest.reward) && quest.reward > 0 ? quest.reward : 0;
    state.coins += reward;
    if (quest.type === "main") {
        for (const [dateKey, plans] of Object.entries(state.plans)) {
            state.plans[dateKey] = plans.filter((plan) => plan.questId !== questId);
            if (state.plans[dateKey].length === 0) delete state.plans[dateKey];
        }
    }
    if (saveState()) {
        render();
        celebrate();
        announce(reward > 0
            ? `${quest.title} completed. You earned ${reward} coins.`
            : `${quest.title} completed and moved to completed quests.`);
    } else {
        quest.completed = false;
        delete quest.completedAt;
        state.coins -= reward;
        if (quest.type === "main") state.plans = previousPlans;
    }
}

function deleteQuest(questId) {
    const questIndex = state.quests.findIndex((item) => item.id === questId && ["main", "side"].includes(item.type) && !item.completed);
    if (questIndex === -1) return;

    const [quest] = state.quests.splice(questIndex, 1);
    const previousPlans = Object.fromEntries(
        Object.entries(state.plans).map(([dateKey, plans]) => [dateKey, [...plans]])
    );
    for (const [dateKey, plans] of Object.entries(state.plans)) {
        const remainingPlans = plans.filter((plan) => plan.questId !== questId);
        if (remainingPlans.length > 0) {
            state.plans[dateKey] = remainingPlans;
        } else {
            delete state.plans[dateKey];
        }
    }

    if (saveState()) {
        render();
        announce(`${quest.title} deleted.`);
    } else {
        state.quests.splice(questIndex, 0, quest);
        state.plans = previousPlans;
    }
}

function completeDailyQuest(questId) {
    const quest = state.quests.find((item) => item.id === questId);
    const today = localDateKey();
    if (!quest || quest.type !== "daily" || quest.completedOn === today) return;
    const reward = Number.isInteger(quest.reward) && quest.reward > 0 ? quest.reward : 0;
    quest.completedOn = today;
    state.coins += reward;
    if (saveState()) {
        render();
        celebrate();
        announce(reward > 0
            ? `${quest.title} marked complete for today. You earned ${reward} coins.`
            : `${quest.title} marked complete for today.`);
    } else {
        delete quest.completedOn;
        state.coins -= reward;
    }
}

function deleteDailyQuest(questId) {
    const questIndex = state.quests.findIndex((item) => item.id === questId && item.type === "daily");
    if (questIndex === -1) return;
    const [quest] = state.quests.splice(questIndex, 1);
    if (saveState()) {
        render();
        announce(`${quest.title} deleted.`);
    } else {
        state.quests.splice(questIndex, 0, quest);
    }
}

function purchaseReward(rewardId) {
    const reward = state.rewards.find((item) => item.id === rewardId);
    if (!reward) return;
    if (state.coins < reward.cost) {
        announce(`You need ${reward.cost - state.coins} more coins to redeem ${reward.title}.`);
        return;
    }

    const rewardIndex = state.rewards.indexOf(reward);
    state.coins -= reward.cost;
    const isOneTime = reward.type === "one-time";
    if (isOneTime) state.rewards.splice(rewardIndex, 1);
    if (saveState()) {
        render();
        celebrate();
        announce(isOneTime
            ? `${reward.title} redeemed for ${reward.cost} coins and removed from the shop. Enjoy your reward!`
            : `${reward.title} redeemed for ${reward.cost} coins. Enjoy your reward!`);
    } else {
        state.coins += reward.cost;
        if (isOneTime) state.rewards.splice(rewardIndex, 0, reward);
    }
}

function deleteReward(rewardId) {
    const rewardIndex = state.rewards.findIndex((item) => item.id === rewardId);
    if (rewardIndex === -1) return;

    const [reward] = state.rewards.splice(rewardIndex, 1);
    if (saveState()) {
        render();
        announce(`${reward.title} removed from the shop.`);
    } else {
        state.rewards.splice(rewardIndex, 0, reward);
    }
}

function removeFromPlan(questId, dateKey = localDateKey()) {
    state.plans[dateKey] = (state.plans[dateKey] ?? []).filter((plan) => plan.questId !== questId);
    if (state.plans[dateKey].length === 0) delete state.plans[dateKey];
    if (saveState()) {
        render();
        announce("Quest removed from the calendar.");
    }
}

function removeRecurringEvent(eventId) {
    const existingEvents = state.recurringEvents;
    state.recurringEvents = existingEvents.filter((event) => event.id !== eventId);
    if (saveState()) {
        renderCalendar();
        announce("Recurring event removed from the calendar.");
    } else {
        state.recurringEvents = existingEvents;
    }
}

function updateRewardField() {
    const hasCoinReward = ["main", "side", "daily"].includes(questType.value);
    rewardField.hidden = !hasCoinReward;
    rewardInput.required = hasCoinReward;
}

questType.addEventListener("change", updateRewardField);
updateRewardField();

questForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(questForm);
    const quest = {
        id: createId(),
        title: String(formData.get("title")).trim(),
        description: String(formData.get("description")).trim(),
        type: String(formData.get("type")),
        duration: Number(formData.get("duration")),
        createdAt: Date.now(),
        completed: false
    };
    if (["main", "side", "daily"].includes(quest.type)) quest.reward = Number(formData.get("reward"));

    if (!quest.title || !Number.isInteger(quest.duration) || quest.duration < 1 || (["main", "side", "daily"].includes(quest.type) && (!Number.isInteger(quest.reward) || quest.reward < 1))) {
        announce("Please enter a quest name, a valid duration, and a valid coin reward.");
        return;
    }

    state.quests.push(quest);
    if (saveState()) {
        questForm.reset();
        updateRewardField();
        render();
        const typeLabel = quest.type === "main" ? "Main" : quest.type === "side" ? "Side" : "Daily";
        announce(`${typeLabel} quest added to your quest log.`);
    }
});

rewardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(rewardForm);
    const reward = {
        id: createId(),
        title: String(formData.get("title")).trim(),
        description: String(formData.get("description")).trim(),
        cost: Number(formData.get("cost")),
        type: String(formData.get("type"))
    };

    if (!reward.title || !Number.isInteger(reward.cost) || reward.cost < 1 || !["one-time", "recurring"].includes(reward.type)) {
        announce("Please enter a reward name, a valid coin cost, and a reward type.");
        return;
    }

    state.rewards.push(reward);
    if (saveState()) {
        rewardForm.reset();
        render();
        announce(`${reward.title} added to the reward shop.`);
    } else {
        state.rewards.pop();
    }
});

scheduleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const questId = scheduleQuest.value;
    const startTime = scheduleTime.value;
    const dateKey = scheduleDate.value;
    const quest = state.quests.find((item) => item.id === questId);
    if (!quest || quest.type !== "main" || quest.completed || !startTime || !dateKey) {
        announce("Choose an active main quest, date, and start time to add it to the calendar.");
        return;
    }

    const plans = state.plans[dateKey] ?? [];
    const newStartMinutes = timeToMinutes(startTime);
    const newEndMinutes = newStartMinutes + quest.duration;
    const overlapsPlan = plans.some((plan) => {
        const plannedQuest = state.quests.find((item) => item.id === plan.questId);
        if (!plannedQuest) return false;
        const planStart = timeToMinutes(plan.startTime);
        const planEnd = planStart + plannedQuest.duration;
        return newStartMinutes < planEnd && planStart < newEndMinutes;
    });
    const selectedDate = dateFromKey(dateKey);
    const overlapsEvent = getRecurringEventsForDate(selectedDate).some((event) => (
        newStartMinutes < timeToMinutes(event.endTime) &&
        timeToMinutes(event.startTime) < newEndMinutes
    ));
    if (overlapsPlan || overlapsEvent) {
        announce(overlapsEvent
            ? "That time overlaps a recurring event. Choose a different start time."
            : "That time overlaps another main quest. Choose a different start time.");
        return;
    }

    state.plans[dateKey] = [...plans, { questId, startTime }];
    if (saveState()) {
        closeSchedule();
        render();
        announce(`${quest.title} added to the calendar.`);
    } else {
        state.plans[dateKey] = plans;
        if (plans.length === 0) delete state.plans[dateKey];
    }
});

calendarEventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(calendarEventForm);
    const weekdays = formData.getAll("weekdays").map(Number);
    const recurringEvent = {
        id: createId(),
        title: String(formData.get("title")).trim(),
        description: String(formData.get("description")).trim(),
        weekdays,
        startTime: String(formData.get("startTime")),
        endTime: String(formData.get("endTime"))
    };

    if (!recurringEvent.title || weekdays.length === 0) {
        announce("Add an event name and choose at least one weekday.");
        return;
    }
    if (!recurringEvent.startTime || !recurringEvent.endTime || timeToMinutes(recurringEvent.endTime) <= timeToMinutes(recurringEvent.startTime)) {
        announce("Choose a valid end time later than the event start time.");
        return;
    }

    const todayKey = localDateKey();
    const conflictsWithQuest = Object.entries(state.plans).some(([dateKey, plans]) => {
        if (dateKey < todayKey || !recurringEvent.weekdays.includes(dateFromKey(dateKey).getDay())) return false;
        return plans.some((plan) => {
            const quest = state.quests.find((item) => item.id === plan.questId);
            if (!quest || quest.completed) return false;
            const planStart = timeToMinutes(plan.startTime);
            const planEnd = planStart + quest.duration;
            return timeToMinutes(recurringEvent.startTime) < planEnd && planStart < timeToMinutes(recurringEvent.endTime);
        });
    });
    if (conflictsWithQuest) {
        announce("This recurring event overlaps a planned main quest. Adjust one of the times before adding it.");
        return;
    }

    state.recurringEvents.push(recurringEvent);
    if (saveState()) {
        calendarEventForm.reset();
        renderCalendar();
        announce(`${recurringEvent.title} added as a weekly recurring event.`);
    } else {
        state.recurringEvents.pop();
    }
});

document.querySelector("#open-schedule").addEventListener("click", () => openSchedule());
document.querySelector("#close-schedule").addEventListener("click", closeSchedule);
document.querySelector("#cancel-schedule").addEventListener("click", closeSchedule);

function activateTab(tab) {
    const tabs = [boardTab, calendarTab, completedTab, shopTab];
    const views = [boardView, calendarView, completedView, shopView];
    tabs.forEach((item, index) => {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
        item.tabIndex = isActive ? 0 : -1;
        views[index].hidden = !isActive;
    });
    tab.focus();
}

boardTab.addEventListener("click", () => activateTab(boardTab));
calendarTab.addEventListener("click", () => activateTab(calendarTab));
completedTab.addEventListener("click", () => activateTab(completedTab));
shopTab.addEventListener("click", () => activateTab(shopTab));
document.querySelector(".tabs").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const tabs = [boardTab, calendarTab, completedTab, shopTab];
    const currentIndex = tabs.indexOf(document.activeElement);
    const nextIndex = event.key === "Home"
        ? 0
        : event.key === "End"
            ? tabs.length - 1
            : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    activateTab(tabs[nextIndex]);
});

weekViewButton.addEventListener("click", () => {
    calendarMode = "week";
    weekViewButton.classList.add("is-active");
    monthViewButton.classList.remove("is-active");
    weekViewButton.setAttribute("aria-pressed", "true");
    monthViewButton.setAttribute("aria-pressed", "false");
    renderCalendar();
});
monthViewButton.addEventListener("click", () => {
    calendarMode = "month";
    monthViewButton.classList.add("is-active");
    weekViewButton.classList.remove("is-active");
    monthViewButton.setAttribute("aria-pressed", "true");
    weekViewButton.setAttribute("aria-pressed", "false");
    renderCalendar();
});
document.querySelector("#calendar-previous").addEventListener("click", () => {
    if (calendarMode === "week") {
        selectedCalendarDate = addDays(selectedCalendarDate, -7);
    } else {
        selectedCalendarDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() - 1, 1);
    }
    renderCalendar();
});
document.querySelector("#calendar-next").addEventListener("click", () => {
    if (calendarMode === "week") {
        selectedCalendarDate = addDays(selectedCalendarDate, 7);
    } else {
        selectedCalendarDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() + 1, 1);
    }
    renderCalendar();
});
document.querySelector("#calendar-today").addEventListener("click", () => {
    selectedCalendarDate = new Date();
    renderCalendar();
});
document.querySelector("#calendar-plan-quest").addEventListener("click", () => {
    openScheduleForDate(undefined, localDateKey(selectedCalendarDate));
});
scheduleDate.addEventListener("change", updateScheduleOptions);

scheduleQuest.addEventListener("change", () => {
    const quest = state.quests.find((item) => item.id === scheduleQuest.value);
    scheduleHint.textContent = quest
        ? `This quest takes ${formatDuration(quest.duration)}. Its end time will be calculated automatically.`
        : "The end time will be calculated from the quest duration.";
});

function updateTodayLabel() {
    document.querySelector("#today-label").textContent = new Date().toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}

let displayedDate = localDateKey();
updateTodayLabel();
loadState();
render();

window.setInterval(() => {
    const today = localDateKey();
    if (today !== displayedDate) {
        displayedDate = today;
        updateTodayLabel();
        render();
    }
}, 60_000);