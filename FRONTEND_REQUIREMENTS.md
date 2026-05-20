# FURPMS - Frontend Requirements & Role Specifications
**FPT University Research Project Management System**

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [4 User Roles & Portals](#4-user-roles--portals)
3. [Role 1: Faculty/PI (Giảng viên)](#role-1-facultypi-giảng-viên)
4. [Role 2: Review Committee (Hội đồng phản biện)](#role-2-review-committee-hội-đồng-phản-biện)
5. [Role 3: Staff (Cán bộ quản lý)](#role-3-staff-cán-bộ-quản-lý)
6. [Role 4: Administrator (Quản trị viên)](#role-4-administrator-quản-trị-viên)
7. [Current Implementation Status](#current-implementation-status)
8. [Missing Features to Implement](#missing-features-to-implement)

---

## 🎯 System Overview

FURPMS là hệ thống quản lý đề xuất nghiên cứu cho Đại học FPT, phục vụ đồ án tốt nghiệp SEP490.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Tailwind CSS v4
- Backend: .NET Core Web API
- Database: SQL Server
- AI Integration: Google Gemini API, OpenAI Embeddings
- Meeting: Google Meet API

**Core Workflow:**
1. Faculty nộp đề xuất → 2. Admin/Staff assign reviewers → 3. Review Committee chấm điểm (có AI trợ giúp) → 4. Committee meeting → 5. Approve/Reject

---

## 🎭 4 User Roles & Portals

| Role | Vietnamese | Portal URL | Main Responsibilities |
|------|-----------|------------|----------------------|
| **Administrator** | Quản trị viên hệ thống | `/admin` | Quản lý users, phân quyền, cấu hình hệ thống, kiểm duyệt |
| **Staff** | Cán bộ quản lý | `/staff` | Quản lý meetings, assign reviewers, budget monitoring, AI moderation |
| **Faculty** | Giảng viên/PI | `/faculty` | Nộp đề xuất, báo cáo tiến độ, tham gia họp bảo vệ |
| **Review Committee** | Hội đồng phản biện | `/reviewer` | Chấm điểm đề xuất, AI summary, nhận xét, tham gia họp |

---

## 🎓 Role 1: Faculty/PI (Giảng viên)

### Dashboard Overview
**URL:** `/faculty`

**Màn hình chính khi login:**
```
┌─────────────────────────────────────────────────────────────┐
│  Xin chào, Dr. Nguyễn Văn A                                 │
│  Faculty Portal                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 My Proposals Summary                                    │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ Submitted│Under Review│ Approved │ Rejected │            │
│  │    3     │     2      │    8     │    1     │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                              │
│  ⚠️  Upcoming Deadlines & Milestones                        │
│  • Literature Review - Due: 20/05/2026 (2 days)            │
│  • Data Collection - Due: 15/06/2026 (OVERDUE!)            │
│                                                              │
│  📅 Upcoming Defense Meetings                               │
│  • AI Chatbot Review - 18/05/2026 14:00                    │
│    [Join Google Meet] button                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

#### 1. **My Proposals List** (Danh sách đề xuất)
```tsx
// Component: ProposalsList
interface Proposal {
  id: number;
  title: string;
  category: string; // AI & ML, IoT, Blockchain, Cloud, Cybersecurity
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Revision Required';
  score: number | null; // 0-50
  submittedDate: Date;
  deadline: Date;
  version: number; // v1, v2, v3...
}
```

**UI Requirements:**
- Table/Grid view với filters (status, category, date range)
- Color-coded status badges:
  - `Submitted`: Blue
  - `Under Review`: Yellow
  - `Approved`: Green
  - `Rejected`: Red
  - `Revision Required`: Orange
- Sort by: date, score, status

#### 2. **Submit New Proposal** (Nộp đề xuất mới)
**Button:** "Nộp đề xuất mới" → Opens modal/page

**Form Fields:**
```tsx
interface ProposalForm {
  title: string;              // Max 500 chars
  description: string;        // Rich text editor
  category: string;           // Dropdown: AI & ML, IoT, Blockchain, Cloud, Cybersecurity
  budgetAmount: number;       // VND, min 1,000,000
  durationMonths: number;     // 3-36 months
  files: File[];              // Upload PDF, DOCX (max 10MB per file)
  reviewDeadline: Date;       // Ngày deadline để review committee chấm
}
```

**Validation:**
- Title required, max 500 chars
- Description required, min 100 words
- Budget ≥ 1,000,000 VND
- Duration 3-36 months
- At least 1 file required (Proposal document)
- Review deadline must be future date

**Success Flow:**
1. Submit form → API creates proposal with status `Submitted`
2. Show success message: "Đề xuất đã được nộp thành công!"
3. Redirect to proposal detail page
4. Backend auto-generates proposal embedding for semantic search (background job)

#### 3. **Milestone Tracking** (Theo dõi tiến độ)
**Tab:** "Progress Reports" / "Báo cáo tiến độ"

```tsx
interface Milestone {
  id: number;
  proposalId: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  progressPercent: number; // 0-100
}
```

**UI Requirements:**
- Gantt chart visualization (use library: `react-gantt-chart` or similar)
- Timeline view showing all milestones
- Progress bars for each milestone
- Ability to update progress % and status
- Auto-mark as `Overdue` if endDate < today && status != Completed

#### 4. **Join Defense Meeting** (Tham gia họp bảo vệ)
**Button:** "Tham gia họp" / "Join Google Meet"

**Flow:**
1. Click button → API returns Google Meet link
2. Open link in new tab → redirect to meet.google.com/xxx-yyyy-zzz
3. PI joins video call with review committee

**API Endpoint:**
```
GET /api/meetings/{meetingId}/join
Response: { meetingLink: "https://meet.google.com/abc-defg-hij" }
```

#### 5. **Semantic Search** (Tìm kiếm ngữ nghĩa)
**Feature:** Search bar với AI-powered semantic search

**UI:**
```
┌──────────────────────────────────────────────────────┐
│  🔍 Tìm kiếm đề xuất...                              │
│  [Input: "chatbot giáo dục AI"]            [Search]  │
└──────────────────────────────────────────────────────┘

Results:
• AI-Powered Chatbot for Education (Similarity: 92%)
• Machine Learning for Student Performance (85%)
• Educational Data Mining System (78%)
```

**Technical:**
- Input query → API converts to vector embedding via OpenAI
- Backend calculates cosine similarity with stored proposal embeddings
- Return top-K results sorted by similarity score
- Highlight matched concepts

**API Endpoint:**
```
POST /api/search/semantic
Body: {
  query: "chatbot giáo dục AI",
  topK: 10,
  filters: { category: "AI & ML" }
}
Response: {
  results: [
    { proposalId: 1, title: "...", similarity: 0.92, matchedConcepts: [...] }
  ]
}
```

---

## 🎯 Role 2: Review Committee (Hội đồng phản biện)

### Dashboard Overview
**URL:** `/reviewer`

**Màn hình chính khi login:**
```
┌─────────────────────────────────────────────────────────────┐
│  Xin chào, Dr. Trần Thị B                                   │
│  Review Committee Portal                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Assigned Reviews                                        │
│  ┌──────────┬──────────┬──────────┐                       │
│  │ Pending  │In Progress│Completed │                       │
│  │    3     │     2     │    12    │                       │
│  └──────────┴──────────┴──────────┘                       │
│                                                              │
│  ⏰ Urgent Deadlines                                        │
│  • AI Chatbot Proposal - Deadline: 25/05/2026 (3 days)    │
│  • IoT Campus System - Deadline: 28/05/2026 (6 days)      │
│                                                              │
│  📅 Upcoming Committee Meetings                             │
│  • Review Committee Session - 18/05/2026 14:00             │
│    [Join Google Meet]                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

#### 1. **Review Assignment List** (Danh sách bài chấm)
```tsx
interface ReviewAssignment {
  reviewId: number;
  proposalId: number;
  proposalTitle: string;
  pi: string; // Principal Investigator name
  category: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  deadline: Date;
  assignedDate: Date;
}
```

**UI Requirements:**
- Table view với status filters
- Sort by: deadline (urgent first), priority, assigned date
- Color-coded priority badges
- Click row → opens review interface

#### 2. **AI Summary Generation** (Tạo tóm tắt AI)
**Button:** "Generate AI Summary" → Calls Gemini API

**Flow:**
1. Reviewer opens proposal to review
2. Click "Generate AI Summary" button
3. Loading spinner shows "AI đang phân tích đề xuất..."
4. API sends proposal content to Gemini API
5. Response displays in a card:

```
┌──────────────────────────────────────────────────────────┐
│  🤖 AI Summary (Generated by Gemini)                     │
├──────────────────────────────────────────────────────────┤
│  This proposal presents a novel approach to educational  │
│  chatbots using transformer architecture. Methodology is │
│  sound with clear milestones. Budget allocation appears  │
│  reasonable for the proposed scope.                      │
│                                                           │
│  Main concerns: Tight 12-month timeline for training and │
│  deployment phases. Recommend adding contingency for     │
│  model training compute costs.                           │
│                                                           │
│  [Edit] [Use as Template] [Regenerate]                   │
└──────────────────────────────────────────────────────────┘
```

**API Integration:**
```
POST /api/reviews/{reviewId}/ai-summary
Response: {
  aiSummary: "...",
  aiComments: "...",
  confidence: 0.85
}
```

**Backend calls Gemini API:**
```csharp
var prompt = $@"
Analyze this research proposal and provide:
1. Summary (2-3 sentences)
2. Constructive feedback

Title: {proposal.Title}
Category: {proposal.Category}
Budget: {proposal.BudgetAmount:N0} VND
Duration: {proposal.DurationMonths} months
Description: {proposal.Description}

Respond in JSON: {{ ""summary"": ""..."", ""comments"": ""..."" }}
";
```

#### 3. **Scoring Rubric** (Form chấm điểm)
**Form:** 5 criteria × 10 points = 50 max

```tsx
interface ReviewScores {
  innovation: number;        // 0-10: Tính mới & độc đáo
  methodology: number;       // 0-10: Phương pháp nghiên cứu
  feasibility: number;       // 0-10: Tính khả thi & timeline
  budgetJustification: number; // 0-10: Lý do ngân sách
  expectedImpact: number;    // 0-10: Tác động dự kiến
}
```

**UI Component:**
```tsx
<RubricScoreForm>
  <ScoreCriterion
    label="Innovation & Originality"
    description="Tính mới và độc đáo của ý tưởng"
    maxScore={10}
    value={scores.innovation}
    onChange={(val) => setScores({ ...scores, innovation: val })}
  />
  {/* Repeat for 5 criteria */}
  
  <TotalScore>{scores.total} / 50</TotalScore>
</RubricScoreForm>
```

**Validation:**
- Each score 0-10
- All 5 criteria required
- Total auto-calculated
- Cannot submit review without filling all scores

#### 4. **AI Suggested Comments** (Gợi ý nhận xét AI)
**Feature:** Display AI-generated comments for reviewer to edit

```
┌──────────────────────────────────────────────────────────┐
│  💬 Review Comments                                       │
├──────────────────────────────────────────────────────────┤
│  [Tabs: Your Comments | AI Suggestions]                  │
│                                                           │
│  AI Suggestions:                                          │
│  ✓ "Strong theoretical foundation with clear research    │
│     questions."                                           │
│  ✓ "Consider extending timeline for user testing phase." │
│  ✓ "Recommend adding contingency for compute costs."     │
│                                                           │
│  [Copy to Your Comments] [Edit & Use]                    │
│                                                           │
│  Your Comments:                                           │
│  <TextArea>                                               │
│    The methodology is well-structured...                 │
│  </TextArea>                                              │
│                                                           │
│  [Save Draft] [Submit Review]                            │
└──────────────────────────────────────────────────────────┘
```

#### 5. **Final Decision** (Quyết định cuối cùng)
**Radio Buttons:**
- ⭕ Approve (Đồng ý duyệt)
- ⭕ Reject (Từ chối)

**Flow:**
1. Fill all rubric scores
2. Write comments (can use AI suggestions)
3. Select Approve/Reject
4. Click "Submit Review"
5. Status changes from `In Progress` → `Completed`
6. Proposal status updates based on committee consensus

---

## 🏢 Role 3: Staff (Cán bộ quản lý)

### Dashboard Overview
**URL:** `/staff`

**Màn hình chính khi login:**
```
┌─────────────────────────────────────────────────────────────┐
│  Xin chào, Phạm Thị D                                       │
│  Staff Management Portal                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 System Overview                                         │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │ Proposals│  Reviews │ Meetings │  Users   │            │
│  │   245    │ 142/245  │    12    │    89    │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                              │
│  ⚠️  Budget Alerts (3 projects need attention)             │
│  • AI Chatbot: 92% utilization (OVER BUDGET!)             │
│  • IoT Campus: 85% utilization (WARNING)                   │
│  • Blockchain: 78% utilization (OK)                        │
│                                                              │
│  📅 Upcoming Meetings (12 scheduled)                        │
│  • AI Chatbot Review - 18/05/2026 14:00 (5 attendees)     │
│    [Manage] [Generate Meet Link] [Send Invites]           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

#### 1. **Meeting Management** (Quản lý lịch họp)
**Section:** "Meeting Setup & Scheduling"

**Create New Meeting Form:**
```tsx
interface MeetingForm {
  proposalId: number;         // Select from dropdown
  meetingTitle: string;       // Auto-filled: "Review Committee - {ProposalTitle}"
  scheduledDate: Date;        // Date picker
  scheduledTime: string;      // Time picker (HH:mm)
  reviewerIds: number[];      // Multi-select, min 3 reviewers
  autoGenerateMeet: boolean;  // Checkbox (default: true)
  notes: string;              // Optional meeting notes
}
```

**Auto-Generate Google Meet Flow:**
1. Fill meeting form
2. Check "Auto-generate Google Meet link" ✅
3. Click "Create Meeting"
4. Backend calls Google Meet API:
   ```csharp
   var meetLink = await GoogleMeetService.CreateMeeting(meeting);
   // Returns: https://meet.google.com/abc-defg-hij
   ```
5. Meeting link saved to DB
6. Email invites sent to all attendees (PI + reviewers)
7. Event added to Google Calendar of all participants

**Meeting List Table:**
```
┌───────────────────────────────────────────────────────────────┐
│ Proposal          │ Date       │ Time  │ Attendees │ Status   │
├───────────────────────────────────────────────────────────────┤
│ AI Chatbot        │ 18/05/2026 │ 14:00 │ 5         │ Scheduled│
│ IoT Campus        │ 20/05/2026 │ 09:30 │ 4         │ Scheduled│
│ Blockchain Creds  │ 22/05/2026 │ 15:00 │ 6         │ Scheduled│
│                   │            │       │           │          │
│ [Edit] [Cancel] [Generate Meet Link] [Send Reminder]         │
└───────────────────────────────────────────────────────────────┘
```

#### 2. **Reviewer Assignment** (Phân công phản biện)
**Section:** "Assign Reviewers to Proposals"

**Assign Flow:**
1. Select proposal from list
2. View available reviewers with workload info:
   ```
   ┌──────────────────────────────────────────────────────┐
   │ Available Reviewers                                  │
   ├──────────────────────────────────────────────────────┤
   │ ☐ Dr. Trần Thị B (8 assigned, 5 completed, 3 pending)│
   │   Expertise: AI, Machine Learning                   │
   │   Completion Rate: 63%                              │
   │                                                      │
   │ ☐ Dr. Lê Văn C (12 assigned, 10 completed, 2 pending)│
   │   Expertise: IoT, Cloud Computing                   │
   │   Completion Rate: 83% ⭐                           │
   │                                                      │
   │ ☐ Dr. Phạm Văn D (6 assigned, 3 completed, 3 pending)│
   │   Expertise: Blockchain, Security                   │
   │   Completion Rate: 50%                              │
   │                                                      │
   │ [Assign Selected] [Send Email Invitation]           │
   └──────────────────────────────────────────────────────┘
   ```
3. Select 3-5 reviewers (recommended: choose those with lower workload)
4. Set deadline for review completion
5. Click "Assign & Notify"
6. System sends email to reviewers with proposal details + deadline

**Validation:**
- Minimum 2 reviewers required (recommended 3-5)
- Cannot assign PI of proposal as reviewer
- Warn if reviewer workload > 15 assignments

#### 3. **Budget Monitoring** (Giám sát ngân sách)
**Section:** "Budget Alerts & Analytics"

**Budget Status Colors:**
- 🟢 Green (0-80%): On Track
- 🟡 Yellow (80-100%): Warning
- 🔴 Red (>100%): Over Budget

**Alert Table:**
```
┌───────────────────────────────────────────────────────────────┐
│ Project           │ PI          │ Allocated  │ Spent │ Status │
├───────────────────────────────────────────────────────────────┤
│ AI Chatbot        │ Dr. Nguyễn A│ 50M VND    │ 46M   │ 🔴 92% │
│ IoT Campus        │ Dr. Trần B  │ 80M VND    │ 68M   │ 🟡 85% │
│ Blockchain Creds  │ Dr. Lê C    │ 40M VND    │ 31M   │ 🟢 78% │
│                                                                │
│ [View Details] [Approve Extension] [Send Alert Email]        │
└───────────────────────────────────────────────────────────────┘
```

**Budget Detail View:**
```
Project: AI Chatbot for Education
Total Budget: 50,000,000 VND
Total Spent: 46,000,000 VND (92%)

Breakdown by Category:
┌────────────────────────────────────────────┐
│ Personnel:         20M  →  18M  (90%)  🟡 │
│ Equipment:         15M  →  15M (100%)  🟡 │
│ Research Materials: 8M  →   8M (100%)  🟡 │
│ Travel:            3M  →   3M (100%)  🟡 │
│ Publication:       2M  →   2M (100%)  🟡 │
│ Contingency:       2M  →   0M   (0%)  🟢 │
└────────────────────────────────────────────┘

⚠️ Alert: Budget utilization at 92%. Consider approving 
   contingency fund usage or requesting extension.

[Approve Contingency Use] [Request Budget Extension]
```

#### 4. **AI Moderation Queue** (Kiểm duyệt AI)
**Section:** "Review AI-Generated Content"

**Purpose:** Staff reviews and approves AI-generated summaries/comments before they're finalized

**Queue Table:**
```
┌───────────────────────────────────────────────────────────────┐
│ Proposal              │ Reviewer  │ Content Type │ Status     │
├───────────────────────────────────────────────────────────────┤
│ ML Student Prediction │ Dr. Lê C  │ AI Summary   │ Pending    │
│ Cloud Learning        │ Dr. Trần B│ AI Comments  │ Approved ✓ │
│ Cybersecurity FW      │ Dr. Phạm D│ AI Summary   │ Needs Edit │
│                                                                │
│ [View] [Approve] [Request Revision] [Reject]                 │
└───────────────────────────────────────────────────────────────┘
```

**Review AI Content Modal:**
```
┌──────────────────────────────────────────────────────────┐
│  AI-Generated Summary Review                             │
├──────────────────────────────────────────────────────────┤
│  Proposal: Machine Learning for Student Performance      │
│  Reviewer: Dr. Lê Văn C                                  │
│  Generated: 15/05/2026 14:23                             │
│                                                           │
│  AI Summary:                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ This proposal leverages ML algorithms to predict   │ │
│  │ student outcomes. Methodology is solid with clear  │ │
│  │ validation approach. Main concern: dataset size... │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  Quality Check:                                           │
│  ☑ Factually accurate                                    │
│  ☑ Professionally worded                                 │
│  ☑ Constructive tone                                     │
│  ☐ Contains inappropriate content                        │
│                                                           │
│  Staff Notes (optional):                                  │
│  <TextArea>                                               │
│    Consider adding note about ethics review...           │
│  </TextArea>                                              │
│                                                           │
│  [Approve] [Send Back for Revision] [Reject]            │
└──────────────────────────────────────────────────────────┘
```

#### 5. **Resource Management** (Quản lý tài nguyên)
**Features:**
- Approve budget allocations
- Grant lab access permissions
- Approve project timeline extensions (max +50% original duration)

**Extension Request Form:**
```
┌──────────────────────────────────────────────────────────┐
│  Project Extension Request                               │
├──────────────────────────────────────────────────────────┤
│  Proposal: AI Chatbot for Education                      │
│  PI: Dr. Nguyễn Văn A                                    │
│  Original Duration: 12 months                            │
│  Requested Extension: +6 months                          │
│  Reason: Dataset collection taking longer than expected  │
│                                                           │
│  Budget Impact: None (within existing budget)            │
│                                                           │
│  ⚠️ Note: Extension is 50% of original duration (MAX)    │
│                                                           │
│  [Approve] [Request More Info] [Deny]                    │
└──────────────────────────────────────────────────────────┘
```

---

## 👑 Role 4: Administrator (Quản trị viên)

### Dashboard Overview
**URL:** `/admin`

**Màn hình chính khi login:**
```
┌─────────────────────────────────────────────────────────────┐
│  Administrator Dashboard                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🌍 System-Wide Statistics                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │Total Users│Proposals │ Reviews  │ Meetings │            │
│  │    89    │   245    │   142    │    12    │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                              │
│  📊 Charts: Submission rates, Category breakdown, etc.      │
│                                                              │
│  🔔 Recent Activity Logs (Last 100 actions)                 │
│  • 15/05/2026 14:23 - Dr. Nguyễn A submitted proposal      │
│  • 15/05/2026 13:45 - Staff assigned 3 reviewers           │
│  • 15/05/2026 12:10 - Dr. Trần B completed review          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

#### 1. **User Management** (Quản lý người dùng)
**Section:** "Manage System Users"

**User Table (Grid View):**
```
┌─────────────────────────────────────────────────────────────────┐
│ ID │ Name         │ Email           │ Role    │ Dept    │ Status │
├─────────────────────────────────────────────────────────────────┤
│ 1  │ Nguyễn Văn A │ nguyena@fpt.edu │ Faculty │ AI&DS   │ Active │
│ 2  │ Trần Thị B   │ tranb@fpt.edu   │ Review  │ SE      │ Active │
│ 3  │ Lê Văn C     │ lec@fpt.edu     │ Review  │ CS      │ Inactive│
│                                                                   │
│ [Create User] [Import CSV] [Export]                             │
└─────────────────────────────────────────────────────────────────┘
```

**Create/Edit User Form:**
```tsx
interface UserForm {
  fullName: string;
  email: string;             // Must be @fpt.edu.vn
  phoneNumber: string;
  role: 'Administrator' | 'Staff' | 'Faculty' | 'Review Committee';
  department: string;        // SE, AI&DS, CS, IS, Cybersecurity
  status: 'Active' | 'Inactive';
  password: string;          // Only for create, hashed in DB
}
```

**Role Assignment:**
- Dropdown with 4 options
- Admin can change any user's role
- Changing role triggers audit log entry

**Deactivate User:**
- Change status from `Active` → `Inactive`
- User cannot login but data preserved
- Can be reactivated later

#### 2. **System Configuration** (Cấu hình hệ thống)
**Section:** "Research Cycles & Settings"

**Define Research Cycle:**
```
┌──────────────────────────────────────────────────────────┐
│  Research Cycle Configuration                            │
├──────────────────────────────────────────────────────────┤
│  Cycle Name: Spring 2026 Research Round                  │
│  Submission Period:                                       │
│    Start Date: 01/03/2026                                │
│    End Date:   31/05/2026                                │
│                                                           │
│  Review Period:                                           │
│    Start Date: 01/06/2026                                │
│    End Date:   30/06/2026                                │
│                                                           │
│  Total Budget Allocation: 5,000,000,000 VND              │
│  Max per Proposal: 100,000,000 VND                       │
│                                                           │
│  [Save Cycle] [Publish to System]                        │
└──────────────────────────────────────────────────────────┘
```

**Global Settings:**
- Default review deadline (e.g., 2 weeks after assignment)
- Max file upload size (default 10MB)
- Email notification templates
- AI moderation settings (auto-approve threshold)

#### 3. **Comment Moderation** (Kiểm duyệt bình luận)
**Section:** "Discussion Thread Moderation"

**Features:**
- View all comments across all proposals
- Pin important comments (shows at top of thread)
- Unpin comments
- Delete inappropriate comments (with reason logged)

**Pin Comment Flow:**
```
Comment by Dr. Trần B on "AI Chatbot" proposal:
"This approach aligns with our university's strategic goals 
 for digital transformation."

[Pin Comment] ← Admin clicks this
→ Comment moves to top of discussion thread
→ Shows "📌 Pinned by Admin" badge
→ All users see it first when viewing discussion
```

**Pinned Comment Display:**
```
┌──────────────────────────────────────────────────────────┐
│  📌 Pinned Comments                                       │
├──────────────────────────────────────────────────────────┤
│  📌 Dr. Trần B - 14/05/2026                              │
│  This approach aligns with our university's strategic... │
│  👍 12 likes                                              │
│  [Unpin] [Edit] [Delete]                                 │
└──────────────────────────────────────────────────────────┘
```

#### 4. **Activity Logs** (Nhật ký hoạt động)
**Section:** "System Audit Trail"

**Log Table:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Time            │ User       │ Action            │ Entity      │
├─────────────────────────────────────────────────────────────────┤
│ 15/05 14:23:45  │ Dr. Nguyễn │ submitted_proposal│ Proposal #45│
│ 15/05 14:20:12  │ Admin      │ assigned_reviewer │ Review #120 │
│ 15/05 13:15:30  │ Dr. Trần   │ completed_review  │ Review #118 │
│ 15/05 12:45:00  │ Staff      │ created_meeting   │ Meeting #8  │
│                                                                  │
│ [Filter by User] [Filter by Action] [Export CSV]               │
└─────────────────────────────────────────────────────────────────┘
```

**Filters:**
- Date range
- User
- Action type (created, updated, deleted, etc.)
- Entity type (Proposal, Review, Meeting, User)

**Export:**
- CSV format for compliance reports
- Include IP address, User-Agent for security audit

---

## ✅ Current Implementation Status

### ✅ Completed Features

#### Login & Authentication
- ✅ Login page with 4 demo accounts
- ✅ Role-based routing (admin, staff, faculty, reviewer)
- ✅ Logout functionality (clean, no reload)

#### Admin Portal (`/admin`)
- ✅ Dashboard with stats cards
- ✅ Bar chart (Submission rates)
- ✅ Pie chart (Budget by category)
- ✅ Recent activities table
- ✅ User Management component
- ✅ Proposal Management component
- ✅ Meeting Scheduler component
- ✅ Budget Tracker component
- ✅ Document Repository component
- ✅ Discussion Threads component
- ✅ Timeline Tracker component
- ✅ Activity Log component
- ✅ Advanced Search component
- ✅ Reports Export component
- ✅ Notifications panel

#### Staff Portal (`/staff`) ⭐ NEWLY ADDED
- ✅ Dashboard with overview stats
- ✅ Budget alerts with color coding
- ✅ Upcoming meetings list
- ✅ Reviewer assignment table
- ✅ AI moderation queue
- ✅ Reports & analytics charts
- ✅ Meeting management (reuses MeetingScheduler)
- ✅ Budget monitoring (reuses BudgetTracker)
- ✅ Activity log (reuses ActivityLog)

#### Faculty Portal (`/faculty`)
- ✅ Proposal submission form (multi-step)
- ✅ My submissions list
- ✅ File upload functionality
- ✅ Status tracking

#### Reviewer Portal (`/reviewer`)
- ✅ Review interface with rubric scores
- ✅ AI summary generation (UI mockup)
- ✅ Reviewer dashboard
- ✅ Proposal list assigned to reviewer

### ❌ Missing Features to Implement

#### Faculty Portal
- ❌ **Milestone tracking Gantt chart**
  - Component: `<MilestoneGanttChart />`
  - Library: `react-gantt-chart` or `gantt-task-react`
  - Features: progress bars, overdue alerts, drag-to-reschedule
  
- ❌ **Google Meet Join button integration**
  - API call to get meeting link
  - Open in new tab on click
  
- ❌ **Semantic Search bar**
  - Component: `<SemanticSearchBar />`
  - API: `POST /api/search/semantic`
  - UI: Display similarity scores, matched concepts

- ❌ **Progress report submission**
  - Form to update milestone progress %
  - File upload for progress reports

#### Reviewer Portal
- ❌ **AI Summary Generation - Real API Integration**
  - Currently mockup, need actual Gemini API call
  - Loading state, error handling
  - Edit & save AI summary
  
- ❌ **AI Suggested Comments - Display & Edit**
  - Show AI comments in separate tab
  - "Copy to Your Comments" button
  - "Edit & Use" button

- ❌ **Review submission validation**
  - Enforce all 5 rubric scores filled
  - Require decision (Approve/Reject)
  - Cannot submit incomplete review

#### Staff Portal
- ❌ **Google Meet Link Auto-Generation**
  - Backend integration with Google Meet API
  - "Generate Meet Link" button
  - Display generated link in table
  
- ❌ **Send Email Invitations**
  - Email templates for meeting invites
  - Send to all attendees (PI + reviewers)
  - Add to Google Calendar
  
- ❌ **Budget extension approval workflow**
  - Form to approve/deny extension requests
  - Validation: max +50% of original duration
  - Email notifications

- ❌ **AI Moderation detailed view**
  - Modal to view full AI content
  - Quality checklist
  - Approve/Reject/Request Revision actions

#### Admin Portal
- ❌ **Research Cycle Configuration**
  - Form to define submission/review periods
  - Budget allocation settings
  - Publish to system

- ❌ **CSV Import/Export Users**
  - Import users from CSV file
  - Export user list to CSV
  - Validation & error handling

---

## 🎨 Design System Notes

### Color Palette (Tailwind Classes)
```
Primary:   bg-blue-600, text-blue-600
Success:   bg-green-600, text-green-600
Warning:   bg-yellow-500, text-yellow-600
Danger:    bg-red-600, text-red-600
Info:      bg-purple-600, text-purple-600

Status Colors:
- Submitted:   bg-blue-100 text-blue-800
- Under Review: bg-yellow-100 text-yellow-800
- Approved:    bg-green-100 text-green-800
- Rejected:    bg-red-100 text-red-800
- Revision:    bg-orange-100 text-orange-800
```

### Typography
- Headings: `font-bold text-gray-800`
- Body text: `text-gray-700`
- Secondary text: `text-gray-500`
- Links: `text-blue-600 hover:text-blue-800`

### Components
- Cards: `bg-white rounded-xl shadow-sm border border-gray-100 p-6`
- Buttons: `px-4 py-2 rounded-lg font-medium transition`
- Tables: `border border-gray-200 rounded-xl overflow-hidden`

---

## 📦 Recommended Libraries

### Charts
```bash
pnpm add recharts
```
Already installed, used in AdminDashboard and StaffDashboard

### Gantt Chart (for Milestones)
```bash
pnpm add gantt-task-react
```
Or alternative: `react-gantt-chart`

### Rich Text Editor (for descriptions)
```bash
pnpm add @tiptap/react @tiptap/starter-kit
```

### Date/Time Pickers
```bash
pnpm add react-datepicker
```

### File Upload
```bash
pnpm add react-dropzone
```

---

## 🚀 Implementation Priority

### Phase 1 (High Priority) - Complete Missing Core Features
1. ✅ Staff Portal (DONE)
2. ❌ AI Summary real API integration (Reviewer)
3. ❌ Google Meet link generation (Staff/Faculty)
4. ❌ Semantic Search (Faculty)

### Phase 2 (Medium Priority) - Enhanced UX
5. ❌ Milestone Gantt chart (Faculty)
6. ❌ AI Moderation detailed view (Staff)
7. ❌ Email notifications (Staff)
8. ❌ Review validation (Reviewer)

### Phase 3 (Low Priority) - Admin Features
9. ❌ Research Cycle config (Admin)
10. ❌ CSV Import/Export (Admin)
11. ❌ Budget extension workflow (Staff)

---

## 🧪 Demo Accounts

| Username | Password | Role | Portal |
|----------|----------|------|--------|
| admin | admin123 | Administrator | `/admin` |
| staff | staff123 | Staff | `/staff` |
| faculty | faculty123 | Faculty | `/faculty` |
| reviewer | reviewer123 | Review Committee | `/reviewer` |

---

## 📝 Notes for Frontend Team

1. **API Integration:**
   - All API endpoints are defined in `DATABASE_DESIGN.md`
   - Use `fetch` or `axios` for API calls
   - Base URL: `https://api.furpms.fpt.edu.vn/api/v1` (production)
   - Dev URL: `http://localhost:5000/api/v1`

2. **State Management:**
   - Current: React `useState` and prop drilling
   - Consider: Zustand or React Context for global state
   - Auth state should be in App.tsx or context

3. **Form Validation:**
   - Use `react-hook-form` + `zod` for type-safe validation
   - Already installed: `react-hook-form@7.55.0`

4. **TypeScript:**
   - All components should be `.tsx`
   - Define interfaces for all data models
   - Use enums for status values

5. **Responsive Design:**
   - Mobile-first approach
   - Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
   - Test on mobile, tablet, desktop

6. **Accessibility:**
   - Use semantic HTML
   - Add `aria-label` to buttons/icons
   - Keyboard navigation support
   - Color contrast WCAG AA compliant

---

Đây là toàn bộ requirements chi tiết cho 4 portals. Team Frontend có thể bắt đầu implement theo priority order!
