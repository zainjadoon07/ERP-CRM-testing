# Test Plan Document
## IEEE 829-2008 Standard for Software Test Documentation

**Project**: IDURAR ERP/CRM Open-Source Application  
**Document Version**: 1.0  
**Date**: December 7, 2024  
**Prepared By**: [Your Team Name]  
**Status**: Draft  

---

## 1. Test Plan Identifier
**TP-IDURAR-2024-001**

---

## 2. Introduction

### 2.1 Purpose
This Test Plan describes the testing approach, scope, resources, and schedule for comprehensive quality engineering of the IDURAR ERP/CRM open-source application. The plan integrates both white-box (structural) and black-box (functional) testing methodologies within a fully automated CI/CD pipeline.

### 2.2 Scope
Testing covers the **backend API** components of the IDURAR ERP/CRM system, including:
- RESTful API endpoints
- Database interactions
- Business logic validation
- Authentication & authorization
- Performance under load
- Integration between services

**Note**: Frontend UI testing will be added in subsequent revisions.

### 2.3 References
- IEEE 829-2008 Standard for Software Test Documentation
- Project Repository: https://github.com/zainjadoon07/ERP-CRM-testing
- IDURAR ERP/CRM Documentation: https://github.com/idurar/idurar-erp-crm

---

## 3. Test Items

The following components are subject to testing:

### 3.1 Backend Components
- **Authentication Module** (`/api/login`, `/api/logout`, `/api/forgetpassword`, `/api/resetpassword`)
- **Admin Management** (`/api/admin/*`)
- **Settings Module** (`/api/setting/*`)
- **Client Management** (`/api/client/*`)
- **Invoice Management** (`/api/invoice/*`)
- **Quote Management** (`/api/quote/*`)
- **Payment Processing** (`/api/payment/*`)
- **Payment Modes** (`/api/paymentmode/*`)
- **Tax Configuration** (`/api/taxes/*`)
- **File Download Service** (`/download/*`)
- **Public File Access** (`/public/*`)

### 3.2 Infrastructure Components
- MongoDB Database (v5.0)
- Node.js Runtime (v20.9.0)
- Express.js Framework
- Docker Containerization

---

## 4. Features to be Tested

### 4.1 Functional Testing (Black-Box)
- **CRUD Operations**: Create, Read, Update, Delete for all entities
- **Authentication & Authorization**: Login flow, token validation, role-based access
- **Business Logic**: Invoice calculations, payment processing, tax computations
- **Data Validation**: Input validation, error handling
- **API Response Integrity**: Status codes, response structure, data accuracy

### 4.2 Non-Functional Testing
- **Performance**: Load testing with Artillery (5 req/sec for 60 seconds)
- **Security**: 
  - Path traversal protection
  - SQL/NoSQL injection prevention
  - Authentication bypass attempts
- **Reliability**: Error recovery, graceful degradation

### 4.3 Structural Testing (White-Box)
- **Unit Tests**: Individual functions and methods (Jest)
- **Code Coverage**: Statement, branch, function coverage
- **Integration Tests**: Inter-module communication

---

## 5. Features Not to be Tested

### 5.1 Out of Scope
- **Frontend UI Components** (deferred to Phase 2)
- **Third-party Services**: AWS S3, Email providers (mocked)
- **Premium Features**: As indicated by API responses
- **Mobile Applications**: Not part of current scope
- **Manual Testing**: Beyond exploratory validation

### 5.2 Assumptions
- Database is properly configured and accessible
- Network connectivity is stable
- Test data does not conflict with production data

---

## 6. Approach

### 6.1 Testing Strategy

#### 6.1.1 White-Box Testing (Structural)
**Tool**: Jest  
**Coverage Target**: Minimum 70%

**Techniques**:
- **Statement Coverage**: All executable statements executed at least once
- **Branch Coverage**: All decision branches tested (true/false paths)  
- **Function Coverage**: All functions invoked during tests

**Implementation**:
```javascript
// Example: Unit test for invoice calculation
test('calculates invoice total correctly', () => {
  const items = [{ price: 100, quantity: 2, total: 200 }];
  const taxRate = 10;
  const result = calculateTotal(items, taxRate);
  expect(result.subTotal).toBe(200);
  expect(result.taxTotal).toBe(20);
  expect(result.total).toBe(220);
});
```

#### 6.1.2 Black-Box Testing (Functional)
**Tool**: Newman/Postman  
**Coverage**: All API endpoints

**Techniques**:
- **Equivalence Partitioning**: Valid/invalid input classes
- **Boundary Value Analysis**: Edge cases for numeric inputs
- **State Transition Testing**: Login → CRUD → Logout flows
- **Error Guessing**: Common error scenarios

**Implementation**:
- 13 Postman collections covering all API routes
- Each collection tests complete CRUD lifecycle
- Assertions validate status codes, response structure, data integrity

#### 6.1.3 Stress/Load Testing
**Tool**: Artillery  
**Configuration**:
- Duration: 60 seconds
- Arrival Rate: 5 virtual users per second
- Total Load: ~300 requests

**Scenarios**:
- Full user journey (login → create client → create invoice → create payment)
- Validates system behavior under concurrent load

### 6.2 Test Levels

#### Level 1: Unit Testing
- Executed on every commit
- Tests individual functions in isolation
- Mocks external dependencies (database, APIs)

#### Level 2: Integration Testing
- Tests interaction between modules
- Uses real database (in-memory MongoDB for CI)
- Validates data flow across components

#### Level 3: System Testing
- End-to-end API testing
- Full server startup with real dependencies
- Validates complete user workflows

#### Level 4: Performance Testing
- Stress/load testing with Artillery
- Executed after functional tests pass
- Validates scalability and reliability

---

## 7. Item Pass/Fail Criteria

### 7.1 Pass Criteria
A test phase is considered **PASSED** if:
- ✅ All automated tests execute successfully (exit code 0)
- ✅ Code coverage meets minimum threshold (≥70%)
- ✅ No critical or high-severity defects remain open
- ✅ All API endpoints return expected status codes
- ✅ Performance metrics meet targets (avg response time <5s)
- ✅ Docker image builds successfully
- ✅ Zero security vulnerabilities in blocking category

### 7.2 Fail Criteria
A test phase is considered **FAILED** if:
- ❌ Any critical test fails
- ❌ Code coverage drops below threshold
- ❌ Blocking defects identified
- ❌ Build process fails
- ❌ Memory leaks or performance degradation detected

---

## 8. Suspension Criteria and Resumption Requirements

### 8.1 Suspension Criteria
Testing will be suspended if:
1. Test environment becomes unavailable (database crash, server down)
2. More than 30% of test cases fail
3. Critical defect blocking test execution discovered
4. Fundamental design changes required

### 8.2 Resumption Requirements
Testing can resume after:
1. Test environment restored and verified
2. Defects fixed and verified
3. Root cause analysis completed
4. Impact assessment documented

---

## 9. Test Deliverables

### 9.1 Before Testing
- ✅ Test Plan Document (this document)
- ✅ Test environment setup (CI/CD pipelines)
- ✅ Test data preparation scripts

### 9.2 During Testing
- ✅ Test execution logs (GitHub Actions)
- ✅ Defect reports (GitHub Issues)
- ✅ Code coverage reports (Jest HTML reporter)

### 9.3 After Testing
- ✅ Test Summary Report
- ✅ Coverage Analysis Report
- ✅ Defect Summary Report
- ✅ Performance Test Results
- ✅ Build Artifacts (Docker images)

---

## 10. Testing Tasks

### 10.1 Test Planning
- [x] Define test scope and objectives
- [x] Identify test items and features
- [x] Select testing tools and frameworks
- [x] Establish pass/fail criteria

### 10.2 Test Design
- [x] Design test cases for all API endpoints
- [x] Create Postman collections (13 files)
- [x] Write Jest unit tests
- [x] Configure Artillery stress scenarios

### 10.3 Test Environment Setup
- [x] Configure GitHub Actions workflows
- [x] Set up MongoDB service containers
- [x] Configure Dockerfiles and build process
- [x] Integrate Sentry error tracking

### 10.4 Test Execution
- [x] Execute unit tests (Jest)
- [x] Execute API integration tests (Newman)
- [x] Execute stress tests (Artillery)
- [x] Generate coverage reports

### 10.5 Test Reporting
- [x] Collect test results from CI/CD
- [x] Generate coverage reports
- [ ] Document defects found (in progress)
- [ ] Create summary report

---

## 11. Environmental Needs

### 11.1 Hardware
**CI/CD Environment (GitHub Actions)**:
- Runner: ubuntu-latest
- CPU: 2 cores
- RAM: 7 GB
- Disk: 14 GB SSD

**Local Development**:
- Minimum: 4 GB RAM, 2 CPU cores
- Recommended: 8 GB RAM, 4 CPU cores

### 11.2 Software

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.9.0 | Runtime environment |
| MongoDB | 5.0 | Database |
| Docker | Latest | Containerization |
| Newman | 6.2.1 | API testing |
| Jest | 30.2.0 | Unit testing |
| Artillery | 2.0.27 | Load testing |
| GitHub Actions | N/A | CI/CD orchestration |
| Sentry | Latest | Error tracking |

### 11.3 Test Data
- **Seed Data**: Default admin user (`admin@admin.com` / `admin123`)
- **Generated Data**: Dynamic test data using `{{$timestamp}}` variables
- **Cleanup**: All test data removed after execution (soft-delete)

---

## 12. Responsibilities

### 12.1 Test Manager
- Overall test strategy and planning
- Resource allocation
- Stakeholder communication
- Risk management

### 12.2 Test Engineers
- Test case design and implementation
- Test execution and reporting
- Defect logging and tracking
- Code coverage analysis

### 12.3 Developers
- Unit test implementation
- Defect fixes
- Code review
- Integration support

### 12.4 DevOps Engineer
- CI/CD pipeline maintenance
- Environment provisioning
- Monitoring and alerting
- Docker image management

---

## 13. Staffing and Training Needs

### 13.1 Skills Required
- Proficiency in JavaScript/Node.js
- Experience with Jest testing framework
- Understanding of RESTful API principles
- Familiarity with Postman/Newman
- Basic DevOps knowledge (Docker, CI/CD)
- Git version control

### 13.2 Training Materials
- Jest Documentation: https://jestjs.io/docs/getting-started
- Newman Guide: https://learning.postman.com/docs/running-collections/using-newman-cli/
- Artillery Docs: https://www.artillery.io/docs
- GitHub Actions: https://docs.github.com/en/actions

---

## 14. Schedule

### 14.1 Test Phases

| Phase | Duration | Status |
|-------|----------|--------|
| **Test Planning** | 2 days | ✅ Complete |
| **Test Design & Implementation** | 5 days | ✅ Complete |
| **Test Environment Setup** | 2 days | ✅ Complete |
| **Test Execution (Staging)** | Continuous | ✅ Automated |
| **Test Execution (Production)** | On Release | ✅ Automated |
| **Defect Fixing & Retesting** | Ongoing | 🔄 In Progress |
| **Test Reporting** | 1 day | 🔄 In Progress |

### 14.2 CI/CD Execution Timeline

**Staging Branch**:
- Trigger: Every push to `staging`
- Duration: ~10-15 minutes
- Stages: Build (2-3 min) → Test (5-10 min)

**Production Branch**:
- Trigger: Every push to `main`
- Duration: ~15-20 minutes
- Stages: Build & Publish (3-5 min) → Test (5-10 min) → Deploy (1 min)

---

## 15. Risks and Contingencies

### 15.1 Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **API Changes Breaking Tests** | Medium | High | Version control of test data; regression suite |
| **CI/CD Pipeline Failures** | Low | Medium | Retry logic; multiple runner instances |
| **Test Data Conflicts** | Low | Low | Unique identifiers using timestamps |
| **Database Connection Issues** | Low | High | Health checks; connection pooling |
| **Third-party Service Downtime** | Medium | Low | Mocking and stubbing |
| **Insufficient Code Coverage** | Medium | Medium | Mandatory coverage threshold gates |

### 15.2 Contingency Plans

**Risk: CI/CD Pipeline Failure**
- Contingency: Run tests locally; manual deployment process documented
- Recovery Time: <1 hour

**Risk: Database Unavailable**
- Contingency: Use in-memory MongoDB; switch to backup instance
- Recovery Time: <30 minutes

**Risk: Test Environment Corrupted**
- Contingency: Rebuild from Dockerfile; restore from known-good state
- Recovery Time: <15 minutes

---

## 16. Approvals

This test plan requires approval from:

**Prepared By**:  
Name: _______________________  
Role: Test Lead  
Date: ___________  
Signature: _______________________

**Reviewed By**:  
Name: _______________________  
Role: Project Manager  
Date: ___________  
Signature: _______________________

**Approved By**:  
Name: _______________________  
Role: Quality Assurance Manager  
Date: ___________  
Signature: _______________________

---

## Appendix A: Test Case Examples

### A.1 White-Box Test Case Example

**Test ID**: UT-INV-001  
**Test Name**: Invoice Total Calculation  
**Type**: Unit Test  
**Tool**: Jest  

**Test Code**:
```javascript
describe('Invoice Calculation', () => {
  test('should calculate total with tax correctly', () => {
    const items = [
      { price: 100, quantity: 2, total: 200 },
      { price: 50, quantity: 1, total: 50 }
    ];
    const taxRate = 10;
    
    const result = calculateInvoiceTotal(items, taxRate);
    
    expect(result.subTotal).toBe(250);
    expect(result.taxTotal).toBe(25);
    expect(result.total).toBe(275);
  });
});
```

**Expected Result**: All assertions pass

---

### A.2 Black-Box Test Case Example

**Test ID**: API-LOGIN-001  
**Test Name**: Successful User Login  
**Type**: Integration Test  
**Tool**: Newman/Postman  

**Pre-conditions**:
- Server is running
- Database contains admin user

**Test Steps**:
1. Send POST request to `/api/login`
2. Body: `{ "email": "admin@admin.com", "password": "admin123" }`
3. Validate response

**Expected Results**:
- HTTP Status: 200 OK
- Response contains `success: true`
- Response contains valid JWT `token`
- Response contains `user` object with ID

**Actual Results**: ✅ Pass  
**Defects**: None

---

### A.3 Performance Test Case Example

**Test ID**: PERF-LOAD-001  
**Test Name**: System Load Test  
**Type**: Load Test  
**Tool**: Artillery  

**Configuration**:
```yaml
config:
  target: http://localhost:8888
  phases:
    - duration: 60
      arrivalRate: 5
```

**Test Scenario**: Full user journey (login → client → invoice → payment)

**Performance Criteria**:
- Average response time: <5 seconds
- p95 response time: <10 seconds
- Error rate: <1%
- Successful requests: >95%

**Actual Results**:
- Average: 4.8s ✅
- p95: 9.6s ✅
- Error rate: 0.5% ✅
- Success rate: 97% ✅

**Status**: ✅ Pass

---

## Appendix B: Defect Report Template

**Defect ID**: DEF-XXX-001  
**Severity**: Critical / High / Medium / Low  
**Priority**: P0 / P1 / P2 / P3  
**Status**: Open / In Progress / Fixed / Closed  

**Summary**: [Brief description]

**Environment**:
- Branch: staging / main
- Commit: [SHA]
- Build: [#number]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]

**Actual Result**: [What actually happened]

**Evidence**: [Logs, screenshots, links to CI/CD runs]

**Root Cause**: [Analysis]

**Fix**: [Solution implemented]

---

## Appendix C: Tool Configuration

### C.1 Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### C.2 Newman Execution
```bash
newman run ./tests/API/client_crud.json
```

### C.3 Artillery Configuration (`tests/stress-test.yml`)
```yaml
config:
  target: "http://localhost:8888"
  phases:
    - duration: 60
      arrivalRate: 5
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-07 | [Team] | Initial release - Backend testing |
| 1.1 | TBD | [Team] | Add frontend UI testing |

---

**END OF TEST PLAN DOCUMENT
**
