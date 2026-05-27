# Guía de Testing

Estrategias de testing para la aplicación.

## Setup Testing

### Instalar Dependencias

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jest-mock-extended
```

### Crear `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Crear `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

### Actualizar `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Unit Tests

### Testear Utilidades

**`src/lib/__tests__/utils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { formatPriority, parseTicketStatus, calculateSLA } from '@/lib/utils'

describe('Utilities', () => {
  describe('formatPriority', () => {
    it('should format low priority as lowercase', () => {
      expect(formatPriority('low')).toBe('low')
    })

    it('should format critical priority with color', () => {
      expect(formatPriority('critical')).toBe('🔴 Critical')
    })
  })

  describe('calculateSLA', () => {
    it('should return false if ticket past SLA', () => {
      const ticketCreatedAt = new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      expect(calculateSLA(ticketCreatedAt, 'high')).toBe(false)
    })

    it('should return true if ticket within SLA', () => {
      const ticketCreatedAt = new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      expect(calculateSLA(ticketCreatedAt, 'high')).toBe(true)
    })
  })
})
```

### Testear API Helpers

**`src/lib/__tests__/api-helpers.test.ts`**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { errorResponse, successResponse } from '@/lib/api-helpers'

describe('API Helpers', () => {
  describe('successResponse', () => {
    it('should return 200 JSON response', () => {
      const response = successResponse({ data: 'test' })
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })
  })

  describe('errorResponse', () => {
    it('should return error with status code', () => {
      const response = errorResponse('Not found', 'NOT_FOUND', 404)
      expect(response.status).toBe(404)
    })
  })
})
```

---

## Component Tests

### Testear Button Component

**`src/components/__tests__/button.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick handler', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Submit</Button>)
    fireEvent.click(screen.getByText('Submit'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('should show loading state', () => {
    render(<Button isLoading>Loading...</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('disabled')
  })
})
```

### Testear Card Component

**`src/components/__tests__/card.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react'
import { Card } from '@/components/ui/card'

describe('Card Component', () => {
  it('should render children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class">Content</Card>
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
```

---

## Integration Tests

### Testear Flujo de Crear Ticket

**`src/app/api/tickets/__tests__/route.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/tickets/route'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
vi.mock('@supabase/supabase-js')

describe('POST /api/tickets', () => {
  let mockRequest: any

  beforeEach(() => {
    mockRequest = {
      json: vi.fn().mockResolvedValue({
        title: 'Test Ticket',
        description: 'Test Description',
        category: 'General',
      }),
      headers: {
        get: vi.fn((key) => {
          if (key === 'Authorization') return 'Bearer token'
          return null
        }),
      },
    }
  })

  it('should create a ticket', async () => {
    const response = await POST(mockRequest)
    expect(response.status).toBe(201)
  })

  it('should return 401 if not authenticated', async () => {
    mockRequest.headers.get = vi.fn(() => null)
    const response = await POST(mockRequest)
    expect(response.status).toBe(401)
  })

  it('should validate required fields', async () => {
    mockRequest.json = vi.fn().mockResolvedValue({
      title: '',
      description: '',
    })
    const response = await POST(mockRequest)
    expect(response.status).toBe(400)
  })
})
```

---

## E2E Tests (Opcional)

### Setup Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Crear `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

### Crear `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'agent@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrong')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should register new user', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[type="email"]', 'newuser@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[type="password"]:nth-of-type(2)', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })
})
```

### Crear `e2e/tickets.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Tickets', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'agent@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a ticket', async ({ page }) => {
    await page.goto('/tickets/new')
    await page.fill('input[type="text"]', 'Test Ticket Title')
    await page.fill('textarea', 'Test ticket description')
    await page.selectOption('select[name="category"]', 'general')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/tickets\/[a-f0-9-]+/)
  })

  test('should filter tickets by status', async ({ page }) => {
    await page.goto('/tickets')
    await page.selectOption('select[name="status"]', 'open')
    const tickets = page.locator('[data-testid="ticket-card"]')
    const count = await tickets.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should add comment to ticket', async ({ page }) => {
    await page.goto('/tickets/123')
    await page.fill('textarea[name="comment"]', 'Test comment')
    await page.click('button:text("Add Comment")')
    await expect(page.locator('text=Test comment')).toBeVisible()
  })
})
```

---

## Performance Tests

### Testear Load Time

**`e2e/performance.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test('should load dashboard in < 2s', async ({ page }) => {
  const start = Date.now()
  await page.goto('/dashboard')
  const duration = Date.now() - start
  expect(duration).toBeLessThan(2000)
})

test('should list 10 tickets in < 1s', async ({ page }) => {
  const start = Date.now()
  await page.goto('/tickets')
  await page.waitForLoadState('networkidle')
  const duration = Date.now() - start
  expect(duration).toBeLessThan(1000)
})
```

---

## Running Tests

### Ejecutar Todos los Tests

```bash
npm test
```

### Ejecutar Tests Específicos

```bash
npm test -- utils.test.ts
npm test -- --grep "Button"
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm run test:coverage
```

### UI de Tests (Vitest)

```bash
npm run test:ui
```

---

## CI/CD Integration

### GitHub Actions Workflow

**`.github/workflows/test.yml`**

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run dev &
      - run: npx playwright test
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Coverage Targets

| Categoría | Target |
|-----------|--------|
| Components | 80% |
| Utilities | 90% |
| API Routes | 85% |
| Hooks | 80% |
| Overall | 80% |

---

## Testing Checklist

- [ ] Unit tests para utils y helpers
- [ ] Component tests para UI components
- [ ] Integration tests para APIs
- [ ] E2E tests para flujos principales
- [ ] Performance tests
- [ ] Security tests (SQL injection, XSS)
- [ ] Accessibility tests (WCAG 2.1)
- [ ] Mobile tests (responsive design)
- [ ] Coverage >80%
- [ ] CI/CD pipeline verde

---

## Mejores Prácticas

1. **AAA Pattern**: Arrange, Act, Assert
2. **Nombres Descriptivos**: Test names explican qué se prueba
3. **DRY**: No repitas setup code
4. **Mocks**: Mockea Supabase, OpenAI en tests
5. **Fixtures**: Usa data factories para tests limpios
6. **Aislamiento**: Cada test es independiente
7. **Coverage**: Mantén >80% siempre
8. **Performance**: Tests < 5s cada uno

---

## Debugging Tests

### Ver Logs en Tests

```typescript
import { test } from '@playwright/test'

test('debug', async ({ page }) => {
  page.on('console', (msg) => console.log(msg.text()))
  await page.goto('/tickets')
  // ...
})
```

### Pause Ejecución

```typescript
test('debug', async ({ page }) => {
  await page.pause() // Abre inspector
  // ...
})
```

### Slow Motion

```bash
npx playwright test --headed --slow-mo=1000
```
