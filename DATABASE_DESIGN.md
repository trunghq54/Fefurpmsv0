# FURPMS - Database Design & API Specification
**FPT University Research Project Management System**

## 📋 Table of Contents
1. [Database Schema](#database-schema)
2. [Entity Relationships](#entity-relationships)
3. [Enum Values](#enum-values)
4. [Business Rules](#business-rules)
5. [API Endpoints](#api-endpoints)
6. [SQL Server Scripts](#sql-server-scripts)

---

## 🗄️ Database Schema

### 1. Users Table
Quản lý tất cả người dùng trong hệ thống (Admin, Faculty, Reviewer, Student)

```sql
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(512) NOT NULL,
    PhoneNumber VARCHAR(20),
    Role VARCHAR(50) NOT NULL CHECK (Role IN ('Administrator', 'Staff', 'Faculty', 'Review Committee')),
    Department NVARCHAR(255),
    Status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    LastLoginAt DATETIME2,
    
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Role (Role),
    INDEX IX_Users_Status (Status),
    INDEX IX_Users_Department (Department)
);
```

**Fields:**
- `UserId`: Primary key, auto-increment
- `FullName`: Họ tên đầy đủ (Vietnamese support)
- `Email`: Unique, dùng để login
- `PasswordHash`: Bcrypt/SHA256 hashed password
- `PhoneNumber`: Optional
- `Role`: `Administrator` | `Staff` | `Faculty` | `Review Committee`
- `Department`: `Software Engineering` | `AI & Data Science` | `Computer Science` | `Information Systems` | `Cybersecurity`
- `Status`: `Active` | `Inactive`
- `CreatedAt`: Account creation timestamp
- `UpdatedAt`: Last profile update
- `LastLoginAt`: Last login tracking

---

### 2. Proposals Table
Quản lý các đề xuất nghiên cứu

```sql
CREATE TABLE Proposals (
    ProposalId INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(500) NOT NULL,
    Description NTEXT NOT NULL,
    PrincipalInvestigatorId INT NOT NULL,
    Category VARCHAR(100) NOT NULL CHECK (Category IN ('AI & ML', 'IoT', 'Blockchain', 'Cloud Computing', 'Cybersecurity')),
    BudgetAmount BIGINT NOT NULL,
    DurationMonths INT NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (Status IN ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Revision Required')),
    Priority VARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('High', 'Medium', 'Low')),
    TotalScore DECIMAL(5,2) NULL,
    SubmittedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ReviewDeadline DATE,
    ApprovalDate DATETIME2 NULL,
    Version INT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    
    CONSTRAINT FK_Proposals_PI FOREIGN KEY (PrincipalInvestigatorId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    
    INDEX IX_Proposals_Status (Status),
    INDEX IX_Proposals_PI (PrincipalInvestigatorId),
    INDEX IX_Proposals_Category (Category),
    INDEX IX_Proposals_SubmittedDate (SubmittedDate),
    INDEX IX_Proposals_Priority (Priority)
);
```

**Fields:**
- `ProposalId`: Primary key
- `Title`: Tên đề xuất (max 500 chars)
- `Description`: Mô tả chi tiết (unlimited text)
- `PrincipalInvestigatorId`: FK to Users (Faculty member)
- `Category`: AI & ML | IoT | Blockchain | Cloud Computing | Cybersecurity
- `BudgetAmount`: Số tiền đề xuất (VND, BIGINT for large amounts)
- `DurationMonths`: Thời gian thực hiện (months)
- `Status`: Submitted | Under Review | Approved | Rejected | Revision Required
- `Priority`: High | Medium | Low
- `TotalScore`: Điểm tổng từ reviews (0-50, nullable)
- `SubmittedDate`: Ngày nộp
- `ReviewDeadline`: Deadline để review committee chấm
- `ApprovalDate`: Ngày được approve (nullable)
- `Version`: Version tracking (v1, v2, v3...)

---

### 3. Reviews Table
Quản lý các đánh giá từ reviewer

```sql
CREATE TABLE Reviews (
    ReviewId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    ReviewerId INT NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'In Progress', 'Completed')),
    Priority VARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('High', 'Medium', 'Low')),
    Deadline DATE NOT NULL,
    TotalScore DECIMAL(5,2) NULL,
    AiSummary NTEXT NULL,
    AiComments NTEXT NULL,
    ReviewerComments NTEXT NULL,
    Decision VARCHAR(20) NULL CHECK (Decision IN ('Approve', 'Reject', NULL)),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Reviews_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Reviewer FOREIGN KEY (ReviewerId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT UQ_Reviews_ProposalReviewer UNIQUE (ProposalId, ReviewerId),
    
    INDEX IX_Reviews_Status (Status),
    INDEX IX_Reviews_Deadline (Deadline),
    INDEX IX_Reviews_Proposal (ProposalId),
    INDEX IX_Reviews_Reviewer (ReviewerId)
);
```

**Fields:**
- `ReviewId`: Primary key
- `ProposalId`: FK to Proposals
- `ReviewerId`: FK to Users (role = Review Committee)
- `Status`: Pending | In Progress | Completed
- `Priority`: High | Medium | Low
- `Deadline`: Ngày deadline phải hoàn thành review
- `TotalScore`: Tổng điểm (0-50), computed from ReviewScores
- `AiSummary`: AI-generated summary từ Gemini API
- `AiComments`: AI-suggested feedback
- `ReviewerComments`: Reviewer's own comments
- `Decision`: Approve | Reject | NULL (chưa quyết định)
- `CompletedAt`: Timestamp khi hoàn thành

---

### 4. ReviewScores Table
Chi tiết điểm theo từng tiêu chí đánh giá (Rubric)

```sql
CREATE TABLE ReviewScores (
    ReviewScoreId INT PRIMARY KEY IDENTITY(1,1),
    ReviewId INT NOT NULL,
    Criterion NVARCHAR(255) NOT NULL,
    MaxScore INT NOT NULL DEFAULT 10,
    Score DECIMAL(4,2) NOT NULL DEFAULT 0,
    Comments NTEXT NULL,
    
    CONSTRAINT FK_ReviewScores_Review FOREIGN KEY (ReviewId) REFERENCES Reviews(ReviewId) ON DELETE CASCADE,
    CONSTRAINT CHK_ReviewScores_Score CHECK (Score >= 0 AND Score <= MaxScore),
    
    INDEX IX_ReviewScores_Review (ReviewId)
);
```

**Rubric Criteria (5 categories × 10 points = 50 max):**
1. Innovation & Originality (0-10)
2. Methodology & Approach (0-10)
3. Feasibility & Timeline (0-10)
4. Budget Justification (0-10)
5. Expected Impact (0-10)

---

### 5. Meetings Table
Quản lý các buổi họp review committee

```sql
CREATE TABLE Meetings (
    MeetingId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    MeetingTitle NVARCHAR(500) NOT NULL,
    ScheduledDate DATE NOT NULL,
    ScheduledTime TIME NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled')),
    MeetingLink VARCHAR(500) NULL,
    AutoGenerateMeet BIT NOT NULL DEFAULT 0,
    Notes NTEXT NULL,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Meetings_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Meetings_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId) ON DELETE NO ACTION,
    
    INDEX IX_Meetings_Status (Status),
    INDEX IX_Meetings_ScheduledDate (ScheduledDate),
    INDEX IX_Meetings_Proposal (ProposalId)
);
```

**Fields:**
- `MeetingId`: Primary key
- `ProposalId`: FK to Proposals
- `MeetingTitle`: Tên meeting
- `ScheduledDate`: Ngày họp
- `ScheduledTime`: Giờ họp
- `Status`: Scheduled | Completed | Cancelled
- `MeetingLink`: Google Meet URL (auto-generated if enabled)
- `AutoGenerateMeet`: Flag để tự động tạo Meet link
- `Notes`: Ghi chú meeting
- `CreatedBy`: FK to Users (Admin who created)

---

### 6. MeetingReviewers Table
Junction table: Meeting ↔ Reviewers (Many-to-Many)

```sql
CREATE TABLE MeetingReviewers (
    MeetingId INT NOT NULL,
    ReviewerId INT NOT NULL,
    
    PRIMARY KEY (MeetingId, ReviewerId),
    CONSTRAINT FK_MeetingReviewers_Meeting FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId) ON DELETE CASCADE,
    CONSTRAINT FK_MeetingReviewers_Reviewer FOREIGN KEY (ReviewerId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
```

---

### 7. Comments Table
Quản lý discussion threads (comments + replies)

```sql
CREATE TABLE Comments (
    CommentId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    AuthorId INT NOT NULL,
    ParentCommentId INT NULL,
    Content NTEXT NOT NULL,
    IsPinned BIT NOT NULL DEFAULT 0,
    LikesCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Comments_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_Author FOREIGN KEY (AuthorId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Comments_Parent FOREIGN KEY (ParentCommentId) REFERENCES Comments(CommentId) ON DELETE NO ACTION,
    
    INDEX IX_Comments_Proposal (ProposalId),
    INDEX IX_Comments_Author (AuthorId),
    INDEX IX_Comments_Parent (ParentCommentId),
    INDEX IX_Comments_CreatedAt (CreatedAt DESC)
);
```

**Fields:**
- `CommentId`: Primary key
- `ProposalId`: FK to Proposals
- `AuthorId`: FK to Users
- `ParentCommentId`: Self-referencing FK for nested replies (NULL = root comment)
- `Content`: Nội dung comment
- `IsPinned`: Admin/Moderator có thể pin comment
- `LikesCount`: Số lượng likes
- `CreatedAt`: Timestamp
- `UpdatedAt`: Last edited timestamp

---

### 8. Documents Table
Quản lý tài liệu đính kèm

```sql
CREATE TABLE Documents (
    DocumentId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NULL,
    FileName NVARCHAR(500) NOT NULL,
    FileType VARCHAR(50) NOT NULL CHECK (FileType IN ('pdf', 'doc', 'docx', 'xlsx', 'image', 'zip')),
    FileSizeBytes BIGINT NOT NULL,
    Category VARCHAR(100) NOT NULL CHECK (Category IN ('Proposal', 'Budget', 'Research', 'Design', 'Dataset', 'Review')),
    UploadedBy INT NOT NULL,
    Version INT NOT NULL DEFAULT 1,
    Status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (Status IN ('Draft', 'Reviewed', 'Final')),
    StoragePath VARCHAR(1000) NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Documents_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE SET NULL,
    CONSTRAINT FK_Documents_Uploader FOREIGN KEY (UploadedBy) REFERENCES Users(UserId) ON DELETE NO ACTION,
    
    INDEX IX_Documents_Proposal (ProposalId),
    INDEX IX_Documents_Category (Category),
    INDEX IX_Documents_Uploader (UploadedBy)
);
```

**Fields:**
- `DocumentId`: Primary key
- `ProposalId`: FK to Proposals (nullable - có thể có doc không thuộc proposal cụ thể)
- `FileName`: Tên file
- `FileType`: pdf | doc | docx | xlsx | image | zip
- `FileSizeBytes`: Kích thước file (bytes)
- `Category`: Proposal | Budget | Research | Design | Dataset | Review
- `UploadedBy`: FK to Users
- `Version`: Version tracking
- `Status`: Draft | Reviewed | Final
- `StoragePath`: Đường dẫn lưu file (Azure Blob Storage / local path)

---

### 9. BudgetAllocations Table
Phân bổ ngân sách theo từng category

```sql
CREATE TABLE BudgetAllocations (
    BudgetAllocationId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    Category VARCHAR(100) NOT NULL CHECK (Category IN ('Personnel', 'Equipment', 'Research Materials', 'Travel', 'Publication', 'Contingency')),
    AllocatedAmount BIGINT NOT NULL,
    SpentAmount BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT FK_BudgetAllocations_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT CHK_BudgetAllocations_Spent CHECK (SpentAmount >= 0 AND SpentAmount <= AllocatedAmount),
    
    INDEX IX_BudgetAllocations_Proposal (ProposalId)
);
```

**Computed Fields (in API):**
- `RemainingAmount = AllocatedAmount - SpentAmount`
- `UtilizationPercent = (SpentAmount / AllocatedAmount) * 100`
- `Status = 'On Track' | 'Warning' (>80%) | 'Over Budget' (>100%)`

---

### 10. Milestones Table
Quản lý timeline và milestones của project

```sql
CREATE TABLE Milestones (
    MilestoneId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Description NTEXT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
    ProgressPercent INT NOT NULL DEFAULT 0 CHECK (ProgressPercent >= 0 AND ProgressPercent <= 100),
    AssigneeId INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Milestones_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Milestones_Assignee FOREIGN KEY (AssigneeId) REFERENCES Users(UserId) ON DELETE SET NULL,
    CONSTRAINT CHK_Milestones_Dates CHECK (EndDate >= StartDate),
    
    INDEX IX_Milestones_Proposal (ProposalId),
    INDEX IX_Milestones_Status (Status),
    INDEX IX_Milestones_EndDate (EndDate)
);
```

---

### 11. MilestoneDependencies Table
Quản lý dependencies giữa các milestones

```sql
CREATE TABLE MilestoneDependencies (
    MilestoneId INT NOT NULL,
    DependsOnMilestoneId INT NOT NULL,
    
    PRIMARY KEY (MilestoneId, DependsOnMilestoneId),
    CONSTRAINT FK_MilestoneDeps_Milestone FOREIGN KEY (MilestoneId) REFERENCES Milestones(MilestoneId) ON DELETE NO ACTION,
    CONSTRAINT FK_MilestoneDeps_DependsOn FOREIGN KEY (DependsOnMilestoneId) REFERENCES Milestones(MilestoneId) ON DELETE NO ACTION,
    CONSTRAINT CHK_MilestoneDeps_NoCycle CHECK (MilestoneId != DependsOnMilestoneId)
);
```

---

### 12. ActivityLogs Table
Audit trail - log mọi hành động trong hệ thống

```sql
CREATE TABLE ActivityLogs (
    ActivityLogId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Action VARCHAR(100) NOT NULL,
    EntityType VARCHAR(100) NOT NULL,
    EntityId INT NOT NULL,
    Details NVARCHAR(1000) NULL,
    IpAddress VARCHAR(50) NULL,
    UserAgent VARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ActivityLogs_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    
    INDEX IX_ActivityLogs_User (UserId),
    INDEX IX_ActivityLogs_Entity (EntityType, EntityId),
    INDEX IX_ActivityLogs_CreatedAt (CreatedAt DESC)
);
```

**Sample Actions:**
- `submitted_proposal`, `updated_proposal`, `deleted_proposal`
- `assigned_reviewer`, `completed_review`, `approved_review`
- `scheduled_meeting`, `cancelled_meeting`
- `uploaded_document`, `deleted_document`
- `created_user`, `updated_user`, `deactivated_user`

---

### 13. Notifications Table
Hệ thống thông báo

```sql
CREATE TABLE Notifications (
    NotificationId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Type VARCHAR(100) NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Message NTEXT NOT NULL,
    RelatedEntityType VARCHAR(100) NULL,
    RelatedEntityId INT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    
    INDEX IX_Notifications_User (UserId),
    INDEX IX_Notifications_IsRead (IsRead),
    INDEX IX_Notifications_CreatedAt (CreatedAt DESC)
);
```

**Notification Types:**
- `review_assigned` - Reviewer được assign review
- `proposal_approved` - Proposal được duyệt
- `proposal_rejected` - Proposal bị reject
- `deadline_reminder` - Nhắc deadline review
- `meeting_scheduled` - Meeting được schedule
- `comment_reply` - Có người reply comment
- `budget_warning` - Cảnh báo ngân sách

---

### 14. ProposalEmbeddings Table
Lưu trữ vector embeddings cho Semantic Search (AI-powered)

```sql
CREATE TABLE ProposalEmbeddings (
    ProposalEmbeddingId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL UNIQUE,
    TitleEmbedding VARBINARY(MAX) NOT NULL,
    DescriptionEmbedding VARBINARY(MAX) NOT NULL,
    CombinedEmbedding VARBINARY(MAX) NOT NULL,
    EmbeddingModel VARCHAR(100) NOT NULL DEFAULT 'text-embedding-ada-002',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    
    CONSTRAINT FK_ProposalEmbeddings_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    
    INDEX IX_ProposalEmbeddings_Proposal (ProposalId)
);
```

**Fields:**
- `ProposalEmbeddingId`: Primary key
- `ProposalId`: FK to Proposals (UNIQUE - mỗi proposal chỉ có 1 embedding record)
- `TitleEmbedding`: Vector embedding của Title (binary format, 1536 dimensions cho OpenAI ada-002)
- `DescriptionEmbedding`: Vector embedding của Description
- `CombinedEmbedding`: Vector embedding tổng hợp (Title + Description) - dùng cho search chính
- `EmbeddingModel`: Model đã dùng để generate (OpenAI `text-embedding-ada-002` hoặc Google `textembedding-gecko`)
- `CreatedAt`: Timestamp khi tạo embedding
- `UpdatedAt`: Timestamp khi re-generate embedding (khi proposal được update)

**Semantic Search Flow:**
1. User nhập query: "chatbot education AI"
2. Backend gọi OpenAI/Google API để convert query → vector embedding
3. Tính cosine similarity giữa query vector và `CombinedEmbedding` của tất cả proposals
4. Return top-k proposals với similarity score cao nhất
5. Kết hợp với traditional filters (category, status, score range...)

**Technical Notes:**
- Embeddings được generate/update bằng **background job** (không real-time khi submit proposal)
- Dùng **Azure Cognitive Search** hoặc **Pinecone** cho production-grade vector search
- Fallback về traditional search nếu embedding chưa ready
- Re-generate embeddings khi proposal Title/Description thay đổi

---

## 🔗 Entity Relationships

### ERD Summary

```
Users (1) ──────< (N) Proposals [PI]
Users (1) ──────< (N) Reviews [Reviewer]
Users (1) ──────< (N) Comments [Author]
Users (1) ──────< (N) Documents [Uploader]
Users (N) ──────< (N) Meetings [via MeetingReviewers]
Users (1) ──────< (N) ActivityLogs
Users (1) ──────< (N) Notifications

Proposals (1) ──< (N) Reviews
Proposals (1) ──< (N) Comments
Proposals (1) ──< (N) Documents
Proposals (1) ──< (N) BudgetAllocations
Proposals (1) ──< (N) Milestones
Proposals (1) ──< (N) Meetings
Proposals (1) ──< (1) ProposalEmbeddings [for Semantic Search]

Reviews (1) ────< (N) ReviewScores

Comments (1) ───< (N) Comments [Parent-Child self-reference]

Milestones (N) ─< (N) Milestones [via MilestoneDependencies]

Meetings (N) ───< (N) Users [via MeetingReviewers]
```

---

## 📊 Enum Values Reference

### User.Role
- `Administrator` - Quản trị hệ thống (toàn quyền)
- `Staff` - Cán bộ (quản lý cuộc họp, thống kê, báo cáo)
- `Faculty` - Giảng viên/PI nộp đề xuất
- `Review Committee` - Ủy ban phản biện (chấm điểm đề xuất)

**Role Permissions Matrix:**

| Feature | Administrator | Staff | Faculty | Review Committee |
|---------|--------------|-------|---------|------------------|
| **User Management** |
| Create/Update/Delete Users | ✅ | ❌ | ❌ | ❌ |
| View All Users | ✅ | ✅ | ❌ | ❌ |
| **Proposal Management** |
| Submit Proposal | ❌ | ❌ | ✅ | ❌ |
| View Own Proposals | ❌ | ❌ | ✅ | ❌ |
| View All Proposals | ✅ | ✅ | ❌ | ✅ (assigned only) |
| Update Proposal Status | ✅ | ❌ | ❌ | ❌ |
| Delete Proposal | ✅ | ❌ | ❌ | ❌ |
| **Review Management** |
| Assign Reviewers | ✅ | ❌ | ❌ | ❌ |
| Conduct Review | ❌ | ❌ | ❌ | ✅ |
| View All Reviews | ✅ | ✅ | ❌ | ✅ (own only) |
| Generate AI Summary | ❌ | ❌ | ❌ | ✅ |
| **Meeting Management** |
| Schedule Meeting | ✅ | ✅ | ❌ | ❌ |
| Cancel/Update Meeting | ✅ | ✅ | ❌ | ❌ |
| Join Meeting | ✅ | ✅ | ✅ (if invited) | ✅ (if invited) |
| Generate Meet Link | ✅ | ✅ | ❌ | ❌ |
| **Document Management** |
| Upload Document | ✅ | ✅ | ✅ (to own proposals) | ✅ (review docs) |
| Delete Document | ✅ | ❌ | ✅ (own only) | ❌ |
| View All Documents | ✅ | ✅ | ❌ | ✅ (assigned proposals) |
| **Budget Management** |
| Create Budget Allocation | ✅ | ❌ | ✅ (own proposals) | ❌ |
| Update Spent Amount | ✅ | ✅ | ❌ | ❌ |
| View Budget Analytics | ✅ | ✅ | ✅ (own proposals) | ❌ |
| **Reports & Analytics** |
| View Dashboard | ✅ | ✅ | ✅ (limited) | ✅ (limited) |
| Export Reports | ✅ | ✅ | ❌ | ❌ |
| View Activity Logs | ✅ | ✅ | ❌ | ❌ |
| **Discussion & Comments** |
| Post Comments | ✅ | ✅ | ✅ | ✅ |
| Pin/Unpin Comments | ✅ | ❌ | ❌ | ❌ |
| Delete Comments | ✅ | ❌ | ✅ (own only) | ✅ (own only) |

### User.Department
- `Software Engineering`
- `AI & Data Science`
- `Computer Science`
- `Information Systems`
- `Cybersecurity`

### User.Status
- `Active` - Đang hoạt động
- `Inactive` - Đã vô hiệu hóa

### Proposal.Category
- `AI & ML` - Artificial Intelligence & Machine Learning
- `IoT` - Internet of Things
- `Blockchain`
- `Cloud Computing`
- `Cybersecurity`

### Proposal.Status
- `Submitted` - Vừa nộp, chưa review
- `Under Review` - Đang được review
- `Approved` - Đã phê duyệt
- `Rejected` - Bị từ chối
- `Revision Required` - Cần sửa đổi

### Proposal.Priority
- `High` - Ưu tiên cao
- `Medium` - Ưu tiên trung bình
- `Low` - Ưu tiên thấp

### Review.Status
- `Pending` - Chưa bắt đầu
- `In Progress` - Đang review
- `Completed` - Hoàn thành

### Review.Decision
- `Approve` - Đồng ý duyệt
- `Reject` - Từ chối
- `NULL` - Chưa quyết định

### Meeting.Status
- `Scheduled` - Đã lên lịch
- `Completed` - Đã hoàn thành
- `Cancelled` - Đã hủy

### Document.FileType
- `pdf`
- `doc`
- `docx`
- `xlsx`
- `image` (png, jpg, etc.)
- `zip`

### Document.Category
- `Proposal` - Tài liệu đề xuất
- `Budget` - Bảng phân bổ ngân sách
- `Research` - Tài liệu nghiên cứu
- `Design` - Thiết kế kỹ thuật
- `Dataset` - Dữ liệu
- `Review` - Tài liệu đánh giá

### Document.Status
- `Draft` - Bản nháp
- `Reviewed` - Đã được review
- `Final` - Bản cuối cùng

### BudgetAllocation.Category
- `Personnel` - Nhân sự
- `Equipment` - Thiết bị
- `Research Materials` - Vật tư nghiên cứu
- `Travel` - Đi lại
- `Publication` - Xuất bản
- `Contingency` - Dự phòng (5-10% tổng budget)

### Milestone.Status
- `Pending` - Chưa bắt đầu
- `In Progress` - Đang thực hiện
- `Completed` - Hoàn thành
- `Overdue` - Quá hạn (auto-set khi EndDate < Today và chưa Completed)

---

## 📐 Business Rules & Constraints

### 1. Proposal Rules
- ✅ Budget phải ≥ 1,000,000 VND
- ✅ Duration phải ≥ 3 months và ≤ 36 months
- ✅ TotalScore tính từ average của Reviews (0-50)
- ✅ Chỉ Faculty mới có thể submit proposal
- ✅ Status workflow: `Submitted → Under Review → (Approved | Rejected | Revision Required)`
- ✅ Nếu `Revision Required`, Faculty có thể update và re-submit (tăng Version)
- ✅ Priority được admin set hoặc auto-calculate từ score

### 2. Review Rules
- ✅ Mỗi Proposal phải có ít nhất **2 reviewers** (thường 3-5)
- ✅ Không được assign PI của proposal làm reviewer cho chính proposal đó
- ✅ Chỉ users có Role = `Review Committee` mới có thể được assign làm reviewer
- ✅ TotalScore = SUM của tất cả ReviewScores.Score (max 50)
- ✅ Review phải hoàn thành trước `ReviewDeadline`
- ✅ AI Summary được generate từ Gemini API khi reviewer click "Generate AI Summary"
- ✅ Review chỉ có thể Completed khi đã điền đủ 5 rubric scores

### 3. Budget Rules
- ✅ SUM(BudgetAllocations.AllocatedAmount) phải = Proposal.BudgetAmount
- ✅ Contingency category bắt buộc và phải ≥ 5% tổng budget
- ✅ SpentAmount không được vượt AllocatedAmount
- ✅ Warning alert khi Utilization > 80%
- ✅ Over Budget alert khi Utilization > 100%

### 4. Meeting Rules
- ✅ Meeting chỉ schedule được khi Proposal.Status = 'Under Review'
- ✅ Phải có ít nhất 3 reviewers trong MeetingReviewers
- ✅ Nếu `AutoGenerateMeet = true`, system tự generate Google Meet link
- ✅ Meeting có thể reschedule nếu Status = 'Scheduled'
- ✅ Không thể reschedule meeting đã Completed

### 5. Milestone Rules
- ✅ EndDate phải >= StartDate
- ✅ Nếu có Dependencies, không thể start milestone khi DependsOn chưa Completed
- ✅ Auto-update Status = 'Overdue' nếu EndDate < TODAY() và Status != 'Completed'
- ✅ ProgressPercent phải 0-100
- ✅ Overall project progress = AVG(all milestones ProgressPercent)

### 6. Comment Rules
- ✅ Pinned comments luôn hiển thị đầu tiên
- ✅ Replies có ParentCommentId != NULL
- ✅ Không được delete comment có replies (phải delete replies trước)
- ✅ Admin có thể pin/unpin bất kỳ comment nào

### 7. Document Rules
- ✅ Max file size: 10 MB (configurable)
- ✅ Version tự động tăng khi re-upload cùng FileName
- ✅ Chỉ uploader hoặc Admin mới có thể delete document

### 8. Activity Log Rules
- ✅ Tất cả actions quan trọng phải log (CREATE, UPDATE, DELETE)
- ✅ ActivityLogs **IMMUTABLE** - không được update/delete (audit trail)
- ✅ Retention policy: giữ logs ít nhất 2 năm

### 9. Semantic Search Rules
- ✅ Embeddings được generate tự động khi proposal được submit/update
- ✅ Background job chạy để sync embeddings cho proposals cũ
- ✅ Nếu embedding chưa có, fallback về traditional keyword search
- ✅ Similarity threshold: chỉ return results với cosine similarity > 0.7
- ✅ Cache query embeddings (TTL 1 hour) để tránh gọi API nhiều lần cho cùng query

---

## 🚀 API Endpoints Specification

### Authentication & Authorization

**Base URL:** `https://api.furpms.fpt.edu.vn/api/v1`

#### Auth Endpoints
```
POST   /auth/login                    # Login with email/password
POST   /auth/logout                   # Logout
POST   /auth/refresh-token            # Refresh JWT token
POST   /auth/forgot-password          # Request password reset
POST   /auth/reset-password           # Reset password with token
GET    /auth/me                       # Get current user info
```

---

### Users API

```
GET    /users                         # List all users (Admin only) - pagination, filters
GET    /users/{id}                    # Get user by ID
POST   /users                         # Create new user (Admin only)
PUT    /users/{id}                    # Update user (Admin or self)
DELETE /users/{id}                    # Soft delete user (Admin only)
PATCH  /users/{id}/status             # Activate/Deactivate user
GET    /users/{id}/proposals          # Get proposals by user (as PI)
GET    /users/{id}/reviews            # Get reviews by user (as Reviewer)
GET    /users/{id}/activity-logs      # Get user's activity history
```

**Query Parameters:**
- `?page=1&pageSize=20` - Pagination
- `?role=Faculty` - Filter by role
- `?department=Software Engineering` - Filter by department
- `?status=Active` - Filter by status
- `?search=nguyen` - Search by name/email

**Sample Response:** `GET /users?page=1&pageSize=10`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": 1,
        "fullName": "Administrator FURPMS",
        "email": "admin@fpt.edu.vn",
        "phoneNumber": "+84987654321",
        "role": "Administrator",
        "department": "Administration",
        "status": "Active",
        "createdAt": "2024-01-15T08:30:00Z",
        "lastLoginAt": "2026-05-16T09:15:00Z"
      },
      {
        "userId": 2,
        "fullName": "Nguyễn Văn Hùng",
        "email": "hungnv@fpt.edu.vn",
        "phoneNumber": "+84987654322",
        "role": "Staff",
        "department": "Administration",
        "status": "Active",
        "createdAt": "2024-02-10T10:00:00Z",
        "lastLoginAt": "2026-05-16T08:00:00Z"
      }
    ],
    "totalCount": 89,
    "page": 1,
    "pageSize": 10,
    "totalPages": 9
  }
}
```

---

### Proposals API

```
GET    /proposals                     # List all proposals - filters, pagination
GET    /proposals/{id}                # Get proposal by ID
POST   /proposals                     # Create new proposal (Faculty only)
PUT    /proposals/{id}                # Update proposal (PI or Admin)
DELETE /proposals/{id}                # Delete proposal (Admin only)
PATCH  /proposals/{id}/status         # Update proposal status (Admin)
PATCH  /proposals/{id}/priority       # Update priority (Admin)
GET    /proposals/{id}/reviews        # Get all reviews for proposal
GET    /proposals/{id}/documents      # Get all documents for proposal
GET    /proposals/{id}/budget         # Get budget breakdown
GET    /proposals/{id}/milestones     # Get project timeline
GET    /proposals/{id}/comments       # Get discussion thread
POST   /proposals/{id}/submit         # Submit proposal for review (change status)
```

**Query Parameters:**
- `?status=Under Review` - Filter by status
- `?category=AI & ML` - Filter by category
- `?piId=5` - Filter by PI
- `?minScore=30&maxScore=50` - Filter by score range
- `?submittedAfter=2026-01-01` - Filter by date
- `?priority=High` - Filter by priority
- `?search=chatbot` - Search in title/description

**Sample Request:** `POST /proposals`
```json
{
  "title": "AI-Powered Chatbot for Education",
  "description": "Detailed description of the research proposal...",
  "category": "AI & ML",
  "budgetAmount": 50000000,
  "durationMonths": 12,
  "reviewDeadline": "2026-05-31"
}
```

**Sample Response:** `GET /proposals/{id}`
```json
{
  "success": true,
  "data": {
    "proposalId": 1,
    "title": "AI-Powered Chatbot for Education",
    "description": "...",
    "principalInvestigator": {
      "userId": 5,
      "fullName": "Dr. Nguyễn Văn A",
      "email": "nguyenvana@fpt.edu.vn",
      "department": "AI & Data Science"
    },
    "category": "AI & ML",
    "budgetAmount": 50000000,
    "durationMonths": 12,
    "status": "Under Review",
    "priority": "High",
    "totalScore": 42.5,
    "submittedDate": "2026-05-10T14:30:00Z",
    "reviewDeadline": "2026-05-31",
    "version": 1,
    "reviewCount": 3,
    "documentCount": 5
  }
}
```

---

### Reviews API

```
GET    /reviews                       # List all reviews (Admin/Reviewer)
GET    /reviews/{id}                  # Get review by ID
POST   /reviews                       # Assign reviewer (Admin only)
PUT    /reviews/{id}                  # Update review scores/comments
DELETE /reviews/{id}                  # Delete review (Admin only)
PATCH  /reviews/{id}/status           # Update review status
POST   /reviews/{id}/ai-summary       # Generate AI summary (Gemini API)
POST   /reviews/{id}/ai-comments      # Generate AI suggested comments
POST   /reviews/{id}/submit           # Submit final review decision
GET    /reviews/{id}/scores           # Get rubric scores detail
PUT    /reviews/{id}/scores           # Update rubric scores
```

**Sample Request:** `POST /reviews` (Assign reviewer)
```json
{
  "proposalId": 1,
  "reviewerId": 8,
  "deadline": "2026-05-25",
  "priority": "High"
}
```

**Sample Request:** `PUT /reviews/{id}/scores`
```json
{
  "scores": [
    { "criterion": "Innovation & Originality", "score": 8.5, "comments": "Good novel approach" },
    { "criterion": "Methodology & Approach", "score": 9.0, "comments": "Well-structured methodology" },
    { "criterion": "Feasibility & Timeline", "score": 7.5, "comments": "Timeline is tight" },
    { "criterion": "Budget Justification", "score": 8.0, "comments": "Reasonable budget" },
    { "criterion": "Expected Impact", "score": 9.0, "comments": "High potential impact" }
  ]
}
```

**Sample Response:** `POST /reviews/{id}/ai-summary` (Gemini API integration)
```json
{
  "success": true,
  "data": {
    "aiSummary": "This proposal presents a novel approach to educational chatbots using transformer-based architecture. The methodology is sound with clear milestones. Budget allocation appears reasonable for the proposed scope. Main concerns: tight 12-month timeline for training and deployment phases.",
    "aiComments": "Consider extending timeline for user testing phase. Recommend adding contingency for model training compute costs. Strong potential for real-world impact in online learning environments.",
    "confidence": 0.85
  }
}
```

---

### Meetings API

```
GET    /meetings                      # List all meetings
GET    /meetings/{id}                 # Get meeting by ID
POST   /meetings                      # Schedule new meeting (Admin)
PUT    /meetings/{id}                 # Update meeting details
DELETE /meetings/{id}                 # Cancel meeting
PATCH  /meetings/{id}/status          # Update meeting status
POST   /meetings/{id}/generate-link   # Generate Google Meet link
GET    /meetings/{id}/reviewers       # Get meeting attendees
POST   /meetings/{id}/reviewers       # Add reviewer to meeting
DELETE /meetings/{id}/reviewers/{reviewerId} # Remove reviewer
```

**Sample Request:** `POST /meetings`
```json
{
  "proposalId": 1,
  "meetingTitle": "Review Committee Meeting - AI Chatbot Proposal",
  "scheduledDate": "2026-06-05",
  "scheduledTime": "14:00:00",
  "autoGenerateMeet": true,
  "reviewerIds": [8, 12, 15]
}
```

**Sample Response:** `POST /meetings/{id}/generate-link` (Google Meet API)
```json
{
  "success": true,
  "data": {
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "meetingId": "abc-defg-hij"
  }
}
```

---

### Comments API

```
GET    /comments                      # List comments (by proposal)
GET    /comments/{id}                 # Get comment by ID
POST   /comments                      # Create new comment
PUT    /comments/{id}                 # Update comment (author only)
DELETE /comments/{id}                 # Delete comment (author/admin)
POST   /comments/{id}/replies         # Reply to comment
PATCH  /comments/{id}/pin             # Pin/unpin comment (Admin)
POST   /comments/{id}/like            # Like comment
DELETE /comments/{id}/like            # Unlike comment
```

**Query Parameters:**
- `?proposalId=1` - Filter by proposal
- `?authorId=5` - Filter by author
- `?isPinned=true` - Get only pinned comments

**Sample Request:** `POST /comments`
```json
{
  "proposalId": 1,
  "content": "The methodology section needs more detail on data preprocessing.",
  "parentCommentId": null
}
```

**Sample Request:** `POST /comments/{id}/replies`
```json
{
  "content": "Good point! I will add a subsection on data cleaning pipeline."
}
```

---

### Documents API

```
GET    /documents                     # List documents
GET    /documents/{id}                # Get document metadata
POST   /documents                     # Upload new document
DELETE /documents/{id}                # Delete document
GET    /documents/{id}/download       # Download file
GET    /documents/{id}/preview        # Preview file (if supported)
```

**Query Parameters:**
- `?proposalId=1` - Filter by proposal
- `?category=Budget` - Filter by category
- `?uploadedBy=5` - Filter by uploader

**Sample Request:** `POST /documents` (Multipart/form-data)
```
Content-Type: multipart/form-data

proposalId: 1
category: Proposal
file: [binary file data]
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "documentId": 10,
    "fileName": "research-proposal.pdf",
    "fileType": "pdf",
    "fileSizeBytes": 2458624,
    "category": "Proposal",
    "uploadedBy": {
      "userId": 5,
      "fullName": "Dr. Nguyễn Văn A"
    },
    "version": 1,
    "status": "Draft",
    "storagePath": "/uploads/proposals/1/research-proposal-v1.pdf",
    "uploadedAt": "2026-05-10T15:20:00Z"
  }
}
```

---

### Budget API

```
GET    /budget                        # List budget allocations
GET    /proposals/{id}/budget         # Get budget for proposal
POST   /proposals/{id}/budget         # Create budget allocation
PUT    /budget/{id}                   # Update budget allocation
DELETE /budget/{id}                   # Delete budget allocation
GET    /budget/analytics              # Budget analytics dashboard data
```

**Sample Request:** `POST /proposals/{id}/budget`
```json
{
  "allocations": [
    { "category": "Personnel", "allocatedAmount": 20000000 },
    { "category": "Equipment", "allocatedAmount": 15000000 },
    { "category": "Research Materials", "allocatedAmount": 8000000 },
    { "category": "Travel", "allocatedAmount": 3000000 },
    { "category": "Publication", "allocatedAmount": 2000000 },
    { "category": "Contingency", "allocatedAmount": 2000000 }
  ]
}
```

**Sample Response:** `GET /proposals/{id}/budget`
```json
{
  "success": true,
  "data": {
    "totalBudget": 50000000,
    "totalAllocated": 50000000,
    "totalSpent": 0,
    "totalRemaining": 50000000,
    "utilizationPercent": 0,
    "status": "On Track",
    "allocations": [
      {
        "budgetAllocationId": 1,
        "category": "Personnel",
        "allocatedAmount": 20000000,
        "spentAmount": 0,
        "remainingAmount": 20000000,
        "utilizationPercent": 0
      }
    ]
  }
}
```

---

### Milestones API

```
GET    /milestones                    # List milestones
GET    /milestones/{id}               # Get milestone by ID
POST   /milestones                    # Create milestone
PUT    /milestones/{id}               # Update milestone
DELETE /milestones/{id}               # Delete milestone
PATCH  /milestones/{id}/progress      # Update progress
POST   /milestones/{id}/dependencies  # Add dependency
DELETE /milestones/{id}/dependencies/{dependencyId} # Remove dependency
GET    /proposals/{id}/timeline       # Get Gantt chart data
```

**Sample Request:** `POST /milestones`
```json
{
  "proposalId": 1,
  "title": "Literature Review & Research Design",
  "description": "Complete comprehensive literature review and finalize research methodology",
  "startDate": "2026-06-01",
  "endDate": "2026-07-31",
  "assigneeId": 5
}
```

**Sample Response:** `GET /proposals/{id}/timeline` (for Gantt chart)
```json
{
  "success": true,
  "data": {
    "proposalId": 1,
    "overallProgress": 35,
    "milestones": [
      {
        "milestoneId": 1,
        "title": "Literature Review",
        "startDate": "2026-06-01",
        "endDate": "2026-07-31",
        "status": "Completed",
        "progressPercent": 100,
        "dependencies": []
      },
      {
        "milestoneId": 2,
        "title": "Data Collection",
        "startDate": "2026-08-01",
        "endDate": "2026-09-30",
        "status": "In Progress",
        "progressPercent": 45,
        "dependencies": [1]
      }
    ]
  }
}
```

---

### Activity Logs API

```
GET    /activity-logs                 # List all activity logs (Admin)
GET    /activity-logs/{id}            # Get log by ID
GET    /users/{id}/activity-logs      # Get logs for specific user
GET    /proposals/{id}/activity-logs  # Get logs for specific proposal
```

**Query Parameters:**
- `?userId=5` - Filter by user
- `?action=submitted_proposal` - Filter by action
- `?entityType=Proposal` - Filter by entity type
- `?startDate=2026-05-01&endDate=2026-05-31` - Date range

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "activityLogId": 245,
        "user": {
          "userId": 5,
          "fullName": "Dr. Nguyễn Văn A"
        },
        "action": "submitted_proposal",
        "entityType": "Proposal",
        "entityId": 1,
        "details": "Submitted proposal 'AI-Powered Chatbot for Education'",
        "ipAddress": "203.162.10.123",
        "createdAt": "2026-05-10T14:30:00Z"
      }
    ],
    "totalCount": 1523,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### Notifications API

```
GET    /notifications                 # Get notifications for current user
GET    /notifications/{id}            # Get notification by ID
PATCH  /notifications/{id}/read       # Mark as read
PATCH  /notifications/read-all        # Mark all as read
DELETE /notifications/{id}            # Delete notification
GET    /notifications/unread-count    # Get unread count (for badge)
```

**Sample Response:** `GET /notifications`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "notificationId": 123,
        "type": "review_assigned",
        "title": "New Review Assignment",
        "message": "You have been assigned to review proposal 'AI-Powered Chatbot for Education'",
        "relatedEntityType": "Proposal",
        "relatedEntityId": 1,
        "isRead": false,
        "createdAt": "2026-05-16T10:30:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

### Reports & Analytics API

```
GET    /reports/dashboard             # Get dashboard statistics
GET    /reports/proposals             # Proposal status report
GET    /reports/budget-summary        # Budget allocation summary
GET    /reports/reviewer-performance  # Reviewer performance metrics
POST   /reports/export                # Export report (PDF/Excel/CSV)
GET    /reports/analytics             # Advanced analytics data
```

**Sample Response:** `GET /reports/dashboard`
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalProposals": 245,
      "totalUsers": 89,
      "totalReviewers": 34,
      "upcomingMeetings": 12,
      "activeProposals": 87,
      "approvedProposals": 142,
      "rejectedProposals": 16
    },
    "submissionTrend": [
      { "month": "Jan 2026", "count": 45 },
      { "month": "Feb 2026", "count": 52 }
    ],
    "categoryBreakdown": [
      { "category": "AI & ML", "count": 85, "percentage": 35 },
      { "category": "IoT", "count": 61, "percentage": 25 }
    ],
    "budgetBreakdown": [
      { "category": "AI & ML", "amount": 350000000 },
      { "category": "IoT", "amount": 250000000 }
    ]
  }
}
```

**Sample Request:** `POST /reports/export`
```json
{
  "reportType": "proposals",
  "format": "excel",
  "filters": {
    "status": "Approved",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-05-31"
  }
}
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.furpms.fpt.edu.vn/downloads/reports/proposal-report-20260516.xlsx",
    "fileName": "proposal-report-20260516.xlsx",
    "fileSizeBytes": 245678,
    "expiresAt": "2026-05-17T10:30:00Z"
  }
}
```

---

### Search API

```
GET    /search                        # Traditional keyword search across all entities
GET    /search/proposals              # Keyword search proposals only
GET    /search/users                  # Search users only
GET    /search/documents              # Search documents only
POST   /search/semantic               # AI-powered semantic search (RECOMMENDED)
POST   /search/semantic/proposals     # Semantic search for proposals only
GET    /search/suggestions            # Auto-suggest based on partial query
```

**Query Parameters (Traditional Search):**
- `?q=chatbot` - Search query
- `?type=Proposal` - Entity type filter
- `?category=AI & ML` - Category filter
- `?status=Approved` - Status filter
- `?minScore=30&maxScore=50` - Score range
- `?department=Software Engineering` - Department filter

**Sample Response:** `GET /search?q=chatbot`
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "proposalId": 1,
        "title": "AI-Powered Chatbot for Education",
        "pi": "Dr. Nguyễn Văn A",
        "status": "Approved",
        "score": 42.5,
        "relevanceScore": 0.95
      }
    ],
    "documents": [
      {
        "documentId": 5,
        "fileName": "chatbot-architecture.pdf",
        "proposalId": 1,
        "relevanceScore": 0.87
      }
    ],
    "totalResults": 8,
    "searchType": "keyword"
  }
}
```

---

#### Semantic Search (AI-Powered)

**Sample Request:** `POST /search/semantic`
```json
{
  "query": "tìm nghiên cứu về trí tuệ nhân tạo ứng dụng trong giáo dục",
  "filters": {
    "category": "AI & ML",
    "status": ["Approved", "Under Review"],
    "minScore": 30
  },
  "topK": 10,
  "similarityThreshold": 0.7
}
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "proposalId": 1,
        "title": "AI-Powered Chatbot for Education",
        "description": "A comprehensive research project to develop an AI chatbot...",
        "pi": {
          "userId": 5,
          "fullName": "Dr. Nguyễn Văn A"
        },
        "category": "AI & ML",
        "status": "Approved",
        "score": 42.5,
        "semanticSimilarity": 0.92,
        "matchedConcepts": ["artificial intelligence", "education", "chatbot"]
      },
      {
        "proposalId": 15,
        "title": "Machine Learning for Student Performance Prediction",
        "description": "Using ML algorithms to predict student outcomes...",
        "pi": {
          "userId": 12,
          "fullName": "Dr. Phạm Thị D"
        },
        "category": "AI & ML",
        "status": "Under Review",
        "score": 38.0,
        "semanticSimilarity": 0.85,
        "matchedConcepts": ["machine learning", "education", "student analytics"]
      }
    ],
    "totalResults": 12,
    "searchType": "semantic",
    "queryEmbeddingModel": "text-embedding-ada-002",
    "processingTimeMs": 245
  }
}
```

**How Semantic Search Works:**

1. **Query Processing:**
   - User nhập query (có thể tiếng Việt hoặc tiếng Anh)
   - Backend gọi OpenAI API: `POST https://api.openai.com/v1/embeddings`
   - Convert query text → 1536-dimensional vector

2. **Vector Similarity Calculation:**
   - Tính **cosine similarity** giữa query vector và `ProposalEmbeddings.CombinedEmbedding`
   - Formula: `similarity = dot(query_vec, proposal_vec) / (norm(query_vec) * norm(proposal_vec))`
   - Chỉ lấy proposals có similarity > threshold (default 0.7)

3. **Ranking & Filtering:**
   - Sort results theo similarity score (cao → thấp)
   - Apply traditional filters (category, status, score range)
   - Return top-K results (default 10)

4. **Advantages over Keyword Search:**
   - Hiểu ngữ nghĩa: "chatbot" ≈ "conversational AI" ≈ "dialogue system"
   - Cross-language: query tiếng Việt match được proposal tiếng Anh
   - Concept matching: "học máy" match được "machine learning", "deep learning", "neural networks"

**API Integration Notes:**
```csharp
// .NET Backend - Generate Embedding
public async Task<float[]> GenerateEmbedding(string text)
{
    var client = new HttpClient();
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {OPENAI_API_KEY}");
    
    var request = new
    {
        input = text,
        model = "text-embedding-ada-002"
    };
    
    var response = await client.PostAsJsonAsync(
        "https://api.openai.com/v1/embeddings",
        request
    );
    
    var result = await response.Content.ReadFromJsonAsync<EmbeddingResponse>();
    return result.Data[0].Embedding; // float[1536]
}

// Calculate Cosine Similarity
public float CosineSimilarity(float[] vec1, float[] vec2)
{
    float dot = 0, norm1 = 0, norm2 = 0;
    for (int i = 0; i < vec1.Length; i++)
    {
        dot += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }
    return dot / (MathF.Sqrt(norm1) * MathF.Sqrt(norm2));
}
```

---

## 🛠️ SQL Server Scripts

### Create Database

```sql
-- Create Database
CREATE DATABASE FURPMS
GO

USE FURPMS
GO

-- Enable Full-Text Search (for advanced search)
EXEC sp_fulltext_database 'enable'
GO
```

---

### Create All Tables (Full Script)

```sql
-- ================================================
-- FURPMS Database Schema
-- FPT University Research Project Management System
-- ================================================

USE FURPMS
GO

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(512) NOT NULL,
    PhoneNumber VARCHAR(20),
    Role VARCHAR(50) NOT NULL CHECK (Role IN ('Administrator', 'Staff', 'Faculty', 'Review Committee')),
    Department NVARCHAR(255),
    Status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    LastLoginAt DATETIME2
);

CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Role ON Users(Role);
CREATE INDEX IX_Users_Status ON Users(Status);
CREATE INDEX IX_Users_Department ON Users(Department);

-- ============================================
-- 2. Proposals Table
-- ============================================
CREATE TABLE Proposals (
    ProposalId INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(500) NOT NULL,
    Description NTEXT NOT NULL,
    PrincipalInvestigatorId INT NOT NULL,
    Category VARCHAR(100) NOT NULL CHECK (Category IN ('AI & ML', 'IoT', 'Blockchain', 'Cloud Computing', 'Cybersecurity')),
    BudgetAmount BIGINT NOT NULL,
    DurationMonths INT NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (Status IN ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Revision Required')),
    Priority VARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('High', 'Medium', 'Low')),
    TotalScore DECIMAL(5,2) NULL,
    SubmittedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ReviewDeadline DATE,
    ApprovalDate DATETIME2 NULL,
    Version INT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    
    CONSTRAINT FK_Proposals_PI FOREIGN KEY (PrincipalInvestigatorId) REFERENCES Users(UserId) ON DELETE NO ACTION
);

CREATE INDEX IX_Proposals_Status ON Proposals(Status);
CREATE INDEX IX_Proposals_PI ON Proposals(PrincipalInvestigatorId);
CREATE INDEX IX_Proposals_Category ON Proposals(Category);
CREATE INDEX IX_Proposals_SubmittedDate ON Proposals(SubmittedDate);
CREATE INDEX IX_Proposals_Priority ON Proposals(Priority);

-- ============================================
-- 3. Reviews Table
-- ============================================
CREATE TABLE Reviews (
    ReviewId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    ReviewerId INT NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'In Progress', 'Completed')),
    Priority VARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('High', 'Medium', 'Low')),
    Deadline DATE NOT NULL,
    TotalScore DECIMAL(5,2) NULL,
    AiSummary NTEXT NULL,
    AiComments NTEXT NULL,
    ReviewerComments NTEXT NULL,
    Decision VARCHAR(20) NULL CHECK (Decision IN ('Approve', 'Reject', NULL)),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Reviews_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Reviewer FOREIGN KEY (ReviewerId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT UQ_Reviews_ProposalReviewer UNIQUE (ProposalId, ReviewerId)
);

CREATE INDEX IX_Reviews_Status ON Reviews(Status);
CREATE INDEX IX_Reviews_Deadline ON Reviews(Deadline);
CREATE INDEX IX_Reviews_Proposal ON Reviews(ProposalId);
CREATE INDEX IX_Reviews_Reviewer ON Reviews(ReviewerId);

-- ============================================
-- 4. ReviewScores Table
-- ============================================
CREATE TABLE ReviewScores (
    ReviewScoreId INT PRIMARY KEY IDENTITY(1,1),
    ReviewId INT NOT NULL,
    Criterion NVARCHAR(255) NOT NULL,
    MaxScore INT NOT NULL DEFAULT 10,
    Score DECIMAL(4,2) NOT NULL DEFAULT 0,
    Comments NTEXT NULL,
    
    CONSTRAINT FK_ReviewScores_Review FOREIGN KEY (ReviewId) REFERENCES Reviews(ReviewId) ON DELETE CASCADE,
    CONSTRAINT CHK_ReviewScores_Score CHECK (Score >= 0 AND Score <= MaxScore)
);

CREATE INDEX IX_ReviewScores_Review ON ReviewScores(ReviewId);

-- ============================================
-- 5. Meetings Table
-- ============================================
CREATE TABLE Meetings (
    MeetingId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    MeetingTitle NVARCHAR(500) NOT NULL,
    ScheduledDate DATE NOT NULL,
    ScheduledTime TIME NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (Status IN ('Scheduled', 'Completed', 'Cancelled')),
    MeetingLink VARCHAR(500) NULL,
    AutoGenerateMeet BIT NOT NULL DEFAULT 0,
    Notes NTEXT NULL,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Meetings_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Meetings_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId) ON DELETE NO ACTION
);

CREATE INDEX IX_Meetings_Status ON Meetings(Status);
CREATE INDEX IX_Meetings_ScheduledDate ON Meetings(ScheduledDate);
CREATE INDEX IX_Meetings_Proposal ON Meetings(ProposalId);

-- ============================================
-- 6. MeetingReviewers Table (Junction)
-- ============================================
CREATE TABLE MeetingReviewers (
    MeetingId INT NOT NULL,
    ReviewerId INT NOT NULL,
    
    PRIMARY KEY (MeetingId, ReviewerId),
    CONSTRAINT FK_MeetingReviewers_Meeting FOREIGN KEY (MeetingId) REFERENCES Meetings(MeetingId) ON DELETE CASCADE,
    CONSTRAINT FK_MeetingReviewers_Reviewer FOREIGN KEY (ReviewerId) REFERENCES Users(UserId) ON DELETE NO ACTION
);

-- ============================================
-- 7. Comments Table
-- ============================================
CREATE TABLE Comments (
    CommentId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    AuthorId INT NOT NULL,
    ParentCommentId INT NULL,
    Content NTEXT NOT NULL,
    IsPinned BIT NOT NULL DEFAULT 0,
    LikesCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Comments_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_Author FOREIGN KEY (AuthorId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Comments_Parent FOREIGN KEY (ParentCommentId) REFERENCES Comments(CommentId) ON DELETE NO ACTION
);

CREATE INDEX IX_Comments_Proposal ON Comments(ProposalId);
CREATE INDEX IX_Comments_Author ON Comments(AuthorId);
CREATE INDEX IX_Comments_Parent ON Comments(ParentCommentId);
CREATE INDEX IX_Comments_CreatedAt ON Comments(CreatedAt DESC);

-- ============================================
-- 8. Documents Table
-- ============================================
CREATE TABLE Documents (
    DocumentId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NULL,
    FileName NVARCHAR(500) NOT NULL,
    FileType VARCHAR(50) NOT NULL CHECK (FileType IN ('pdf', 'doc', 'docx', 'xlsx', 'image', 'zip')),
    FileSizeBytes BIGINT NOT NULL,
    Category VARCHAR(100) NOT NULL CHECK (Category IN ('Proposal', 'Budget', 'Research', 'Design', 'Dataset', 'Review')),
    UploadedBy INT NOT NULL,
    Version INT NOT NULL DEFAULT 1,
    Status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (Status IN ('Draft', 'Reviewed', 'Final')),
    StoragePath VARCHAR(1000) NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Documents_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE SET NULL,
    CONSTRAINT FK_Documents_Uploader FOREIGN KEY (UploadedBy) REFERENCES Users(UserId) ON DELETE NO ACTION
);

CREATE INDEX IX_Documents_Proposal ON Documents(ProposalId);
CREATE INDEX IX_Documents_Category ON Documents(Category);
CREATE INDEX IX_Documents_Uploader ON Documents(UploadedBy);

-- ============================================
-- 9. BudgetAllocations Table
-- ============================================
CREATE TABLE BudgetAllocations (
    BudgetAllocationId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    Category VARCHAR(100) NOT NULL CHECK (Category IN ('Personnel', 'Equipment', 'Research Materials', 'Travel', 'Publication', 'Contingency')),
    AllocatedAmount BIGINT NOT NULL,
    SpentAmount BIGINT NOT NULL DEFAULT 0,
    
    CONSTRAINT FK_BudgetAllocations_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT CHK_BudgetAllocations_Spent CHECK (SpentAmount >= 0 AND SpentAmount <= AllocatedAmount)
);

CREATE INDEX IX_BudgetAllocations_Proposal ON BudgetAllocations(ProposalId);

-- ============================================
-- 10. Milestones Table
-- ============================================
CREATE TABLE Milestones (
    MilestoneId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Description NTEXT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
    ProgressPercent INT NOT NULL DEFAULT 0 CHECK (ProgressPercent >= 0 AND ProgressPercent <= 100),
    AssigneeId INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL,
    
    CONSTRAINT FK_Milestones_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE,
    CONSTRAINT FK_Milestones_Assignee FOREIGN KEY (AssigneeId) REFERENCES Users(UserId) ON DELETE SET NULL,
    CONSTRAINT CHK_Milestones_Dates CHECK (EndDate >= StartDate)
);

CREATE INDEX IX_Milestones_Proposal ON Milestones(ProposalId);
CREATE INDEX IX_Milestones_Status ON Milestones(Status);
CREATE INDEX IX_Milestones_EndDate ON Milestones(EndDate);

-- ============================================
-- 11. MilestoneDependencies Table
-- ============================================
CREATE TABLE MilestoneDependencies (
    MilestoneId INT NOT NULL,
    DependsOnMilestoneId INT NOT NULL,
    
    PRIMARY KEY (MilestoneId, DependsOnMilestoneId),
    CONSTRAINT FK_MilestoneDeps_Milestone FOREIGN KEY (MilestoneId) REFERENCES Milestones(MilestoneId) ON DELETE NO ACTION,
    CONSTRAINT FK_MilestoneDeps_DependsOn FOREIGN KEY (DependsOnMilestoneId) REFERENCES Milestones(MilestoneId) ON DELETE NO ACTION,
    CONSTRAINT CHK_MilestoneDeps_NoCycle CHECK (MilestoneId != DependsOnMilestoneId)
);

-- ============================================
-- 12. ActivityLogs Table
-- ============================================
CREATE TABLE ActivityLogs (
    ActivityLogId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Action VARCHAR(100) NOT NULL,
    EntityType VARCHAR(100) NOT NULL,
    EntityId INT NOT NULL,
    Details NVARCHAR(1000) NULL,
    IpAddress VARCHAR(50) NULL,
    UserAgent VARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_ActivityLogs_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION
);

CREATE INDEX IX_ActivityLogs_User ON ActivityLogs(UserId);
CREATE INDEX IX_ActivityLogs_Entity ON ActivityLogs(EntityType, EntityId);
CREATE INDEX IX_ActivityLogs_CreatedAt ON ActivityLogs(CreatedAt DESC);

-- ============================================
-- 13. Notifications Table
-- ============================================
CREATE TABLE Notifications (
    NotificationId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Type VARCHAR(100) NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Message NTEXT NOT NULL,
    RelatedEntityType VARCHAR(100) NULL,
    RelatedEntityId INT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);

CREATE INDEX IX_Notifications_User ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(CreatedAt DESC);

-- ============================================
-- 14. ProposalEmbeddings Table (Semantic Search)
-- ============================================
CREATE TABLE ProposalEmbeddings (
    ProposalEmbeddingId INT PRIMARY KEY IDENTITY(1,1),
    ProposalId INT NOT NULL UNIQUE,
    TitleEmbedding VARBINARY(MAX) NOT NULL,
    DescriptionEmbedding VARBINARY(MAX) NOT NULL,
    CombinedEmbedding VARBINARY(MAX) NOT NULL,
    EmbeddingModel VARCHAR(100) NOT NULL DEFAULT 'text-embedding-ada-002',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    
    CONSTRAINT FK_ProposalEmbeddings_Proposal FOREIGN KEY (ProposalId) REFERENCES Proposals(ProposalId) ON DELETE CASCADE
);

CREATE INDEX IX_ProposalEmbeddings_Proposal ON ProposalEmbeddings(ProposalId);

GO

PRINT 'FURPMS Database Schema Created Successfully!'
PRINT '14 Tables Created: Users, Proposals, Reviews, ReviewScores, Meetings, MeetingReviewers, Comments, Documents, BudgetAllocations, Milestones, MilestoneDependencies, ActivityLogs, Notifications, ProposalEmbeddings'
GO
```

---

### Stored Procedures & Functions

```sql
-- ============================================
-- Calculate Total Score for Review
-- ============================================
CREATE PROCEDURE sp_CalculateReviewScore
    @ReviewId INT
AS
BEGIN
    UPDATE Reviews
    SET TotalScore = (
        SELECT SUM(Score)
        FROM ReviewScores
        WHERE ReviewId = @ReviewId
    )
    WHERE ReviewId = @ReviewId;
END
GO

-- ============================================
-- Calculate Proposal Average Score
-- ============================================
CREATE PROCEDURE sp_CalculateProposalScore
    @ProposalId INT
AS
BEGIN
    UPDATE Proposals
    SET TotalScore = (
        SELECT AVG(TotalScore)
        FROM Reviews
        WHERE ProposalId = @ProposalId AND Status = 'Completed'
    )
    WHERE ProposalId = @ProposalId;
END
GO

-- ============================================
-- Auto-Update Overdue Milestones
-- ============================================
CREATE PROCEDURE sp_UpdateOverdueMilestones
AS
BEGIN
    UPDATE Milestones
    SET Status = 'Overdue'
    WHERE EndDate < CAST(GETDATE() AS DATE)
      AND Status IN ('Pending', 'In Progress');
END
GO

-- ============================================
-- Get Budget Utilization
-- ============================================
CREATE FUNCTION fn_GetBudgetUtilization(@ProposalId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        ProposalId,
        Category,
        AllocatedAmount,
        SpentAmount,
        (AllocatedAmount - SpentAmount) AS RemainingAmount,
        CASE 
            WHEN AllocatedAmount > 0 THEN (SpentAmount * 100.0 / AllocatedAmount)
            ELSE 0
        END AS UtilizationPercent,
        CASE
            WHEN SpentAmount > AllocatedAmount THEN 'Over Budget'
            WHEN (SpentAmount * 100.0 / AllocatedAmount) > 80 THEN 'Warning'
            ELSE 'On Track'
        END AS BudgetStatus
    FROM BudgetAllocations
    WHERE ProposalId = @ProposalId
);
GO

-- ============================================
-- Get Proposal Statistics
-- ============================================
CREATE PROCEDURE sp_GetProposalStatistics
AS
BEGIN
    SELECT 
        COUNT(*) AS TotalProposals,
        SUM(CASE WHEN Status = 'Submitted' THEN 1 ELSE 0 END) AS SubmittedCount,
        SUM(CASE WHEN Status = 'Under Review' THEN 1 ELSE 0 END) AS UnderReviewCount,
        SUM(CASE WHEN Status = 'Approved' THEN 1 ELSE 0 END) AS ApprovedCount,
        SUM(CASE WHEN Status = 'Rejected' THEN 1 ELSE 0 END) AS RejectedCount,
        SUM(CASE WHEN Status = 'Revision Required' THEN 1 ELSE 0 END) AS RevisionRequiredCount,
        AVG(TotalScore) AS AverageScore,
        SUM(BudgetAmount) AS TotalBudget
    FROM Proposals;
END
GO

-- ============================================
-- Generate/Update Proposal Embedding
-- ============================================
CREATE PROCEDURE sp_UpsertProposalEmbedding
    @ProposalId INT,
    @TitleEmbedding VARBINARY(MAX),
    @DescriptionEmbedding VARBINARY(MAX),
    @CombinedEmbedding VARBINARY(MAX),
    @EmbeddingModel VARCHAR(100) = 'text-embedding-ada-002'
AS
BEGIN
    IF EXISTS (SELECT 1 FROM ProposalEmbeddings WHERE ProposalId = @ProposalId)
    BEGIN
        -- Update existing embedding
        UPDATE ProposalEmbeddings
        SET TitleEmbedding = @TitleEmbedding,
            DescriptionEmbedding = @DescriptionEmbedding,
            CombinedEmbedding = @CombinedEmbedding,
            EmbeddingModel = @EmbeddingModel,
            UpdatedAt = GETDATE()
        WHERE ProposalId = @ProposalId;
    END
    ELSE
    BEGIN
        -- Insert new embedding
        INSERT INTO ProposalEmbeddings (ProposalId, TitleEmbedding, DescriptionEmbedding, CombinedEmbedding, EmbeddingModel)
        VALUES (@ProposalId, @TitleEmbedding, @DescriptionEmbedding, @CombinedEmbedding, @EmbeddingModel);
    END
END
GO

-- ============================================
-- Get Proposals Missing Embeddings (for background job)
-- ============================================
CREATE PROCEDURE sp_GetProposalsMissingEmbeddings
    @Limit INT = 100
AS
BEGIN
    SELECT TOP (@Limit)
        p.ProposalId,
        p.Title,
        p.Description
    FROM Proposals p
    LEFT JOIN ProposalEmbeddings pe ON p.ProposalId = pe.ProposalId
    WHERE pe.ProposalEmbeddingId IS NULL
    ORDER BY p.SubmittedDate DESC;
END
GO
```

---

### Sample Data Insert Script

```sql
-- ============================================
-- Insert Sample Data
-- ============================================

-- Insert Users
INSERT INTO Users (FullName, Email, PasswordHash, PhoneNumber, Role, Department, Status)
VALUES 
('Administrator FURPMS', 'admin@fpt.edu.vn', 'HASHED_PASSWORD_HERE', '+84987654321', 'Administrator', 'Administration', 'Active'),
('Nguyễn Văn Hùng', 'hungnv@fpt.edu.vn', 'HASHED_PASSWORD_HERE', '+84987654322', 'Staff', 'Administration', 'Active'),
('Dr. Nguyễn Văn A', 'nguyenvana@fpt.edu.vn', 'HASHED_PASSWORD_HERE', '+84123456789', 'Faculty', 'AI & Data Science', 'Active'),
('Dr. Trần Thị B', 'tranthib@fpt.edu.vn', 'HASHED_PASSWORD_HERE', '+84123456790', 'Review Committee', 'Software Engineering', 'Active'),
('Dr. Lê Văn C', 'levanc@fpt.edu.vn', 'HASHED_PASSWORD_HERE', '+84123456791', 'Review Committee', 'Computer Science', 'Active');

-- Insert Sample Proposal
INSERT INTO Proposals (Title, Description, PrincipalInvestigatorId, Category, BudgetAmount, DurationMonths, Status, Priority, ReviewDeadline)
VALUES 
('AI-Powered Chatbot for Education', 'A comprehensive research project to develop an AI-powered chatbot...', 2, 'AI & ML', 50000000, 12, 'Under Review', 'High', '2026-05-31');

-- Insert Sample Review
INSERT INTO Reviews (ProposalId, ReviewerId, Status, Priority, Deadline)
VALUES 
(1, 3, 'Pending', 'High', '2026-05-25');

-- Insert Sample Review Scores
INSERT INTO ReviewScores (ReviewId, Criterion, MaxScore, Score)
VALUES 
(1, 'Innovation & Originality', 10, 0),
(1, 'Methodology & Approach', 10, 0),
(1, 'Feasibility & Timeline', 10, 0),
(1, 'Budget Justification', 10, 0),
(1, 'Expected Impact', 10, 0);

GO
```

---

## 🔐 Security Considerations

### Authentication & Authorization
- Use **JWT tokens** with short expiry (15 mins) + refresh tokens
- Implement **Role-Based Access Control (RBAC)**
- Password hashing: **BCrypt** with salt rounds ≥ 10
- Enable **HTTPS only** in production
- Implement **rate limiting** on API endpoints

### Data Protection
- Encrypt sensitive data at rest (Azure SQL Transparent Data Encryption)
- Sanitize all user inputs to prevent **SQL injection**
- Validate file uploads (type, size, virus scanning)
- Enable **CORS** with whitelist origins only
- Implement **audit logging** for all critical operations

---

## 📈 Performance Optimization

### Database Indexes
- All foreign keys already indexed
- Add composite indexes for common query patterns:
```sql
CREATE INDEX IX_Proposals_Status_Category ON Proposals(Status, Category);
CREATE INDEX IX_Reviews_Proposal_Status ON Reviews(ProposalId, Status);
```

### Caching Strategy
- Cache frequently accessed data (dashboard stats, user profiles)
- Use **Redis** for session management and caching
- Implement **response caching** for GET endpoints (5-60 mins TTL)

### API Response Optimization
- Implement **pagination** on all list endpoints (default pageSize=20, max=100)
- Use **GraphQL** or field filtering to reduce payload size
- Enable **gzip compression** on API responses
- Lazy load related entities (use `?include=reviews,documents`)

---

## 🧪 Testing Requirements

### Unit Tests
- Test all business logic functions
- Test validation rules and constraints
- Mock database interactions

### Integration Tests
- Test API endpoints with real database
- Test authentication/authorization flows
- Test file upload/download operations

### Performance Tests
- Load test with 1000+ concurrent users
- Stress test proposal submission flow
- Test database query performance

---

## 🤖 AI Integration Guide

### 1. Gemini API Integration (Review AI Summary)

**Use Case:** Generate AI-powered summary và suggested comments khi reviewer đánh giá proposal

**Endpoint:** `POST /reviews/{id}/ai-summary`

**Implementation (.NET):**
```csharp
public class GeminiService
{
    private readonly string _apiKey = Configuration["Gemini:ApiKey"];
    private const string GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    
    public async Task<(string summary, string comments)> GenerateReviewSummary(Proposal proposal)
    {
        var prompt = $@"
You are an expert research proposal reviewer. Analyze this proposal and provide:
1. A concise summary (2-3 sentences)
2. Constructive feedback and suggestions

Proposal Title: {proposal.Title}
Category: {proposal.Category}
Budget: {proposal.BudgetAmount:N0} VND
Duration: {proposal.DurationMonths} months

Description:
{proposal.Description}

Provide response in JSON format:
{{
  ""summary"": ""..."",
  ""comments"": ""...""
}}
";

        var request = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            }
        };

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("x-goog-api-key", _apiKey);
        
        var response = await client.PostAsJsonAsync(GEMINI_API_URL, request);
        var result = await response.Content.ReadFromJsonAsync<GeminiResponse>();
        
        var jsonText = result.Candidates[0].Content.Parts[0].Text;
        var parsed = JsonSerializer.Deserialize<ReviewSuggestion>(jsonText);
        
        return (parsed.Summary, parsed.Comments);
    }
}
```

---

### 2. OpenAI Embeddings (Semantic Search)

**Use Case:** Generate vector embeddings cho proposals để phục vụ semantic search

**Endpoint:** `POST /search/semantic`

**Implementation (.NET):**
```csharp
public class OpenAIEmbeddingService
{
    private readonly string _apiKey = Configuration["OpenAI:ApiKey"];
    private const string OPENAI_EMBEDDING_URL = "https://api.openai.com/v1/embeddings";
    
    // Generate embedding for a single text
    public async Task<float[]> GenerateEmbedding(string text)
    {
        var request = new
        {
            input = text,
            model = "text-embedding-ada-002" // 1536 dimensions, $0.0001 per 1K tokens
        };

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        
        var response = await client.PostAsJsonAsync(OPENAI_EMBEDDING_URL, request);
        var result = await response.Content.ReadFromJsonAsync<OpenAIEmbeddingResponse>();
        
        return result.Data[0].Embedding; // float[1536]
    }
    
    // Generate embeddings for proposal
    public async Task GenerateProposalEmbeddings(int proposalId)
    {
        var proposal = await _dbContext.Proposals.FindAsync(proposalId);
        
        var titleEmbedding = await GenerateEmbedding(proposal.Title);
        var descriptionEmbedding = await GenerateEmbedding(proposal.Description);
        var combinedEmbedding = await GenerateEmbedding($"{proposal.Title}. {proposal.Description}");
        
        // Convert float[] to byte[] for storage
        var titleBytes = FloatArrayToBytes(titleEmbedding);
        var descBytes = FloatArrayToBytes(descriptionEmbedding);
        var combinedBytes = FloatArrayToBytes(combinedEmbedding);
        
        // Upsert to database
        await _dbContext.Database.ExecuteSqlRawAsync(@"
            EXEC sp_UpsertProposalEmbedding 
                @ProposalId = {0}, 
                @TitleEmbedding = {1}, 
                @DescriptionEmbedding = {2}, 
                @CombinedEmbedding = {3}",
            proposalId, titleBytes, descBytes, combinedBytes
        );
    }
    
    // Semantic search
    public async Task<List<ProposalSearchResult>> SemanticSearch(string query, int topK = 10)
    {
        // 1. Generate query embedding
        var queryEmbedding = await GenerateEmbedding(query);
        
        // 2. Get all proposals with embeddings
        var proposalsWithEmbeddings = await _dbContext.ProposalEmbeddings
            .Include(pe => pe.Proposal)
            .ToListAsync();
        
        // 3. Calculate cosine similarity
        var results = new List<ProposalSearchResult>();
        foreach (var pe in proposalsWithEmbeddings)
        {
            var proposalVector = BytesToFloatArray(pe.CombinedEmbedding);
            var similarity = CosineSimilarity(queryEmbedding, proposalVector);
            
            if (similarity > 0.7) // Threshold
            {
                results.Add(new ProposalSearchResult
                {
                    Proposal = pe.Proposal,
                    SemanticSimilarity = similarity
                });
            }
        }
        
        // 4. Return top-K results
        return results
            .OrderByDescending(r => r.SemanticSimilarity)
            .Take(topK)
            .ToList();
    }
    
    // Helper: Cosine similarity
    private float CosineSimilarity(float[] vec1, float[] vec2)
    {
        float dot = 0, norm1 = 0, norm2 = 0;
        for (int i = 0; i < vec1.Length; i++)
        {
            dot += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        return dot / (MathF.Sqrt(norm1) * MathF.Sqrt(norm2));
    }
    
    // Helper: Convert float[] to byte[] for SQL storage
    private byte[] FloatArrayToBytes(float[] array)
    {
        var bytes = new byte[array.Length * sizeof(float)];
        Buffer.BlockCopy(array, 0, bytes, 0, bytes.Length);
        return bytes;
    }
    
    // Helper: Convert byte[] back to float[]
    private float[] BytesToFloatArray(byte[] bytes)
    {
        var floats = new float[bytes.Length / sizeof(float)];
        Buffer.BlockCopy(bytes, 0, floats, 0, bytes.Length);
        return floats;
    }
}
```

**Background Job (Hangfire) - Generate Embeddings:**
```csharp
public class EmbeddingBackgroundJob
{
    [AutomaticRetry(Attempts = 3)]
    public async Task GenerateMissingEmbeddings()
    {
        // Get proposals without embeddings
        var proposals = await _dbContext.Database
            .SqlQuery<ProposalBasic>("EXEC sp_GetProposalsMissingEmbeddings @Limit = 50")
            .ToListAsync();
        
        foreach (var proposal in proposals)
        {
            try
            {
                await _embeddingService.GenerateProposalEmbeddings(proposal.ProposalId);
                _logger.LogInformation($"Generated embeddings for Proposal #{proposal.ProposalId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to generate embeddings for Proposal #{proposal.ProposalId}");
            }
        }
    }
}

// Register in Startup.cs
RecurringJob.AddOrUpdate<EmbeddingBackgroundJob>(
    "generate-embeddings",
    job => job.GenerateMissingEmbeddings(),
    Cron.Hourly // Run every hour
);
```

---

### 3. Google Meet API Integration

**Use Case:** Auto-generate Google Meet links khi schedule meeting

**Implementation (.NET):**
```csharp
public class GoogleMeetService
{
    private readonly string _serviceAccountJson = Configuration["Google:ServiceAccountJson"];
    
    public async Task<string> CreateMeetingLink(Meeting meeting)
    {
        var credential = GoogleCredential
            .FromJson(_serviceAccountJson)
            .CreateScoped(CalendarService.Scope.Calendar);
        
        var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential
        });
        
        var eventRequest = new Event
        {
            Summary = meeting.MeetingTitle,
            Description = $"Review Committee Meeting for Proposal #{meeting.ProposalId}",
            Start = new EventDateTime
            {
                DateTime = meeting.ScheduledDate.Add(meeting.ScheduledTime),
                TimeZone = "Asia/Ho_Chi_Minh"
            },
            End = new EventDateTime
            {
                DateTime = meeting.ScheduledDate.Add(meeting.ScheduledTime).AddHours(2),
                TimeZone = "Asia/Ho_Chi_Minh"
            },
            ConferenceData = new ConferenceData
            {
                CreateRequest = new CreateConferenceRequest
                {
                    RequestId = Guid.NewGuid().ToString(),
                    ConferenceSolutionKey = new ConferenceSolutionKey
                    {
                        Type = "hangoutsMeet"
                    }
                }
            }
        };
        
        var request = service.Events.Insert(eventRequest, "primary");
        request.ConferenceDataVersion = 1;
        
        var createdEvent = await request.ExecuteAsync();
        var meetLink = createdEvent.ConferenceData.EntryPoints
            .FirstOrDefault(ep => ep.EntryPointType == "video")?.Uri;
        
        return meetLink; // https://meet.google.com/xxx-yyyy-zzz
    }
}
```

---

### Cost Estimation (AI APIs)

| Service | Pricing | Estimated Monthly Cost |
|---------|---------|------------------------|
| **OpenAI Embeddings** (text-embedding-ada-002) | $0.0001 / 1K tokens | ~$5-10 (500 proposals × 2K tokens avg) |
| **Google Gemini Pro** (AI Summary) | $0.00025 / 1K chars input, $0.0005 / 1K chars output | ~$10-15 (200 reviews/month × 5K chars avg) |
| **Google Meet API** | Free (included with Google Workspace) | $0 |
| **Total Estimated** | | **$15-25/month** |

---

Đây là document đầy đủ để anh bắt đầu implement backend API với .NET và SQL Server. Tất cả đã được cập nhật theo feedback:

✅ **Role đã sửa**: `Administrator, Staff, Faculty, Review Committee` (thay vì Admin, Student, Reviewer)  
✅ **Semantic Search đã thêm**: Bảng `ProposalEmbeddings` + API endpoints + implementation code  
✅ **Role Permissions Matrix** rõ ràng cho 4 roles  
✅ **AI Integration Guide** cho Gemini, OpenAI, Google Meet

Cần thêm detail về phần nào (authentication flow, file storage architecture, deployment guide) thì nói thêm nhé!