-- Run once on existing databases before starting the updated application.
RENAME TABLE
  `petty_cash` TO `administrative_expense`,
  `petty_cash_category` TO `administrative_expense_category`;
