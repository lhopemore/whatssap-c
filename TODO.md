# WhatsApp-2 Issues Fix Plan

## Steps:
1. [x] Delete duplicate app/lib/soupabaseClient.ts
2. [ ] Fix components/Sidebar.tsx: Remove duplicate useEffect/fetchChats, fix styled components/CSS, add chat list rendering with links to /chat/[id]
3. [ ] Fix app/chat/page.tsx: Remove malformed code, add auth guard, useParams for chat ID, fetch/display/send messages, realtime
4. [ ] Create app/chat/[id]/page.tsx: Dynamic chat page
5. [ ] Update any remaining imports, lint, test

**Progress:** Step 1 done, working on step 2 (Sidebar.tsx).
