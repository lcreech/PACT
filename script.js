// Initialize streaks, max streaks, streak dates, and habit names
const streaks = { physical: 0, academic: 0, creative: 0, tiered: 0 };
const maxStreaks = { physical: 0, academic: 0, creative: 0, tiered: 0 };
const streakDates = { physical: [], academic: [], creative: [], tiered: [] };
const habitLog = { physical: new Set(), academic: new Set(), creative: new Set(), tiered: new Set() };
const habitNames = { physical: "Physical Habit", academic: "Academic Habit", creative: "Creative Habit", tiered: "Tiered Habit" };
let selectedDate = null;

// Load saved habit names from localStorage and update labels
Object.keys(habitNames).forEach(category => {
    const savedName = localStorage.getItem(`${category}-habit-name`);
    if (savedName) {
        habitNames[category] = savedName;
        document.getElementById(`${category}-label`).textContent = savedName;
        // Also update the daily action checkboxes
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
        nameInput.value = ""; // Clear input after setting

        // Update the daily action checkbox label
        const habitCheckboxLabel = document.querySelector(`#${category}-habit + span`);
        if (habitCheckboxLabel) {
            habitCheckboxLabel.textContent = habitNames[category];
        }
    }
}

// Complete habit for selected date or today and update streak
function completeHabit(category) {
    const date = selectedDate ? selectedDate : new Date().toISOString().split('T')[0];
    const completedOnDate = habitLog[category].has(date);

    if (!completedOnDate) {
        habitLog[category].add(date);
        streaks[category]++;
        maxStreaks[category] = Math.max(streaks[category], maxStreaks[category]);

        // Update streak dates (sort in chronological order)
        streakDates[category].push(date);
        streakDates[category].sort(); // Sort the dates chronologically
        updateStreakDisplay(category);

        renderCalendar();
    }
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

    // Display active streak dates in chronological order
    const sortedDates = streakDates[category].sort(); // Ensure they are in chronological order
    const startDate = sortedDates[0] ? formatDate(sortedDates[0]) : "None";
    const endDate = sortedDates[sortedDates.length - 1] ? formatDate(sortedDates[sortedDates.length - 1]) : "None";
    document.getElementById(`${category}-streak-dates`).innerText = `${startDate} to ${endDate}`;
}

// Render calendar with completed days
function renderCalendar() {
    const calendarGrid = document.getElementById("calendar-grid");
    const calendarMonthYear = document.getElementById("calendar-month-year");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Set the current month and year
    const options = { year: 'numeric', month: 'long' };
    calendarMonthYear.textContent = firstDay.toLocaleDateString('en-US', options);

    calendarGrid.innerHTML = ""; // Clear existing days

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";
        if (Object.values(habitLog).some(log => log.has(date))) {
            dayElement.classList.add("completed");
        }
        dayElement.textContent = day;
        
        // Attach click handler to select a date and display completed habits
        dayElement.addEventListener("click", () => {
            selectedDate = date;
            document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
            dayElement.classList.add('selected');
            loadSelectedDateHabits();
        });

        calendarGrid.appendChild(dayElement);
    }
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

// Initialize calendar and set saved names on load
renderCalendar();
