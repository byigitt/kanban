import { Card, FilterOptions } from "../types";
import { isOverdue, isToday, isWithinDays, isFuture } from "./dateUtils";

/**
 * Filters cards based on the provided filter options
 */
export const filterCards = (
  cards: Card[],
  filterOptions: FilterOptions
): Card[] => {
  if (
    !filterOptions ||
    (filterOptions.labelIds.length === 0 &&
      !filterOptions.priority &&
      !filterOptions.dueDateFilter)
  ) {
    return cards;
  }

  return cards.filter((card) => {
    // Filter by labels
    const passesLabelFilter =
      filterOptions.labelIds.length === 0 ||
      filterOptions.labelIds.some((labelId) => card.labels.includes(labelId));

    // Filter by priority
    const passesPriorityFilter =
      !filterOptions.priority || card.priority === filterOptions.priority;

    // Filter by due date
    let passesDueDateFilter = true;
    if (filterOptions.dueDateFilter && card.dueDate) {
      switch (filterOptions.dueDateFilter) {
        case "overdue":
          passesDueDateFilter = isOverdue(card.dueDate);
          break;
        case "today":
          passesDueDateFilter = isToday(card.dueDate);
          break;
        case "thisWeek":
          passesDueDateFilter = isWithinDays(card.dueDate, 7);
          break;
        case "future":
          passesDueDateFilter = isFuture(card.dueDate);
          break;
      }
    } else if (filterOptions.dueDateFilter) {
      // If filtering by due date but card has no due date
      passesDueDateFilter = false;
    }

    // Card must pass all active filters
    return passesLabelFilter && passesPriorityFilter && passesDueDateFilter;
  });
};
