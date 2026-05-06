# IM SDK - AI Coding Agent Instructions

## Project Overview
TypeScript-based IM (Instant Messaging) SDK library with complete type definitions, event-driven architecture, and Docker support. This is a **library project**, not a standalone application.

## Architecture & Key Components

### Manager-Based Architecture
Five core managers coordinated by `IMClient` (Facade pattern):
- **IMClient** (`src/core/IMClient.ts`) - Main entry point, coordinates all managers
- **MessageManager** - Message CRUD, search, pagination
- **ConversationManager** - Private chats, groups, channels
- **ConnectionManager** - WebSocket lifecycle, auto-reconnect, heartbeat
- **UserManager** - User state, online status tracking

All managers extend `EventEmitter` from `eventemitter3` for event-driven communication.

### Type System (`src/types/index.ts`)
Comprehensive TypeScript types cover all domain entities. Key patterns:
- Enums for fixed states: `UserStatus`, `MessageType`, `ConnectionStatus`, `EventType`
- Interfaces for data structures: `Message`, `Conversation`, `User`
- Adapter interfaces for extensibility: `StorageAdapter`, `EncryptionAdapter`

## Critical Development Workflows

### Building & Testing
```bash
npm run build          # Compile TypeScript (must succeed before Docker build)
npm run dev            # Watch mode for development
npm run start:test     # Launch WebSocket test server on port 3000
```

### Docker Development
**Important**: Dockerfile runs `server/test-server.js` (NOT `dist/index.js`) because this is a library.
```bash
npm run docker:run     # Starts im-sdk-app + Redis containers
docker-compose logs im-sdk  # View server logs
```

### TypeScript Compilation Gotchas
1. **Unused parameters**: Prefix with `_` (e.g., `_key: string`) to satisfy `noUnusedParameters`
2. **Browser APIs in Node**: `localStorage` requires `declare const localStorage: any;` for dual-environment compatibility
3. **Unused imports**: Remove completely - TypeScript strict mode flags them as errors

## Project-Specific Conventions

### Event Naming Pattern
Events use colon-separated namespaces: `message:received`, `user:status:changed`, `conversation:created`
```typescript
// Event emission in managers
this.emit(EventType.MessageReceived, { message, timestamp: new Date() });

// IMClient proxies all manager events via wildcard listener
this.messageManager.on('*', (event, ...args) => this.emit(event, ...args));
```

### Manager Getter Methods
IMClient exposes managers via getters for advanced use cases:
```typescript
const msgMgr = imClient.getMessageManager();
const convMgr = imClient.getConversationManager();
```

### UUID Generation
Use `uuid` library's `v4` function consistently:
```typescript
import { v4 as uuid } from 'uuid';
const id = uuid(); // Generate unique IDs for messages, conversations
```

### Adapter Pattern for Cross-Environment
`StorageAdapter` and `EncryptionAdapter` enable runtime environment flexibility:
- **Browser**: `LocalStorageAdapter` (checks `typeof localStorage`)
- **Node.js**: `MemoryStorageAdapter`
- **Encryption**: `AESEncryptionAdapter` (Base64 placeholder) or `NoEncryptionAdapter`

## Testing Infrastructure

### Test Server (`server/test-server.js`)
Node.js WebSocket server for integration testing:
- Serves static files from `public/` (HTML test page)
- WebSocket on same port (3000)
- Message types: `auth:login`, `message:send`, `ping/pong`, broadcasts

### Test Page (`public/index.html` + `client.js`)
Visual testing UI with mock client implementation. Real SDK usage requires bundling (Webpack/Rollup).

## npm Configuration

### China Mirror Acceleration
`.npmrc` configured with `registry=https://registry.npmmirror.com` for fast dependency installation in China. Docker build explicitly uses this registry:
```dockerfile
RUN npm ci --registry https://registry.npmmirror.com
```

## Integration Points

### WebSocket Message Protocol
```typescript
// Client -> Server
{ type: 'message:send', payload: Message }
{ type: 'auth:login', payload: { userId, token } }

// Server -> Client  
{ type: 'message:received', payload: Message }
{ type: 'auth:login:success', payload: { userId, username } }
```

### ConnectionManager Lifecycle
1. `connect()` - Establishes WebSocket, starts heartbeat
2. Auto-reconnect on close (exponential backoff, max 10 attempts)
3. `send()` - JSON-stringifies payloads
4. `disconnect()` - Cleans up timers, closes socket

## When Adding New Features

1. **New Manager**: Extend `EventEmitter`, integrate in `IMClient` constructor
2. **New Type**: Add to `src/types/index.ts`, export from `src/index.ts`
3. **New Event**: Add to `EventType` enum, document in README event list
4. **Cross-environment code**: Check `typeof window !== 'undefined'` or use adapters
5. **Docker changes**: Test both `npm run build` locally AND `docker-compose up --build`

## Common Pitfalls

- **Docker build failures**: Always run `npm run build` locally first to catch TypeScript errors
- **localStorage errors**: Node.js environment doesn't have `localStorage` - use runtime checks
- **Event listener leaks**: Call `removeAllListeners()` in `destroy()` methods
- **Authentication state**: Most methods require `userManager.getCurrentUser()` to exist
