# Translation System

This application supports multiple languages using **i18next**. All user-facing text is stored in JSON translation files and can be easily edited.

## File Structure

```
public/locales/
├── en/
│   └── common.json      # English translations
└── sv/
    └── common.json      # Swedish translations
```

## How to Edit Translations

1. Open the relevant language file: `public/locales/{LANGUAGE}/common.json`
2. Edit the values while keeping the keys unchanged
3. The changes will be reflected immediately (no restart needed)

### Example

**English** (`public/locales/en/common.json`):
```json
{
  "app": {
    "title": "Task Board",
    "description": "Manage your Linear workspace tasks"
  }
}
```

**Swedish** (`public/locales/sv/common.json`):
```json
{
  "app": {
    "title": "Kristallens Att-Göra-Lista",
    "description": "Hantera dina Linear workspace-uppgifter"
  }
}
```

## Adding New Text to Translations

1. **Identify the category**: Is it a button, error message, label, etc.?
2. **Choose or create a key**: Use a descriptive nested key like `errors.save_failed`
3. **Add to all language files**:
   - Add to `public/locales/en/common.json`
   - Add to `public/locales/sv/common.json`
4. **Use in code**:

```javascript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return <button>{t('button.save')}</button>;
}
```

## Current Translation Structure

The translation file is organized by category:

- **app** - Application title and description
- **auth** - Authentication-related text (login, logout)
- **loading** - Loading indicators
- **board** - Kanban board text (search, results)
- **modal** - Modal dialog buttons and titles
- **errors** - Error messages
- **issue** - Issue/ticket field labels

## Adding a New Language

1. Create a new folder: `public/locales/{LANGUAGE_CODE}`
2. Copy `public/locales/en/common.json` to the new folder
3. Translate all values
4. The language will automatically appear in the language switcher

## Language Switcher

Users can switch languages using the language switcher in the top-right corner of the board:
- **EN** - English
- **SV** - Swedish

The selected language is saved in browser localStorage and persists across sessions.

## Default Language

The default language is **English**. If a user has not selected a language, English will be displayed.

## Translation Keys Available

```
app.title              - Application title
app.description        - App description
auth.login_button      - Discord login button text
auth.logout            - Sign out button text
loading.text           - Loading message
board.search_placeholder - Search input placeholder
board.showing          - "Showing X of Y" prefix
board.of               - "of" separator word
board.tasks            - "tasks" plural word
board.clear_search     - Clear search button
modal.new_issue        - New issue modal title
modal.add              - Add button
modal.save             - Save button
modal.cancel           - Cancel button
modal.close            - Close button
errors.save_failed     - Save operation failed
errors.create_failed   - Create operation failed
errors.api_error       - Generic API error
issue.title            - Issue title label
issue.description      - Description field label
issue.priority         - Priority field label
issue.assignee         - Assignee field label
issue.status           - Status field label
issue.labels           - Labels field label
issue.steps            - Steps to reproduce label
issue.image            - Image URL label
```

## Tips

- Keep translations concise
- Maintain consistent terminology across languages
- Test in both languages after making changes
- Use placeholders `{var}` if you need dynamic content: `"Hello {name}"`
