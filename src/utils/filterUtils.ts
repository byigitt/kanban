import { Card, FilterOptions } from "../types";

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
      const dueDate = new Date(card.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      switch (filterOptions.dueDateFilter) {
        case "overdue":
          passesDueDateFilter = dueDate < today;
          break;
        case "today":
          passesDueDateFilter = dueDate >= today && dueDate < tomorrow;
          break;
        case "thisWeek":
          passesDueDateFilter = dueDate >= today && dueDate < nextWeek;
          break;
        case "future":
          passesDueDateFilter = dueDate >= nextWeek;
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
