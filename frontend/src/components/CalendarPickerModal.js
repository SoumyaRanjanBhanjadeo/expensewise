import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}) {
  const { isDarkMode, colors } = useTheme();

  // Parse initial date
  const parseDate = (d) => {
    if (!d) return new Date();
    if (d instanceof Date && !isNaN(d)) return d;
    const timestamp = Date.parse(d);
    if (!isNaN(timestamp)) return new Date(timestamp);
    return new Date();
  };

  const initialDate = useMemo(() => parseDate(selectedDate), [selectedDate, visible]);

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [activeDate, setActiveDate] = useState(initialDate);

  useEffect(() => {
    if (visible) {
      const parsed = parseDate(selectedDate);
      setCurrentYear(parsed.getFullYear());
      setCurrentMonth(parsed.getMonth());
      setActiveDate(parsed);
    }
  }, [visible, selectedDate]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Jump to today
  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    handleSelectDay(today.getDate(), today.getMonth(), today.getFullYear());
  };

  // Select a specific day
  const handleSelectDay = (day, month = currentMonth, year = currentYear) => {
    const newDateObj = new Date(year, month, day);
    setActiveDate(newDateObj);

    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = SHORT_MONTHS[month];
    const formattedString = `${formattedDay} ${formattedMonth} ${year}`;

    if (onSelectDate) {
      onSelectDate(formattedString, newDateObj);
    }
    if (onClose) {
      onClose();
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 for Sunday
  const today = new Date();
  const isCurrentMonthToday =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // Build grid of days
  const calendarCells = useMemo(() => {
    const cells = [];
    // Blank leading slots
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ key: `blank_${i}`, isBlank: true });
    }
    // Days 1..N
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected =
        activeDate &&
        activeDate.getFullYear() === currentYear &&
        activeDate.getMonth() === currentMonth &&
        activeDate.getDate() === d;

      const isToday = isCurrentMonthToday && today.getDate() === d;

      cells.push({
        key: `day_${d}`,
        day: d,
        isSelected,
        isToday,
      });
    }
    return cells;
  }, [currentYear, currentMonth, activeDate, daysInMonth, firstDayOfWeek]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
        >
          {/* Calendar Header: Month + Year & Nav Arrows */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              activeOpacity={0.7}
              style={[
                styles.navArrowBtn,
                {
                  backgroundColor: isDarkMode ? "#021A13" : "#F1F5F9",
                  borderColor: isDarkMode ? "rgba(16, 185, 129, 0.25)" : "#E2E8F0",
                },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isDarkMode ? "#34D399" : "#0F4634"}
              />
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
              <Text
                style={[
                  styles.monthTitleText,
                  { color: colors.textPrimary },
                ]}
              >
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleNextMonth}
              activeOpacity={0.7}
              style={[
                styles.navArrowBtn,
                {
                  backgroundColor: isDarkMode ? "#021A13" : "#F1F5F9",
                  borderColor: isDarkMode ? "rgba(16, 185, 129, 0.25)" : "#E2E8F0",
                },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDarkMode ? "#34D399" : "#0F4634"}
              />
            </TouchableOpacity>
          </View>

          {/* Days of Week Row (Sun - Sat) */}
          <View style={styles.daysOfWeekRow}>
            {DAYS_OF_WEEK.map((dayName, idx) => (
              <View key={dayName} style={styles.dayOfWeekCol}>
                <Text
                  style={[
                    styles.dayOfWeekText,
                    {
                      color: idx === 0 || idx === 6
                        ? (isDarkMode ? "#34D399" : "#10B981")
                        : colors.textMuted,
                    },
                  ]}
                >
                  {dayName}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Days 7-Col Grid */}
          <View style={styles.calendarGrid}>
            {calendarCells.map((cell) => {
              if (cell.isBlank) {
                return <View key={cell.key} style={styles.dayCell} />;
              }

              return (
                <TouchableOpacity
                  key={cell.key}
                  onPress={() => handleSelectDay(cell.day)}
                  activeOpacity={0.7}
                  style={styles.dayCell}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      cell.isSelected && styles.dayCircleSelected,
                      cell.isToday && !cell.isSelected && [
                        styles.dayCircleToday,
                        { borderColor: isDarkMode ? "#34D399" : "#10B981" },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: colors.textPrimary },
                        cell.isSelected && styles.dayTextSelected,
                        cell.isToday && !cell.isSelected && {
                          color: isDarkMode ? "#34D399" : "#10B981",
                          fontWeight: "800",
                        },
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Modal Footer: Quick Today Shortcut & Close */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={handleGoToToday}
              activeOpacity={0.7}
              style={[
                styles.todayShortcutBtn,
                {
                  backgroundColor: isDarkMode ? "#021A13" : "#E8F5E9",
                  borderColor: isDarkMode ? "rgba(16, 185, 129, 0.3)" : "#C8E6C9",
                },
              ]}
            >
              <Ionicons
                name="today-outline"
                size={15}
                color={isDarkMode ? "#34D399" : "#0F4634"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.todayShortcutText,
                  { color: isDarkMode ? "#34D399" : "#0F4634" },
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: isDarkMode ? "#04281E" : "#F1F5F9",
                },
              ]}
            >
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 9999,
  },
  calendarCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  monthTitleText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  daysOfWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  dayOfWeekCol: {
    width: 40,
    alignItems: "center",
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCell: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  dayCircleToday: {
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.15)",
  },
  todayShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  todayShortcutText: {
    fontSize: 13,
    fontWeight: "700",
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
