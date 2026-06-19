import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

// ESLint flat config (v9). Soi lỗi logic JS/TS + React hooks; format để Prettier lo
// (eslint-config-prettier tắt mọi rule style trùng Prettier, tránh đánh nhau).
export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Codebase hiện dùng `any` ở vài chỗ map dữ liệu BE (axios error, sheet_to_html…)
      // → hạ xuống cảnh báo thay vì chặn build, dọn dần.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Cho phép _prefix để cố tình bỏ qua biến/tham số không dùng.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  prettier,
)
