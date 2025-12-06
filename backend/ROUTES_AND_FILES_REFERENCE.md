# Complete Routes and Associated Files Reference

This document lists all API routes and the files they depend on in the backend.

---

## Main App File
**File:** `src/app.js`
- Registers all route modules
- Uses error handlers
- Applies middleware (cors, compression, cookie-parser, json parser)

---

## 1. AUTHENTICATION ROUTES
**Route File:** `src/routes/coreRoutes/coreAuth.js`
**Base Path:** `/api`

### Routes:
- `POST /api/login`
- `POST /api/forgetpassword`
- `POST /api/resetpassword`
- `POST /api/logout`

### Associated Files:

**Controllers:**
- `src/controllers/coreControllers/adminAuth/index.js`
  - Uses: `src/controllers/middlewaresControllers/createAuthMiddleware/index.js`

**Middleware Controllers:**
- `src/controllers/middlewaresControllers/createAuthMiddleware/index.js`
  - Uses:
    - `src/controllers/middlewaresControllers/createAuthMiddleware/isValidAuthToken.js`
    - `src/controllers/middlewaresControllers/createAuthMiddleware/login.js`
    - `src/controllers/middlewaresControllers/createAuthMiddleware/logout.js`
    - `src/controllers/middlewaresControllers/createAuthMiddleware/forgetPassword.js`
    - `src/controllers/middlewaresControllers/createAuthMiddleware/resetPassword.js`

**Supporting Files:**
- `src/controllers/middlewaresControllers/createAuthMiddleware/authUser.js`
- `src/controllers/middlewaresControllers/createAuthMiddleware/sendMail.js`
- `src/controllers/middlewaresControllers/createAuthMiddleware/checkAndCorrectURL.js`

**Models:**
- `src/models/coreModels/Admin.js`
- `src/models/coreModels/AdminPassword.js`

**Error Handlers:**
- `src/handlers/errorHandlers.js` (catchErrors)

---

## 2. ADMIN ROUTES
**Route File:** `src/routes/coreRoutes/coreApi.js`
**Base Path:** `/api`** (Requires Auth)

### Routes:
- `GET /api/admin/read/:id`
- `PATCH /api/admin/password-update/:id`
- `PATCH /api/admin/profile/password`
- `PATCH /api/admin/profile/update`

### Associated Files:

**Controllers:**
- `src/controllers/coreControllers/adminController/index.js`
  - Uses: `src/controllers/middlewaresControllers/createUserController/index.js`

**Middleware Controllers:**
- `src/controllers/middlewaresControllers/createUserController/index.js`
  - Uses:
    - `src/controllers/middlewaresControllers/createUserController/read.js`
    - `src/controllers/middlewaresControllers/createUserController/updatePassword.js`
    - `src/controllers/middlewaresControllers/createUserController/updateProfile.js`
    - `src/controllers/middlewaresControllers/createUserController/updateProfilePassword.js`

**Middleware:**
- `src/middlewares/uploadMiddleware/index.js`
  - Uses: `src/middlewares/uploadMiddleware/singleStorageUpload.js`

**Models:**
- `src/models/coreModels/Admin.js`
- `src/models/coreModels/AdminPassword.js`

**Auth:**
- `src/controllers/coreControllers/adminAuth/index.js` (isValidAuthToken middleware)

**Error Handlers:**
- `src/handlers/errorHandlers.js` (catchErrors)

---

## 3. SETTING ROUTES
**Route File:** `src/routes/coreRoutes/coreApi.js`
**Base Path:** `/api`** (Requires Auth)

### Routes:
- `POST /api/setting/create`
- `GET /api/setting/read/:id`
- `PATCH /api/setting/update/:id`
- `GET /api/setting/search`
- `GET /api/setting/list`
- `GET /api/setting/listAll`
- `GET /api/setting/filter`
- `GET /api/setting/readBySettingKey/:settingKey`
- `GET /api/setting/listBySettingKey`
- `PATCH /api/setting/updateBySettingKey/:settingKey?`
- `PATCH /api/setting/upload/:settingKey?`
- `PATCH /api/setting/updateManySetting`

### Associated Files:

**Controllers:**
- `src/controllers/coreControllers/settingController/index.js`
  - Uses:
    - `src/controllers/coreControllers/settingController/listAll.js`
    - `src/controllers/coreControllers/settingController/listBySettingKey.js`
    - `src/controllers/coreControllers/settingController/readBySettingKey.js`
    - `src/controllers/coreControllers/settingController/updateBySettingKey.js`
    - `src/controllers/coreControllers/settingController/updateManySetting.js`
    - `src/controllers/middlewaresControllers/createCRUDController/index.js` (for CRUD operations)

**Middleware Controllers:**
- `src/controllers/middlewaresControllers/createCRUDController/index.js`
  - Uses:
    - `src/controllers/middlewaresControllers/createCRUDController/create.js`
    - `src/controllers/middlewaresControllers/createCRUDController/read.js`
    - `src/controllers/middlewaresControllers/createCRUDController/update.js`
    - `src/controllers/middlewaresControllers/createCRUDController/remove.js`
    - `src/controllers/middlewaresControllers/createCRUDController/search.js`
    - `src/controllers/middlewaresControllers/createCRUDController/filter.js`
    - `src/controllers/middlewaresControllers/createCRUDController/listAll.js`
    - `src/controllers/middlewaresControllers/createCRUDController/paginatedList.js`

**Middleware:**
- `src/middlewares/uploadMiddleware/index.js`
  - Uses: `src/middlewares/uploadMiddleware/singleStorageUpload.js`

**Models:**
- `src/models/coreModels/Setting.js`

**Auth:**
- `src/controllers/coreControllers/adminAuth/index.js` (isValidAuthToken middleware)

**Error Handlers:**
- `src/handlers/errorHandlers.js` (catchErrors)

---

## 4. ENTITY ROUTES (Client, Invoice, Quote, Payment, PaymentMode, Taxes)
**Route File:** `src/routes/appRoutes/appApi.js`
**Base Path:** `/api`** (Requires Auth)

### Routes Generated for Each Entity:
- `POST /api/{entity}/create`
- `GET /api/{entity}/read/:id`
- `PATCH /api/{entity}/update/:id`
- `DELETE /api/{entity}/delete/:id`
- `GET /api/{entity}/search`
- `GET /api/{entity}/list`
- `GET /api/{entity}/listAll`
- `GET /api/{entity}/filter`
- `GET /api/{entity}/summary`

### Special Routes:
- `POST /api/invoice/mail`
- `POST /api/quote/mail`
- `POST /api/payment/mail`
- `GET /api/quote/convert/:id`

### Associated Files:

**Route Generator:**
- `src/routes/appRoutes/appApi.js`
  - Uses:
    - `src/controllers/appControllers/index.js`
    - `src/models/utils/index.js` (routesList)

**Controllers Index:**
- `src/controllers/appControllers/index.js`
  - Uses:
    - `src/controllers/middlewaresControllers/createCRUDController/index.js`
    - `src/models/utils/index.js` (routesList)
    - Dynamically loads controllers from: `src/controllers/appControllers/{entity}Controller/`

**Entity Controllers (Custom):**

#### Client Controller:
- `src/controllers/appControllers/clientController/index.js`
  - Uses:
    - `src/controllers/middlewaresControllers/createCRUDController/index.js`
    - `src/controllers/appControllers/clientController/summary.js`

#### Invoice Controller:
- `src/controllers/appControllers/invoiceController/index.js`
  - Uses:
    - `src/controllers/appControllers/invoiceController/create.js`
    - `src/controllers/appControllers/invoiceController/read.js`
    - `src/controllers/appControllers/invoiceController/update.js`
    - `src/controllers/appControllers/invoiceController/remove.js`
    - `src/controllers/appControllers/invoiceController/paginatedList.js`
    - `src/controllers/appControllers/invoiceController/sendMail.js`
    - `src/controllers/appControllers/invoiceController/summary.js`
    - `src/controllers/appControllers/invoiceController/schemaValidate.js`

#### Quote Controller:
- `src/controllers/appControllers/quoteController/index.js`
  - Uses:
    - `src/controllers/appControllers/quoteController/create.js`
    - `src/controllers/appControllers/quoteController/read.js`
    - `src/controllers/appControllers/quoteController/update.js`
    - `src/controllers/appControllers/quoteController/paginatedList.js`
    - `src/controllers/appControllers/quoteController/sendMail.js`
    - `src/controllers/appControllers/quoteController/summary.js`
    - `src/controllers/appControllers/quoteController/convertQuoteToInvoice.js`

#### Payment Controller:
- `src/controllers/appControllers/paymentController/index.js`
  - Uses:
    - `src/controllers/appControllers/paymentController/create.js`
    - `src/controllers/appControllers/paymentController/update.js`
    - `src/controllers/appControllers/paymentController/remove.js`
    - `src/controllers/appControllers/paymentController/sendMail.js`
    - `src/controllers/appControllers/paymentController/summary.js`
    - `src/controllers/middlewaresControllers/createCRUDController/index.js` (for read, search, list, filter, listAll)

#### PaymentMode Controller:
- `src/controllers/appControllers/paymentModeController/index.js`
  - Uses: `src/controllers/middlewaresControllers/createCRUDController/index.js` (all CRUD operations)

#### Taxes Controller:
- `src/controllers/appControllers/taxesController/index.js`
  - Uses: `src/controllers/middlewaresControllers/createCRUDController/index.js` (all CRUD operations)

**Models:**
- `src/models/appModels/Client.js`
- `src/models/appModels/Invoice.js`
- `src/models/appModels/Quote.js`
- `src/models/appModels/Payment.js`
- `src/models/appModels/PaymentMode.js`
- `src/models/appModels/Taxes.js`

**Models Utils:**
- `src/models/utils/index.js` (generates routesList from appModels)

**Middleware Controllers:**
- `src/controllers/middlewaresControllers/createCRUDController/index.js` (for standard CRUD operations)

**Helpers:**
- `src/helpers.js` (used by invoice/quote controllers for calculations)

**Auth:**
- `src/controllers/coreControllers/adminAuth/index.js` (isValidAuthToken middleware)

**Error Handlers:**
- `src/handlers/errorHandlers.js` (catchErrors)

---

## 5. DOWNLOAD ROUTES
**Route File:** `src/routes/coreRoutes/coreDownloadRouter.js`
**Base Path:** `/download`

### Routes:
- `GET /download/:directory/:file`

### Associated Files:

**Handlers:**
- `src/handlers/downloadHandler/downloadPdf.js`
  - Uses:
    - `src/controllers/pdfController/index.js`
    - PDF templates in `src/pdf/`:
      - `src/pdf/Invoice.pug`
      - `src/pdf/Quote.pug`
      - `src/pdf/Payment.pug`
      - `src/pdf/Offer.pug`

**PDF Controller:**
- `src/controllers/pdfController/index.js`

**Models:**
- `src/models/appModels/Invoice.js`
- `src/models/appModels/Quote.js`
- `src/models/appModels/Payment.js`

---

## 6. PUBLIC ROUTES
**Route File:** `src/routes/coreRoutes/corePublicRouter.js`
**Base Path:** `/public`

### Routes:
- `GET /public/:subPath/:directory/:file`

### Associated Files:

**Utils:**
- `src/utils/is-path-inside.js` (security check for file paths)

**Public Directory:**
- `src/public/uploads/` (serves static files)

---

## SHARED FILES USED BY ALL ROUTES

### Error Handlers:
- `src/handlers/errorHandlers.js`
  - `catchErrors` - Wraps async route handlers
  - `notFound` - 404 handler
  - `productionErrors` - Error handler

### Middleware (Applied in app.js):
- `cors` - Cross-origin resource sharing
- `compression` - Response compression
- `cookie-parser` - Cookie parsing
- `express.json()` - JSON body parser
- `express.urlencoded()` - URL-encoded body parser

### Models (Core):
- `src/models/coreModels/Admin.js`
- `src/models/coreModels/AdminPassword.js`
- `src/models/coreModels/Setting.js`
- `src/models/coreModels/Upload.js`

### Models (App):
- `src/models/appModels/Client.js`
- `src/models/appModels/Invoice.js`
- `src/models/appModels/Quote.js`
- `src/models/appModels/Payment.js`
- `src/models/appModels/PaymentMode.js`
- `src/models/appModels/Taxes.js`

---

## FILE DEPENDENCY SUMMARY

### Core Route Files:
1. `src/routes/coreRoutes/coreAuth.js`
2. `src/routes/coreRoutes/coreApi.js`
3. `src/routes/coreRoutes/coreDownloadRouter.js`
4. `src/routes/coreRoutes/corePublicRouter.js`
5. `src/routes/appRoutes/appApi.js`

### Controller Files:
- `src/controllers/coreControllers/adminAuth/index.js`
- `src/controllers/coreControllers/adminController/index.js`
- `src/controllers/coreControllers/settingController/index.js`
- `src/controllers/appControllers/index.js`
- `src/controllers/appControllers/{entity}Controller/index.js` (for each entity)

### Middleware Controller Files:
- `src/controllers/middlewaresControllers/createAuthMiddleware/index.js`
- `src/controllers/middlewaresControllers/createCRUDController/index.js`
- `src/controllers/middlewaresControllers/createUserController/index.js`

### Model Files:
- All files in `src/models/coreModels/`
- All files in `src/models/appModels/`
- `src/models/utils/index.js`

### Handler Files:
- `src/handlers/errorHandlers.js`
- `src/handlers/downloadHandler/downloadPdf.js`

### Middleware Files:
- `src/middlewares/uploadMiddleware/index.js`
- `src/middlewares/uploadMiddleware/singleStorageUpload.js`

### Utility Files:
- `src/utils/is-path-inside.js`
- `src/helpers.js`

### PDF Files:
- `src/controllers/pdfController/index.js`
- `src/pdf/*.pug` (templates)

---

## NOTES

1. **Dynamic Routes**: Entity routes (client, invoice, quote, payment, paymentmode, taxes) are generated dynamically based on models in `src/models/appModels/`

2. **Authentication**: Most routes (except login, forgetpassword, resetpassword, download, public) require authentication via `adminAuth.isValidAuthToken` middleware

3. **Error Handling**: All routes use `catchErrors` wrapper from `errorHandlers.js`

4. **File Uploads**: Routes that handle file uploads use `singleStorageUpload` middleware

5. **Model Registration**: Models must be loaded before routes can use them (typically done in `server.js`)

