# API Reference

Complete API documentation for the AI Support Ticket System.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All endpoints except `/api/auth/*` require authentication via JWT token in the `Authorization` header:

```http
Authorization: Bearer {jwt_token}
```

Get JWT token from Supabase Auth after login.

## Common Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

**Status**: 200, 201

### Error Response

```json
{
  "error": "Error code",
  "message": "Human-readable error message"
}
```

**Status**: 400, 401, 403, 404, 500

---

## Tickets Endpoints

### List Tickets

```http
GET /api/tickets?page=1&limit=10&status=open&priority=high&search=keyword&sort=created_at&order=desc
```

**Query Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max: 100) |
| `status` | string | - | Filter: open, in_progress, resolved, closed |
| `priority` | string | - | Filter: low, medium, high, critical |
| `category_id` | UUID | - | Filter by category |
| `assigned_to` | UUID | - | Filter by assignee |
| `search` | string | - | Search in title & description |
| `sort` | string | created_at | Sort by field |
| `order` | string | desc | asc or desc |

**Response:**

```json
{
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "title": "String",
        "description": "String",
        "status": "open",
        "priority": "high",
        "category": { "id": "uuid", "name": "String" },
        "created_by": { "id": "uuid", "email": "String", "name": "String" },
        "assigned_to": { "id": "uuid", "email": "String", "name": "String" } | null,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "comment_count": 5,
        "ai_sentiment": "positive",
        "ai_priority_suggested": "medium"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

**Roles**: User (own only), Agent, Admin

---

### Create Ticket

```http
POST /api/tickets
Content-Type: application/json

{
  "title": "String (required, 5-200 chars)",
  "description": "String (required, 10-5000 chars)",
  "category_id": "UUID (optional)",
  "priority": "low|medium|high|critical (optional, default: medium)",
  "attachments": ["URL (optional, max 5)"]
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "title": "String",
    "description": "String",
    "status": "open",
    "priority": "medium",
    "created_at": "2024-01-01T00:00:00Z",
    "created_by_id": "uuid"
  },
  "message": "Ticket created successfully"
}
```

**Status**: 201

**Roles**: User, Agent, Admin

---

### Get Ticket

```http
GET /api/tickets/{ticket_id}
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `ticket_id` | UUID (path) | Ticket ID |

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "title": "String",
    "description": "String",
    "status": "open",
    "priority": "high",
    "category": { "id": "uuid", "name": "String" },
    "created_by": { "id": "uuid", "email": "String", "name": "String" },
    "assigned_to": { "id": "uuid", "email": "String", "name": "String" } | null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "ai_sentiment": "positive",
    "ai_risk_score": 45,
    "comments": [
      {
        "id": "uuid",
        "author": { "id": "uuid", "name": "String", "role": "user" },
        "content": "String",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Status**: 200

**Roles**: All (User sees own only)

---

### Update Ticket

```http
PATCH /api/tickets/{ticket_id}
Content-Type: application/json

{
  "status": "open|in_progress|resolved|closed (optional)",
  "priority": "low|medium|high|critical (optional)",
  "assigned_to_id": "UUID | null (optional)",
  "category_id": "UUID (optional)"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "status": "in_progress",
    "priority": "high",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Ticket updated successfully"
}
```

**Status**: 200

**Roles**: Agent (own or assigned), Admin

---

### Delete Ticket

```http
DELETE /api/tickets/{ticket_id}
```

**Response:**

```json
{
  "data": { "id": "uuid" },
  "message": "Ticket deleted successfully"
}
```

**Status**: 200

**Roles**: Admin only

---

## Comments Endpoints

### List Comments

```http
GET /api/tickets/{ticket_id}/comments
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "ticket_id": "uuid",
      "author": {
        "id": "uuid",
        "email": "String",
        "name": "String",
        "role": "user|agent|admin"
      },
      "content": "String",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Status**: 200

**Roles**: All (User sees ticket comments if can see ticket)

---

### Add Comment

```http
POST /api/tickets/{ticket_id}/comments
Content-Type: application/json

{
  "content": "String (required, 1-5000 chars)"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "ticket_id": "uuid",
    "author_id": "uuid",
    "content": "String",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Comment added successfully"
}
```

**Status**: 201

**Roles**: All

---

## Users Endpoints

### List Users

```http
GET /api/users?page=1&limit=20&role=agent&search=name
```

**Query Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `role` | string | Filter: user, agent, admin |
| `search` | string | Search by name/email |

**Response:**

```json
{
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "String",
        "name": "String",
        "role": "user|agent|admin",
        "created_at": "2024-01-01T00:00:00Z",
        "stats": {
          "tickets_created": 5,
          "tickets_resolved": 3,
          "avg_resolution_time_hours": 24
        }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 42 }
  }
}
```

**Status**: 200

**Roles**: Admin only

---

### Update User Role

```http
PATCH /api/users/{user_id}
Content-Type: application/json

{
  "role": "user|agent|admin"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "email": "String",
    "role": "agent",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "User role updated successfully"
}
```

**Status**: 200

**Roles**: Admin only

---

## Notifications Endpoints

### List Notifications

```http
GET /api/notifications?unread_only=true&limit=20
```

**Query Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `unread_only` | boolean | Only unread (default: false) |
| `limit` | number | Items to return (default: 20) |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "ticket_assigned|comment_added|ticket_resolved|priority_changed",
      "message": "String",
      "related_ticket_id": "uuid",
      "read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Status**: 200

**Roles**: All

---

### Mark Notification as Read

```http
PATCH /api/notifications/{notification_id}
Content-Type: application/json

{
  "read": true
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "read": true,
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Notification marked as read"
}
```

**Status**: 200

**Roles**: All (user can only update own)

---

## AI Endpoints

### Classify Ticket

Automatically analyze ticket for priority, sentiment, and risk.

```http
POST /api/ai/classify
Content-Type: application/json

{
  "ticket_id": "UUID (optional)",
  "title": "String (required)",
  "description": "String (required)",
  "category": "String (optional)"
}
```

**Response:**

```json
{
  "data": {
    "priority": "low|medium|high|critical",
    "priority_confidence": 0.95,
    "sentiment": "positive|neutral|negative|angry",
    "sentiment_confidence": 0.88,
    "category_suggestions": [
      { "category": "String", "confidence": 0.92 }
    ],
    "risk_factors": ["String"],
    "requires_escalation": false
  }
}
```

**Status**: 200

**Roles**: Agent, Admin

**Cost**: ~200 tokens/request

---

### Summarize Ticket

Generate executive summary of ticket.

```http
POST /api/ai/summarize
Content-Type: application/json

{
  "ticket_id": "UUID (required)",
  "include_comments": true
}
```

**Response:**

```json
{
  "data": {
    "summary": "2-3 sentence summary of the issue",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "previous_attempts": "Description of previous resolution attempts if any"
  }
}
```

**Status**: 200

**Roles**: Agent, Admin

**Cost**: ~150 tokens/request

---

### Suggest Response

Generate response suggestion for agent.

```http
POST /api/ai/suggest
Content-Type: application/json

{
  "ticket_id": "UUID (required)",
  "context": "String (optional, additional context)"
}
```

**Response:**

```json
{
  "data": {
    "suggestion": "Professional response template",
    "tone": "professional|empathetic|technical",
    "key_points": ["Point to address 1", "Point to address 2"],
    "follow_up_question": "String (if more info needed)"
  }
}
```

**Status**: 200

**Roles**: Agent, Admin

**Note**: This is a suggestion only. Agents must review and approve before sending.

**Cost**: ~200 tokens/request

---

### Assess Risk

Evaluate ticket risk level.

```http
POST /api/ai/risk
Content-Type: application/json

{
  "ticket_id": "UUID (required)",
  "include_sentiment": true
}
```

**Response:**

```json
{
  "data": {
    "risk_score": 0,
    "risk_level": "low|medium|high|critical",
    "risk_factors": ["Customer angry", "Long resolution time", "VIP account"],
    "recommendation": "monitor|prioritize|escalate",
    "escalation_reason": "String (if recommendation is escalate)"
  }
}
```

**Status**: 200

**Roles**: Agent, Admin

**Cost**: ~100 tokens/request

---

### Recommend Next Action

AI-powered action recommendation.

```http
POST /api/ai/next-action
Content-Type: application/json

{
  "ticket_id": "UUID (required)"
}
```

**Response:**

```json
{
  "data": {
    "recommended_action": "assign_to_specialist|request_more_info|escalate|close|send_update|provide_workaround",
    "reasoning": "Why this action is recommended",
    "specialist_type": "String (if assign_to_specialist)",
    "questions_to_ask": ["Question 1", "Question 2"],
    "confidence": 0.92
  }
}
```

**Status**: 200

**Roles**: Agent, Admin

**Cost**: ~150 tokens/request

---

## Webhook Endpoints

### Receive n8n Event

Receive events from n8n workflows.

```http
POST /api/webhooks/n8n
Content-Type: application/json
X-Webhook-Secret: {secret}

{
  "event": "ticket_created|ticket_priority_high|ticket_resolved",
  "ticket_id": "UUID",
  "data": { ... }
}
```

**Response:**

```json
{
  "data": { "event_id": "UUID" },
  "message": "Event received"
}
```

**Status**: 200

**Security**: Validates `X-Webhook-Secret` header

---

## Error Codes

| Code | HTTP | Meaning | Solution |
|------|------|---------|----------|
| `UNAUTHORIZED` | 401 | No valid JWT token | Login and provide token |
| `FORBIDDEN` | 403 | User lacks permission | Check role and RLS |
| `NOT_FOUND` | 404 | Resource doesn't exist | Verify ID is correct |
| `VALIDATION_ERROR` | 400 | Invalid input data | Check request format |
| `RATE_LIMITED` | 429 | Too many requests | Wait before retrying |
| `INTERNAL_ERROR` | 500 | Server error | Contact support |
| `AI_ERROR` | 500 | OpenAI API error | Check API key, retry |

---

## Rate Limiting

Rate limits apply per user per minute:

| Endpoint | Limit | Reset |
|----------|-------|-------|
| `/api/tickets` | 60 | 1 min |
| `/api/ai/*` | 20 | 1 min |
| `/api/comments` | 30 | 1 min |
| Other | 100 | 1 min |

Response header: `X-RateLimit-Remaining: 45`

---

## Pagination

For list endpoints, use these parameters:

```
GET /api/tickets?page=2&limit=20
```

Response includes:

```json
{
  "data": { ... },
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Filters

### Status Values
- `open` - New ticket
- `in_progress` - Agent working on it
- `resolved` - Fixed, awaiting user confirmation
- `closed` - Confirmed resolved

### Priority Values
- `low` - Can wait
- `medium` - Normal (default)
- `high` - Urgent
- `critical` - Production down

### Sentiment Values
- `positive` - Happy customer
- `neutral` - Matter-of-fact
- `negative` - Upset
- `angry` - Very angry

### Role Values
- `user` - Customer
- `agent` - Support staff
- `admin` - Manager

---

## Examples

### Create Ticket via curl

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "title": "Cannot login",
    "description": "Getting 500 error when trying to sign in",
    "category_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Classify Ticket via JavaScript

```javascript
const response = await fetch('/api/ai/classify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Server down',
    description: 'API returns 500 errors',
    category: 'Infrastructure'
  })
});

const { data } = await response.json();
console.log(`Priority: ${data.priority}`);
console.log(`Sentiment: ${data.sentiment}`);
```

### List Tickets with Filters via React

```javascript
import { useEffect, useState } from 'react';

export function TicketsList() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch(`/api/tickets?status=open&priority=high&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setTickets(d.data.tickets));
  }, []);

  return (
    <ul>
      {tickets.map(t => <li key={t.id}>{t.title}</li>)}
    </ul>
  );
}
```

---

## SDK Usage

### Using with Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### Using with React Hooks

```typescript
import { useTickets } from '@/hooks/useTickets';

export function Dashboard() {
  const { tickets, loading } = useTickets({
    status: 'open',
    priority: 'high'
  });

  if (loading) return <div>Loading...</div>;
  return <div>{tickets.map(t => ...)}</div>;
}
```

---

## Changelog

### v1.0.0 (Current)

- ✅ Tickets CRUD
- ✅ Comments system
- ✅ IA classification
- ✅ Real-time updates
- ✅ n8n webhooks

### v1.1.0 (Planned)

- [ ] Bulk ticket operations
- [ ] Advanced search with Elasticsearch
- [ ] Ticket templates
- [ ] SLA tracking
- [ ] Customer satisfaction surveys

---

## Support

For API issues:
1. Check error code above
2. Verify JWT token is valid
3. Check request format
4. Review Supabase logs
5. Contact support@company.com
