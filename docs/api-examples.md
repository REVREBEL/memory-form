# Memory Form API Examples

This document provides examples of JSON payloads for creating and updating memory items in the Webflow CMS.

---

## Creating a New Memory Item

### Request

**Endpoint**: `POST /api/memory`

**Content-Type**: `multipart/form-data`

**Form Data**:
```
collection-id: 507f1f77bcf86cd799439011
name: Summer Vacation 2024
slug: summer-vacation-2024
first-name: Jane
last-name: Smith
email: jane.smith@example.com
memory: We spent an incredible week exploring the mountains. The kids loved hiking and seeing wildlife.
memory-date: 2024-07-15T10:00:00.000Z
location: Rocky Mountain National Park
tag-1: family
tag-2: vacation
tag-3: mountains
content-link: https://example.com/photos/summer-2024.jpg
archived: false
draft: false
```

### Response (Success)

**Status**: `200 OK`

```json
{
  "success": true,
  "message": "Memory created successfully",
  "data": {
    "id": "66a1234567890abcdef12345",
    "cmsLocaleId": "507f1f77bcf86cd799439011",
    "lastPublished": null,
    "lastUpdated": "2024-01-15T14:30:00.000Z",
    "createdOn": "2024-01-15T14:30:00.000Z",
    "isArchived": false,
    "isDraft": false,
    "fieldData": {
      "name": "Summer Vacation 2024",
      "slug": "summer-vacation-2024",
      "first-name": "Jane",
      "last-name": "Smith",
      "email": "jane.smith@example.com",
      "memory": "We spent an incredible week exploring the mountains. The kids loved hiking and seeing wildlife.",
      "memory-date": "2024-07-15T10:00:00.000Z",
      "location": "Rocky Mountain National Park",
      "tag-1": "family",
      "tag-2": "vacation",
      "tag-3": "mountains",
      "content-link": "https://example.com/photos/summer-2024.jpg"
    }
  }
}
```

### Response (Validation Error)

**Status**: `400 Bad Request`

```json
{
  "success": false,
  "errors": [
    "Name is required",
    "Email is required",
    "Memory is required",
    "Memory date is required"
  ]
}
```

### Response (Server Error)

**Status**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Failed to create memory item",
  "details": "Collection not found"
}
```

---

## Updating an Existing Memory Item

### Request

**Endpoint**: `POST /api/memory`

**Content-Type**: `multipart/form-data`

**Form Data**:
```
collection-id: 507f1f77bcf86cd799439011
item-id: 66a1234567890abcdef12345
name: Summer Vacation 2024 - Updated
slug: summer-vacation-2024
first-name: Jane
last-name: Smith
email: jane.smith@example.com
memory: We spent an incredible week exploring the mountains. The kids loved hiking, seeing wildlife, and camping under the stars!
memory-date: 2024-07-15T10:00:00.000Z
location: Rocky Mountain National Park
tag-1: family
tag-2: vacation
tag-3: camping
video-link: https://youtube.com/watch?v=example
archived: false
draft: false
```

### Response (Success)

**Status**: `200 OK`

```json
{
  "success": true,
  "message": "Memory updated successfully",
  "data": {
    "id": "66a1234567890abcdef12345",
    "cmsLocaleId": "507f1f77bcf86cd799439011",
    "lastPublished": "2024-01-15T14:30:00.000Z",
    "lastUpdated": "2024-01-16T09:15:00.000Z",
    "createdOn": "2024-01-15T14:30:00.000Z",
    "isArchived": false,
    "isDraft": false,
    "fieldData": {
      "name": "Summer Vacation 2024 - Updated",
      "slug": "summer-vacation-2024",
      "first-name": "Jane",
      "last-name": "Smith",
      "email": "jane.smith@example.com",
      "memory": "We spent an incredible week exploring the mountains. The kids loved hiking, seeing wildlife, and camping under the stars!",
      "memory-date": "2024-07-15T10:00:00.000Z",
      "location": "Rocky Mountain National Park",
      "tag-1": "family",
      "tag-2": "vacation",
      "tag-3": "camping",
      "video-link": "https://youtube.com/watch?v=example"
    }
  }
}
```

---

## CMS Item Payload Structure (Internal)

This is the structure sent to the Webflow CMS API internally by the server.

### Create Item Payload

```json
{
  "fieldData": {
    "name": "Beach Day 2024",
    "slug": "beach-day-2024",
    "first-name": "John",
    "last-name": "Doe",
    "email": "john@example.com",
    "memory": "An amazing day at the beach with family. We built sandcastles, swam in the ocean, and watched the sunset.",
    "memory-date": "2024-06-15T14:30:00.000Z",
    "location": "Santa Monica Beach",
    "tag-1": "family",
    "tag-2": "summer",
    "tag-3": "beach",
    "photo": "https://cdn.example.com/photos/beach-2024.jpg",
    "content-link": "https://example.com/albums/beach-day"
  },
  "isArchived": false,
  "isDraft": false
}
```

### Update Item Payload

```json
{
  "fieldData": {
    "name": "Beach Day 2024 (Updated)",
    "slug": "beach-day-2024",
    "memory": "An amazing day at the beach with family. We built sandcastles, swam in the ocean, and watched the sunset. UPDATE: We also found some beautiful seashells!",
    "tag-3": "vacation",
    "video-link": "https://youtube.com/watch?v=beach-2024"
  },
  "isArchived": false,
  "isDraft": false
}
```

**Note**: When updating, you only need to include the fields you want to change. The `name` and `slug` are always included to ensure data integrity.

---

## Field Type Reference

### System Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Display name for the memory |
| `slug` | String | Auto | URL-safe identifier (auto-generated from name if not provided) |
| `collection-id` | String | Yes | Webflow collection ID (24-char MongoDB ObjectId) |
| `locale-id` | String | No | Locale ID for multi-locale sites |
| `item-id` | String | No | Item ID for updates (leave empty for new items) |

### Custom Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first-name` | String | No | First name of person sharing memory |
| `last-name` | String | No | Last name of person sharing memory |
| `email` | Email | Yes | Email address (validated format) |
| `memory` | Text | Yes | The memory description/story |
| `memory-date` | DateTime | Yes | When the memory occurred (ISO 8601) |
| `location` | String | No | Where the memory took place |
| `tag-1` | String | No | First tag for categorization |
| `tag-2` | String | No | Second tag for categorization |
| `tag-3` | String | No | Third tag for categorization |
| `photo` | String (URL) | No | Photo URL or upload reference |
| `video` | String | No | Video media field |
| `video-link` | String (URL) | No | External video link (YouTube, etc.) |
| `content-link` | String (URL) | No | Link to external content/album |
| `archived` | Boolean | No | Whether item is archived (default: false) |
| `draft` | Boolean | No | Whether item is draft (default: false) |

---

## Date Format Examples

Memory dates must be in ISO 8601 format or a format that JavaScript's `Date()` constructor can parse.

### Valid Formats

```
2024-07-15T14:30:00.000Z          ✓ ISO 8601 with timezone
2024-07-15T14:30:00               ✓ ISO 8601 without timezone
2024-07-15                        ✓ Date only
07/15/2024                        ✓ US date format
15-07-2024                        ✓ EU date format
July 15, 2024                     ✓ Natural language
```

### Invalid Formats

```
15/07/2024                        ✗ Ambiguous format
tomorrow                          ✗ Relative dates
2024-13-01                        ✗ Invalid month
2024-07-32                        ✗ Invalid day
```

The API will automatically convert valid dates to ISO 8601 format before storing in the CMS.

---

## URL Validation

URLs for `video-link` and `content-link` must:
- Start with `http://` or `https://`
- Be a valid URL format

### Valid URLs

```
https://youtube.com/watch?v=abc123          ✓
https://www.example.com/photo.jpg           ✓
http://example.com/page                     ✓
```

### Invalid URLs

```
www.example.com                             ✗ Missing protocol
example.com                                 ✗ Missing protocol
ftp://example.com                           ✗ Wrong protocol
file:///local/path                          ✗ Wrong protocol
```

---

## Slug Generation Rules

If `slug` is not provided, it will be auto-generated from `name` using these rules:

1. Convert to lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep only letters, numbers, hyphens)
4. Remove multiple consecutive hyphens
5. Remove leading/trailing hyphens

### Examples

| Name | Generated Slug |
|------|----------------|
| "Summer Vacation 2024" | `summer-vacation-2024` |
| "My Best Friend's Wedding!" | `my-best-friends-wedding` |
| "   Paris Trip (2023)   " | `paris-trip-2023` |
| "NEW YEAR'S EVE!!!" | `new-years-eve` |

---

## JavaScript Fetch Example

### Creating a Memory

```javascript
const formData = new FormData();
formData.append('collection-id', 'YOUR_COLLECTION_ID');
formData.append('name', 'My Memory');
formData.append('email', 'user@example.com');
formData.append('memory', 'This is my memory story...');
formData.append('memory-date', '2024-01-15');
formData.append('first-name', 'John');
formData.append('last-name', 'Doe');
formData.append('location', 'New York');

const response = await fetch('/api/memory', {
  method: 'POST',
  body: formData
});

const result = await response.json();

if (result.success) {
  console.log('Memory created:', result.data.id);
  console.log('Item slug:', result.data.fieldData.slug);
} else {
  console.error('Errors:', result.errors);
}
```

### Updating a Memory

```javascript
const formData = new FormData();
formData.append('collection-id', 'YOUR_COLLECTION_ID');
formData.append('item-id', '66a1234567890abcdef12345'); // Existing item ID
formData.append('name', 'My Updated Memory');
formData.append('memory', 'Updated memory story...');

const response = await fetch('/api/memory', {
  method: 'POST',
  body: formData
});

const result = await response.json();

if (result.success) {
  console.log('Memory updated:', result.data.id);
  console.log('Last updated:', result.data.lastUpdated);
} else {
  console.error('Error:', result.error);
}
```

---

## Testing with cURL

### Create Memory

```bash
curl -X POST http://localhost:4321/api/memory \
  -F "collection-id=507f1f77bcf86cd799439011" \
  -F "name=Test Memory" \
  -F "email=test@example.com" \
  -F "memory=This is a test memory" \
  -F "memory-date=2024-01-15" \
  -F "location=Test Location"
```

### Update Memory

```bash
curl -X POST http://localhost:4321/api/memory \
  -F "collection-id=507f1f77bcf86cd799439011" \
  -F "item-id=66a1234567890abcdef12345" \
  -F "name=Updated Test Memory" \
  -F "memory=This is an updated test memory"
```

---

*Last Updated: 2024*
*Part of memory-form project*
