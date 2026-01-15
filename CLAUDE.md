
## React Style Rules

- Each component should be in its own file named with the same name as the component in PascalCase
- Use named exports over default exports
- for types use `satisfies` over `as` or :Type syntax.
- Never `import * as React` or `import React from 'react'`
- Always `import { useState, useEffect } from 'react'`
- Use `import type` for types when using verbatimModuleSyntax
- Use @/ prefix for internal imports
- Remove all unused imports
- Use `pnpm lint` to check for all errors
- Write function declarations with explicit return types
- Never use React.\* APIs - import hooks/types directly
- Always add ReactElement return type on React Components
- Always add explicit parameter types (no implicit any)
- Prefix unused parameters with underscore
- For useMutation custom hooks postfix the `mutation` name
- Methods passed to method props should be prefixed with handle[method name] and the method props themselves should be prefixed with on[method name] Eg <form onSubmit={handleSubmit} />
