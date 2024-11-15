// Initialize streaks, max streaks, streak dates, and habit names
const streaks = { physical: 0, academic: 0, creative: 0, tiered: 0 };
const maxStreaks = { physical: 0, academic: 0, creative: 0, tiered: 0 };
const streakDates = { physical: [], academic: [], creative: [], tiered: [] };
const habitLog = { physical: new Set(), academic: new Set(), creative: new Set(), tiered: new Set() };
const habitNames = { physical: "Physical Habit", academic: "Academic Habit", creative: "Creative Habit", tiered: "Tiered Habit" };
let selectedDate = new Date().toISOString().split("T")[0]; // Default to today's date

// Load saved habit names from localStorage and update labels
Object.keys(habitNames).forEach(category => {
    const savedName = localStorage.getItem(`${category}-habit-name`);
    if (savedName) {
        habitNames[category] = savedName;
        document.getElementById(`${category}-label`).textContent = savedName;
        const habitCheckboxLabel = document.querySelector(`#${category}-habit + span`);
        if (habitCheckboxLabel) {
            habitCheckboxLabel.textContent = savedName;
        }
    }
});

// Toggle habit naming section visibility
function toggleHabitNaming() {
    const habitNamingSection = document.getElementById('habit-naming');
    habitNamingSection.style.display = habitNamingSection.style.display === 'none' ? 'block' : 'none';
}

// Set habit name and save to localStorage
function setHabitName(category) {
    const nameInput = document.getElementById(`${category}-name`);
    const habitLabel = document.getElementById(`${category}-label`);
    if (nameInput.value.trim() !== "") {
        habitNames[category] = nameInput.value;
        habitLabel.textContent = habitNames[category];
        localStorage.setItem(`${category}-habit-name`, habitNames[category]);
        nameInput.value = "";
        const habitCheckboxLabel = document.querySelector(`#${category}-habit + span`);
        if (habitCheckboxLabel) {
            habitCheckboxLabel.textContent = habitNames[category];
        }
    }
}

// Complete habit for selected date or today and update streak
function completeHabit(category) {
    const date = selectedDate ? selectedDate : new Date().toISOString().split('T')[0];
    if (!habitLog[category].has(date)) {
        habitLog[category].add(date);
        updateStreak(category);
        renderCalendar();
    }
}

// Update streak considering today as a valid start or continuation point
function updateStreak(category) {
    const datesArray = Array.from(habitLog[category]).sort();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    streaks[category] = 0;
    streakDates[category] = [];

    for (let i = datesArray.length - 1; i >= 0; i--) {
        const currentDate = new Date(datesArray[i]);

        // If current date is today or yesterday, continue the streak
        if (
            i === datesArray.length - 1 &&
            (currentDate.toISOString().split("T")[0] === today.toISOString().split("T")[0] ||
             currentDate.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0])
        ) {
            streaks[category]++;
            streakDates[category].unshift(datesArray[i]);
        } else if (
            i < datesArray.length - 1 &&
            new Date(datesArray[i + 1]) - currentDate === 24 * 60 * 60 * 1000
        ) {
            streaks[category]++;
            streakDates[category].unshift(datesArray[i]);
        } else {
            break;
        }
    }

    maxStreaks[category] = Math.max(streaks[category], maxStreaks[category]);
    updateStreakDisplay(category);
}

// Format date to mm/dd/yy
function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year.slice(2)}`;
}

// Update the display for streaks, max streaks, and streak dates
function updateStreakDisplay(category) {
    document.getElementById(`${category}-streak`).innerText = streaks[category];
    document.getElementById(`${category}-max-streak`).innerText = maxStreaks[category];
    const startDate = streakDates[category][0] ? formatDate(streakDates[category][0]) : "None";
    const endDate = streakDates[category][streakDates[category].length - 1] ? formatDate(streakDates[category][streakDates[category].length - 1]) : "None";
    document.getElementById(`${category}-streak-dates`).innerText = `${startDate} to ${endDate}`;
}

// Render calendar with completed days and highlight selected date
function renderCalendar() {
    const calendarGrid = document.getElementById("calendar-grid");
    const calendarMonthYear = document.getElementById("calendar-month-year");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    calendarMonthYear.textContent = firstDay.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    calendarGrid.innerHTML = "";

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";
        
        // Highlight completed and selected dates
        if (Object.values(habitLog).some(log => log.has(date))) {
            dayElement.classList.add("completed");
        }
        if (date === selectedDate) {
            dayElement.classList.add("selected");
        }

        dayElement.textContent = day;
        dayElement.addEventListener("click", () => {
            selectedDate = date;
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
            dayElement.classList.add('selected');
            loadSelectedDateHabits();
        });

        calendarGrid.appendChild(dayElement);
    }

    // Update the selected date display
    updateSelectedDateDisplay();
}

// Load selected date's habit completion state into the checkboxes
function loadSelectedDateHabits() {
    if (selectedDate) {
        Object.keys(habitLog).forEach(category => {
            const checkbox = document.getElementById(`${category}-habit`);
            checkbox.checked = habitLog[category].has(selectedDate);
        });
    }
}

// Update the selected date display near daily actions
function updateSelectedDateDisplay() {
    const dateDisplay = document.getElementById("daily-action-date");
    if (dateDisplay) {
        dateDisplay.textContent = `Selected Date: ${formatDate(selectedDate)}`;
    }
}

// Initialize calendar and set saved names on load
renderCalendar();
updateSelectedDateDisplay();
